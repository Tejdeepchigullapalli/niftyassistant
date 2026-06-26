import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 28.34,
    right: 28.34,
    borderTopWidth: 1,
    borderTopColor: reportTheme.border,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disclaimer: {
    fontFamily: 'Helvetica',
    fontSize: 5.5,
    color: reportTheme.subtle,
    maxWidth: '70%',
    lineHeight: 1.3,
  },
  rightBlock: {
    alignItems: 'flex-end',
  },
  brand: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6,
    color: reportTheme.muted,
  },
  pageNumber: {
    fontFamily: 'Helvetica',
    fontSize: 6,
    color: reportTheme.subtle,
    marginTop: 2,
  }
});

export function ReportFooter() {
  return (
    <View style={styles.footerContainer} fixed>
      <Text style={styles.disclaimer}>
        Disclaimer: For research and educational purposes only. Not financial advice. Generated using NiftyAI analytical models and available market data.
      </Text>
      <View style={styles.rightBlock}>
        <Text style={styles.brand}>NiftyAI — AI Investment Intelligence</Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </View>
  );
}
export default ReportFooter;
