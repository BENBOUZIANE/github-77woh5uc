interface StackedBarChartProps {
  data: {
    [category: string]: {
      [subCategory: string]: number;
    };
  };
  title?: string;
  colors?: {
    [key: string]: string;
  };
  width?: number;
  height?: number;
}

export default function StackedBarChart({
  data,
  title,
  colors = {
    'Grave': '#ef4444',
    'Non grave': '#10b981'
  },
  width = 600,
  height = 400
}: StackedBarChartProps) {
  const categories = Object.keys(data);
  const subCategories = categories.length > 0 ? Object.keys(data[categories[0]]) : [];

  const maxTotal = Math.max(
    ...categories.map(cat =>
      Object.values(data[cat]).reduce((sum, val) => sum + val, 0)
    )
  );

  const margin = { top: 40, right: 120, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const barWidth = chartWidth / (categories.length * 1.5);
  const scale = chartHeight / (maxTotal || 1);

  return (
    <div className="flex flex-col items-center">
      {title && <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>}
      <svg width={width} height={height} className="overflow-visible">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {categories.map((category, catIndex) => {
            const categoryTotal = Object.values(data[category]).reduce((sum, val) => sum + val, 0);
            const x = (catIndex * chartWidth) / categories.length + barWidth / 2;

            let cumulativeHeight = 0;

            return (
              <g key={category}>
                {subCategories.map((subCat) => {
                  const value = data[category][subCat] || 0;
                  const barHeight = value * scale;
                  const y = chartHeight - cumulativeHeight - barHeight;

                  const rect = (
                    <g key={`${category}-${subCat}`}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={colors[subCat] || '#94a3b8'}
                        opacity={0.9}
                        className="hover:opacity-100 transition-opacity"
                      />
                      {value > 0 && barHeight > 20 && (
                        <text
                          x={x + barWidth / 2}
                          y={y + barHeight / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs font-semibold fill-white"
                        >
                          {value}
                        </text>
                      )}
                    </g>
                  );

                  cumulativeHeight += barHeight;
                  return rect;
                })}

                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 15}
                  textAnchor="middle"
                  className="text-xs fill-slate-600"
                >
                  {category.length > 12 ? category.substring(0, 10) + '...' : category}
                </text>

                {categoryTotal > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - cumulativeHeight - 10}
                    textAnchor="middle"
                    className="text-sm font-bold fill-slate-700"
                  >
                    {categoryTotal}
                  </text>
                )}
              </g>
            );
          })}

          <line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="#cbd5e1"
            strokeWidth={2}
          />
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={chartHeight}
            stroke="#cbd5e1"
            strokeWidth={2}
          />

          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = chartHeight - tick * chartHeight;
            const value = Math.round(tick * maxTotal);
            return (
              <g key={tick}>
                <line
                  x1={0}
                  y1={y}
                  x2={-5}
                  y2={y}
                  stroke="#94a3b8"
                  strokeWidth={1}
                />
                <line
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  strokeDasharray="4"
                />
                <text
                  x={-10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-slate-600"
                >
                  {value}
                </text>
              </g>
            );
          })}
        </g>

        <g transform={`translate(${width - margin.right + 20}, ${margin.top + 20})`}>
          {subCategories.map((subCat, index) => (
            <g key={subCat} transform={`translate(0, ${index * 25})`}>
              <rect
                x={0}
                y={0}
                width={16}
                height={16}
                fill={colors[subCat] || '#94a3b8'}
                rx={2}
              />
              <text
                x={24}
                y={8}
                dominantBaseline="middle"
                className="text-xs fill-slate-700"
              >
                {subCat}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
