import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  const [assetType, setAssetType] = useState('')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
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
      })
      navigate(`/portfolios/${id}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const availableSymbols = assetType ? symbolsByType[assetType] ?? [] : []

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/portfolios/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Add Asset</h1>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Asset Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Asset Type */}
            <div className="space-y-1.5">
              <Label>Asset Type</Label>
              <Select value={assetType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
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
                  <SelectValue placeholder={assetType ? 'Select symbol...' : 'Select type first'} />
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
              <Label htmlFor="quantity">Quantity</Label>
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

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting || !assetType || !symbol || !quantity}>
                {submitting ? 'Adding...' : 'Add Asset'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/portfolios/${id}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
