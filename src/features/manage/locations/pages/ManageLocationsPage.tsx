import { useNavigate } from '@tanstack/react-router'
import { MapPin, Navigation, Plus } from 'lucide-react'
import { useState } from 'react'

import { EmptyState, ErrorState, ForbiddenState, LoadingState } from '@/components/AsyncState'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCountryName } from '@/lib/format'
import { isForbiddenError } from '@/lib/http'
import { getGoogleMapsSearchUrl } from '@/lib/maps'

import { CreateLocationDialog } from '../components/CreateLocationDialog'
import { useLocations } from '../hooks/useLocations'

export function ManageLocationsPage() {
  const [page, setPage] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const navigate = useNavigate()
  const query = useLocations(page)
  const items = query.data?.items ?? []

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Estrutura</p><h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Locais</h1><p className="mt-1 text-sm text-muted-foreground">Consulte e cadastre locais usados na programação de eventos.</p></div><Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4" />Novo local</Button></div>
      {query.isLoading && <LoadingState title="Carregando locais..." />}
      {query.isError && (isForbiddenError(query.error) ? <ForbiddenState /> : <ErrorState onRetry={() => void query.refetch()} />)}
      {!query.isLoading && !query.isError && items.length === 0 && <EmptyState title="Nenhum local cadastrado." description="Cadastre o primeiro local para associá-lo a eventos." />}
      {items.length > 0 && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((location) => {
        const mapUrl = getGoogleMapsSearchUrl({
          name: location.name,
          street: location.street,
          city: location.city,
          state: location.state,
          postalCode: location.postalCode,
          country: formatCountryName(location.countryCode),
          latitude: location.latitude,
          longitude: location.longitude,
        })

        return <Card className="gap-4 py-5" key={location.id}><CardHeader className="flex grid-cols-none flex-row items-start gap-3 px-5"><div className="rounded-lg bg-primary/10 p-2 text-primary"><MapPin className="h-5 w-5" /></div><div><CardTitle>{location.name}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{location.city}, {location.state}</p></div></CardHeader><CardContent className="space-y-1 px-5 text-sm text-muted-foreground"><p>{location.street || 'Endereço não informado'}</p><p>{location.postalCode || 'Código postal não informado'} · {formatCountryName(location.countryCode)}</p>{location.latitude !== undefined && location.longitude !== undefined && <p className="flex items-center gap-1 text-xs"><Navigation className="h-3.5 w-3.5" />{location.latitude}, {location.longitude}</p>}</CardContent><CardFooter className="flex flex-col gap-2 px-5 sm:flex-row">{mapUrl ? <Button asChild className="w-full" size="sm"><a href={mapUrl} rel="noopener noreferrer" target="_blank">Ver local no mapa</a></Button> : <Button className="w-full" disabled size="sm">Mapa indisponível</Button>}</CardFooter></Card>
      })}</div>}
      {query.data && <Pagination disabled={query.isFetching} itemLabel="locais" onPageChange={setPage} page={query.data.page ?? page} totalElements={query.data.totalElements ?? items.length} totalPages={query.data.totalPages ?? 0} />}
      <CreateLocationDialog onCreated={(locationId) => { setIsCreateOpen(false); void navigate({ to: '/manage/locations/$locationId', params: { locationId } }) }} onOpenChange={setIsCreateOpen} open={isCreateOpen} />
    </div>
  )
}
