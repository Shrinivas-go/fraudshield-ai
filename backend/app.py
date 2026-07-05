import os
import io
import uuid
import sqlite3
import time
import re
import joblib
import numpy as np
import pandas as pd
from functools import wraps
from flask import Flask, request, jsonify, make_response, send_from_directory, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from collections import defaultdict

# ── App setup ───────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "fraudshield-demo-secret-key-2026")

# Restrict CORS origin to the React development server or the same origin in production
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
CORS(app, resources={r"/api/*": {"origins": [FRONTEND_URL]}})

# ── Load trained model ──────────────────────────────────────
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
model_bundle = joblib.load(os.path.join(MODEL_DIR, "model.pkl"))
rf_model = model_bundle["model"]
FEATURE_COLUMNS = model_bundle["feature_columns"]

print(f"[FraudShield] Model loaded — {len(FEATURE_COLUMNS)} features")

# ── SQLite user database ────────────────────────────────────
DB_PATH = os.path.join(MODEL_DIR, "users.db")


def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
    print("[FraudShield] SQLite database ready")


init_db()

# ── Security Helpers ────────────────────────────────────────

# Simple in-memory IP-based rate limiter
rate_limit_records = defaultdict(list)


def rate_limit(limit=60, window=60):
    """
    In-memory rate limiter decorator.
    limit: max requests allowed within window
    window: time frame in seconds
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            ip = request.remote_addr
            now = time.time()
            # Retain only timestamps within the current window
            rate_limit_records[ip] = [t for t in rate_limit_records[ip] if now - t < window]
            
            if len(rate_limit_records[ip]) >= limit:
                return jsonify({"detail": "Too many requests. Please try again later."}), 429
                
            rate_limit_records[ip].append(now)
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def generate_auth_token(user_id):
    """Generate a secure cryptographically signed token."""
    serializer = URLSafeTimedSerializer(app.secret_key)
    return serializer.dumps({"user_id": user_id}, salt="auth-salt")


def verify_auth_token(token):
    """Verify and decode the auth token."""
    serializer = URLSafeTimedSerializer(app.secret_key)
    try:
        # Token valid for 24 hours
        data = serializer.loads(token, salt="auth-salt", max_age=86400)
        return data["user_id"]
    except (SignatureExpired, BadSignature):
        return None


def login_required(f):
    """Decorator to protect routes requiring authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"detail": "Authentication token is missing or invalid"}), 401
        
        token = auth_header.split(" ")[1]
        user_id = verify_auth_token(token)
        if not user_id:
            return jsonify({"detail": "Authentication token is expired or invalid"}), 401
            
        g.user_id = user_id
        return f(*args, **kwargs)
    return decorated_function


# ── Domain Helpers & Mapping ────────────────────────────────
MERCHANT_CATEGORIES = ["Clothing", "Electronics", "Food", "Grocery", "Travel"]
EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

FEATURE_EXPLANATIONS = {
    "foreign_transaction": {
        "name": "Foreign Transaction",
        "high": "This transaction was made from a foreign location, which is a common indicator of stolen card usage.",
        "low": "This is a domestic transaction, which is typical of the cardholder's normal behavior.",
    },
    "device_trust_score": {
        "name": "Device Trust Score",
        "high": "The device used has a very low trust score ({value}/100), suggesting it may be compromised or previously linked to fraud.",
        "low": "The device used has a healthy trust score ({value}/100), consistent with the cardholder's known devices.",
    },
    "location_mismatch": {
        "name": "Location Mismatch",
        "high": "The transaction location doesn't match the cardholder's known locations — a red flag for card-not-present fraud.",
        "low": "The transaction location matches the cardholder's expected area.",
    },
    "transaction_hour": {
        "name": "Transaction Time",
        "high": "This transaction occurred at {value}:00 hours — an unusual time that correlates with higher fraud rates.",
        "low": "This transaction occurred during normal business hours ({value}:00), a low-risk time window.",
    },
    "velocity_last_24h": {
        "name": "Transaction Velocity",
        "high": "{value} transactions in the last 24 hours is abnormally high, suggesting rapid card testing or a spending spree on a stolen card.",
        "low": "Only {value} transaction(s) in the last 24 hours — within normal spending patterns.",
    },
    "amount": {
        "name": "Transaction Amount",
        "high": "₹{value:,.0f} is a significantly large transaction that deviates from the cardholder's typical spending range.",
        "low": "₹{value:,.0f} falls within a normal spending range for this type of merchant.",
    },
    "cardholder_age": {
        "name": "Cardholder Age",
        "high": "The cardholder's age ({value}) falls in a demographic with higher fraud victimization rates.",
        "low": "The cardholder's age ({value}) is in a lower-risk demographic.",
    },
}

