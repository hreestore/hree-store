import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Snackbar } from '@/components/snackbar';
import { StoreProvider } from '@/redux';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider } from '@/theme/theme-provider';
import ZoomRestriction from '@/components/zoom-restriction';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata = {
  title: 'Hree Create | Custom Apparel',
  description: 'Premium custom apparel brand offering unique graphic designs on t-shirts, hoodies, and more.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased font-sans bg-[#f7e6dc] dark:bg-[#0a1a1a] text-[#0a1a1a] dark:text-[#f7e6dc]">
        <ZoomRestriction />
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeProvider>
            <StoreProvider>
              <Navbar />
              {children}
              <Footer />
              <Snackbar />
            </StoreProvider>
          </ThemeProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
