import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { marketApi } from '@/services/api'
import { useBuyAsset } from '@/hooks/queries'
import { todayString, toApiDate } from '@/lib/date'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MoneyInput } from '@/components/ui/money-input'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Search, X } from 'lucide-react'

const assetTypes = ['Stock', 'Currency', 'Gold']
const currencySymbols = ['USD', 'EUR', 'GBP']
const currencies = ['TRY', 'USD']

export default function AddAsset() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [assetType, setAssetType] = useState('')
  const [symbol, setSymbol] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [currency, setCurrency] = useState('TRY')
  const [date, setDate] = useState(todayString())
  const [error, setError] = useState(null)
  const buyMutation = useBuyAsset()

  // Hisse araması — debounce (300ms, min 2 karakter). Seçim yapıldıysa arama durur.
  useEffect(() => {
    if (assetType !== 'Stock' || symbol) return
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const handle = setTimeout(async () => {
      try {
        const res = await marketApi.search(q)
        setResults(res.data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [query, assetType, symbol])

  const handleTypeChange = (val) => {
    setAssetType(val)
    setQuery('')
    setResults([])
    setSymbol(val === 'Gold' ? 'XAU' : '')
    setSelectedName(val === 'Gold' ? t('assets.gold') : '')
    // Altın ve döviz her zaman TL ile alınır → para birimi kilitli
    if (val === 'Gold' || val === 'Currency') setCurrency('TRY')
  }

  const handleSelectResult = (r) => {
    setSymbol(r.symbol)
    setSelectedName(r.name)
    setResults([])
    if (r.currency === 'USD' || r.currency === 'TRY') setCurrency(r.currency)
  }

  const handleClearSymbol = () => {
    setSymbol('')
    setSelectedName('')
    setQuery('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!assetType || !symbol || !quantity || !unitPrice) return
    setError(null)
    try {
      await buyMutation.mutateAsync({
        assetType,
        symbol,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
        currency,
        date: toApiDate(date),
      })
      navigate(`/assets?tab=${assetType}`)
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/assets')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('assets.buyAsset')}</h1>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">{t('assets.buyAsset')}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Asset Type */}
            <div className="space-y-1.5">
              <Label>{t('common.type')}</Label>
              <Select value={assetType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.type')} />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`assets.${type.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset / Symbol */}
            <div className="space-y-1.5">
              <Label>{assetType ? t(`assets.${assetType.toLowerCase()}`) : t('assets.name')}</Label>

              {assetType === 'Currency' && (
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('assets.name')} />
                  </SelectTrigger>
                  <SelectContent>
                    {currencySymbols.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {assetType === 'Stock' && symbol && (
                <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{symbol}</div>
                    <div className="truncate text-xs text-muted-foreground">{selectedName}</div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={handleClearSymbol}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {assetType === 'Stock' && !symbol && (
                <div className="relative">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t('assets.searchPlaceholder')}
                      className="pl-9"
                      autoComplete="off"
                    />
                  </div>
                  {(searching || results.length > 0) && (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
                      {searching && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">{t('common.loading')}</div>
                      )}
                      {!searching && results.map((r) => (
                        <button
                          key={`${r.symbol}-${r.exchange}`}
                          type="button"
                          onClick={() => handleSelectResult(r)}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-secondary"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground">{r.symbol}</div>
                            <div className="truncate text-xs text-muted-foreground">{r.name}</div>
                          </div>
                          <span className="tabular shrink-0 text-xs text-muted-foreground">{r.exchange}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {assetType === 'Gold' && (
                <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2">
                  <span className="text-sm font-medium text-foreground">XAU</span>
                  <span className="text-xs text-muted-foreground">· {t('assets.goldGram')}</span>
                </div>
              )}

              {!assetType && (
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder={t('assets.name')} />
                  </SelectTrigger>
                </Select>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label htmlFor="quantity">{assetType === 'Gold' ? t('assets.grams') : t('assets.quantity')}</Label>
              <MoneyInput
                id="quantity"
                placeholder="0"
                value={quantity}
                onChange={setQuantity}
                required
              />
            </div>

            {/* Unit price + currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="unitPrice">
                  {assetType === 'Gold' ? t('assets.pricePerGram') : t('assets.purchasePrice')}
                </Label>
                <MoneyInput
                  id="unitPrice"
                  currency={currency}
                  placeholder="0,00"
                  value={unitPrice}
                  onChange={setUnitPrice}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('assets.currencyLabel')}</Label>
                <Select value={currency} onValueChange={setCurrency} disabled={assetType === 'Gold' || assetType === 'Currency'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Purchase date */}
            <div className="space-y-1.5">
              <Label htmlFor="date">{t('assets.purchaseDate')}</Label>
              <DatePicker
                id="date"
                value={date}
                onChange={setDate}
                clearable={false}
                disabledDates={{ after: new Date() }}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={buyMutation.isPending || !assetType || !symbol || !quantity || !unitPrice}>
                {buyMutation.isPending ? '...' : t('assets.buy')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/assets')}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