RISK_THRESHOLDS = {
    "foreign_transaction": lambda v: v == 1,
    "device_trust_score": lambda v: v < 40,
    "location_mismatch": lambda v: v == 1,
    "transaction_hour": lambda v: v >= 22 or v <= 4,
    "velocity_last_24h": lambda v: v >= 6,
    "amount": lambda v: v >= 3000,
    "cardholder_age": lambda v: v <= 25,
}


def validate_transaction_data(data):
    """
    Validate the structure and values of an incoming transaction request.
    Returns a list of error messages, or an empty list if valid.
    """
    errors = []
    
    required = [
        "amount", "transaction_hour", "merchant_category",
        "foreign_transaction", "location_mismatch",
        "device_trust_score", "velocity_last_24h", "cardholder_age",
    ]
    missing = [f for f in required if f not in data]
    if missing:
        errors.append(f"Missing required fields: {', '.join(missing)}")
        return errors

    # Validate amount
    try:
        amount = float(data.get("amount"))
        if amount < 0:
            errors.append("Amount must be a non-negative number")
    except (ValueError, TypeError):
        errors.append("Amount must be a valid number")
        
    # Validate transaction_hour
    try:
        hour = int(data.get("transaction_hour"))
        if not (0 <= hour <= 23):
            errors.append("Transaction hour must be between 0 and 23")
    except (ValueError, TypeError):
        errors.append("Transaction hour must be an integer between 0 and 23")
        
    # Validate device_trust_score
    try:
        score = int(data.get("device_trust_score"))
        if not (0 <= score <= 100):
            errors.append("Device trust score must be between 0 and 100")
    except (ValueError, TypeError):
        errors.append("Device trust score must be an integer between 0 and 100")
        
    # Validate velocity_last_24h
    try:
        velocity = int(data.get("velocity_last_24h"))
        if velocity < 0:
            errors.append("Velocity must be a non-negative integer")
    except (ValueError, TypeError):
        errors.append("Velocity must be a valid integer")
        
    # Validate cardholder_age
    try:
        age = int(data.get("cardholder_age"))
        if not (18 <= age <= 120):
            errors.append("Cardholder age must be between 18 and 120")
    except (ValueError, TypeError):
        errors.append("Cardholder age must be an integer between 18 and 120")
        
    # Validate foreign_transaction
    try:
        ft = int(data.get("foreign_transaction"))
        if ft not in [0, 1]:
            errors.append("Foreign transaction must be 0 or 1")
    except (ValueError, TypeError):
        errors.append("Foreign transaction must be 0 or 1")
        
    # Validate location_mismatch
    try:
        lm = int(data.get("location_mismatch"))
        if lm not in [0, 1]:
            errors.append("Location mismatch must be 0 or 1")
    except (ValueError, TypeError):
        errors.append("Location mismatch must be 0 or 1")
        
    # Validate merchant_category
    category = data.get("merchant_category")
    if category not in MERCHANT_CATEGORIES:
        errors.append(f"Merchant category must be one of: {', '.join(MERCHANT_CATEGORIES)}")
        
    return errors


