// lib/geocoding.ts
// ─────────────────────────────────────────────────────────
// Camada de abstração para geocoding.
// Troque o provider alterando UMA linha: ACTIVE_PROVIDER
// ─────────────────────────────────────────────────────────

export interface GeocodingResult {
  address: string
  neighborhood: string
  city: string
  state: string
  stateShort: string
  zipCode: string
  lat: number
  lng: number
  formattedAddress: string
}

// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÃO — Troque aqui o provider ativo
// ═══════════════════════════════════════════════════════════

type Provider = 'google' | 'nominatim'

const ACTIVE_PROVIDER: Provider = 'nominatim' // ← mude para 'google' quando quiser

// Só necessária se ACTIVE_PROVIDER === 'google'
const GOOGLE_API_KEY = 'SUA_GOOGLE_MAPS_API_KEY'

// ═══════════════════════════════════════════════════════════
// PROVIDER: NOMINATIM (OpenStreetMap) — Gratuito, sem chave
// ═══════════════════════════════════════════════════════════

async function nominatimGeocode(query: string): Promise<GeocodingResult | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('countrycodes', 'br')
  url.searchParams.set('limit', '1')
  url.searchParams.set('accept-language', 'pt-BR')

  const res = await fetch(url.toString(), {
    headers: {
      // Nominatim exige identificação — coloque um e-mail válido
      'User-Agent': 'RicardoReisImoveis/1.0 (ricardoaugustoreis@gmail.com)',
    },
  })

  const data = await res.json()
  if (!data || data.length === 0) return null

  const item = data[0]
  const addr = item.address || {}

  const state = addr.state || ''
  const stateShort = extractBrazilianStateShort(state)

  return {
    address: [addr.road, addr.house_number].filter(Boolean).join(', '),
    neighborhood: addr.suburb || addr.neighbourhood || addr.city_district || '',
    city: addr.city || addr.town || addr.municipality || '',
    state,
    stateShort,
    zipCode: addr.postcode || '',
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    formattedAddress: item.display_name || '',
  }
}

async function nominatimReverse(lat: number, lng: number): Promise<GeocodingResult | null> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', lat.toString())
  url.searchParams.set('lon', lng.toString())
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', 'pt-BR')

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'RicardoReisImoveis/1.0 (ricardoaugustoreis@gmail.com)',
    },
  })

  const data = await res.json()
  if (!data || data.error) return null

  const addr = data.address || {}

  const state = addr.state || ''
  const stateShort = extractBrazilianStateShort(state)

  return {
    address: [addr.road, addr.house_number].filter(Boolean).join(', '),
    neighborhood: addr.suburb || addr.neighbourhood || addr.city_district || '',
    city: addr.city || addr.town || addr.municipality || '',
    state,
    stateShort,
    zipCode: addr.postcode || '',
    lat,
    lng,
    formattedAddress: data.display_name || '',
  }
}

// ═══════════════════════════════════════════════════════════
// PROVIDER: GOOGLE MAPS — Precisa de API Key
// ═══════════════════════════════════════════════════════════

async function googleGeocode(query: string): Promise<GeocodingResult | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', query)
  url.searchParams.set('key', GOOGLE_API_KEY)
  url.searchParams.set('language', 'pt-BR')
  url.searchParams.set('region', 'br')

  const res = await fetch(url.toString())
  const data = await res.json()

  if (data.status !== 'OK' || !data.results?.[0]) return null

  return parseGoogleResult(data.results[0])
}

async function googleReverse(lat: number, lng: number): Promise<GeocodingResult | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('latlng', `${lat},${lng}`)
  url.searchParams.set('key', GOOGLE_API_KEY)
  url.searchParams.set('language', 'pt-BR')

  const res = await fetch(url.toString())
  const data = await res.json()

  if (data.status !== 'OK' || !data.results?.[0]) return null

  return parseGoogleResult(data.results[0], lat, lng)
}

function parseGoogleResult(
  result: any,
  fallbackLat?: number,
  fallbackLng?: number,
): GeocodingResult {
  const components = result.address_components || []

  const get = (type: string) =>
    components.find((c: any) => c.types.includes(type))?.long_name || ''
  const getShort = (type: string) =>
    components.find((c: any) => c.types.includes(type))?.short_name || ''

  const lat = result.geometry?.location?.lat ?? fallbackLat ?? 0
  const lng = result.geometry?.location?.lng ?? fallbackLng ?? 0

  return {
    address: [get('route'), get('street_number')].filter(Boolean).join(', '),
    neighborhood: get('sublocality_level_1') || get('sublocality') || '',
    city: get('administrative_area_level_2') || get('locality') || '',
    state: get('administrative_area_level_1') || '',
    stateShort: getShort('administrative_area_level_1') || '',
    zipCode: get('postal_code') || '',
    lat,
    lng,
    formattedAddress: result.formatted_address || '',
  }
}

// ═══════════════════════════════════════════════════════════
// INTERFACE PÚBLICA — use estas funções em todo o projeto
// ═══════════════════════════════════════════════════════════

/**
 * Busca coordenadas e dados de localização a partir de um endereço.
 */
export async function geocodeAddress(query: string): Promise<GeocodingResult | null> {
  try {
    if (ACTIVE_PROVIDER === 'google') {
      return await googleGeocode(query)
    }
    return await nominatimGeocode(query)
  } catch (error) {
    console.error(`[geocoding] Erro ao geocodificar "${query}":`, error)
    return null
  }
}

/**
 * Busca endereço e dados de localização a partir de coordenadas.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    if (ACTIVE_PROVIDER === 'google') {
      return await googleReverse(lat, lng)
    }
    return await nominatimReverse(lat, lng)
  } catch (error) {
    console.error(`[geocoding] Erro no reverse geocode (${lat}, ${lng}):`, error)
    return null
  }
}

/**
 * Busca endereço por CEP usando a ViaCEP (sempre gratuito, independente do provider).
 */
export async function geocodeByCep(cep: string): Promise<{
  address: string
  neighborhood: string
  city: string
  stateShort: string
} | null> {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    const data = await res.json()

    if (data.erro) return null

    return {
      address: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      stateShort: data.uf || '',
    }
  } catch (error) {
    console.error(`[geocoding] Erro ao buscar CEP "${cep}":`, error)
    return null
  }
}

/**
 * Retorna o provider atualmente ativo.
 */
export function getActiveProvider(): Provider {
  return ACTIVE_PROVIDER
}

// ═══════════════════════════════════════════════════════════
// UTILITÁRIO: Nome completo do estado → sigla (UF)
// ═══════════════════════════════════════════════════════════

const BRAZILIAN_STATES: Record<string, string> = {
  'acre': 'AC',
  'alagoas': 'AL',
  'amapá': 'AP',
  'amazonas': 'AM',
  'bahia': 'BA',
  'ceará': 'CE',
  'distrito federal': 'DF',
  'espírito santo': 'ES',
  'goiás': 'GO',
  'maranhão': 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  'pará': 'PA',
  'paraíba': 'PB',
  'paraná': 'PR',
  'pernambuco': 'PE',
  'piauí': 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  'rondônia': 'RO',
  'roraima': 'RR',
  'santa catarina': 'SC',
  'são paulo': 'SP',
  'sergipe': 'SE',
  'tocantins': 'TO',
}

function extractBrazilianStateShort(stateName: string): string {
  if (!stateName) return ''
  // Se já é sigla (2 letras maiúsculas)
  if (/^[A-Z]{2}$/.test(stateName)) return stateName
  const normalized = stateName.toLowerCase().trim()
  return BRAZILIAN_STATES[normalized] || stateName
}
