export const reportLayout = {
  // A4 dimensions in points
  pageWidth: 595.28,
  pageHeight: 841.89,
  
  // A4 Landscape dimensions in points
  pageWidthLandscape: 841.89,
  pageHeightLandscape: 595.28,
  
  // Margins in points
  margin: {
    top: 34,      // 12mm
    bottom: 40,   // 14mm
    left: 28.34,  // 10mm
    right: 28.34  // 10mm
  },
  
  // Standard paddings and spacing
  cardPadding: 10,
  rowHeight: 18,
  gap: 8,
  
  // Reusable component width dimensions inside printable boundaries
  contentWidth: 538.6, // pageWidth - left - right
  contentWidthLandscape: 785.21 // pageWidthLandscape - left - right
};
