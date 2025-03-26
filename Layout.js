// File: src/components/Layout.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { useSupabase } from '../contexts/SupabaseContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, loading } = useSupabase();
  const router = useRouter();

  // Dopo il montaggio, possiamo accedere al tema
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    if (!loading && !user && router.pathname !== '/login' && router.pathname !== '/register') {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Gestisce il toggle del tema chiaro/scuro
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Gestisce l'apertura/chiusura della sidebar su mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Non renderizzare nulla fino al montaggio per evitare problemi di idratazione
  if (!mounted) return null;

  // Layout per le pagine di autenticazione
  if (router.pathname === '/login' || router.pathname === '/register') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main>{children}</main>
      </div>
    );
  }

  // Layout principale con sidebar e navbar
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - visibile su desktop, toggle su mobile */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Contenuto principale */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar 
          toggleSidebar={toggleSidebar} 
          toggleTheme={toggleTheme} 
          theme={theme} 
        />
        
        {/* Area contenuto principale con scrolling */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
