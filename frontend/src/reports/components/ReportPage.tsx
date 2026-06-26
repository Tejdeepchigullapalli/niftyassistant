import React from 'react';
import { Page, StyleSheet } from '@react-pdf/renderer';
import { reportTheme } from '../constants/reportTheme';
import { reportLayout } from '../constants/reportLayout';

const styles = StyleSheet.create({
  page: {
    backgroundColor: reportTheme.pageBackground,
    color: reportTheme.text,
    fontFamily: 'Helvetica',
    paddingTop: reportLayout.margin.top,
    paddingBottom: reportLayout.margin.bottom + 15, // extra margin for footer spacing
    paddingLeft: reportLayout.margin.left,
    paddingRight: reportLayout.margin.right,
  }
});

interface ReportPageProps {
  children: React.ReactNode;
  orientation?: 'portrait' | 'landscape';
  bookmark?: string;
}

export function ReportPage({ children, orientation = 'portrait', bookmark }: ReportPageProps) {
  return (
    <Page 
      size="A4" 
      orientation={orientation} 
      style={styles.page}
      bookmark={bookmark ? { title: bookmark, fit: true } : undefined}
    >
      {children}
    </Page>
  );
}
export default ReportPage;
