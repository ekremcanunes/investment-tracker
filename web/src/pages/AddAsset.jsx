import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { assetApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

const symbolsByType = {
  Currency: ['USD', 'EUR', 'GBP'],
  Stock: ['AAPL', 'MSFT', 'NVDA', 'GOOGL'],
  Crypto: ['BTC', 'ETH', 'SOL'],
}

const assetTypes = ['Currency', 'Stock', 'Crypto']
const currencies = ['TRY', 'USD']

export default function AddAsset() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [assetType, setAssetType] = useState('')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [currency, setCurrency] = useState('TRY')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleTypeChange = (val) => {
    setAssetType(val)
    setSymbol('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!assetType || !symbol || !quantity || !unitPrice) return
    setSubmitting(true)
    setError(null)
    try {
      await assetApi.buy({
        assetType,
        symbol,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
        currency,
        date: new Date(date).toISOString(),
      })
      navigate('/assets')
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
      setSubmitting(false)
    }
  }

  const availableSymbols = assetType ? symbolsByType[assetType] ?? [] : []

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
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
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
              <Label>{t('assets.name')}</Label>
              <Select value={symbol} onValueChange={setSymbol} disabled={!assetType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('assets.name')} />
                </SelectTrigger>
                <SelectContent>
                  {availableSymbols.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label htmlFor="quantity">{t('assets.quantity')}</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            {/* Unit price + currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="unitPrice">{t('assets.purchasePrice')}</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('assets.currencyLabel')}</Label>
                <Select value={currency} onValueChange={setCurrency}>
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
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting || !assetType || !symbol || !quantity || !unitPrice}>
                {submitting ? '...' : t('assets.buy')}
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
