# Pakistan Flood ML Analytics Dashboard

Full-stack analytics platform for Pakistan flood data (2005–2025). Upload five CSV/Excel datasets, run five ML models, and explore results through an interactive React dashboard with a light-green UI.

**Live repo:** [github.com/kamizox/pdf-extraction-pipeline-Proj](https://github.com/kamizox/pdf-extraction-pipeline-Proj)

---

## Features

| Module | Algorithm | Dataset | Objective |
|--------|-----------|---------|-----------|
| 1 | ARIMAX(2,1,2) | Yearly time series (21 rows) | Forecast annual casualties 2026–2030 |
| 2 | XGBoost | District records (2,267 rows) | Multilevel fatality tier classification |
| 3 | NLP analytics | Incident reports (2,267 rows) | Sentiment & report quality (Valid/Incomplete) |
| 4 | CNN (PyTorch) | Damage features (2,267 rows) | 4×3 heatmap grids → damage tier prediction |
| 5 | K-Means (k=3) | Risk zones (2,267 rows) | Unsupervised regional risk clustering |

- **Upload flow:** Five dedicated dataset slots before entering the dashboard  
- **Auto-detect:** Run all models in one request  
- **Charts:** Recharts (line, bar, pie, scatter, heatmap grids)  
- **API docs:** FastAPI Swagger at `/docs`

---

## Visual Tour & Screenshots

Here is a visual walkthrough of the Pakistan Flood ML Analytics Dashboard:

### 1. Dataset Upload Portal
Before analyzing, upload the 5 dedicated datasets to initialize the pipeline.
![Upload Portal](images/image1.1.png)

### 2. ARIMAX Time Series Forecasting (Module 1)
Forecasts rainfall, flooded area, and houses damaged for 2026–2030.
![ARIMA Rainfall Forecast](images/image1.png)
![ARIMA Flooded Area and Houses Damaged Forecast](images/image2.png)

### 3. XGBoost Fatality Tier Classification (Module 2)
Classifies emergency incidents and ranks feature importance with a confusion matrix.
![XGBoost Classification](images/image3.png)

### 4. NLP Sentiment & Data Quality Analytics (Module 3)
Analyzes incident report text quality (Valid vs. Incomplete) and sentiment by province.
![NLP Sentiment Analytics](images/image4.png)

### 5. PyTorch CNN Damage Tier Prediction (Module 4)
Reshapes 12 flood features into 4×3 spatial grids to predict infrastructure damage tiers.
![CNN Grid Training](images/image5.png)
![CNN Confusion Matrix & Feature Importance](images/image6.png)

### 6. K-Means Regional Risk Clustering (Module 5)
Groups districts into Low, Medium, and High risk zones with a high silhouette score.
![K-Means Clustering](images/image7.png)

### 7. Plotly Multi-Metric Overview
Provides a year-by-year comparison of total casualties vs. average rainfall.
![Plotly Overview](images/image8.png)

---

## Project structure

```
flood-ml-project/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── routes/              # upload, analyze
│   ├── ml/                  # ML modules
│   ├── datasets/            # 5 CSV datasets
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # UploadPage, Dashboard
│   │   └── components/      # Charts & selectors
│   └── package.json
└── .github/workflows/ci.yml
```

---

## Prerequisites

- **Python 3.11+** (3.14 works; TensorFlow not required — CNN uses PyTorch)  
- **Node.js 18+** and npm  
- **Git**

---

## Quick start

### Local Development

### 1. Clone the repository

```bash
git clone https://github.com/kamizox/pdf-extraction-pipeline-Proj.git
cd pdf-extraction-pipeline-Proj
```

### 2. Backend (port 8000)

```bash
cd backend
pip install -r requirements.txt
pip install torch
python generate_datasets.py   # only if datasets/ is empty
uvicorn main:app --reload --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

### 3. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### 4. Workflow

1. Upload all **5 datasets** on the landing page (or use bundled CSVs in `backend/datasets/`).  
2. Click **Go to Dashboard**.  
3. Select an algorithm → **Run Analysis**.  
4. Switch tabs: ARIMA, XGBoost, NLP, CNN, KMeans, Plotly overview.

---

## 🚀 Deployment

### Live Demo
**Backend API:** https://pdf-extraction-pipeline-proj-production.up.railway.app ✅  
**API Docs:** https://pdf-extraction-pipeline-proj-production.up.railway.app/docs ✅  
**Frontend:** [Deploy now - see below](#deploy-frontend)

### Deploy Frontend (5 minutes) - No Credit Card Required!
See [DEPLOY_FRONTEND_NOW.md](DEPLOY_FRONTEND_NOW.md) for quick deployment to Vercel.

### Full Deployment Guides
- **Quick Start:** [RAILWAY_QUICK_START.md](RAILWAY_QUICK_START.md) - 5-minute guide
- **Detailed Guide:** [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) - Complete instructions
- **Frontend Guide:** [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Vercel deployment

**Platforms:**
- **Frontend:** Vercel (free tier, no credit card)
- **Backend:** Railway.app (free tier, no credit card) ✅ DEPLOYED

**Why Railway?** No credit card required, $5 free credits/month, no cold starts!

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload CSV/XLSX (`dataset_key`: dataset1–dataset5) |
| `GET` | `/api/dataset/info` | Metadata for all five datasets |
| `POST` | `/api/analyze/timeseries` | ARIMAX forecast |
| `POST` | `/api/analyze/xgboost` | Fatality classification |
| `POST` | `/api/analyze/nlp` | Sentiment & data quality |
| `POST` | `/api/analyze/cnn` | CNN heatmap damage model |
| `POST` | `/api/analyze/clustering` | K-Means risk zones |
| `POST` | `/api/analyze/auto` | Run all five models |

---

## Datasets

| File | Used by |
|------|---------|
| `Dataset1_ARIMA_TimeSeries.csv` | ARIMAX |
| `Dataset2_XGBoost_Classification.csv` | XGBoost |
| `Dataset3_NLP_Sentiment.csv` | NLP |
| `Dataset4_CNN_DamagePrediction.csv` | CNN |
| `Dataset5_KMeans_RiskZones.csv` | K-Means |

Each analyze endpoint loads **only** its dedicated dataset from `backend/datasets/`.

---

## Tech stack

- **Backend:** FastAPI, pandas, scikit-learn, XGBoost, statsmodels, PyTorch  
- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Axios  
- **CI:** GitHub Actions (backend smoke tests + frontend build)

---

## Notes

- **K-Means:** Silhouette ≈ 0.885 with k=3 on raw scaled features; most districts cluster as low risk, reflecting real flood exposure (extreme years like 2010/2022 are rare high-risk outliers).  
- **CNN:** Rows are reshaped to 4×3 single-channel heatmaps from 12 normalized features.  
- **CORS:** Frontend origins `http://localhost:5173` and `http://localhost:3000` are allowed.

---

## Troubleshooting

### "Not Found" Error on /api/dataset/info

**Problem:** Multiple backend instances running on port 8000 simultaneously.

**Quick Fix (Windows):**
```cmd
fix_backend.bat
```

**Manual Fix:**
```cmd
# 1. Kill all processes on port 8000
netstat -ano | findstr :8000
taskkill /F /PID [PID_NUMBER]

# 2. Start backend cleanly
cd backend
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 3. Verify routes work
curl http://localhost:8000/api/dataset/info
```

**Verify only ONE process is running:**
```cmd
netstat -ano | findstr :8000
```

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

### Easy Startup

Use the automated startup script:
```cmd
start_project.bat
```

This will:
1. Clean up any existing backend processes
2. Start backend on port 8000
3. Start frontend on port 5173
4. Open the application in your browser

---

## License

Academic / project use. Add a license file if you publish publicly.
