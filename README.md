# FraudShield AI 🛡️🤖

Welcome to **FraudShield AI**, a real-time Machine Learning-powered Fraud Detection System. This repository is structured as a unified **monorepo** containing both the React-based frontend application and the Flask-based Machine Learning backend.

---

## 📂 Repository Structure

The project is organized as follows:
- **`/backend`**: Python Flask API that loads the trained machine learning model (`model.pkl`), performs real-time transaction evaluations, manages SQLite authentication database (`users.db`), and handles CSV batch uploads.
- **`/frontend`**: React SPA built with Vite, Tailwind CSS v4, and ECharts for vibrant, dynamic fraud analytics and real-time simulations.
- **`/dataset`**: Contains credit card transaction sample data used for demonstration and model testing.

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
1. **Node.js** (v18+) and **npm**
2. **Python** (3.8+) and **pip**

### 1. Installation
Install all dependencies for both the frontend workspace and the Python backend in a single step from the root directory:
```bash
npm run install:all
```

*Note: You may want to activate your Python virtual environment (`venv`) before running this command if you prefer to keep Python dependencies isolated.*

### 2. Local Development Run
Start both the React development server and the Flask API concurrently:
```bash
npm run dev
```
- **React Frontend**: Runs on [http://localhost:5173](http://localhost:5173)
- **Flask API**: Runs on [http://localhost:5000](http://localhost:5000)

*Vite is configured to automatically proxy `/api` requests to `http://localhost:5000` during local development, preventing CORS issues.*

---

## 🚀 Unified Production Deployment (Single-Deploy)

In production, the React frontend and Flask API are designed to run together as a **single, consolidated web service**. This eliminates the need for separate hosting and completely resolves cross-origin resource sharing (CORS) concerns.

### How it works:
1. **Build the Frontend**: Compile the React SPA into static assets:
   ```bash
   npm run build:frontend
   ```
   This generates the compiled code inside `frontend/dist/`.

2. **Serve from Backend**: Start the Flask backend in production mode:
   ```bash
   # Using standard runner:
   npm run dev:backend
   
   # Or using gunicorn (on production Linux servers):
   npm run start:backend
   ```
   Flask automatically detects the `frontend/dist` directory and serves the compiled static files at the root domain (`/`), while maintaining all `/api` endpoints.

---

## 🎛️ Scripts Reference

All operations can be managed directly from the root folder:

| Command | Action |
|:---|:---|
| `npm run install:all` | Installs npm and pip dependencies. |
| `npm run dev` | Runs both the Vite frontend and Flask backend concurrently. |
| `npm run dev:frontend` | Runs the Vite frontend only. |
| `npm run dev:backend` | Runs the Flask backend only. |
| `npm run build:frontend`| Compiles the React SPA production bundle. |
| `npm run start:backend` | Starts the backend using Gunicorn (production environment). |

---

## 🛡️ License
Class project workspace for Fraud Detection ML. Made with love and modern web design principles.
