import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';

const styles = StyleSheet.create({
  table: {
    width: '100%',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: reportTheme.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: reportTheme.innerCard,
    borderBottomWidth: 1,
    borderBottomColor: reportTheme.border,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: `${reportTheme.border}60`,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  headerText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.5,
    color: reportTheme.muted,
    textTransform: 'uppercase',
  },
  cellText: {
    fontFamily: 'Helvetica',
    fontSize: 6.5,
    color: reportTheme.text,
  }
});

interface ReportTableProps {
  headers: string[];
  colWidths: string[]; // e.g. ['20%', '30%', '50%']
  rows: Array<Array<string | number | React.ReactNode>>;
  alignments?: Array<'left' | 'center' | 'right'>;
  style?: any;
}

export function ReportTable({ headers, colWidths, rows, alignments = [], style }: ReportTableProps) {
  return (
    <View style={[styles.table, style]} wrap={false}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        {headers.map((h, i) => {
          const width = colWidths[i] || 'auto';
          const align = alignments[i] || 'left';
          return (
            <View key={i} style={{ width }}>
              <Text style={[styles.headerText, { textAlign: align }]}>{h}</Text>
            </View>
          );
        })}
      </View>
      
      {/* Data Rows */}
      {rows.map((row, rIdx) => (
        <View key={rIdx} style={[styles.row, { borderBottomWidth: rIdx === rows.length - 1 ? 0 : 0.5 }]}>
          {row.map((cell, cIdx) => {
            const width = colWidths[cIdx] || 'auto';
            const align = alignments[cIdx] || 'left';
            return (
              <View key={cIdx} style={{ width }}>
                {React.isValidElement(cell) ? (
                  cell
                ) : (
                  <Text style={[styles.cellText, { textAlign: align }]}>{cell}</Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default ReportTable;
