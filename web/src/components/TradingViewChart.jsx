import { useEffect, useRef } from 'react'

// TradingView Advanced Chart embed — harici widget, API kredisi yemez.
// BIST için "BIST:THYAO", diğerleri için sembol doğrudan kullanılır.
export default function TradingViewChart({ symbol, exchange }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const tvSymbol = exchange === 'BIST' ? `BIST:${symbol}` : symbol
    const containerId = `tv_${symbol}_${exchange}`.replace(/[^a-zA-Z0-9_]/g, '')

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
        theme: 'dark',
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
  }, [symbol, exchange])

  return <div ref={containerRef} className="h-full w-full" />
}
