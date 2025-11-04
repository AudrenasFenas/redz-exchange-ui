import './globals.css';
import { Inter } from 'next/font/google';
import { AppWalletProvider } from '@/components/AppWalletProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RedzExchange - Advanced DeFi Protocol',
  description: 'Trade, provide liquidity, and launch tokens on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWalletProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            {children}
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
            }}
          />
        </AppWalletProvider>
      </body>
    </html>
  );
}