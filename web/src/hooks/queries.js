import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetApi, dashboardApi, transactionApi } from '@/services/api'

export const queryKeys = {
  holdings: ['holdings'],
  dashboard: ['dashboard'],
  transactions: ['transactions'],
}

// Tüm portföy — tek kaynak; tab'lar bunu client-side filtreler
export function useHoldings() {
  return useQuery({
    queryKey: queryKeys.holdings,
    queryFn: () => assetApi.getAll().then((r) => r.data),
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => dashboardApi.get().then((r) => r.data),
  })
}

// Bir varlığın alım-satım (lot) geçmişi — drawer'da gösterilir
export function useAssetTransactions(symbol) {
  return useQuery({
    queryKey: [...queryKeys.transactions, symbol],
    queryFn: () => transactionApi.getAll({ symbol }).then((r) => r.data.items ?? []),
    enabled: !!symbol,
  })
}

// Al-sat sonrası holdings + dashboard + lot geçmişi otomatik tazelensin
function useAssetMutation(mutationFn) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.holdings })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      qc.invalidateQueries({ queryKey: queryKeys.transactions })
    },
  })
}

export const useBuyAsset = () => useAssetMutation((data) => assetApi.buy(data))
export const useSellAsset = () => useAssetMutation(({ id, data }) => assetApi.sell(id, data))
export const useUpdateAsset = () => useAssetMutation(({ id, data }) => assetApi.update(id, data))
export const useDeleteAsset = () => useAssetMutation((id) => assetApi.delete(id))
