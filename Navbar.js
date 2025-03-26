// File: src/components/Navbar.js
import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '../contexts/SupabaseContext';
import { 
  Bars3Icon as MenuIcon, 
  XMarkIcon as XIcon, 
  SunIcon, 
  MoonIcon, 
  BellIcon, 
  UserCircleIcon 
} from '@heroicons/react/24/outline';

export default function Navbar({ toggleSidebar, toggleTheme, theme }) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, signOut } = useSupabase();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Parte sinistra */}
          <div className="flex">
            {/* Pulsante mobile per aprire la sidebar */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Apri menu</span>
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">CleanAI</span>
              </Link>
            </div>
          </div>

          {/* Parte destra */}
          <div className="flex items-center">
            {/* Pulsante tema chiaro/scuro */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MoonIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {/* Notifiche */}
            <div className="relative ml-3">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <span className="sr-only">Visualizza notifiche</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {/* Badge notifiche */}
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  3
                </span>
              </button>

              {/* Dropdown notifiche */}
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifiche</h3>
                    </div>
                    {/* Lista notifiche */}
                    <div className="max-h-60 overflow-y-auto">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                        <p className="font-medium">Nuova attività assegnata</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">10 minuti fa</p>
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                        <p className="font-medium">Allarme sensore IoT</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">30 minuti fa</p>
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                        <p className="font-medium">Report completato</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">1 ora fa</p>
                      </a>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <a href="#" className="block px-4 py-2 text-sm text-center text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Vedi tutte le notifiche
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profilo utente */}
            <div className="relative ml-3">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span className="sr-only">Apri menu utente</span>
                <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <span className="ml-2 text-gray-700 dark:text-gray-300 hidden sm:block">
                  {user?.email || 'Utente'}
                </span>
              </button>

              {/* Dropdown profilo */}
              {profileDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Link href="/profile">
                      <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                        Profilo
                      </span>
                    </Link>
                    <Link href="/settings">
                      <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                        Impostazioni
                      </span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Esci
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
