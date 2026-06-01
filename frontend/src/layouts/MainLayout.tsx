import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, CheckCircle } from 'lucide-react';
import { DESIGN_VARIANCE, MOTION_INTENSITY } from '../utils/theme';

const menuItems = [
  { text: 'Tu Actividad', icon: <LayoutDashboard className="w-5 h-5 mr-3" />, path: '/' },
  { text: 'Enviar Dinero', icon: <PlusCircle className="w-5 h-5 mr-3" />, path: '/create' },
  { text: 'Aprobaciones', icon: <CheckCircle className="w-5 h-5 mr-3" />, path: '/approve' },
];

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-belo-dark-base font-sans text-belo-light-text antialiased">
      {/* Sidebar */}
      <aside className={`w-64 ${DESIGN_VARIANCE.glassmorphism.sidebar} flex-shrink-0`}>
        <div className="h-16 flex items-center px-6 border-b border-belo-dark-border/40">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white via-belo-light-text to-belo-green bg-clip-text text-transparent">
            Belo
          </h1>
        </div>
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.text}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-xl ${MOTION_INTENSITY.transition} ${isActive
                  ? 'bg-belo-purple/15 text-belo-green shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border-l-2 border-belo-green'
                  : 'text-belo-light-muted hover:bg-belo-dark-surface/40 hover:text-belo-light-text'
                }`
              }
            >
              {item.icon}
              {item.text}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className={`h-16 ${DESIGN_VARIANCE.glassmorphism.header} flex items-center justify-between px-8 flex-shrink-0`}>
          <h2 className="text-lg font-semibold text-belo-light-text">Panel de Control</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-belo-dark-surface border border-white/[0.04] text-xs">
              <span className="w-2 h-2 rounded-full bg-belo-green animate-pulse"></span>
              <span className="text-belo-light-muted">Operador:</span>
              <span className="font-semibold text-belo-light-text">Juan Pérez</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-belo-purple/20 text-belo-green font-mono">operator-123</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-gradient-to-b from-belo-dark-base to-[#0e121a]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}