import React from 'react';
import { Svg, Circle, Text, G, Rect } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

interface ReportDonutChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  width?: number;
  height?: number;
}

export function ReportDonutChart({ data = [], width = 160, height = 90 }: ReportDonutChartProps) {
  if (data.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({
          x: width / 2,
          y: height / 2,
          fill: reportTheme.muted,
          fontSize: 8,
          textAnchor: "middle"
        } as any)}>No allocation data</Text>
      </Svg>
    );
  }

  // Radius of donut circle
  const r = 24;
  const cx = 45;
  const cy = height / 2;
  const circ = 2 * Math.PI * r; // ~150.8

  // Calculate percentages
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const colors = [
    reportTheme.purple,
    reportTheme.blue,
    reportTheme.green,
    reportTheme.orange,
    reportTheme.red,
    reportTheme.subtle
  ];

  let accumulatedPercentage = 0;

  return (
    <Svg width={width} height={height}>
      {/* Circle Slices using strokeDasharray and strokeDashoffset */}
      <G transform={`rotate(-90 ${cx} ${cy})`}>
        {data.map((item, idx) => {
          const pct = (item.value / total) * 100;
          const strokeLength = (pct / 100) * circ;
          const strokeOffset = circ - strokeLength + (accumulatedPercentage / 100) * circ;
          accumulatedPercentage += pct;

          const color = item.color || colors[idx % colors.length];

          return (
            <Circle {...({
              cx: cx,
              cy: cy,
              r: r,
              fill: "none",
              stroke: color,
              strokeWidth: 10,
              strokeDasharray: `${strokeLength} ${circ}`,
              strokeDashoffset: strokeOffset
            } as any)} key={idx} />
          );
        })}
        {/* Inner center hole */}
        <Circle cx={cx} cy={cy} r={r - 5} fill={reportTheme.cardBackground} />
      </G>

      {/* Legends column on the right side */}
      <G>
        {data.slice(0, 5).map((item, idx) => {
          const lX = 100;
          const lY = 12 + idx * 13;
          const color = item.color || colors[idx % colors.length];
          const pct = (item.value / total) * 100;

          return (
            <G key={idx}>
              <Rect
                x={lX}
                y={lY}
                width={5}
                height={5}
                fill={color}
                rx={1}
              />
              <Text {...({
                x: lX + 8,
                y: lY + 4,
                fill: reportTheme.text,
                fontSize: 5.5,
                fontFamily: "Helvetica-Bold"
              } as any)}>
                {item.label.length > 10 ? `${item.label.slice(0, 9)}...` : item.label} ({pct.toFixed(0)}%)
              </Text>
            </G>
          );
        })}
      </G>
    </Svg>
  );
}

export default ReportDonutChart;
