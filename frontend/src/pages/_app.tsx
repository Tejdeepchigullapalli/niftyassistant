import type { AppProps } from 'next/app';
import { InvestmentStateProvider } from '../context/InvestmentStateContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <InvestmentStateProvider>
      <Component {...pageProps} />
    </InvestmentStateProvider>
  );
}

