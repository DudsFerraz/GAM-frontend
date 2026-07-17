import { Link } from '@tanstack/react-router'
import { ArrowLeft, MapPin, Navigation } from 'lucide-react'

import { EmptyState, ErrorState, ForbiddenState, LoadingState } from '@/components/AsyncState'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCountryName } from '@/lib/format'
import { isForbiddenError } from '@/lib/http'

import { useLocation } from '../hooks/useLocations'

export function LocationDetailPage({ locationId }: { locationId: string }) {
  const query = useLocation(locationId)
  if (query.isLoading) return <LoadingState title="Carregando local..." />
  if (query.isError) return isForbiddenError(query.error) ? <ForbiddenState /> : <ErrorState onRetry={() => void query.refetch()} />
  if (!query.data) return <EmptyState title="Local não encontrado." />
  const location = query.data

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <Button asChild size="sm" variant="ghost"><Link to="/manage/locations"><ArrowLeft className="h-4 w-4" />Voltar para locais</Link></Button>
      <div><p className="text-sm font-medium text-primary">Local</p><h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{location.name}</h1><p className="mt-1 text-sm text-muted-foreground">{location.city}, {location.state} · {formatCountryName(location.countryCode)}</p></div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Endereço e localização</CardTitle></CardHeader><CardContent><dl className="grid gap-5 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Endereço</dt><dd className="mt-1 font-medium">{location.street || 'Não informado'}</dd></div><div><dt className="text-muted-foreground">Código postal</dt><dd className="mt-1 font-medium">{location.postalCode || 'Não informado'}</dd></div><div><dt className="text-muted-foreground">Cidade</dt><dd className="mt-1 font-medium">{location.city}</dd></div><div><dt className="text-muted-foreground">Estado</dt><dd className="mt-1 font-medium">{location.state}</dd></div><div><dt className="text-muted-foreground">País</dt><dd className="mt-1 font-medium">{formatCountryName(location.countryCode)}</dd></div><div><dt className="text-muted-foreground">Coordenadas</dt><dd className="mt-1 flex items-center gap-2 font-medium"><Navigation className="h-4 w-4" />{location.latitude !== undefined && location.longitude !== undefined ? `${location.latitude}, ${location.longitude}` : 'Não informadas'}</dd></div></dl></CardContent></Card>
    </div>
  )
}
