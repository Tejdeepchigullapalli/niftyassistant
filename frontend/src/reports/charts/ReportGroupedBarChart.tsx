import React from 'react';
import { Svg, Rect, Text, Line, G } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { ReportChartBuilder, ChartFrame } from '../services/reportChartBuilder';

interface ReportGroupedBarChartProps {
  data: Array<{ label: string; values: number[] }>;
  legends: string[];
  width?: number;
  height?: number;
  colors?: string[];
  valueUnit?: string;
}

export function ReportGroupedBarChart({
  data = [],
  legends = [],
  width = 380,
  height = 110,
  colors = [reportTheme.blue, reportTheme.purple, reportTheme.green],
  valueUnit = 'Cr'
}: ReportGroupedBarChartProps) {
  if (data.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({
          x: width / 2,
          y: height / 2,
          fill: reportTheme.muted,
          fontSize: 8,
          textAnchor: "middle"
        } as any)}>No financial history available</Text>
      </Svg>
    );
  }

  const frame: ChartFrame = {
    width,
    height,
    paddingTop: 18,
    paddingRight: 10,
    paddingBottom: 15,
    paddingLeft: 30,
  };

  // Find max value across all values for vertical scaling
  const allValues = data.flatMap(d => d.values);
  const maxVal = Math.max(...allValues, 0) || 10000;
  
  const yScale = ReportChartBuilder.getLinearScale(0, maxVal, frame.height - frame.paddingBottom, frame.paddingTop);
  
  const totalWidth = frame.width - frame.paddingLeft - frame.paddingRight;
  const groupSpacing = totalWidth / data.length;
  
  // Calculate individual bar widths in the group
  const barCount = legends.length;
  const paddingWithinGroup = 4;
  const availableGroupWidth = groupSpacing - paddingWithinGroup * 2;
  const barWidth = Math.max(2, (availableGroupWidth / barCount) - 1.5);

  const yTicks = [0, maxVal / 2, maxVal];

  return (
    <Svg width={width} height={height}>
      {/* Legends Row at the top */}
      <G>
        {legends.map((legend, idx) => {
          const lX = frame.paddingLeft + idx * 80;
          return (
            <G key={idx}>
              <Rect
                x={lX}
                y={4}
                width={6}
                height={6}
                fill={colors[idx] || reportTheme.muted}
                rx={1}
              />
              <Text {...({
                x: lX + 9,
                y: 10,
                fill: reportTheme.text,
                fontSize: 6.5,
                fontFamily: "Helvetica-Bold"
              } as any)}>
                {legend}
              </Text>
            </G>
          );
        })}
      </G>

      {/* Grid lines */}
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
              y: y + 1.8,
              fill: reportTheme.muted,
              fontSize: 5.5,
              textAnchor: "end"
            } as any)}>
              ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
            </Text>
          </G>
        );
      })}

      {/* Bar Groups */}
      {data.map((group, groupIdx) => {
        const groupStartX = frame.paddingLeft + groupIdx * groupSpacing + paddingWithinGroup;
        
        return (
          <G key={groupIdx}>
            {/* Draw grouped columns */}
            {group.values.map((val, valIdx) => {
              const x = groupStartX + valIdx * (barWidth + 1.5);
              const y = yScale(val);
              const barHeight = frame.height - frame.paddingBottom - y;
              const fill = colors[valIdx] || reportTheme.muted;

              return (
                <Rect
                  key={valIdx}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(0.5, barHeight)}
                  fill={fill}
                  rx={0.8}
                  ry={0.8}
                />
              );
            })}
            
            {/* Year Label bottom */}
            <Text {...({
              x: groupStartX + (groupSpacing - paddingWithinGroup * 2) / 2,
              y: frame.height - 4,
              fill: reportTheme.muted,
              fontSize: 5.5,
              textAnchor: "middle"
            } as any)}>
              {group.label}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

export default ReportGroupedBarChart;
