import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/globals.css';

const display = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

export default function App({ Component, pageProps }) {
  return (
    <main className={`${display.variable} ${body.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}
