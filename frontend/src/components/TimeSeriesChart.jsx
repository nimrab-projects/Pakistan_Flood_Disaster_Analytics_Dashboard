import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  ReferenceLine,
} from 'recharts';

const HIST_COLOR = '#16a34a';
const FORECAST_COLOR = '#f97316';

const FORECAST_PANELS = [
  {
    key: 'rainfall',
    histKey: 'rainfall',
    title: 'Rainfall Forecast (mm) — 2026–2030',
    yLabel: 'Avg Rainfall (mm)',
    formatter: (v) => v != null ? `${Math.round(v)} mm` : '—',
  },
  {
    key: 'flooded_area',
    histKey: 'flooded_area',
    title: 'Flooded Area Forecast (sqkm) — 2026–2030',
    yLabel: 'Flooded Area (sqkm)',
    formatter: (v) => v != null ? `${Math.round(v).toLocaleString()} sqkm` : '—',
  },
  {
    key: 'houses_damaged',
    histKey: 'houses_damaged',
    title: 'Houses Damaged Forecast — 2026–2030',
    yLabel: 'Houses Damaged',
    formatter: (v) => v != null ? Math.round(v).toLocaleString() : '—',
  },
  {
    key: 'damages_usd',
    histKey: 'damages_usd',
    title: 'Economic Damages Forecast (USD Mn) — 2026–2030',
    yLabel: 'Damages (USD Mn)',
    formatter: (v) => v != null ? `$${Math.round(v).toLocaleString()} Mn` : '—',
  },
];

function buildChartData(historical, forecasts, histKey) {
  const lastHistYear = Math.max(...historical.map((h) => h.year));
  const lastHistValue = historical.find((h) => h.year === lastHistYear)?.[histKey];

  const chartData = historical.map((h) => ({
    year: h.year,
    historical: h[histKey],
    arimax_forecast: null,
    lower_ci: null,
    upper_ci: null,
  }));

  // bridge: connect green line to orange line at 2025
  const bridgeIdx = chartData.findIndex((d) => d.year === lastHistYear);
  if (bridgeIdx !== -1) {
    chartData[bridgeIdx].arimax_forecast = lastHistValue;
    chartData[bridgeIdx].lower_ci = lastHistValue;
    chartData[bridgeIdx].upper_ci = lastHistValue;
  }

  (forecasts || []).forEach((f) => {
    chartData.push({
      year: f.year,
      historical: null,
      arimax_forecast: f.predicted != null ? f.predicted : null,
      lower_ci: f.lower_ci != null ? Math.max(0, f.lower_ci) : 0,
      upper_ci: f.upper_ci != null ? f.upper_ci : null,
    });
  });

  chartData.sort((a, b) => a.year - b.year);

  // compute dynamic Y domain: min=0, max = 10% above the biggest value
  const allVals = chartData
    .flatMap((d) => [d.historical, d.arimax_forecast, d.upper_ci])
    .filter((v) => v != null && !isNaN(v));
  const maxVal = allVals.length ? Math.max(...allVals) : 100;
  const yMax = Math.ceil(maxVal * 1.15);

  return { chartData, lastHistYear, yDomain: [0, yMax] };
}

function formatYAxis(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value;
}

export default function TimeSeriesChart({ data }) {
  if (!data?.historical?.length) {
    return (
      <div className="rounded-xl border border-green-200 bg-flood-card p-8 text-center text-green-800">
        Run ARIMAX Time Series analysis to view this chart.
      </div>
    );
  }

  const lastHistYear = Math.max(...data.historical.map((h) => h.year));

  return (
    <div className="rounded-xl border border-green-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-lg font-bold text-flood-text">
        ARIMAX Multi-Target Forecasts — Pakistan Flood Indicators (2005–2030)
      </h3>
      <p className="mb-4 text-sm text-green-700">
        Solid line: observed values (2005–{lastHistYear}). Dotted line: ARIMAX projection
        ({data.forecast_range || '2026–2030'}) with covariate-adjusted forecasts.
      </p>

      {FORECAST_PANELS.map((panel) => {
        const { chartData, yDomain } = buildChartData(
          data.historical,
          data.forecasts?.[panel.key],
          panel.histKey
        );

        return (
          <div key={panel.key} className="mb-8 last:mb-0">
            <h4 className="mb-1 text-base font-semibold text-flood-text">
              {panel.title}
            </h4>
            {data.model_aic?.[panel.key] != null && (
              <p className="mb-3 text-xs text-green-600">
                AIC: {data.model_aic[panel.key]} — {data.model_summaries?.[panel.key]}
              </p>
            )}
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                data={chartData}
                margin={{ top: 16, right: 24, left: 20, bottom: 48 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#14532d', fontSize: 11 }}
                  label={{
                    value: 'Year',
                    position: 'insideBottom',
                    offset: -8,
                    fill: '#14532d',
                  }}
                />
                <YAxis
                  domain={yDomain}
                  tickFormatter={formatYAxis}
                  tick={{ fill: '#14532d', fontSize: 11 }}
                  width={60}
                  label={{
                    value: panel.yLabel,
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#14532d',
                    offset: -5,
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [panel.formatter(value), name]}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: 16 }}
                />
                <ReferenceLine
                  x={2025}
                  stroke="#86efac"
                  strokeDasharray="4 4"
                  label={{ value: 'Forecast →', fill: '#15803d', fontSize: 11, position: 'top' }}
                />
                <Area
                  dataKey="upper_ci"
                  stroke="none"
                  fill="#fed7aa"
                  fillOpacity={0.4}
                  name="Forecast Upper CI"
                  connectNulls={false}
                />
                <Area
                  dataKey="lower_ci"
                  stroke="none"
                  fill="#ffedd5"
                  fillOpacity={0.5}
                  name="Forecast Lower CI"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke={HIST_COLOR}
                  strokeWidth={3}
                  dot={{ r: 4, fill: HIST_COLOR }}
                  name="Historical Data"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="arimax_forecast"
                  stroke={FORECAST_COLOR}
                  strokeWidth={3}
                  strokeDasharray="8 5"
                  dot={{ r: 5, fill: FORECAST_COLOR, strokeWidth: 2, stroke: '#fff' }}
                  name="ARIMAX Forecast (2026–2030)"
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
