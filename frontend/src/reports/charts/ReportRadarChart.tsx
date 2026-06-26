import React from 'react';
import { Svg, Polygon, Text, Line, G, Circle } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

interface ReportRadarChartProps {
  scores: Array<{ label: string; value: number }>;
  width?: number;
  height?: number;
}

export function ReportRadarChart({ scores = [], width = 180, height = 110 }: ReportRadarChartProps) {
  if (scores.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({
          x: width / 2,
          y: height / 2,
          fill: reportTheme.muted,
          fontSize: 8,
          textAnchor: "middle"
        } as any)}>No radar score data available</Text>
      </Svg>
    );
  }

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = 38;

  // Calculate coordinates on radar axes
  const getCoordinates = (index: number, value: number, total: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r
    };
  };

  const totalAxes = scores.length;
  
  // Background grid polygons (50% and 100%)
  const gridPoints50 = scores.map((_, i) => getCoordinates(i, 50, totalAxes));
  const gridPoints100 = scores.map((_, i) => getCoordinates(i, 100, totalAxes));

  const pointsString100 = gridPoints100.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const pointsString50 = gridPoints50.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Plot data points
  const dataPoints = scores.map((s, i) => getCoordinates(i, s.value, totalAxes));
  const dataPointsString = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <Svg width={width} height={height}>
      {/* Outer grid boundary */}
      <Polygon
        points={pointsString100}
        fill="none"
        stroke={`${reportTheme.border}B0`}
        strokeWidth={0.8}
      />
      {/* Middle grid boundary */}
      <Polygon
        points={pointsString50}
        fill="none"
        stroke={`${reportTheme.border}40`}
        strokeWidth={0.5}
        strokeDasharray="1 1"
      />

      {/* Axis lines */}
      {scores.map((_, i) => {
        const outerPt = getCoordinates(i, 100, totalAxes);
        return (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={outerPt.x}
            y2={outerPt.y}
            stroke={`${reportTheme.border}50`}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data Polygon */}
      <Polygon
        points={dataPointsString}
        fill={`${reportTheme.purple}20`}
        stroke={reportTheme.purple}
        strokeWidth={1}
      />

      {/* Label texts around the radar */}
      {scores.map((s, i) => {
        const outerPt = getCoordinates(i, 116, totalAxes);
        const textAnchor = outerPt.x > cx + 5 ? 'start' : outerPt.x < cx - 5 ? 'end' : 'middle';

        return (
          <Text key={i} {...({
            x: outerPt.x,
            y: outerPt.y + 2.5,
            fill: reportTheme.muted,
            fontSize: 5.2,
            fontFamily: "Helvetica-Bold",
            textAnchor: textAnchor
          } as any)}>
            {s.label} ({s.value})
          </Text>
        );
      })}
    </Svg>
  );
}

export default ReportRadarChart;
