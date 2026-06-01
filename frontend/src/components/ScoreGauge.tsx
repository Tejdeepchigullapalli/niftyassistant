import { getScoreColor } from '../utils/api';

interface Props {
  score: number;
  label: string;
  size?: number;
}

export default function ScoreGauge({ score, label, size = 80 }: Props) {
  const color = getScoreColor(score);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1e2d4a" strokeWidth={6}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x={size / 2} y={size / 2 + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize={size * 0.22} fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {score}
        </text>
      </svg>
      <span className="text-xs text-center leading-tight" style={{ color: 'var(--text-muted)', maxWidth: size }}>
        {label}
      </span>
    </div>
  );
}
