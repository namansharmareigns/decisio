import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl sm:text-2xl font-display font-bold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-400 to-accent-400">
                    Decisio
                  </span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/')
                      ? 'border-b-2 border-primary-400 text-slate-50'
                      : 'text-slate-300 hover:text-slate-50 hover:border-white/20'
                  }`}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/decisions"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/decisions') || location.pathname.startsWith('/decisions/')
                      ? 'border-b-2 border-primary-400 text-slate-50'
                      : 'text-slate-300 hover:text-slate-50 hover:border-white/20'
                  }`}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Decisions
                </Link>
                <Link
                  to="/project-context"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive('/project-context')
                      ? 'border-b-2 border-primary-400 text-slate-50'
                      : 'text-slate-300 hover:text-slate-50 hover:border-white/20'
                  }`}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Project Context
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
