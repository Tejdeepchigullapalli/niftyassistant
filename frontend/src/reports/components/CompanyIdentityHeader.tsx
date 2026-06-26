import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { resolveCompanyLogo } from '../services/reportLogoResolver';

const styles = StyleSheet.create({
  container: {
    backgroundColor: reportTheme.cardBackground,
    borderWidth: 1,
    borderColor: reportTheme.border,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  logoFrame: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: reportTheme.border,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
  },
  placeholderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  symbol: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: reportTheme.text,
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: reportTheme.muted,
  },
  meta: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: reportTheme.subtle,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  scoreBadge: {
    backgroundColor: `${reportTheme.purple}15`,
    borderColor: `${reportTheme.purple}40`,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
  },
  scoreText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: reportTheme.purple,
  },
  scoreLabel: {
    fontFamily: 'Helvetica',
    fontSize: 5.5,
    color: reportTheme.muted,
    marginTop: 1,
    textTransform: 'uppercase',
  }
});

interface CompanyIdentityHeaderProps {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  color?: string;
  aiScore?: number;
}

export function CompanyIdentityHeader({ symbol, name, sector, industry, color = reportTheme.purple, aiScore = 75 }: CompanyIdentityHeaderProps) {
  const logo = resolveCompanyLogo(symbol);
  
  return (
    <View style={styles.container} wrap={false}>
      {/* Logo element with vector initials fallback */}
      {!logo.isSvg && logo.src ? (
        <View style={styles.logoFrame}>
          <Image src={logo.src} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
        </View>
      ) : (
        <View style={[styles.logoPlaceholder, { backgroundColor: color }]}>
          <Text style={styles.placeholderText}>{logo.initials}</Text>
        </View>
      )}

      {/* Info Block */}
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <Text style={styles.meta}>
          {sector} • {industry}  |  NSE Listed
        </Text>
      </View>

      {/* Score Badge */}
      <View style={styles.scoreBadge}>
        <Text style={styles.scoreText}>{aiScore}</Text>
        <Text style={styles.scoreLabel}>AI Score</Text>
      </View>
    </View>
  );
}

export default CompanyIdentityHeader;
