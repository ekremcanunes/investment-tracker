import { Navigate, useParams } from 'react-router-dom'
import PortfolioDetail from './PortfolioDetail'

export default function AssetDetail() {
  const { id } = useParams()
  return <PortfolioDetail />
}
