import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { portfolioApi } from '@/services/api'
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

export default function AddAsset() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [assetType, setAssetType] = useState('')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleTypeChange = (val) => {
    setAssetType(val)
    setSymbol('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!assetType || !symbol || !quantity) return
    setSubmitting(true)
    try {
      await portfolioApi.addAsset(id, {
        assetType,
        symbol,
        quantity: parseFloat(quantity),
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      })
      navigate('/assets')
    } catch (err) {
      setError(err.message)
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
        <h1 className="text-2xl font-bold text-white">{t('assets.addAsset')}</h1>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">{t('assets.addAsset')}</CardTitle>
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
                  {assetTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Symbol */}
            <div className="space-y-1.5">
              <Label>Symbol</Label>
              <Select value={symbol} onValueChange={setSymbol} disabled={!assetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Symbol" />
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

            {/* Purchase Price */}
            <div className="space-y-1.5">
              <Label htmlFor="purchasePrice">{t('assets.purchasePrice')}</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting || !assetType || !symbol || !quantity}>
                {submitting ? '...' : t('common.save')}
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
