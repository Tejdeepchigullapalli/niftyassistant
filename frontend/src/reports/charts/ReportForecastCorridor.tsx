import React from 'react';
import { Svg, Line, Circle, Text, Rect, G } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { ReportChartBuilder } from '../services/reportChartBuilder';

interface ReportForecastCorridorProps {
  currentPrice: number;
  bearCase: number;
  baseCase: number;
  bullCase: number;
  targetPrice: number;
  width?: number;
  height?: number;
}

export function ReportForecastCorridor({
  currentPrice,
  bearCase,
  baseCase,
  bullCase,
  targetPrice,
  width = 380,
  height = 55
}: ReportForecastCorridorProps) {
  
  const paddingLeft = 40;
  const paddingRight = 40;
  
  // Set scale boundaries
  const minVal = Math.min(bearCase, currentPrice) * 0.95;
  const maxVal = Math.max(bullCase, targetPrice) * 1.05;
  
  const xScale = ReportChartBuilder.getLinearScale(minVal, maxVal, paddingLeft, width - paddingRight);
  const cy = height / 2 - 5;

  const xBear = xScale(bearCase);
  const xCurrent = xScale(currentPrice);
  const xBase = xScale(baseCase);
  const xBull = xScale(bullCase);
  const xTarget = xScale(targetPrice);

  return (
    <Svg width={width} height={height}>
      {/* Background corridor bar */}
      <Rect
        x={xBear}
        y={cy - 3}
        width={xBull - xBear}
        height={6}
        fill={`${reportTheme.border}B0`}
        rx={3}
      />
      
      {/* Target range marker fill (between bear and bull case) */}
      <Rect
        x={xBase - 1.5}
        y={cy - 3}
        width={3}
        height={6}
        fill={reportTheme.purple}
      />

      {/* Corridor points labels */}
      {/* 1. Bear Case */}
      <G>
        <Circle cx={xBear} cy={cy} r={4} fill={reportTheme.red} />
        <Text {...({
          x: xBear,
          y: cy - 8,
          fill: reportTheme.red,
          fontSize: 5.5,
          fontFamily: "Helvetica-Bold",
          textAnchor: "middle"
        } as any)}>
          Bear ₹{Math.round(bearCase)}
        </Text>
      </G>

      {/* 2. Base Case */}
      <G>
        <Circle cx={xBase} cy={cy} r={4} fill={reportTheme.blue} />
        <Text {...({
          x: xBase,
          y: cy - 8,
          fill: reportTheme.blue,
          fontSize: 5.5,
          fontFamily: "Helvetica-Bold",
          textAnchor: "middle"
        } as any)}>
          Base ₹{Math.round(baseCase)}
        </Text>
      </G>

      {/* 3. Bull Case */}
      <G>
        <Circle cx={xBull} cy={cy} r={4} fill={reportTheme.green} />
        <Text {...({
          x: xBull,
          y: cy - 8,
          fill: reportTheme.green,
          fontSize: 5.5,
          fontFamily: "Helvetica-Bold",
          textAnchor: "middle"
        } as any)}>
          Bull ₹{Math.round(bullCase)}
        </Text>
      </G>

      {/* 4. Current Price indicator */}
      <G>
        <Line x1={xCurrent} y1={cy - 12} x2={xCurrent} y2={cy + 12} stroke={reportTheme.text} strokeWidth={1} strokeDasharray="2 2" />
        <Circle cx={xCurrent} cy={cy} r={3} fill={reportTheme.text} />
        <Text {...({
          x: xCurrent,
          y: cy + 18,
          fill: reportTheme.text,
          fontSize: 6,
          fontFamily: "Helvetica-Bold",
          textAnchor: "middle"
        } as any)}>
          Current ₹{currentPrice.toFixed(1)}
        </Text>
      </G>

      {/* 5. Target Price indicator */}
      <G>
        <Line x1={xTarget} y1={cy - 12} x2={xTarget} y2={cy + 12} stroke={reportTheme.purple} strokeWidth={1} />
        <Circle cx={xTarget} cy={cy} r={3.5} fill={reportTheme.purple} />
        <Text {...({
          x: xTarget,
          y: cy - 16,
          fill: reportTheme.purple,
          fontSize: 6,
          fontFamily: "Helvetica-Bold",
          textAnchor: "middle"
        } as any)}>
          Target ₹{Math.round(targetPrice)}
        </Text>
      </G>
    </Svg>
  );
}

export default ReportForecastCorridor;
