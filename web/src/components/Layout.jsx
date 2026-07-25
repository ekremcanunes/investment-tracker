import { NavLink, Outlet } from 'react-router-dom'
import { TrendingUp, LayoutDashboard, Wallet, BarChart2, LogOut, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Layout() {
  const { logout } = useAuth()
  const { t, lang, switchLang } = useLanguage()

  const navLinks = [
    { to: '/', label: t('nav.overview'), icon: LayoutDashboard, end: true },
    { to: '/assets', label: t('nav.assets'), icon: Wallet },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart2 },
  ]

  return (
    <div className="flex h-screen bg-gray-950">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-800">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-white text-lg">Investment Tracker</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800 space-y-1">
          <button
            onClick={() => switchLang(lang === 'tr' ? 'en' : 'tr')}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Globe className="h-5 w-5" />
            {lang === 'tr' ? 'English' : 'Türkçe'}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
