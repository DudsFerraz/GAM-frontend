type MapLocation = {
  name?: string | null
  street?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  latitude?: number | null
  longitude?: number | null
}

function hasCoordinates(location: MapLocation): location is MapLocation & {
  latitude: number
  longitude: number
} {
  return typeof location.latitude === 'number'
    && Number.isFinite(location.latitude)
    && typeof location.longitude === 'number'
    && Number.isFinite(location.longitude)
}

export function getGoogleMapsSearchUrl(location?: MapLocation | null): string | null {
  if (!location) {
    return null
  }

  const query = hasCoordinates(location)
    ? `${location.latitude},${location.longitude}`
    : [location.name, location.street, location.postalCode, location.city, location.state, location.country]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(', ')

  if (!query) {
    return null
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
