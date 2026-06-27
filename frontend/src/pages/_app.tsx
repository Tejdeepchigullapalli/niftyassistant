import type { AppProps } from 'next/app';
import { InvestmentStateProvider } from '../context/InvestmentStateContext';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <InvestmentStateProvider>
        <Component {...pageProps} />
      </InvestmentStateProvider>
    </AuthProvider>
  );
}

