import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { transactionApi } from '@/services/api'
import { todayString, toApiDate } from '@/lib/date'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoneyInput } from '@/components/ui/money-input'
import { DatePicker } from '@/components/ui/date-picker'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

const EXPENSE_CATEGORIES = ['market', 'bills', 'rent', 'transport', 'entertainment', 'shopping', 'health', 'education', 'other']

const emptyForm = () => ({
  amount: '', category: '', description: '', date: todayString(),
  tags: '', installmentTotal: '', installmentCurrent: '', installmentMonthlyAmount: '',
})

export default function Expenses() {
  const { t, lang } = useLanguage()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isInstallment, setIsInstallment] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = () => {
    transactionApi.getAll({ type: 'Expense', pageSize: 100 })
      .then(res => {
        setTransactions(res.data.items ?? [])
        setError(null)
      })
      .catch(err => setError(err.response?.data?.error?.message ?? err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await transactionApi.create({
        type: 'Expense',
        amount: parseFloat(form.amount),
        currency: 'TRY',
        category: form.category,
        description: form.description || null,
        date: toApiDate(form.date),
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        ...(isInstallment && {
          installmentTotal: parseInt(form.installmentTotal),
          installmentCurrent: parseInt(form.installmentCurrent) || 1,
          installmentMonthlyAmount: parseFloat(form.installmentMonthlyAmount),
        }),
      })
      setForm(emptyForm())
      setShowForm(false)
      setIsInstallment(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await transactionApi.delete(id)
      load()
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
    }
  }

  const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)
  const formatDate = (d) => new Date(d).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')

  if (loading) return <div className="text-gray-400 text-sm">{t('common.loading')}</div>

  const total = transactions.reduce((s, tx) => s + tx.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('expenses.title')}</h1>
          <p className="text-gray-400 text-sm mt-1">{t('common.total')}: {formatCurrency(total)}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('expenses.add')}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t('expenses.add')}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">{t('common.amount')}</Label>
                  <MoneyInput
                    id="amount"
                    currency="TRY"
                    placeholder="0,00"
                    value={form.amount}
                    onChange={v => setForm({ ...form, amount: v })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('common.category')}</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder={t('common.category')} /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{t(`expenses.${c}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">{t('common.date')}</Label>
                  <DatePicker
                    id="date"
                    value={form.date}
                    onChange={v => setForm({ ...form, date: v })}
                    clearable={false}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tags">
                    {t('common.tags')} <span className="text-gray-600 font-normal">({t('common.optional')})</span>
                  </Label>
                  <Input
                    id="tags"
                    placeholder="market, haftalık"
                    value={form.tags}
                    onChange={e => setForm({ ...form, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">{t('common.description')}</Label>
                <Input
                  id="description"
                  placeholder={t('common.description')}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <Checkbox
                id="installment"
                checked={isInstallment}
                onCheckedChange={setIsInstallment}
                label={t('installment.title')}
              />

              {isInstallment && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="instTotal">{t('installment.total')}</Label>
                    <MoneyInput
                      id="instTotal"
                      allowDecimals={false}
                      placeholder="12"
                      value={form.installmentTotal}
                      onChange={v => setForm({ ...form, installmentTotal: v })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="instCurrent">{t('installment.current')}</Label>
                    <MoneyInput
                      id="instCurrent"
                      allowDecimals={false}
                      placeholder="1"
                      value={form.installmentCurrent}
                      onChange={v => setForm({ ...form, installmentCurrent: v })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="instMonthly">{t('installment.monthly')}</Label>
                    <MoneyInput
                      id="instMonthly"
                      currency="TRY"
                      placeholder="0,00"
                      value={form.installmentMonthlyAmount}
                      onChange={v => setForm({ ...form, installmentMonthlyAmount: v })}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting || !form.amount || !form.category || !form.date}>
                  {t('common.save')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-sm text-gray-400">
                <th className="text-left px-4 py-3 font-medium">{t('common.date')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('common.category')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('common.description')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('common.tags')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('common.amount')}</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">{t('transactions.noResults')}</td></tr>
              ) : transactions.map(tx => (
                <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-sm text-gray-300">{formatDate(tx.date)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs">{t(`expenses.${tx.category}`) || tx.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {tx.description || '-'}
                    {tx.installmentTotal && (
                      <span className="ml-2 text-xs text-yellow-400">({tx.installmentCurrent}/{tx.installmentTotal})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tx.tags?.map(tag => (
                      <span key={tag} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs mr-1">{tag}</span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-red-400 tabular-nums">{formatCurrency(tx.amount)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(tx.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
