import React from 'react';
import { Svg, Rect, Text, G } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

interface SectorPerf {
  sector: string;
  change: number;
}

interface ReportHeatmapChartProps {
  data: SectorPerf[];
  width?: number;
  height?: number;
}

export function ReportHeatmapChart({ data = [], width = 380, height = 30 }: ReportHeatmapChartProps) {
  if (data.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({
          x: width / 2,
          y: height / 2,
          fill: reportTheme.muted,
          fontSize: 8,
          textAnchor: "middle"
        } as any)}>No sector performance data</Text>
      </Svg>
    );
  }

  const cols = data.length;
  const paddingLeft = 5;
  const paddingRight = 5;
  const gap = 3;
  const totalWidth = width - paddingLeft - paddingRight;
  const cellWidth = (totalWidth - (cols - 1) * gap) / cols;
  const cellHeight = height - 10;

  return (
    <Svg width={width} height={height}>
      {data.map((item, idx) => {
        const x = paddingLeft + idx * (cellWidth + gap);
        const y = 2;
        
        // color based on returns percentage
        const fill = item.change > 0 
          ? `rgba(34, 197, 94, ${Math.min(0.8, item.change / 3)})` 
          : item.change < 0 
            ? `rgba(239, 68, 68, ${Math.min(0.8, Math.abs(item.change) / 3)})`
            : `${reportTheme.innerCard}`;
            
        const textVal = `${item.change >= 0 ? '+' : ''}${item.change.toFixed(1)}%`;

        return (
          <G key={idx}>
            <Rect
              x={x}
              y={y}
              width={cellWidth}
              height={cellHeight}
              fill={fill}
              stroke={reportTheme.border}
              strokeWidth={0.5}
              rx={2}
            />
            {/* Sector label */}
            <Text {...({
              x: x + cellWidth / 2,
              y: y + cellHeight / 2 - 1,
              fill: reportTheme.text,
              fontSize: 5.2,
              fontFamily: "Helvetica-Bold",
              textAnchor: "middle"
            } as any)}>
              {item.sector.length > 10 ? `${item.sector.slice(0, 9)}.` : item.sector}
            </Text>
            {/* Perform change val */}
            <Text {...({
              x: x + cellWidth / 2,
              y: y + cellHeight / 2 + 5.5,
              fill: reportTheme.text,
              fontSize: 5,
              fontFamily: "Helvetica-Bold",
              textAnchor: "middle"
            } as any)}>
              {textVal}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

export default ReportHeatmapChart;
