import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

const styles = StyleSheet.create({
  badge: {
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
  },
  text: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6,
    textTransform: 'uppercase',
  }
});

interface ReportBadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'default';
  style?: any;
}

export function ReportBadge({ label, type = 'default', style }: ReportBadgeProps) {
  const getColorScheme = () => {
    switch (type) {
      case 'success':
        return {
          bg: `${reportTheme.green}15`,
          border: `${reportTheme.green}40`,
          text: reportTheme.green
        };
      case 'warning':
        return {
          bg: `${reportTheme.orange}15`,
          border: `${reportTheme.orange}40`,
          text: reportTheme.orange
        };
      case 'error':
        return {
          bg: `${reportTheme.red}15`,
          border: `${reportTheme.red}40`,
          text: reportTheme.red
        };
      case 'info':
        return {
          bg: `${reportTheme.blue}15`,
          border: `${reportTheme.blue}40`,
          text: reportTheme.blue
        };
      default:
        return {
          bg: `${reportTheme.subtle}15`,
          border: `${reportTheme.subtle}40`,
          text: reportTheme.muted
        };
    }
  };

  const scheme = getColorScheme();

  return (
    <View style={[styles.badge, { backgroundColor: scheme.bg, borderColor: scheme.border }, style]} wrap={false}>
      <Text style={[styles.text, { color: scheme.text }]}>{label}</Text>
    </View>
  );
}

export default ReportBadge;
