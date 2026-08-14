import { useEffect, useRef } from 'react'

// TradingView Advanced Chart embed — harici widget, API kredisi yemez.
// tvSymbol tam TradingView sembolüdür (ör. "BIST:THYAO", "FX_IDC:USDTRY", "TVC:GOLD").
export default function TradingViewChart({ tvSymbol }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const containerId = `tv_${tvSymbol}`.replace(/[^a-zA-Z0-9_]/g, '')

    const loadScript = () =>
      new Promise((resolve) => {
        if (window.TradingView) return resolve()
        let s = document.getElementById('tradingview-tv-js')
        if (s) {
          s.addEventListener('load', resolve)
          return
        }
        s = document.createElement('script')
        s.id = 'tradingview-tv-js'
        s.src = 'https://s3.tradingview.com/tv.js'
        s.async = true
        s.addEventListener('load', resolve)
        document.body.appendChild(s)
      })

    loadScript().then(() => {
      if (cancelled || !containerRef.current || !window.TradingView) return
      containerRef.current.innerHTML = `<div id="${containerId}" style="height:100%;width:100%"></div>`
      new window.TradingView.widget({
        symbol: tvSymbol,
        container_id: containerId,
        autosize: true,
        interval: 'D',
        timezone: 'Europe/Istanbul',
        theme: 'light',
        style: '1',
        locale: 'tr',
        hide_side_toolbar: true,
        allow_symbol_change: false,
        withdateranges: true,
      })
    })

    return () => {
      cancelled = true
    }
  }, [tvSymbol])

  return <div ref={containerRef} className="h-full w-full" />
}
