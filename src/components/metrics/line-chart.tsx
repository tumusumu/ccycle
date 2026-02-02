'use client';

export interface IDataPoint {
  date: string;
  value: number;
}

export interface ILineChartProps {
  data: IDataPoint[];
  color?: string;
  height?: number;
  showDots?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  yAxisLabel?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function LineChart({
  data,
  color = '#4A90D9',
  height = 200,
  showDots = true,
  showGrid = true,
  showLabels = true,
  yAxisLabel,
  formatValue = (v) => v.toFixed(1),
  className = '',
}: ILineChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-[#5D6D7E] ${className}`}
        style={{ height }}
      >
        暂无数据
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = 100; // percentage based
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate value range
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const paddedMin = minValue - valueRange * 0.1;
  const paddedMax = maxValue + valueRange * 0.1;
  const paddedRange = paddedMax - paddedMin;

  // Generate Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) =>
    paddedMin + (paddedRange * i) / (yTicks - 1)
  );

  // Calculate points
  const points = data.map((d, i) => {
    const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100;
    const y = chartHeight - ((d.value - paddedMin) / paddedRange) * chartHeight;
    return { x, y, ...d };
  });

  // Create SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full overflow-visible"
        style={{ height }}
      >
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <g transform={`translate(0, ${padding.top})`}>
          {/* Grid lines */}
          {showGrid && yTickValues.map((tick, i) => {
            const y = chartHeight - ((tick - paddedMin) / paddedRange) * chartHeight;
            return (
              <line
                key={i}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#EEF2F7"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Area fill */}
          <path
            d={areaD}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {showDots && points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="white"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>

      {/* Y-axis labels */}
      {showLabels && (
        <div
          className="absolute left-0 top-0 flex flex-col justify-between text-xs text-[#5D6D7E]"
          style={{
            height: chartHeight,
            marginTop: padding.top,
            transform: 'translateX(-100%)',
            paddingRight: 8,
          }}
        >
          {yTickValues.reverse().map((tick, i) => (
            <span key={i}>{formatValue(tick)}</span>
          ))}
        </div>
      )}

      {/* X-axis labels */}
      {showLabels && data.length > 0 && (
        <div className="flex justify-between text-xs text-[#5D6D7E] mt-2 px-1">
          <span>{formatDateLabel(data[0].date)}</span>
          {data.length > 2 && (
            <span>{formatDateLabel(data[Math.floor(data.length / 2)].date)}</span>
          )}
          <span>{formatDateLabel(data[data.length - 1].date)}</span>
        </div>
      )}

      {/* Y-axis label */}
      {yAxisLabel && (
        <div className="text-xs text-[#5D6D7E] text-center mt-1">
          {yAxisLabel}
        </div>
      )}
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
