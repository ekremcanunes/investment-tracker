import { NavLink, Outlet } from 'react-router-dom'
import { LineChart, LayoutDashboard, Wallet, BarChart2, LogOut, Globe } from 'lucide-react'
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
    <div className="flex h-screen bg-background text-foreground">
      <aside className="flex w-60 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15">
            <LineChart className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="font-semibold tracking-tight text-foreground">Investment Tracker</span>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-primary/12 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-0.5 border-t border-border px-3 py-3">
          <button
            onClick={() => switchLang(lang === 'tr' ? 'en' : 'tr')}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Globe className="h-[18px] w-[18px]" />
            {lang === 'tr' ? 'English' : 'Türkçe'}
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
