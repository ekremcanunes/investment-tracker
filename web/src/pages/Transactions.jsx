import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { transactionApi } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from 'lucide-react'

const TYPE_ICONS = {
  Income: ArrowUpCircle,
  Expense: ArrowDownCircle,
  AssetBuy: TrendingUp,
  AssetSell: TrendingDown,
}

const TYPE_COLORS = {
  Income: 'text-green-400 bg-green-500/10',
  Expense: 'text-red-400 bg-red-500/10',
  AssetBuy: 'text-blue-400 bg-blue-500/10',
  AssetSell: 'text-orange-400 bg-orange-500/10',
}

export default function Transactions() {
  const { t } = useLanguage()
  const [transactions, setTransactions] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', search: '', from: '', to: '' })

  const load = () => {
    const params = {}
    if (filters.type) params.type = filters.type
    if (filters.search) params.search = filters.search
    if (filters.from) params.from = new Date(filters.from).toISOString()
    if (filters.to) params.to = new Date(filters.to).toISOString()

    transactionApi.getAll(params).then(res => {
      setTransactions(res.data.items ?? [])
      setTotal(res.data.total ?? 0)
      setLoading(false)
    })
  }

  useEffect(load, [filters])

  const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)
  const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t('transactions.title')}</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-9"
            placeholder={t('transactions.search')}
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <Select value={filters.type} onValueChange={v => setFilters({ ...filters, type: v === 'all' ? '' : v })}>
          <SelectTrigger><SelectValue placeholder={t('common.type')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filter.all')}</SelectItem>
            <SelectItem value="Income">{t('transactions.income')}</SelectItem>
            <SelectItem value="Expense">{t('transactions.expense')}</SelectItem>
            <SelectItem value="AssetBuy">{t('transactions.assetBuy')}</SelectItem>
            <SelectItem value="AssetSell">{t('transactions.assetSell')}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" placeholder={t('filter.from')} value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} />
        <Input type="date" placeholder={t('filter.to')} value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} />
      </div>

      <p className="text-sm text-gray-500">{total} {t('transactions.title').toLowerCase()}</p>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t('transactions.noResults')}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-sm text-gray-400">
                  <th className="text-left px-4 py-3 font-medium">{t('common.date')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('common.type')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('common.category')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('common.description')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('common.tags')}</th>
                  <th className="text-right px-4 py-3 font-medium">{t('common.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const Icon = TYPE_ICONS[tx.type] || ArrowUpCircle
                  const colorClass = TYPE_COLORS[tx.type] || 'text-gray-400 bg-gray-500/10'
                  const isNegative = tx.type === 'Expense' || tx.type === 'AssetBuy'
                  return (
                    <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-sm text-gray-300">{formatDate(tx.date)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${colorClass}`}>
                          <Icon className="h-3 w-3" />
                          {t(`transactions.${tx.type.charAt(0).toLowerCase() + tx.type.slice(1)}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{tx.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{tx.description || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {tx.tags?.map(tag => (
                          <span key={tag} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs mr-1">{tag}</span>
                        ))}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
                        {isNegative ? '-' : '+'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
