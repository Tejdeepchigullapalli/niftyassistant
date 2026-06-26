import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 10,
    backgroundColor: reportTheme.innerCard,
    borderWidth: 1,
    borderColor: reportTheme.border,
    borderRadius: 6,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: reportTheme.purple,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  text: {
    fontFamily: 'Helvetica',
    fontSize: 6,
    color: reportTheme.muted,
    lineHeight: 1.4,
  }
});

export function ReportDisclosure() {
  return (
    <View style={styles.container} wrap={false}>
      <Text style={styles.title}>Notice and Disclaimers</Text>
      <Text style={styles.text}>
        This document is prepared automatically by the NiftyAI analytics engine for research and educational purposes only. It does not constitute certified investment advice, solicitation, or a recommendation to buy, sell, or trade any security. Financial assets represent significant volatility risks. Consult a certified financial advisor before committing real capital. Analytical models operate on historical filings and live quote approximations; actual performance may deviate substantially.
      </Text>
    </View>
  );
}

export default ReportDisclosure;
