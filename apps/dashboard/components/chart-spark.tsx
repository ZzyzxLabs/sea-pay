interface ChartSparkProps {
  points: number[];
}

export default function ChartSpark({ points }: ChartSparkProps) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const height = 48;

  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 120;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg width="120" height={height} viewBox={`0 0 120 ${height}`}>
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary"
      />
    </svg>
  );
}
