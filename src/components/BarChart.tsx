interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  height?: number;
}

export default function BarChart({ data, height = 300 }: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-4 justify-around" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 60);

          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="text-center mb-2">
                <div className="text-2xl font-bold text-slate-900">{item.value}</div>
              </div>
              <div
                className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 relative group"
                style={{
                  backgroundColor: item.color,
                  height: barHeight || 4,
                  minHeight: item.value > 0 ? 4 : 0
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                  {item.value}
                </div>
              </div>
              <div className="text-sm font-medium text-slate-700 text-center mt-2">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
