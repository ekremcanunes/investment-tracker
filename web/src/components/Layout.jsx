import { useState, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, CandlestickChart, Coins, Wallet, BarChart2, LogOut, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/app'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

// Canlı sistem tarih/saati (sidebar alt bilgisi)
function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

const sectionCls = 'px-2 pb-1.5 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-shell-muted'

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'relative flex h-[33px] items-center gap-2.5 rounded-lg px-2.5 text-[13px]',
          isActive
            ? 'nav-active bg-shell-panel font-medium text-shell-fg'
            : 'text-shell-muted hover:bg-shell-panel hover:text-shell-fg'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-foil')} />
          {label}
        </>
      )}
    </NavLink>
  )
}

export default function Layout() {
  const { logout, session } = useAuth()
  const { t, lang, switchLang } = useLanguage()
  const now = useClock()

  const email = session?.identity?.traits?.email ?? ''
  const initials = (email.slice(0, 2) || '··').toUpperCase()

  return (
    <div className="flex h-screen bg-shell text-shell-fg">
      <aside className="flex w-[212px] shrink-0 flex-col gap-0.5 px-2.5 py-2.5">
        {/* Marka rozeti */}
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <div className="foil-tile grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] font-mono text-xs font-bold">
            ₺
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold leading-tight text-shell-fg">{APP_NAME}</div>
            <div className="truncate text-[10px] text-shell-muted">{email || '—'}</div>
          </div>
        </div>

        <nav className="mt-2 flex flex-col gap-0.5">
          <div className={sectionCls}>{t('nav.sectionGeneral')}</div>
          <NavItem to="/" label={t('nav.overview')} icon={LayoutDashboard} end />
          <NavItem to="/assets" label={t('nav.assets')} icon={Wallet} />
          <NavItem to="/analytics" label={t('nav.analytics')} icon={BarChart2} />

          <div className={sectionCls}>{t('nav.sectionMarket')}</div>
          <NavItem to="/market" label={t('nav.market')} icon={CandlestickChart} />
          <NavItem to="/gold-fx" label={t('nav.goldFx')} icon={Coins} />
        </nav>

        {/* Alt blok: saat + ayarlar + kullanıcı kartı */}
        <div className="mt-auto flex flex-col gap-0.5">
          <div className="tabular px-2.5 pb-1 text-[10px] leading-relaxed text-shell-muted">
            {now.toLocaleDateString('tr-TR')} · {now.toLocaleTimeString('tr-TR')}
          </div>

          <button
            onClick={() => switchLang(lang === 'tr' ? 'en' : 'tr')}
            className="flex h-[33px] items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-shell-muted hover:bg-shell-panel hover:text-shell-fg"
          >
            <Globe className="h-4 w-4 shrink-0" />
            {lang === 'tr' ? 'English' : 'Türkçe'}
          </button>

          <div className="mt-1 flex items-center gap-2.5 rounded-[9px] border border-shell-border bg-shell-panel px-2 py-2">
            <div className="grid h-[25px] w-[25px] shrink-0 place-items-center rounded-full bg-shell-border text-[10px] font-semibold text-shell-fg">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11.5px] leading-tight text-shell-fg">{email.split('@')[0] || '—'}</div>
              <div className="truncate text-[9.5px] text-shell-muted">{email}</div>
            </div>
            <button
              onClick={logout}
              title={t('nav.logout')}
              aria-label={t('nav.logout')}
              className="shrink-0 rounded-md p-1 text-shell-muted hover:text-shell-fg"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Bone içerik tuvali — koyu şasinin üstünde ayrı bir yüzey */}
      {/* Bone içerik tuvali — padding'i Page bileşeni yönetir (başlık kenara yapışsın diye) */}
      <main className="canvas-inset my-2 mr-2 flex-1 overflow-auto rounded-xl border border-shell-border bg-background text-foreground">
        <Outlet />
      </main>
    </div>
  )
}
