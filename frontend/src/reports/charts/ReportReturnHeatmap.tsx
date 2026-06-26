import React from 'react';
import { Svg, Rect, Text, G } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

interface ReportReturnHeatmapProps {
  heatmapData: Record<string, number[]>; // Year -> 12 numbers
  width?: number;
  height?: number;
}

export function ReportReturnHeatmap({ heatmapData = {}, width = 380, height = 45 }: ReportReturnHeatmapProps) {
  const years = Object.keys(heatmapData);
  if (years.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({
          x: width / 2,
          y: height / 2,
          fill: reportTheme.muted,
          fontSize: 8,
          textAnchor: "middle"
        } as any)}>No performance history registered</Text>
      </Svg>
    );
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startX = 35;
  const startY = 15;
  const cellWidth = 26;
  const cellHeight = 11;
  const gap = 2.5;

  return (
    <Svg width={width} height={height}>
      {/* Month column headers */}
      {months.map((m, idx) => (
        <Text key={m} {...({
          x: startX + idx * (cellWidth + gap) + cellWidth / 2,
          y: 10,
          fill: reportTheme.muted,
          fontSize: 5.5,
          fontFamily: "Helvetica-Bold",
          textAnchor: "middle"
        } as any)}>
          {m}
        </Text>
      ))}

      {/* Grid rows by Year */}
      {years.map((year, yIdx) => {
        const rowY = startY + yIdx * (cellHeight + gap);
        const dataRow = heatmapData[year] || Array(12).fill(0);

        return (
          <G key={year}>
            {/* Year label left side */}
            <Text {...({
              x: 5,
              y: rowY + 7,
              fill: reportTheme.text,
              fontSize: 6.5,
              fontFamily: "Helvetica-Bold",
              textAnchor: "start"
            } as any)}>
              {year}
            </Text>

            {/* Monthly grid cells */}
            {dataRow.map((val, mIdx) => {
              const cellX = startX + mIdx * (cellWidth + gap);
              
              // color logic: green if positive, red if negative, dark background if zero/unrecorded
              const fill = val > 0 
                ? `rgba(34, 197, 94, ${Math.min(0.8, val / 5)})` 
                : val < 0 
                  ? `rgba(239, 68, 68, ${Math.min(0.8, Math.abs(val) / 5)})`
                  : `${reportTheme.innerCard}`;
                  
              const textColor = val === 0 ? reportTheme.subtle : reportTheme.text;

              return (
                <G key={mIdx}>
                  <Rect
                    x={cellX}
                    y={rowY}
                    width={cellWidth}
                    height={cellHeight}
                    fill={fill}
                    stroke={reportTheme.border}
                    strokeWidth={0.3}
                    rx={1}
                  />
                  <Text {...({
                    x: cellX + cellWidth / 2,
                    y: rowY + 7.5,
                    fill: textColor,
                    fontSize: 5.2,
                    fontFamily: "Helvetica-Bold",
                    textAnchor: "middle"
                  } as any)}>
                    {val !== 0 ? `${val > 0 ? '+' : ''}${val.toFixed(1)}%` : '—'}
                  </Text>
                </G>
              );
            })}
          </G>
        );
      })}
    </Svg>
  );
}

export default ReportReturnHeatmap;
