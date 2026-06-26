import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: reportTheme.border,
    paddingBottom: 6,
    marginBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: reportTheme.text,
  },
  logoAccent: {
    color: reportTheme.blue,
  },
  reportTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: reportTheme.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontFamily: 'Helvetica',
    fontSize: 6,
    color: reportTheme.muted,
    marginTop: 1,
  }
});

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  timestamp?: string;
}

export function ReportHeader({ title, subtitle, timestamp }: ReportHeaderProps) {
  const displayTime = timestamp || new Date().toLocaleString('en-IN');
  return (
    <View style={styles.headerContainer} fixed>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          Nifty<Text style={styles.logoAccent}>AI</Text>
        </Text>
        {subtitle && (
          <Text style={{ fontFamily: 'Helvetica', fontSize: 7, color: reportTheme.muted, marginLeft: 4 }}>
            |  {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.metaContainer}>
        <Text style={styles.reportTitle}>{title}</Text>
        <Text style={styles.timestamp}>Generated: {displayTime}</Text>
      </View>
    </View>
  );
}
export default ReportHeader;
