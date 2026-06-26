import React from 'react';
import { View as PdfView, Text as PdfText, StyleSheet as PdfStyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

const styles = PdfStyleSheet.create({
  container: {
    backgroundColor: reportTheme.cardBackground,
    borderWidth: 1,
    borderColor: reportTheme.border,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftBlock: {
    flex: 1,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: reportTheme.text,
  },
  subtitle: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: reportTheme.muted,
    marginTop: 2,
  },
  dateRange: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.5,
    color: reportTheme.purple,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    backgroundColor: reportTheme.innerCard,
    borderWidth: 0.5,
    borderColor: reportTheme.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
    minWidth: 50,
  },
  statValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: reportTheme.text,
  },
  statLabel: {
    fontFamily: 'Helvetica',
    fontSize: 5,
    color: reportTheme.muted,
    textTransform: 'uppercase',
    marginTop: 1,
  }
});

interface PortfolioIdentityHeaderProps {
  portfolioName: string;
  dateRange: string;
  totalValue: number;
  totalPnL: number;
  healthScore: number;
}

export function PortfolioIdentityHeader({
  portfolioName,
  dateRange,
  totalValue,
  totalPnL,
  healthScore
}: PortfolioIdentityHeaderProps) {
  const isUp = totalPnL >= 0;

  return (
    <PdfView style={styles.container} wrap={false}>
      <PdfView style={styles.leftBlock}>
        <PdfText style={styles.title}>{portfolioName}</PdfText>
        <PdfText style={styles.subtitle}>Premium Portfolio Investment Intelligence Report</PdfText>
        <PdfText style={styles.dateRange}>Period: {dateRange}</PdfText>
      </PdfView>
      <PdfView style={styles.statsRow}>
        <PdfView style={styles.statCard}>
          <PdfText style={styles.statValue}>₹{(totalValue / 1e5).toFixed(2)}L</PdfText>
          <PdfText style={styles.statLabel}>Value</PdfText>
        </PdfView>
        <PdfView style={styles.statCard}>
          <PdfText style={[styles.statValue, { color: isUp ? reportTheme.green : reportTheme.red }]}>
            {isUp ? '+' : ''}₹{(totalPnL / 1e3).toFixed(1)}K
          </PdfText>
          <PdfText style={styles.statLabel}>Returns</PdfText>
        </PdfView>
        <PdfView style={styles.statCard}>
          <PdfText style={[styles.statValue, { color: reportTheme.purple }]}>{healthScore}</PdfText>
          <PdfText style={styles.statLabel}>AI Score</PdfText>
        </PdfView>
      </PdfView>
    </PdfView>
  );
}

export default PortfolioIdentityHeader;