def generate_explanation(data: dict, risk_level: str, prob: float) -> dict:
    """Generate human-readable explanation for the prediction."""
    reasons = []
    input_features = {
        "amount": data.get("amount", 0),
        "transaction_hour": data.get("transaction_hour", 0),
        "foreign_transaction": data.get("foreign_transaction", 0),
        "location_mismatch": data.get("location_mismatch", 0),
        "device_trust_score": data.get("device_trust_score", 50),
        "velocity_last_24h": data.get("velocity_last_24h", 0),
        "cardholder_age": data.get("cardholder_age", 30),
    }

    for feature, check_fn in RISK_THRESHOLDS.items():
        value = input_features.get(feature, 0)
        try:
            value = float(value)
        except (ValueError, TypeError):
            value = 0

        if feature in FEATURE_EXPLANATIONS:
            is_risky = check_fn(value)
            template = FEATURE_EXPLANATIONS[feature]
            text = template["high"] if is_risky else template["low"]
            try:
                text = text.format(value=value)
            except (KeyError, ValueError):
                pass
            reasons.append({
                "feature": template["name"],
                "is_risk_factor": is_risky,
                "explanation": text,
            })

    # Sort: risk factors first
    reasons.sort(key=lambda x: (not x["is_risk_factor"], x["feature"]))

    # Overall summary
    if risk_level == "high_risk":
        summary = f"This transaction has a {prob*100:.1f}% fraud probability. Multiple risk factors were detected including suspicious timing, device, or location patterns. We recommend blocking this transaction and verifying with the cardholder."
    elif risk_level == "medium_risk":
        summary = f"This transaction has a {prob*100:.1f}% fraud probability. Some risk indicators are present but not conclusive. We recommend additional verification before processing."
    else:
        summary = f"This transaction has a {prob*100:.1f}% fraud probability. All indicators are within normal parameters. This transaction appears legitimate."

    return {
        "summary": summary,
        "reasons": reasons,
    }


def build_feature_row(data: dict) -> dict:
    """Convert a raw transaction dict into the feature vector the model expects."""
    row = {
        "amount": float(data.get("amount", 0)),
        "transaction_hour": int(data.get("transaction_hour", 0)),
        "foreign_transaction": int(data.get("foreign_transaction", 0)),
        "location_mismatch": int(data.get("location_mismatch", 0)),
        "device_trust_score": int(data.get("device_trust_score", 50)),
        "velocity_last_24h": int(data.get("velocity_last_24h", 0)),
        "cardholder_age": int(data.get("cardholder_age", 30)),
    }

    cat = data.get("merchant_category", "Electronics")
    for c in MERCHANT_CATEGORIES:
        row[f"merchant_category_{c}"] = 1 if c == cat else 0

    row["avg_amount"] = 0.0
    row["tx_freq_1h"] = 0
    row["tx_freq_24h"] = 0
    row["unusual_location"] = 0

    return row


def predict_single(data: dict) -> dict:
    """Run prediction on a single transaction."""
    row = build_feature_row(data)

    feature_values = [row.get(col, 0) for col in FEATURE_COLUMNS]
    X = np.array([feature_values])

    prob = float(rf_model.predict_proba(X)[0][1])

    if prob >= 0.7:
        risk = "high_risk"
    elif prob >= 0.4:
        risk = "medium_risk"
    else:
        risk = "low_risk"

    # Feature importances
    importances = rf_model.feature_importances_
    top_features = sorted(
        zip(FEATURE_COLUMNS, importances),
        key=lambda x: x[1],
        reverse=True,
    )[:6]

    # Human-readable explanation
    explanation = generate_explanation(data, risk, prob)

    return {
        "transaction_id": str(uuid.uuid4()),
        "fraud_probability": round(prob, 4),
        "risk_level": risk,
        "timestamp": pd.Timestamp.now().isoformat(),
        "input_data": {
            "amount": data.get("amount"),
            "transaction_hour": data.get("transaction_hour"),
            "merchant_category": data.get("merchant_category"),
            "foreign_transaction": data.get("foreign_transaction"),
            "location_mismatch": data.get("location_mismatch"),
            "device_trust_score": data.get("device_trust_score"),
            "velocity_last_24h": data.get("velocity_last_24h"),
            "cardholder_age": data.get("cardholder_age"),
        },
        "explainability": {
            "top_features": [
                {"feature": name, "importance": round(float(imp), 4)}
                for name, imp in top_features
            ]
        },
        "explanation": explanation,
    }


