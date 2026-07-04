import { createContext, useContext, useState } from 'react'

const translations = {
  tr: {
    // Navigation
    'nav.overview': 'Genel Bakış',
    'nav.income': 'Gelirler',
    'nav.expenses': 'Giderler',
    'nav.assets': 'Varlıklar',
    'nav.transactions': 'İşlemler',
    'nav.analytics': 'Analiz',
    'nav.logout': 'Çıkış Yap',

    // Overview
    'overview.title': 'Genel Bakış',
    'overview.netWorth': 'Net Varlık',
    'overview.cash': 'Nakit',
    'overview.investments': 'Yatırımlar',
    'overview.crypto': 'Kripto',
    'overview.monthlyIncome': 'Aylık Gelir',
    'overview.monthlyExpense': 'Aylık Gider',
    'overview.netFlow': 'Net Akış',
    'overview.quickAdd': 'Hızlı Ekle',

    // Income
    'income.title': 'Gelirler',
    'income.add': 'Gelir Ekle',
    'income.salary': 'Maaş',
    'income.rental': 'Kira Geliri',
    'income.freelance': 'Serbest Çalışma',
    'income.investment': 'Yatırım Geliri',
    'income.other': 'Diğer',

    // Expenses
    'expenses.title': 'Giderler',
    'expenses.add': 'Gider Ekle',
    'expenses.market': 'Market',
    'expenses.bills': 'Fatura',
    'expenses.rent': 'Kira',
    'expenses.transport': 'Ulaşım',
    'expenses.entertainment': 'Eğlence',
    'expenses.shopping': 'Alışveriş',
    'expenses.health': 'Sağlık',
    'expenses.education': 'Eğitim',
    'expenses.other': 'Diğer',

    // Transactions
    'transactions.title': 'Tüm İşlemler',
    'transactions.search': 'Ara...',
    'transactions.filter': 'Filtrele',
    'transactions.noResults': 'İşlem bulunamadı',
    'transactions.income': 'Gelir',
    'transactions.expense': 'Gider',
    'transactions.assetBuy': 'Alış',
    'transactions.assetSell': 'Satış',

    // Assets
    'assets.title': 'Varlıklar',
    'assets.addAsset': 'Varlık Ekle',
    'assets.currency': 'Döviz',
    'assets.stock': 'Hisse',
    'assets.crypto': 'Kripto',

    // Common
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.add': 'Ekle',
    'common.amount': 'Tutar',
    'common.category': 'Kategori',
    'common.date': 'Tarih',
    'common.description': 'Açıklama',
    'common.tags': 'Etiketler',
    'common.type': 'Tür',
    'common.total': 'Toplam',
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',

    // Installment
    'installment.title': 'Taksit',
    'installment.total': 'Toplam Taksit',
    'installment.current': 'Mevcut Taksit',
    'installment.monthly': 'Aylık Tutar',

    // Filters
    'filter.all': 'Tümü',
    'filter.thisMonth': 'Bu Ay',
    'filter.thisYear': 'Bu Yıl',
    'filter.dateRange': 'Tarih Aralığı',
    'filter.from': 'Başlangıç',
    'filter.to': 'Bitiş',
  },
  en: {
    'nav.overview': 'Overview',
    'nav.income': 'Income',
    'nav.expenses': 'Expenses',
    'nav.assets': 'Assets',
    'nav.transactions': 'Transactions',
    'nav.analytics': 'Analytics',
    'nav.logout': 'Logout',
    'overview.title': 'Overview',
    'overview.netWorth': 'Net Worth',
    'overview.cash': 'Cash',
    'overview.investments': 'Investments',
    'overview.crypto': 'Crypto',
    'overview.monthlyIncome': 'Monthly Income',
    'overview.monthlyExpense': 'Monthly Expense',
    'overview.netFlow': 'Net Flow',
    'overview.quickAdd': 'Quick Add',
    'income.title': 'Income',
    'income.add': 'Add Income',
    'expenses.title': 'Expenses',
    'expenses.add': 'Add Expense',
    'transactions.title': 'All Transactions',
    'transactions.search': 'Search...',
    'transactions.filter': 'Filter',
    'transactions.noResults': 'No transactions found',
    'transactions.income': 'Income',
    'transactions.expense': 'Expense',
    'transactions.assetBuy': 'Buy',
    'transactions.assetSell': 'Sell',
    'assets.title': 'Assets',
    'assets.addAsset': 'Add Asset',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.amount': 'Amount',
    'common.category': 'Category',
    'common.date': 'Date',
    'common.description': 'Description',
    'common.tags': 'Tags',
    'common.type': 'Type',
    'common.total': 'Total',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'installment.title': 'Installment',
    'installment.total': 'Total Installments',
    'installment.current': 'Current Installment',
    'installment.monthly': 'Monthly Amount',
    'filter.all': 'All',
    'filter.thisMonth': 'This Month',
    'filter.thisYear': 'This Year',
    'filter.dateRange': 'Date Range',
    'filter.from': 'From',
    'filter.to': 'To',
  },
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'tr')

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key

  const switchLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem('lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, t, switchLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
