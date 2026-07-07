# FraudShield AI 

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-19.2-61dafb.svg)
![Flask](https://img.shields.io/badge/flask-latest-black.svg)
![scikit-learn](https://img.shields.io/badge/scikit--learn-latest-orange.svg)

## 📌 Overview
**FraudShield AI** is a real-time, Machine Learning-powered Fraud Detection System designed to analyze financial transactions and identify suspicious activities. Financial institutions process millions of transactions daily, making manual review impossible. FraudShield AI solves this problem by using a trained Random Forest model to instantly evaluate transactions, flag high-risk behaviors, and provide human-readable explanations (Explainable AI) for its decisions. 

## ✨ Features
- **Real-Time Fraud Prediction**: Instantly evaluates individual transactions and returns a fraud probability score and risk level (Low, Medium, High).
- **Explainable AI (XAI)**: Generates human-readable explanations detailing exactly *why* a transaction was flagged (e.g., location mismatch, unusual time, suspicious device trust score).
- **Batch Processing**: Supports CSV uploads for bulk transaction analysis.
- **Secure User Authentication**: Custom built JWT-style token authentication using cryptographically signed tokens.
- **Rate Limiting**: Built-in IP-based rate limiting to prevent API abuse and brute-force attacks.
- **Interactive Dashboard**: Modern, responsive React SPA with dynamic charts and visualizations using ECharts.
- **Unified Production Deployment**: Streamlined architecture where the Flask backend serves the compiled React frontend, eliminating CORS issues in production.

## 💻 Tech Stack

### Frontend
- React (v19)
- Vite
- Tailwind CSS (v4)
- ECharts (Data Visualization)

### Backend
- Python (Flask)
- Flask-CORS
- Werkzeug & ItsDangerous (Security/Auth)

### Database
- SQLite (Local development and lightweight data storage)

### Machine Learning
- scikit-learn (Random Forest Classifier)
- Pandas & NumPy (Data Processing)
- imbalanced-learn
- Joblib (Model serialization)

### Deployment & Tools
- Node.js & npm
- Gunicorn (Production WSGI server)
- Git & GitHub

## 🏗️ Architecture
The system follows a standard modern client-server architecture with an integrated ML inference pipeline.

```mermaid
graph TD
    User(["👤 User"]) -->|"User access (HTTP/S)"| Frontend
    
    Frontend["⚛️ React Frontend<br/>Single Page Application (SPA)<br/>UI rendering, API client"]
    
    Frontend -->|"REST API Requests (JSON)"| Backend
    
    Backend["🧪 Python Flask Backend<br/>API Endpoints,<br/>Business Logic, Auth, Routing"]
    
    Backend -->|"Data Persistence"| DB
    Backend -->|"Model Inference/Predictions"| ML
    
    DB[/"🗄️ SQLite Database<br/>Local Data Storage,<br/>Application Data"\]
    
    ML["🤖 Machine Learning Model (Random Forest)<br/>Trained model, Predicts outcomes,<br/>Scikit-learn"]
```

1. The user authenticates and submits transaction data via the React frontend.
2. The Flask backend validates the input and rate-limits the request if necessary.
3. The data is transformed into a feature vector matching the model's expected format.
4. The pre-trained Random Forest model predicts the probability of fraud.
5. The backend analyzes the feature importances to generate a human-readable explanation.
6. Results are stored in the database (if applicable) and returned to the frontend dashboard.

## 📂 Folder Structure

```text
fraudshield-ai/
├── backend/                # Flask API and Machine Learning inference code
│   ├── app.py              # Main Flask application and API routes
│   ├── model.pkl           # Serialized Random Forest model
│   └── train_model.py      # Script used to train and export the ML model
├── frontend/               # React Single Page Application (SPA)
│   ├── src/                # React components, styles, and utilities
│   └── package.json        # Frontend dependencies
├── dataset/                # Sample datasets for testing and demonstration
├── package.json            # Root configuration for monorepo script execution
└── README.md               # Project documentation
```

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v18+)
- Python (3.8+)
- pip & npm

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/fraudshield-ai.git
cd fraudshield-ai
```

### 2. Install Dependencies
Install both frontend and backend dependencies in a single step from the root directory:
```bash
# We recommend creating and activating a Python virtual environment first
npm run install:all
```

### 3. Run the Development Servers
Start both the React frontend and Flask backend concurrently:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

*Vite is configured to proxy API requests to the backend, avoiding CORS issues during local development.*

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Flask Application Secret Key for signing auth tokens
SECRET_KEY=your_secure_random_string_here

# Allowed origins for CORS (Optional)
FRONTEND_URL=http://localhost:5173

# Port for the Flask server (Optional)
PORT=5000

# Enable or disable Flask debug mode (true/false)
FLASK_DEBUG=true
```

## 💡 Usage
1. **Register an account**: Navigate to the web application and create a new account.
2. **Dashboard**: Log in to access the main dashboard.
3. **Single Transaction Check**: Enter transaction details (amount, time, category, etc.) in the manual entry form to get an instant fraud prediction.
4. **Batch Processing**: Navigate to the upload section and submit a CSV file containing multiple transactions for bulk analysis.

## 📸 Screenshots

Here is a glimpse of the FraudShield AI interface in action:

### Dashboard & Analysis
![Analyze Transactions](docs/analyze-transactions.png)
*Real-time fraud prediction with explainable AI breakdowns.*

### Authentication
![Sign In Modal](docs/sign-in.png)
*Secure, token-based authentication system.*

### Landing Page & Features
![Hero Section](docs/hero-section.png)
*Modern, responsive landing page.*

![How It Works](docs/how-it-works.png)
*Clear 3-step pipeline explanation.*

![The Story](docs/story-comic.png)

*Interactive comic strip illustrating the importance of fraud prevention.*

## 🔮 Future Improvements
- **Asynchronous Processing**: Implement Celery and Redis to handle extremely large batch CSV uploads asynchronously without blocking the main thread.
- **Model Retraining Pipeline**: Build an automated pipeline to periodically retrain the model with new user-validated data to mitigate model drift.
- **PostgreSQL Migration**: Migrate from SQLite to PostgreSQL for robust production-level database management and concurrency.
- **Dockerization**: Containerize both the frontend and backend using Docker and Docker Compose for easier environment replication and deployment.

## 🧠 Learning Outcomes
Building and exploring this project provides practical experience in:
- Integrating Machine Learning models into a traditional REST API.
- Implementing Explainable AI (XAI) to translate raw probabilities into actionable business insights.
- Securing web applications with custom authentication schemes and rate limiting.
- Managing a monorepo setup running both Node.js and Python ecosystems concurrently.
- Designing responsive, data-rich user interfaces using React and ECharts.

## 📄 License
This project is licensed under the MIT License.
