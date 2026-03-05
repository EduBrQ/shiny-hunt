import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface DistributionChartProps {
  data: number[];
  pokemonColor: string;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ data, pokemonColor }) => {
  if (!data || data.length === 0) return null;

  // Criar histograma
  const maxAttempts = Math.max(...data);
  const minAttempts = Math.min(...data);
  const range = maxAttempts - minAttempts;
  const binCount = Math.min(20, Math.ceil(Math.sqrt(data.length)));
  const binSize = Math.ceil(range / binCount);

  const bins: number[] = new Array(binCount).fill(0);
  
  data.forEach(attempts => {
    const binIndex = Math.min(Math.floor((attempts - minAttempts) / binSize), binCount - 1);
    bins[binIndex]++;
  });

  const maxBinValue = Math.max(...bins);
  const binLabels = bins.map((_, index) => {
    const start = minAttempts + index * binSize;
    const end = Math.min(start + binSize - 1, maxAttempts);
    return `${start}-${end}`;
  });

  return (
    <div className="chart-container">
      <h3>📊 Distribuição de Tentativas</h3>
      <div className="distribution-chart">
        <div className="chart-bars">
          {bins.map((value, index) => (
            <div key={index} className="chart-bar-wrapper">
              <div className="chart-bar" style={{ 
                height: `${(value / maxBinValue) * 100}%`,
                backgroundColor: pokemonColor,
                opacity: 0.8 + (value / maxBinValue) * 0.2
              }} />
              <div className="chart-bar-label">{value}</div>
              <div className="chart-bar-range">{binLabels[index]}</div>
            </div>
          ))}
        </div>
        <div className="chart-axis">
          <span>{minAttempts}</span>
          <span>{maxAttempts}</span>
        </div>
      </div>
    </div>
  );
};

interface HeatmapProps {
  data: number[];
  pokemonColor: string;
}

export const LuckyHeatmap: React.FC<HeatmapProps> = ({ data, pokemonColor }) => {
  if (!data || data.length === 0) return null;

  // Criar grid 10x10 de "sorte"
  const gridSize = 10;
  const gridData: number[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
  
  // Distribuir dados aleatoriamente no grid
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  let dataIndex = 0;
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (dataIndex < shuffled.length) {
        gridData[i][j] = shuffled[dataIndex++];
      }
    }
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);

  const getHeatmapColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    const opacity = 0.2 + normalized * 0.8;
    return `${pokemonColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  };

  return (
    <div className="chart-container">
      <h3>🍀 Mapa de Sorte</h3>
      <p className="chart-subtitle">Células mais claras = menos tentativas necessárias</p>
      <div className="heatmap-grid">
        {gridData.map((row, i) => (
          row.map((value, j) => (
            <div
              key={`${i}-${j}`}
              className="heatmap-cell"
              style={{
                backgroundColor: getHeatmapColor(value),
                border: `1px solid ${pokemonColor}33`
              }}
              title={`${value} tentativas`}
            >
              <span className="heatmap-value">{value}</span>
            </div>
          ))
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Sorte ↗</span>
        <div className="legend-gradient" style={{ background: `linear-gradient(to right, ${pokemonColor}33, ${pokemonColor})` }} />
        <span>Sorte ↘</span>
      </div>
    </div>
  );
};

interface StatsOverviewProps {
  data: number[];
  pokemonColor: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ data, pokemonColor }) => {
  if (!data || data.length === 0) return null;

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const sorted = [...data].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const stdDev = Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length);

  const percentiles = {
    p25: sorted[Math.floor(sorted.length * 0.25)],
    p75: sorted[Math.floor(sorted.length * 0.75)],
    p90: sorted[Math.floor(sorted.length * 0.9)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };

  return (
    <div className="chart-container">
      <h3>📈 Análise Estatística Avançada</h3>
      <div className="stats-grid">
        <div className="stat-card-advanced" style={{ borderColor: pokemonColor }}>
          <div className="stat-title">Média</div>
          <div className="stat-value-advanced">{mean.toFixed(1)}</div>
        </div>
        <div className="stat-card-advanced" style={{ borderColor: pokemonColor }}>
          <div className="stat-title">Mediana</div>
          <div className="stat-value-advanced">{median}</div>
        </div>
        <div className="stat-card-advanced" style={{ borderColor: pokemonColor }}>
          <div className="stat-title">Desvio Padrão</div>
          <div className="stat-value-advanced">{stdDev.toFixed(1)}</div>
        </div>
        <div className="stat-card-advanced" style={{ borderColor: pokemonColor }}>
          <div className="stat-title">Min/Max</div>
          <div className="stat-value-advanced">{min} / {max}</div>
        </div>
      </div>

      <div className="percentiles-section">
        <h4>Percentuais</h4>
        <div className="percentile-bars">
          {Object.entries(percentiles).map(([percentile, value]) => (
            <div key={percentile} className="percentile-item">
              <span className="percentile-label">{percentile.toUpperCase()}:</span>
              <div className="percentile-bar">
                <div 
                  className="percentile-fill" 
                  style={{ 
                    width: `${(value / max) * 100}%`,
                    backgroundColor: pokemonColor 
                  }}
                />
              </div>
              <span className="percentile-value">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
