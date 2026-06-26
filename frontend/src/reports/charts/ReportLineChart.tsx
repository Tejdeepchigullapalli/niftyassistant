import React from 'react';
import { Svg, Path, Line, Text, G } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { ReportChartBuilder, ChartFrame } from '../services/reportChartBuilder';

interface ReportLineChartProps {
  data: number[];
  labels: string[];
  width?: number;
  height?: number;
  color?: string;
}

export function ReportLineChart({ data = [], labels = [], width = 380, height = 110, color = reportTheme.purple }: ReportLineChartProps) {
  if (data.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({
          x: width / 2,
          y: height / 2,
          fill: reportTheme.muted,
          fontSize: 8,
          textAnchor: "middle"
        } as any)}>No line chart data</Text>
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

  const minY = Math.min(...data, 0);
  const maxY = Math.max(...data, 100);

  const xScale = ReportChartBuilder.getLinearScale(0, data.length - 1, frame.paddingLeft, frame.width - frame.paddingRight);
  const yScale = ReportChartBuilder.getLinearScale(minY, maxY, frame.height - frame.paddingBottom, frame.paddingTop);

  const pts = data.map((val, idx) => ({
    x: xScale(idx),
    y: yScale(val)
  }));

  const linePath = ReportChartBuilder.getPointsPath(pts);

  return (
    <Svg width={width} height={height}>
      {/* Grid lines */}
      {[minY, (minY+maxY)/2, maxY].map((val, i) => {
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
              y: y + 1.8,
              fill: reportTheme.muted,
              fontSize: 5.5,
              textAnchor: "end"
            } as any)}>
              {val.toFixed(0)}
            </Text>
          </G>
        );
      })}

      {/* Polyline */}
      <Path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1}
      />

      {/* X Labels */}
      {labels.map((lbl, idx) => {
        const x = xScale(idx);
        return (
          <Text key={idx} {...({
            x: x,
            y: frame.height - 4,
            fill: reportTheme.muted,
            fontSize: 5.5,
            textAnchor: "middle"
          } as any)}>
            {lbl}
          </Text>
        );
      })}
    </Svg>
  );
}

export default ReportLineChart;
