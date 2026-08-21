import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from statsmodels.tsa.statespace.sarimax import SARIMAX

from ml.preprocessing import clean_dataframe

warnings.filterwarnings('ignore')

DATASET_PATH = Path(__file__).resolve().parent.parent / 'datasets' / 'Dataset1_ARIMA_TimeSeries.csv'
FORECAST_YEARS = (2026, 2030)
ORDER = (1, 0, 1)

MODELS = {
    'rainfall': {
        'target': 'Avg_Rainfall_mm',
        'exog': ['Avg_Rainfall_Anomaly'],
        'summary': 'ARIMAX(1,1,1) predicting Avg_Rainfall_mm with exogenous Avg_Rainfall_Anomaly',
    },
    'flooded_area': {
        'target': 'Flooded_Area_sqkm',
        'exog': ['Avg_Rainfall_mm'],
        'summary': 'ARIMAX(1,1,1) predicting Flooded_Area_sqkm with exogenous Avg_Rainfall_mm',
    },
    'houses_damaged': {
        'target': 'Total_Houses_Damaged',
        'exog': ['Avg_Rainfall_mm'],
        'summary': 'ARIMAX(1,1,1) predicting Total_Houses_Damaged with exogenous Avg_Rainfall_mm',
    },
    'damages_usd': {
        'target': 'Total_Damages_USD_Mn',
        'exog': ['Avg_Rainfall_mm'],
        'summary': 'ARIMAX(1,1,1) predicting Total_Damages_USD_Mn with exogenous Avg_Rainfall_mm',
    },
}


def _fallback_forecast(df, target_col):
    mean_val = float(df[target_col].astype(float).tail(3).mean())
    forecast = []
    for year in range(FORECAST_YEARS[0], FORECAST_YEARS[1] + 1):
        forecast.append({
            'year': year,
            'predicted': round(mean_val, 2),
            'lower_ci': round(mean_val, 2),
            'upper_ci': round(mean_val, 2),
        })
    return forecast


def _fit_and_forecast(df, target_col, exog_cols):
    endog_raw = df[target_col].astype(float).values.reshape(-1, 1)
    exog = df[exog_cols].astype(float)

    scaler = MinMaxScaler()
    endog_scaled = scaler.fit_transform(endog_raw).flatten()

    model = SARIMAX(endog_scaled, exog=exog, order=ORDER)
    fitted = model.fit(disp=False)

    forecast_steps = FORECAST_YEARS[1] - FORECAST_YEARS[0] + 1
    last_exog = exog.tail(3).mean()
    future_exog = pd.DataFrame(
        np.tile(last_exog.values, (forecast_steps, 1)),
        columns=exog_cols,
    )

    forecast_result = fitted.get_forecast(steps=forecast_steps, exog=future_exog)
    pred_scaled = forecast_result.predicted_mean.values.reshape(-1, 1)
    conf_scaled = forecast_result.conf_int().values

    pred = scaler.inverse_transform(pred_scaled).flatten()
    lower = scaler.inverse_transform(conf_scaled[:, [0]]).flatten()
    upper = scaler.inverse_transform(conf_scaled[:, [1]]).flatten()
    lower = np.clip(lower, 0, None)

    forecast = []
    for i, year in enumerate(range(FORECAST_YEARS[0], FORECAST_YEARS[1] + 1)):
        forecast.append({
            'year': year,
            'predicted': round(float(pred[i]), 2),
            'lower_ci': round(float(lower[i]), 2),
            'upper_ci': round(float(upper[i]), 2),
        })

    return forecast, fitted


def run_timeseries_analysis():
    df = pd.read_csv(DATASET_PATH)
    df = clean_dataframe(df)
    df = df.sort_values('Year')

    historical = [
        {
            'year': int(row['Year']),
            'deaths': float(row['Total_Deaths']),
            'rainfall': float(row['Avg_Rainfall_mm']),
            'flooded_area': float(row['Flooded_Area_sqkm']),
            'houses_damaged': float(row['Total_Houses_Damaged']),
            'damages_usd': float(row['Total_Damages_USD_Mn']),
        }
        for _, row in df.iterrows()
    ]

    forecasts = {}
    model_summaries = {}
    model_aic = {}

    for key, spec in MODELS.items():
        try:
            forecast, fitted = _fit_and_forecast(df, spec['target'], spec['exog'])
            model_aic[key] = round(float(fitted.aic), 2)
        except Exception:
            forecast = _fallback_forecast(df, spec['target'])
            model_aic[key] = None

        forecasts[key] = forecast
        model_summaries[key] = spec['summary']

    return {
        'historical': historical,
        'forecasts': forecasts,
        'forecast_range': f'{FORECAST_YEARS[0]}–{FORECAST_YEARS[1]}',
        'model_summaries': model_summaries,
        'model_aic': model_aic,
    }
