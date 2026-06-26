import React from 'react';
import { Svg, Path, Line, Text, G } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { ReportChartBuilder, ChartFrame } from '../services/reportChartBuilder';
import { HistoricalPricePoint } from '../types/reportTypes';

interface ReportPriceChartProps {
  prices: HistoricalPricePoint[];
  width?: number;
  height?: number;
}

export function ReportPriceChart({ prices = [], width = 380, height = 110 }: ReportPriceChartProps) {
  if (prices.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({
          x: width / 2,
          y: height / 2,
          fill: reportTheme.muted,
          fontSize: 8,
          textAnchor: "middle"
        } as any)}>No price history available</Text>
      </Svg>
    );
  }

  const frame: ChartFrame = {
    width,
    height,
    paddingTop: 10,
    paddingRight: 35,
    paddingBottom: 15,
    paddingLeft: 30,
  };

  const closePrices = prices.map(p => p.close);
  const minY = Math.min(...closePrices);
  const maxY = Math.max(...closePrices);
  
  // y axes safety limits
  const delta = (maxY - minY) * 0.05 || 10;
  const adjustedMinY = Math.max(0, minY - delta);
  const adjustedMaxY = maxY + delta;

  const xScale = ReportChartBuilder.getLinearScale(0, prices.length - 1, frame.paddingLeft, frame.width - frame.paddingRight);
  const yScale = ReportChartBuilder.getLinearScale(adjustedMinY, adjustedMaxY, frame.height - frame.paddingBottom, frame.paddingTop);

  // Map points to SVG coordinates
  const pts = prices.map((p, i) => ({
    x: xScale(i),
    y: yScale(p.close)
  }));

  const linePath = ReportChartBuilder.getPointsPath(pts);
  const areaPath = ReportChartBuilder.getAreaPath(pts, frame.height - frame.paddingBottom);

  // Generate axes indicators
  const yTicks = [adjustedMinY, (adjustedMinY + adjustedMaxY) / 2, adjustedMaxY];
  const xTicksIndices = [0, Math.floor(prices.length / 2), prices.length - 1];

  return (
    <Svg width={width} height={height}>
      {/* Background Grid Lines */}
      {yTicks.map((yVal, i) => {
        const yPos = yScale(yVal);
        return (
          <G key={i}>
            <Line 
              x1={frame.paddingLeft} 
              y1={yPos} 
              x2={frame.width - frame.paddingRight} 
              y2={yPos} 
              stroke={`${reportTheme.border}60`} 
              strokeWidth={0.5} 
            />
            <Text {...({
              x: frame.paddingLeft - 4,
              y: yPos + 2,
              fill: reportTheme.muted,
              fontSize: 5.5,
              textAnchor: "end"
            } as any)}>
              ₹{Math.round(yVal)}
            </Text>
          </G>
        );
      })}

      {/* Area Gradient fill */}
      <Path 
        d={areaPath} 
        fill={reportTheme.purple} 
        opacity={0.07} 
      />

      {/* Main Stock price Polyline path */}
      <Path 
        d={linePath} 
        fill="none" 
        stroke={reportTheme.purple} 
        strokeWidth={1.2} 
      />

      {/* X Axes Label Ticks */}
      {xTicksIndices.map((idx, i) => {
        if (idx < 0 || idx >= prices.length) return null;
        const xPos = xScale(idx);
        const p = prices[idx];
        return (
          <Text key={idx} {...({
            x: xPos,
            y: frame.height - 4,
            fill: reportTheme.muted,
            fontSize: 5.5,
            textAnchor: i === 0 ? 'start' : i === 2 ? 'end' : 'middle'
          } as any)}>
            {p.date}
          </Text>
        );
      })}
    </Svg>
  );
}

export default ReportPriceChart;
