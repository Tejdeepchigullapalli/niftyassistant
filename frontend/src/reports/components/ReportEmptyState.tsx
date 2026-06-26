import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: reportTheme.cardBackground,
    borderWidth: 1,
    borderColor: reportTheme.border,
    borderRadius: 6,
    padding: 15,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: reportTheme.muted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  text: {
    fontFamily: 'Helvetica',
    fontSize: 6.5,
    color: reportTheme.subtle,
    textAlign: 'center',
    maxWidth: '80%',
  }
});

interface ReportEmptyStateProps {
  sectionName: string;
  message?: string;
  style?: any;
}

export function ReportEmptyState({ sectionName, message, style }: ReportEmptyStateProps) {
  return (
    <View style={[styles.container, style]} wrap={false}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{sectionName} Unavailable</Text>
      <Text style={styles.text}>
        {message || `No data is currently registered for the ${sectionName} summary. Check active network feeds.`}
      </Text>
    </View>
  );
}

export default ReportEmptyState;
