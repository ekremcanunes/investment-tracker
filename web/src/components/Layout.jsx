import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Wallet, BarChart2, LogOut, Globe } from 'lucide-react'
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
        {/* Wordmark */}
        <div className="border-b-2 border-foreground px-5 py-5">
          <div className="font-serif text-2xl font-bold tracking-tight text-foreground">LEDGER</div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Kişisel Portföy Defteri
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 border px-3 py-2 text-xs font-semibold uppercase tracking-wider',
                  isActive
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <Icon className="h-[15px] w-[15px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-border px-3 py-3">
          <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Folio N° <span className="text-foreground">084-2026</span>
          </div>
          <button
            onClick={() => switchLang(lang === 'tr' ? 'en' : 'tr')}
            className="flex w-full items-center gap-3 border border-transparent px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground"
          >
            <Globe className="h-[15px] w-[15px]" />
            {lang === 'tr' ? 'English' : 'Türkçe'}
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 border border-transparent px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-[15px] w-[15px]" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
