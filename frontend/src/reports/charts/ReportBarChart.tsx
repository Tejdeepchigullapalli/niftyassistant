import React from 'react';
import { Svg, Rect, Text, Line, G } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { ReportChartBuilder, ChartFrame } from '../services/reportChartBuilder';

interface ReportBarChartProps {
  data: Array<{ label: string; value: number }>;
  width?: number;
  height?: number;
  color?: string;
  valueSuffix?: string;
}

export function ReportBarChart({ data = [], width = 180, height = 90, color = reportTheme.purple, valueSuffix = '' }: ReportBarChartProps) {
  if (data.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({ x: width/2, y: height/2, fill: reportTheme.muted, fontSize: 8, textAnchor: "middle" } as any)}>No data available</Text>
      </Svg>
    );
  }

  const frame: ChartFrame = {
    width,
    height,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 15,
    paddingLeft: 22,
  };

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 0) || 100;
  
  const yScale = ReportChartBuilder.getLinearScale(0, maxVal, frame.height - frame.paddingBottom, frame.paddingTop);
  const totalWidth = frame.width - frame.paddingLeft - frame.paddingRight;
  const colSpacing = totalWidth / data.length;
  const barWidth = colSpacing * 0.55;

  const yTicks = [0, maxVal / 2, maxVal];

  return (
    <Svg width={width} height={height}>
      {/* Horizontal grid ticks */}
      {yTicks.map((val, i) => {
        const y = yScale(val);
        return (
          <G key={i}>
            <Line
              x1={frame.paddingLeft}
              y1={y}
              x2={frame.width - frame.paddingRight}
              y2={y}
              stroke={`${reportTheme.border}60`}
              strokeWidth={0.5}
            />
            <Text {...({
              x: frame.paddingLeft - 4,
              y: y + 1.5,
              fill: reportTheme.muted,
              fontSize: 5.5,
              textAnchor: "end"
            } as any)}>
              {val.toFixed(0)}{valueSuffix}
            </Text>
          </G>
        );
      })}

      {/* Columns */}
      {data.map((d, i) => {
        const x = frame.paddingLeft + i * colSpacing + (colSpacing - barWidth) / 2;
        const y = yScale(d.value);
        const barHeight = frame.height - frame.paddingBottom - y;
        
        return (
          <G key={i}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(1, barHeight)}
              fill={color}
              rx={1.5}
              ry={1.5}
            />
            {/* Value label on top of bar */}
            <Text {...({
              x: x + barWidth/2,
              y: y - 3,
              fill: reportTheme.text,
              fontSize: 5,
              fontWeight: "bold",
              textAnchor: "middle"
            } as any)}>
              {d.value.toFixed(1)}{valueSuffix}
            </Text>
            {/* Label below axis */}
            <Text {...({
              x: x + barWidth/2,
              y: frame.height - 4,
              fill: reportTheme.muted,
              fontSize: 5.5,
              textAnchor: "middle"
            } as any)}>
              {d.label}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

export default ReportBarChart;
