// components/CepLookup.tsx
import { useState, useCallback } from 'react'
import { set, type StringInputProps } from 'sanity'
import { Button, Card, Stack, Text, TextInput, Flex, useToast } from '@sanity/ui'
import { geocodeByCep } from '../lib/geocoding'

export function CepLookup(props: StringInputProps) {
  const { onChange, renderDefault } = props
  const [cepInput, setCepInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultInfo, setResultInfo] = useState<string | null>(null)
  const toast = useToast()

  const handleSearch = useCallback(async () => {
    const clean = cepInput.replace(/\D/g, '')
    if (clean.length !== 8) {
      setResultInfo('❌ CEP deve ter 8 dígitos.')
      return
    }

    setLoading(true)
    setResultInfo(null)

    try {
      const result = await geocodeByCep(clean)

      if (!result) {
        setResultInfo('❌ CEP não encontrado.')
        return
      }

      // Preenche o campo de CEP formatado
      const formatted = `${clean.slice(0, 5)}-${clean.slice(5)}`
      onChange(set(formatted))

      const parts = [
        result.address && `📍 ${result.address}`,
        result.neighborhood && `🏘 ${result.neighborhood}`,
        `🏙 ${result.city} - ${result.stateShort}`,
      ].filter(Boolean)

      setResultInfo(`✅ CEP encontrado!\n${parts.join('\n')}`)

      toast.push({
        status: 'success',
        title: 'CEP encontrado!',
        description: `${result.city} - ${result.stateShort}. Copie os dados para os outros campos.`,
      })
    } catch (err) {
      setResultInfo('❌ Erro ao buscar. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }, [cepInput, onChange, toast])

  return (
    <Stack space={3}>
      {renderDefault(props)}

      <Card padding={3} radius={2} shadow={1} tone="positive">
        <Stack space={3}>
          <Text size={1} weight="semibold">
            📮 Buscar por CEP (ViaCEP — gratuito)
          </Text>

          <Flex gap={2}>
            <div style={{ flex: 1 }}>
              <TextInput
                placeholder="38408-100"
                value={cepInput}
                onChange={(e) => setCepInput(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              text={loading ? '...' : 'Buscar'}
              tone="positive"
              onClick={handleSearch}
              disabled={loading || cepInput.replace(/\D/g, '').length < 8}
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
