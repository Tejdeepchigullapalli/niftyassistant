import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: reportTheme.cardBackground,
    borderWidth: 1,
    borderColor: reportTheme.border,
    borderRadius: 6,
    padding: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 46,
  },
  label: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6,
    color: reportTheme.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  value: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: reportTheme.text,
    marginTop: 3,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  changeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.5,
  }
});

interface ReportMetricCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  style?: any;
}

export function ReportMetricCard({ label, value, change, trend = 'neutral', style }: ReportMetricCardProps) {
  const getChangeColor = () => {
    if (trend === 'up') return reportTheme.green;
    if (trend === 'down') return reportTheme.red;
    return reportTheme.muted;
  };

  return (
    <View style={[styles.card, style]} wrap={false}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <Text style={styles.value}>{value}</Text>
        {change && (
          <View style={styles.changeRow}>
            <Text style={[styles.changeText, { color: getChangeColor() }]}>{change}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
export default ReportMetricCard;
