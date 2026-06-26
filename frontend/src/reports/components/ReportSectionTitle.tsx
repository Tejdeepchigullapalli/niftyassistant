import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${reportTheme.purple}30`,
    paddingBottom: 3,
  },
  text: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: reportTheme.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});

interface ReportSectionTitleProps {
  title: string;
}

export function ReportSectionTitle({ title }: ReportSectionTitleProps) {
  return (
    <View style={styles.container} wrap={false}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}
export default ReportSectionTitle;
