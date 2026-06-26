import React from 'react';
import { Svg, Rect, Text } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { ReportChartBuilder, ChartFrame } from '../services/reportChartBuilder';
import { HistoricalPricePoint } from '../types/reportTypes';

interface ReportVolumeChartProps {
  prices: HistoricalPricePoint[];
  width?: number;
  height?: number;
}

export function ReportVolumeChart({ prices = [], width = 380, height = 30 }: ReportVolumeChartProps) {
  if (prices.length === 0) {
    return (
      <Svg width={width} height={height}>
        <Text {...({
          x: width / 2,
          y: height / 2,
          fill: reportTheme.muted,
          fontSize: 6,
          textAnchor: "middle"
        } as any)}>Volume data unavailable</Text>
      </Svg>
    );
  }

  const frame: ChartFrame = {
    width,
    height,
    paddingTop: 2,
    paddingRight: 35,
    paddingBottom: 2,
    paddingLeft: 30,
  };

  const volumes = prices.map(p => p.volume || 0);
  const maxVol = Math.max(...volumes) || 100000;

  const xScale = ReportChartBuilder.getLinearScale(0, prices.length - 1, frame.paddingLeft, frame.width - frame.paddingRight);
  const yScale = ReportChartBuilder.getLinearScale(0, maxVol, frame.height - frame.paddingBottom, frame.paddingTop);

  const barWidth = Math.max(0.5, (frame.width - frame.paddingLeft - frame.paddingRight) / prices.length - 0.5);

  return (
    <Svg width={width} height={height}>
      {prices.map((p, i) => {
        const x = xScale(i) - barWidth/2;
        const yVal = yScale(p.volume || 0);
        const barHeight = frame.height - frame.paddingBottom - yVal;
        
        // determine color: green if price went up, red if price went down
        const wentUp = i === 0 || p.close >= prices[i - 1].close;
        const fill = wentUp ? `${reportTheme.green}A0` : `${reportTheme.red}A0`;

        return (
          <Rect
            key={i}
            x={x}
            y={yVal}
            width={barWidth}
            height={Math.max(0.5, barHeight)}
            fill={fill}
          />
        );
      })}
    </Svg>
  );
}

export default ReportVolumeChart;
