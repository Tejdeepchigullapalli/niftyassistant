export interface ChartFrame {
  width: number;
  height: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

// Chart coordinate mapping helper functions
export class ReportChartBuilder {
  static getLinearScale(
    minVal: number,
    maxVal: number,
    minPixel: number,
    maxPixel: number
  ): (val: number) => number {
    const range = maxVal - minVal;
    if (range === 0) return () => minPixel;
    const pixelRange = maxPixel - minPixel;
    return (val: number) => {
      const pct = (val - minVal) / range;
      return minPixel + pct * pixelRange;
    };
  }

  static getPointsPath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) return '';
    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }

  static getAreaPath(points: Array<{ x: number; y: number }>, baseHeight: number): string {
    if (points.length === 0) return '';
    const linePath = this.getPointsPath(points);
    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    return `${linePath} L ${lastX} ${baseHeight.toFixed(1)} L ${firstX} ${baseHeight.toFixed(1)} Z`;
  }
}
