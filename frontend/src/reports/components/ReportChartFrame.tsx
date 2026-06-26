import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: reportTheme.cardBackground,
    borderWidth: 1,
    borderColor: reportTheme.border,
    borderRadius: 6,
    padding: 8,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: `${reportTheme.border}80`,
    paddingBottom: 4,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: reportTheme.text,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: 'Helvetica',
    fontSize: 6,
    color: reportTheme.muted,
  }
});

interface ReportChartFrameProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: any;
}

export function ReportChartFrame({ title, subtitle, children, style }: ReportChartFrameProps) {
  return (
    <View style={[styles.container, style]} wrap={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}

export default ReportChartFrame;
