// components/AddressLookup.tsx
import { useState, useCallback } from 'react'
import { set, type StringInputProps } from 'sanity'
import { Button, Card, Stack, Text, TextInput, Flex, useToast } from '@sanity/ui'
import { geocodeAddress, getActiveProvider } from '../lib/geocoding'

export function AddressLookup(props: StringInputProps) {
  const { onChange, renderDefault } = props
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultInfo, setResultInfo] = useState<string | null>(null)
  const toast = useToast()

  const providerName = getActiveProvider() === 'google' ? 'Google Maps' : 'OpenStreetMap'

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim()
    if (!query) return

    setLoading(true)
    setResultInfo(null)

    try {
      const result = await geocodeAddress(query)

      if (!result) {
        setResultInfo('❌ Endereço não encontrado. Tente ser mais específico.')
        return
      }

      // Preenche o campo de endereço
      onChange(set(result.address || query))

      const parts = [
        result.address && `📍 ${result.address}`,
        result.neighborhood && `🏘 ${result.neighborhood}`,
        `🏙 ${result.city} - ${result.stateShort}`,
        result.zipCode && `📮 ${result.zipCode}`,
        `🗺 ${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}`,
      ].filter(Boolean)

      setResultInfo(`✅ Encontrado!\n${parts.join('\n')}`)

      toast.push({
        status: 'success',
        title: 'Endereço encontrado!',
        description: `${result.city} - ${result.stateShort}. Copie os dados abaixo para os outros campos.`,
      })
    } catch (err) {
      setResultInfo('❌ Erro ao buscar. Verifique sua conexão.')
      toast.push({
        status: 'error',
        title: 'Erro na busca',
        description: 'Não foi possível conectar ao serviço de geocoding.',
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, onChange, toast])

  return (
    <Stack space={3}>
      {renderDefault(props)}

      <Card padding={3} radius={2} shadow={1} tone="primary">
        <Stack space={3}>
          <Text size={1} weight="semibold">
            🔍 Buscar endereço ({providerName})
          </Text>
          <Text size={1} muted>
            Digite o endereço completo e clique em Buscar. Os dados encontrados
            aparecerão abaixo — copie para os campos de Bairro, Cidade, etc.
          </Text>

          <Flex gap={2}>
            <div style={{ flex: 1 }}>
              <TextInput
                placeholder="Ex: Rua dos Pereiras 836, Uberlândia MG"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              text={loading ? 'Buscando...' : 'Buscar'}
              tone="primary"
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
            />
          </Flex>

          {resultInfo && (
            <Card
              padding={3}
              radius={2}
              tone={resultInfo.startsWith('✅') ? 'positive' : 'critical'}
            >
              <pre
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                }}
              >
                {resultInfo}
              </pre>
            </Card>
          )}
        </Stack>
      </Card>
    </Stack>
  )
}
