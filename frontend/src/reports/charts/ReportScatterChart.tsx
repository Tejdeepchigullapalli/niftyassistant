import React from 'react';
import { Svg, Circle, Text, Line, G, Rect } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { ReportChartBuilder, ChartFrame } from '../services/reportChartBuilder';

interface PeerPoint {
  symbol: string;
  pe: number;
  growth: number;
  isTarget: boolean;
}

interface ReportScatterChartProps {
  peers: PeerPoint[];
  targetSymbol: string;
  width?: number;
  height?: number;
}

export function ReportScatterChart({ peers = [], targetSymbol, width = 380, height = 110 }: ReportScatterChartProps) {
  if (peers.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({
          x: width / 2,
          y: height / 2,
          fill: reportTheme.muted,
          fontSize: 8,
          textAnchor: "middle"
        } as any)}>No sector peer scatter data available</Text>
      </Svg>
    );
  }

  const frame: ChartFrame = {
    width,
    height,
    paddingTop: 10,
    paddingRight: 35,
    paddingBottom: 20,
    paddingLeft: 30,
  };

  const pes = peers.map(p => p.pe || 15);
  const growths = peers.map(p => p.growth || 5);
  
  const minX = Math.max(0, Math.min(...pes) * 0.8);
  const maxX = Math.max(...pes) * 1.1;
  const minY = Math.min(...growths, 0) * 1.2;
  const maxY = Math.max(...growths) * 1.1;

  const xScale = ReportChartBuilder.getLinearScale(minX, maxX, frame.paddingLeft, frame.width - frame.paddingRight);
  const yScale = ReportChartBuilder.getLinearScale(minY, maxY, frame.height - frame.paddingBottom, frame.paddingTop);

  const xTicks = [minX, (minX + maxX)/2, maxX];
  const yTicks = [minY, (minY + maxY)/2, maxY];

  return (
    <Svg width={width} height={height}>
      {/* Grid lines & Y Axis Ticks */}
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
              y: yPos + 1.8,
              fill: reportTheme.muted,
              fontSize: 5.5,
              textAnchor: "end"
            } as any)}>
              {yVal.toFixed(0)}%
            </Text>
          </G>
        );
      })}

      {/* X Axis Ticks */}
      {xTicks.map((xVal, i) => {
        const xPos = xScale(xVal);
        return (
          <G key={i}>
            <Line
              x1={xPos}
              y1={frame.paddingTop}
              x2={xPos}
              y2={frame.height - frame.paddingBottom}
              stroke={`${reportTheme.border}30`}
              strokeWidth={0.5}
            />
            <Text {...({
              x: xPos,
              y: frame.height - 8,
              fill: reportTheme.muted,
              fontSize: 5.5,
              textAnchor: "middle"
            } as any)}>
              P/E: {xVal.toFixed(0)}
            </Text>
          </G>
        );
      })}

      {/* Axis Labels */}
      <Text {...({
        x: width / 2,
        y: height - 2,
        fill: reportTheme.muted,
        fontSize: 5.5,
        fontFamily: "Helvetica-Bold",
        textAnchor: "middle"
      } as any)}>
        Valuation (P/E Ratio)
      </Text>

      {/* Plot Dots */}
      {peers.map((p, idx) => {
        const x = xScale(p.pe);
        const y = yScale(p.growth);
        const isTarget = p.symbol.toUpperCase() === targetSymbol.toUpperCase();

        if (isTarget) {
          return (
            <G key={idx}>
              {/* Highlight circle block */}
              <Circle
                cx={x}
                cy={y}
                r={6}
                fill={reportTheme.purple}
                opacity={0.3}
              />
              <Circle
                cx={x}
                cy={y}
                r={3}
                fill={reportTheme.purple}
                stroke={reportTheme.text}
                strokeWidth={0.5}
              />
              {/* Label symbol on top of current company dot */}
              <Text {...({
                x: x,
                y: y - 8,
                fill: reportTheme.text,
                fontSize: 6.5,
                fontFamily: "Helvetica-Bold",
                textAnchor: "middle"
              } as any)}>
                {p.symbol}
              </Text>
            </G>
          );
        }

        // Draw standard peer dots
        return (
          <G key={idx}>
            <Circle
              cx={x}
              cy={y}
              r={2.5}
              fill={reportTheme.blue}
              stroke={reportTheme.border}
              strokeWidth={0.3}
              opacity={0.8}
            />
            <Text {...({
              x: x,
              y: y + 6,
              fill: reportTheme.muted,
              fontSize: 4.5,
              textAnchor: "middle"
            } as any)}>
              {p.symbol}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

export default ReportScatterChart;
