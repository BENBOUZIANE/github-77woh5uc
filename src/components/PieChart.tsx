interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export default function PieChart({ data, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-slate-100 border-4 border-slate-200"
        style={{ width: size, height: size }}
      >
        <span className="text-slate-400 font-medium">Aucune donnée</span>
      </div>
    );
  }

  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startX = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
    const startY = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
    const endX = 50 + 50 * Math.cos((startAngle + angle - 90) * Math.PI / 180);
    const endY = 50 + 50 * Math.sin((startAngle + angle - 90) * Math.PI / 180);
    const largeArcFlag = angle > 180 ? 1 : 0;

    const path = `M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

    return {
      ...item,
      path,
      percentage: percentage.toFixed(1),
      startAngle,
      angle
    };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.path}
                fill={segment.color}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
            </g>
          ))}
          <circle
            cx="50"
            cy="50"
            r="25"
            fill="white"
            className="drop-shadow-lg"
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[8px] font-bold fill-slate-700"
            transform="rotate(90 50 50)"
          >
            {total}
          </text>
          <text
            x="50"
            y="58"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[4px] fill-slate-500"
            transform="rotate(90 50 50)"
          >
            Total
          </text>
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: segment.color }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">
                {segment.label}
              </span>
              <span className="text-xs text-slate-500">
                {segment.value} ({segment.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
