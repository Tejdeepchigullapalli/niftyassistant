import React from 'react';
import { Svg, Rect, Text, G } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

interface ScoreComponent {
  label: string;
  score: number;
  desc: string;
}

interface ReportScoreBarsProps {
  scores: ScoreComponent[];
  width?: number;
  height?: number;
}

export function ReportScoreBars({ scores = [], width = 380, height = 110 }: ReportScoreBarsProps) {
  if (scores.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({
          x: width / 2,
          y: height / 2,
          fill: reportTheme.muted,
          fontSize: 8,
          textAnchor: "middle"
        } as any)}>No score analysis available</Text>
      </Svg>
    );
  }

  const rowHeight = 17;
  const barWidth = 140;
  const barHeight = 4.5;
  const colors = [
    reportTheme.blue,
    reportTheme.purple,
    reportTheme.green,
    reportTheme.orange,
    reportTheme.blue,
    reportTheme.red
  ];

  return (
    <Svg width={width} height={height}>
      {scores.map((s, idx) => {
        const y = idx * rowHeight + 4;
        const color = s.score >= 70 ? reportTheme.green : s.score >= 50 ? reportTheme.orange : reportTheme.red;
        const fillWidth = (s.score / 100) * barWidth;

        return (
          <G key={idx}>
            {/* Label */}
            <Text {...({
              x: 5,
              y: y + 5,
              fill: reportTheme.text,
              fontSize: 6.5,
              fontFamily: "Helvetica-Bold"
            } as any)}>
              {s.label}
            </Text>

            {/* Score Number */}
            <Text {...({
              x: 90,
              y: y + 5,
              fill: color,
              fontSize: 6.5,
              fontFamily: "Helvetica-Bold",
              textAnchor: "end"
            } as any)}>
              {s.score}/100
            </Text>

            {/* Progress track */}
            <Rect
              x={100}
              y={y + 1}
              width={barWidth}
              height={barHeight}
              fill={`${reportTheme.border}B0`}
              rx={2}
            />

            {/* Progress fill */}
            <Rect
              x={100}
              y={y + 1}
              width={fillWidth}
              height={barHeight}
              fill={color}
              rx={2}
            />

            {/* Description */}
            <Text {...({
              x: 250,
              y: y + 5,
              fill: reportTheme.muted,
              fontSize: 5.8
            } as any)}>
              {s.desc.length > 36 ? `${s.desc.slice(0, 35)}...` : s.desc}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

export default ReportScoreBars;
