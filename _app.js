// File: src/pages/_app.js
import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import { SupabaseProvider } from '../contexts/SupabaseContext';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <SupabaseProvider>
      <ThemeProvider attribute="class">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SupabaseProvider>
  );
}

export default MyApp;
