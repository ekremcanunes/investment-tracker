import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetApi, dashboardApi } from '@/services/api'

export const queryKeys = {
  holdings: ['holdings'],
  dashboard: ['dashboard'],
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

// Al-sat sonrası holdings + dashboard otomatik tazelensin
function useAssetMutation(mutationFn) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.holdings })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export const useBuyAsset = () => useAssetMutation((data) => assetApi.buy(data))
export const useSellAsset = () => useAssetMutation(({ id, data }) => assetApi.sell(id, data))
export const useUpdateAsset = () => useAssetMutation(({ id, data }) => assetApi.update(id, data))
export const useDeleteAsset = () => useAssetMutation((id) => assetApi.delete(id))
