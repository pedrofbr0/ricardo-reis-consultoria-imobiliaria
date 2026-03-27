// components/MapInput.tsx
// ─────────────────────────────────────────────────────────
// Componente de mapa interativo para o campo geopoint.
// Usa Leaflet + OpenStreetMap — 100% gratuito, sem API key.
//
// Funcionalidades:
// - Clique no mapa para marcar localização
// - Busca por endereço (Nominatim)
// - Cola coordenadas (Google Earth/Maps)
// - Reverse geocoding (mostra endereço do ponto clicado)
// - Arrasta o marcador para reposicionar
// ─────────────────────────────────────────────────────────
import { useEffect, useRef, useState, useCallback } from 'react'
import { set, unset, type ObjectInputProps } from 'sanity'
import { Button, Card, Stack, Text, TextInput, Flex, useToast } from '@sanity/ui'
import { geocodeAddress, reverseGeocode } from '../lib/geocoding'

// Leaflet CSS + JS são carregados via CDN no useEffect
declare global {
  interface Window {
    L: any
  }
}

// ─── Carregar Leaflet via CDN ────────────────────────────
function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve()
      return
    }

    // CSS
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    css.crossOrigin = ''
    document.head.appendChild(css)

    // JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = ''
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Falha ao carregar Leaflet'))
    document.head.appendChild(script)
  })
}