# ── Auth Routes ─────────────────────────────────────────────
@app.route("/api/auth/signup", methods=["POST"])
@rate_limit(limit=5, window=60)
def signup():
    data = request.get_json(force=True)
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"detail": "Email and password are required"}), 400
    if not EMAIL_REGEX.match(email):
        return jsonify({"detail": "Invalid email address format"}), 400
    if len(password) < 6:
        return jsonify({"detail": "Password must be at least 6 characters"}), 400

    display_name = name or email.split("@")[0]
    pw_hash = generate_password_hash(password)
    created = pd.Timestamp.now().isoformat()

    conn = None
    try:
        conn = get_db()
        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (display_name, email, pw_hash, created),
        )
        conn.commit()
        user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({"detail": "An account with this email already exists"}), 409
    except Exception as e:
        return jsonify({"detail": f"Server error: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

    token = generate_auth_token(user_id)

    return jsonify({
        "user": {"name": display_name, "email": email},
        "token": token,
        "message": "Account created successfully",
    })


@app.route("/api/auth/login", methods=["POST"])
@rate_limit(limit=10, window=60)
def login():
    data = request.get_json(force=True)
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"detail": "Email and password are required"}), 400

    conn = None
    try:
        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    except Exception as e:
        return jsonify({"detail": f"Server error: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"detail": "Invalid email or password"}), 401

    token = generate_auth_token(user["id"])

    return jsonify({
        "user": {"name": user["name"], "email": user["email"]},
        "token": token,
        "message": "Login successful",
    })


# ── Prediction Routes ──────────────────────────────────────
@app.route("/api/demo/predict", methods=["POST"])
@login_required
def api_predict():
    """Single transaction prediction."""
    data = request.get_json(force=True)

    validation_errors = validate_transaction_data(data)
    if validation_errors:
        return jsonify({
            "detail": {
                "error": "Validation failed",
                "messages": validation_errors
            }
        }), 400

    try:
        result = predict_single(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"detail": f"Prediction error: {str(e)}"}), 500


@app.route("/api/demo/upload-csv", methods=["POST"])
@login_required
@rate_limit(limit=10, window=60)
def api_upload_csv():
    """Batch CSV upload and prediction."""
    if "file" not in request.files:
        return jsonify({"detail": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify({"detail": "Only CSV files are accepted"}), 400

    try:
        content = file.read().decode("utf-8")
        df = pd.read_csv(io.StringIO(content))
    except Exception as e:
        return jsonify({"detail": f"Failed to read CSV: {e}"}), 400

    predictions = []
    successful = 0
    failed = 0

    for idx, row_data in df.iterrows():
        try:
            data = row_data.to_dict()
            
            # Cast common columns to avoid strict type mismatch during dict conversion
            sanitized_data = {
                "amount": float(data.get("amount", 0)),
                "transaction_hour": int(data.get("transaction_hour", 0)),
                "merchant_category": str(data.get("merchant_category", "Electronics")),
                "foreign_transaction": int(data.get("foreign_transaction", 0)),
                "location_mismatch": int(data.get("location_mismatch", 0)),
                "device_trust_score": int(data.get("device_trust_score", 50)),
                "velocity_last_24h": int(data.get("velocity_last_24h", 0)),
                "cardholder_age": int(data.get("cardholder_age", 30))
            }
            
            result = predict_single(sanitized_data)
            predictions.append({
                "row_index": int(idx),
                "transaction_id": result["transaction_id"],
                "fraud_probability": result["fraud_probability"],
                "risk_level": result["risk_level"],
                "input_data": result["input_data"],
                "explainability": result["explainability"],
                "explanation": result["explanation"],
                "status": "success",
            })
            successful += 1
        except Exception as e:
            predictions.append({
                "row_index": int(idx),
                "status": "error",
                "error": str(e),
            })
            failed += 1

    return jsonify({
        "total_rows": len(df),
        "successful": successful,
        "failed": failed,
        "predictions": predictions,
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_features": len(FEATURE_COLUMNS)})


# ── Serve Frontend in Production ────────────────────────────
FRONTEND_DIST = os.path.abspath(os.path.join(MODEL_DIR, "../frontend/dist"))

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    else:
        if os.path.exists(os.path.join(FRONTEND_DIST, "index.html")):
            return send_from_directory(FRONTEND_DIST, "index.html")
        else:
            return jsonify({
                "message": "Welcome to FraudShield AI API. Frontend build not found.",
                "local_development_tip": "If running locally, run the frontend Vite dev server or run 'npm run build:frontend' from root."
            }), 200


# ── Run ─────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    app.run(debug=debug, host="0.0.0.0", port=port)
