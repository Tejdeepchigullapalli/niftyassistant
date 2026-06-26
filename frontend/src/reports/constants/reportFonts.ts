import { Font } from '@react-pdf/renderer';

// Register Inter font weights from google static hosting
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp5GP37TOf0K7uxptw.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp5GP37TOf0K7uxptw.ttf',
      fontWeight: 'medium',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp5GP37TOf0K7uxptw.ttf',
      fontWeight: 'semibold',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp5GP37TOf0K7uxptw.ttf',
      fontWeight: 'bold',
    }
  ]
});

export const fontList = {
  main: 'Inter',
  fallback: 'Helvetica'
};