export function MapInput(props: ObjectInputProps) {
  const { value, onChange, renderDefault } = props
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const toast = useToast()

  const [leafletReady, setLeafletReady] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [coordsInput, setCoordsInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [reverseResult, setReverseResult] = useState<string | null>(null)

  const currentLat = (value as any)?.lat
  const currentLng = (value as any)?.lng

  // ─── Atualizar valor no Sanity ──────────────────────
  const updateGeopoint = useCallback(
    (lat: number, lng: number) => {
      onChange(
        set({
          _type: 'geopoint',
          lat: Math.round(lat * 1000000) / 1000000,
          lng: Math.round(lng * 1000000) / 1000000,
        }),
      )
    },
    [onChange],
  )

  // ─── Carregar Leaflet ───────────────────────────────
  useEffect(() => {
    loadLeaflet()
      .then(() => setLeafletReady(true))
      .catch((err) => console.error(err))
  }, [])

  // ─── Inicializar mapa ──────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return

    const L = window.L

    const defaultLat = currentLat || -18.9186
    const defaultLng = currentLng || -48.2772
    const defaultZoom = currentLat ? 15 : 10

    const map = L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: defaultZoom,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Marcador inicial (se já tiver coordenadas)
    if (currentLat && currentLng) {
      const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        updateGeopoint(pos.lat, pos.lng)
      })

      markerRef.current = marker
    }

    // Clique no mapa para posicionar marcador
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          updateGeopoint(pos.lat, pos.lng)
        })
        markerRef.current = marker
      }

      updateGeopoint(lat, lng)
    })

    mapInstanceRef.current = map

    // Fix: Leaflet precisa de um resize após montar
    setTimeout(() => map.invalidateSize(), 200)

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [leafletReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Sincronizar marcador quando valor muda externamente ──
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLat || !currentLng) return

    const L = window.L

    if (markerRef.current) {
      markerRef.current.setLatLng([currentLat, currentLng])
    } else {
      const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(
        mapInstanceRef.current,
      )
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        updateGeopoint(pos.lat, pos.lng)
      })
      markerRef.current = marker
    }

    mapInstanceRef.current.setView([currentLat, currentLng], 15)
  }, [currentLat, currentLng, updateGeopoint])

  // ─── Buscar endereço ────────────────────────────────
  const handleAddressSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setReverseResult(null)

    try {
      const result = await geocodeAddress(searchQuery)
      if (!result) {
        toast.push({
          status: 'warning',
          title: 'Endereço não encontrado',
          description: 'Tente ser mais específico.',
        })
        return
      }

      updateGeopoint(result.lat, result.lng)

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([result.lat, result.lng], 16)
      }

      setReverseResult(
        `✅ ${result.address ? result.address + ', ' : ''}${result.neighborhood ? result.neighborhood + ', ' : ''}${result.city} - ${result.stateShort}`,
      )

      toast.push({
        status: 'success',
        title: 'Localização encontrada!',
        description: `${result.city} - ${result.stateShort}`,
      })
    } catch {
      toast.push({
        status: 'error',
        title: 'Erro na busca',
      })
    } finally {
      setSearching(false)
    }
  }, [searchQuery, updateGeopoint, toast])

  // ─── Colar coordenadas ─────────────────────────────
  const handleCoordsInput = useCallback(async () => {
    const input = coordsInput.trim()
    if (!input) return

    const parts = input
      .replace(/[°'"NSEW]/gi, ' ')
      .split(/[,\s]+/)
      .filter(Boolean)

    if (parts.length < 2) {
      toast.push({ status: 'warning', title: 'Formato inválido', description: 'Use: -18.9186, -48.2772' })
      return
    }

    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.push({ status: 'warning', title: 'Coordenadas inválidas' })
      return
    }

    updateGeopoint(lat, lng)

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15)
    }

    // Reverse geocode para mostrar o endereço
    setSearching(true)
    try {
      const result = await reverseGeocode(lat, lng)
      if (result) {
        setReverseResult(
          `✅ ${result.address ? result.address + ', ' : ''}${result.neighborhood ? result.neighborhood + ', ' : ''}${result.city} - ${result.stateShort}`,
        )
      }
    } catch {
      // silencioso
    } finally {
      setSearching(false)
    }

    toast.push({ status: 'success', title: 'Coordenadas aplicadas!' })
  }, [coordsInput, updateGeopoint, toast])

  // ─── Limpar localização ─────────────────────────────
  const handleClear = useCallback(() => {
    onChange(unset())
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
      markerRef.current = null
    }
    setReverseResult(null)
  }, [onChange])

  return (
    <Stack space={4}>
      {/* Mapa */}
      <Card radius={2} shadow={1} overflow="hidden">
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: 360,
            background: '#e5e3df',
            cursor: 'crosshair',
          }}
        >
          {!leafletReady && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#666',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
              }}
            >
              Carregando mapa...
            </div>
          )}
        </div>
      </Card>

      {/* Coordenadas atuais */}
      {currentLat && currentLng && (
        <Card padding={3} radius={2} tone="positive">
          <Flex align="center" justify="space-between">
            <Text size={1}>
              📍 <strong>{currentLat.toFixed(6)}</strong>, <strong>{currentLng.toFixed(6)}</strong>
            </Text>
            <Button text="Limpar" tone="critical" mode="ghost" fontSize={1} onClick={handleClear} />
          </Flex>
          {reverseResult && (
            <Text size={1} muted style={{ marginTop: 8 }}>
              {reverseResult}
            </Text>
          )}
        </Card>
      )}

      {/* Busca por endereço */}
      <Card padding={3} radius={2} shadow={1} tone="primary">
        <Stack space={3}>
          <Text size={1} weight="semibold">
            🔍 Buscar por endereço
          </Text>
          <Flex gap={2}>
            <div style={{ flex: 1 }}>
              <TextInput
                placeholder="Ex: Rua dos Pereiras 836, Uberlândia MG"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
              />
            </div>
            <Button
              text={searching ? '...' : 'Buscar'}
              tone="primary"
              onClick={handleAddressSearch}
              disabled={searching || !searchQuery.trim()}
            />
          </Flex>
        </Stack>
      </Card>

      {/* Colar coordenadas */}
      <Card padding={3} radius={2} shadow={1} tone="caution">
        <Stack space={3}>
          <Text size={1} weight="semibold">
            📌 Colar coordenadas (Google Earth / Maps)
          </Text>
          <Flex gap={2}>
            <div style={{ flex: 1 }}>
              <TextInput
                placeholder="-18.9186, -48.2772"
                value={coordsInput}
                onChange={(e) => setCoordsInput(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCoordsInput()}
              />
            </div>
            <Button
              text={searching ? '...' : 'Aplicar'}
              tone="caution"
              onClick={handleCoordsInput}
              disabled={searching || !coordsInput.trim()}
            />
          </Flex>
        </Stack>
      </Card>
    </Stack>
  )
}