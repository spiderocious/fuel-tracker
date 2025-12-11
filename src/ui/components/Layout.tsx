import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaList, FaPlus } from 'react-icons/fa';
import { ROUTES } from '@web/shared/constants/routes';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-primary">MileTracker</h1>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            <Link
              to={ROUTES.DASHBOARD}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive(ROUTES.DASHBOARD)
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <FaHome />
              <span>Dashboard</span>
            </Link>
            <Link
              to={ROUTES.MILEAGE_LIST}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive(ROUTES.MILEAGE_LIST)
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <FaList />
              <span>Mileage Logs</span>
            </Link>
            <Link
              to={ROUTES.ADD_MILEAGE}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive(ROUTES.ADD_MILEAGE)
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <FaPlus />
              <span>Add Log</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
