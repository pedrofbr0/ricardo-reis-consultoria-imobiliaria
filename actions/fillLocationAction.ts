// actions/fillLocationAction.ts
import { useState } from 'react'
import { useDocumentOperation, type DocumentActionComponent } from 'sanity'
import { reverseGeocode } from '../lib/geocoding'

export const FillLocationAction: DocumentActionComponent = (props) => {
  const { id, type, draft, published } = props
  const { patch } = useDocumentOperation(id, type)
  const [isRunning, setIsRunning] = useState(false)

  // Só mostra a action para documentos do tipo 'property'
  if (type !== 'property') return null

  const doc = draft || published
  const geopoint = (doc as any)?.geopoint

  const hasCoordinates = geopoint?.lat && geopoint?.lng

  return {
    label: isRunning
      ? '⏳ Buscando endereço...'
      : '📍 Preencher localização pelas coordenadas',
    title: hasCoordinates
      ? `Buscar endereço para ${geopoint.lat.toFixed(4)}, ${geopoint.lng.toFixed(4)}`
      : 'Marque um ponto no mapa primeiro',
    tone: 'primary' as const,
    disabled: !hasCoordinates || isRunning,

    onHandle: async () => {
      if (!hasCoordinates) {
        props.onComplete()
        return
      }

      setIsRunning(true)

      try {
        const result = await reverseGeocode(geopoint.lat, geopoint.lng)

        if (result) {
          const patchData: Record<string, any> = {
            city: result.city,
            state: result.stateShort,
          }

          // Só preenche se tiver valor (não sobrescreve dados manuais com vazio)
          if (result.address) patchData.address = result.address
          if (result.neighborhood) patchData.neighborhood = result.neighborhood
          if (result.zipCode) patchData.zipCode = result.zipCode

          // Monta o locationLabel automaticamente
          if (result.neighborhood && result.city) {
            patchData.locationLabel = `${result.neighborhood}, ${result.city} - ${result.stateShort}`
          } else if (result.city) {
            patchData.locationLabel = `${result.city} - ${result.stateShort}`
          }

          patch.execute([{ set: patchData }])
        }
      } catch (err) {
        console.error('[FillLocationAction] Erro:', err)
      } finally {
        setIsRunning(false)
        props.onComplete()
      }
    },
  }
}
