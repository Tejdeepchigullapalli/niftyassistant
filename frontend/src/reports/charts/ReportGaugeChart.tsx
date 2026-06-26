import React from 'react';
import { Svg, Circle, Text, G, Line } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

interface ReportGaugeChartProps {
  score: number; // 0 to 100
  label: string;
  width?: number;
  height?: number;
  color?: string;
}

export function ReportGaugeChart({ score = 75, label, width = 110, height = 70, color = reportTheme.purple }: ReportGaugeChartProps) {
  const r = 24;
  const cx = width / 2;
  const cy = height - 15;
  const circ = 2 * Math.PI * r; // ~150.8
  const semiCirc = circ / 2;    // ~75.4

  // Offset calculations: 100 score corresponds to 0 offset on the half circle
  // 0 score corresponds to semiCirc offset
  const scoreRatio = Math.min(100, Math.max(0, score)) / 100;
  const strokeOffset = semiCirc - (scoreRatio * semiCirc);

  // Needle angle in radians (0 is left, Math.PI is right)
  const angleRad = Math.PI * scoreRatio;
  const needleX = cx - Math.cos(angleRad) * (r - 2);
  const needleY = cy - Math.sin(angleRad) * (r - 2);

  return (
    <Svg width={width} height={height}>
      <G transform={`rotate(-180 ${cx} ${cy})`}>
        {/* Background track (Grey semicircle) */}
        <Circle {...({
          cx: cx,
          cy: cy,
          r: r,
          fill: "none",
          stroke: `${reportTheme.border}B0`,
          strokeWidth: 6,
          strokeDasharray: `${semiCirc} ${circ}`,
          strokeDashoffset: semiCirc
        } as any)} />
        {/* Score Fill track (Colored semicircle) */}
        <Circle {...({
          cx: cx,
          cy: cy,
          r: r,
          fill: "none",
          stroke: color,
          strokeWidth: 6,
          strokeDasharray: `${semiCirc} ${circ}`,
          strokeDashoffset: strokeOffset + semiCirc
        } as any)} />
      </G>

      {/* Needle indicator */}
      <Line
        x1={cx}
        y1={cy}
        x2={needleX}
        y2={needleY}
        stroke={reportTheme.text}
        strokeWidth={1.5}
      />
      <Circle cx={cx} cy={cy} r={2} fill={reportTheme.text} />

      {/* Label and score display values */}
      <Text {...({
        x: cx,
        y: cy + 8,
        fill: reportTheme.text,
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        textAnchor: "middle"
      } as any)}>
        {score}%
      </Text>
      <Text {...({
        x: cx,
        y: cy + 13,
        fill: reportTheme.muted,
        fontSize: 5,
        fontFamily: "Helvetica-Bold",
        textAnchor: "middle",
        textTransform: "uppercase"
      } as any)}>
        {label}
      </Text>
    </Svg>
  );
}

export default ReportGaugeChart;
