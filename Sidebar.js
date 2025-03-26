// File: src/components/Sidebar.js
import { Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  ClipboardDocumentCheckIcon as ClipboardCheckIcon,
  UserGroupIcon,
  MapPinIcon as LocationMarkerIcon,
  ChartBarIcon,
  Cog6ToothIcon as CogIcon,
  BellIcon,
  PhotoIcon as PhotographIcon,
  CpuChipIcon as ChipIcon
} from '@heroicons/react/24/outline';

// Definizione delle voci del menu
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Attività di Pulizia', href: '/tasks', icon: ClipboardCheckIcon },
  { name: 'Clienti', href: '/clients', icon: UserGroupIcon },
  { name: 'Locations', href: '/locations', icon: LocationMarkerIcon },
  { name: 'Report', href: '/reports', icon: ChartBarIcon },
  { name: 'Analisi Visiva', href: '/visual-analysis', icon: PhotographIcon },
  { name: 'Sensori IoT', href: '/iot-sensors', icon: ChipIcon },
  { name: 'Notifiche', href: '/notifications', icon: BellIcon },
  { name: 'Impostazioni', href: '/settings', icon: CogIcon },
];

export default function Sidebar({ open, setOpen }) {
  const router = useRouter();

  return (
    <>
      {/* Sidebar mobile (off-canvas) */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Chiudi sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">CleanAI</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group flex items-center px-2 py-2 text-base font-medium rounded-md
                        ${
                          router.pathname === item.href
                            ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                        }
                      `}
                    >
                      <item.icon
                        className={`
                          mr-4 flex-shrink-0 h-6 w-6
                          ${
                            router.pathname === item.href
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                          }
                        `}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Versione 0.1.0
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      CleanAI - Pulizia Proattiva e Intelligente
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
        </Dialog>
      </Transition.Root>

      {/* Sidebar desktop (statica) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">CleanAI</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${
                      router.pathname === item.href
                        ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-6 w-6
                      ${
                        router.pathname === item.href
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                      }
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Versione 0.1.0
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CleanAI - Pulizia Proattiva e Intelligente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
