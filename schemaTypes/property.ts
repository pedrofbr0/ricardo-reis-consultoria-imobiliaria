// schemaTypes/property.ts
import { defineType, defineField } from 'sanity'
import { AddressLookup } from '../components/AddressLookup'
import { CepLookup } from '../components/CepLookup'
import { MapInput } from '../components/MapInput'

export default defineType({
  name: 'property',
  title: 'Imóvel',
  type: 'document',
  icon: () => '🏠',

  fieldsets: [
    { name: 'basic', title: '📋 Informações básicas', options: { collapsible: true } },
    { name: 'media', title: '📸 Fotos e vídeos', options: { collapsible: true } },
    { name: 'specs', title: '📐 Especificações', options: { collapsible: true } },
    { name: 'financial', title: '💰 Valores', options: { collapsible: true } },
    { name: 'location', title: '📍 Localização', options: { collapsible: true } },
    { name: 'features', title: '✅ Características', options: { collapsible: true } },
    { name: 'description', title: '📝 Descrição', options: { collapsible: true } },
    { name: 'display', title: '🌐 Exibição no site', options: { collapsible: true } },
    {
      name: 'internal',
      title: '🔒 Dados internos (não aparece no site)',
      options: { collapsible: true, collapsed: true },
    },
  ],

  fields: [
    // ═══════════════════════════════════════════════════════
    // INFORMAÇÕES BÁSICAS
    // ═══════════════════════════════════════════════════════
    defineField({
      name: 'title',
      title: 'Título do Anúncio',
      type: 'string',
      fieldset: 'basic',
      description: 'Ex: "Apartamento no Santa Mônica" ou "Fazenda de Engorda · Triângulo Mineiro"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      fieldset: 'basic',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'Código do Imóvel',
      type: 'string',
      fieldset: 'basic',
      description: 'Código interno. Ex: "1675"',
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'reference',
      to: [{ type: 'propertyCategory' }],
      fieldset: 'basic',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'propertyType',
      title: 'Tipo do Imóvel',
      type: 'reference',
      to: [{ type: 'propertyType' }],
      fieldset: 'basic',
      validation: (rule) => rule.required(),
      options: {
        filter: ({ document }: any) => {
          if (!document?.category?._ref) return {}
          return {
            filter: 'category._ref == $categoryId',
            params: { categoryId: document.category._ref },
          }
        },
      },
    }),
    defineField({
      name: 'transactionType',
      title: 'Tipo de Negócio',
      type: 'string',
      fieldset: 'basic',
      options: {
        list: [
          { title: 'Venda', value: 'sale' },
          { title: 'Aluguel', value: 'rent' },
          { title: 'Venda e Aluguel', value: 'both' },
        ],
        layout: 'radio',
      },
      initialValue: 'sale',
    }),

    // ═══════════════════════════════════════════════════════
    // MÍDIA
    // ═══════════════════════════════════════════════════════
    defineField({
      name: 'mainImage',
      title: 'Foto de Capa',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      description: 'Imagem principal que aparece no card do portfólio.',
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Galeria de Fotos',
      type: 'array',
      fieldset: 'media',
      description: 'Adicione todas as fotos do imóvel. Arraste para reordenar.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Descrição da foto',
              type: 'string',
            }),
            defineField({
              name: 'room',
              title: 'Cômodo',
              type: 'string',
              options: {
                list: [
                  'Fachada',
                  'Sala',
                  'Quarto',
                  'Suíte',
                  'Cozinha',
                  'Banheiro',
                  'Varanda',
                  'Garagem',
                  'Área Externa',
                  'Piscina',
                  'Jardim',
                  'Vista Aérea',
                  'Outro',
                ],
              },
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'videos',
      title: 'Vídeos',
      type: 'array',
      fieldset: 'media',
      description: 'Links do YouTube ou upload direto de vídeos e GIFs.',
      of: [
        {
          type: 'object',
          name: 'video',
          title: 'Vídeo',
          fields: [
            defineField({
              name: 'type',
              title: 'Tipo',
              type: 'string',
              options: {
                list: [
                  { title: 'YouTube / Vimeo (link)', value: 'url' },
                  { title: 'Upload direto', value: 'file' },
                ],
                layout: 'radio',
              },
              initialValue: 'url',
            }),
            defineField({
              name: 'url',
              title: 'URL do Vídeo',
              type: 'url',
              hidden: ({ parent }: any) => parent?.type !== 'url',
            }),
            defineField({
              name: 'file',
              title: 'Arquivo de Vídeo',
              type: 'file',
              options: { accept: 'video/*,.gif' },
              hidden: ({ parent }: any) => parent?.type !== 'file',
            }),
            defineField({
              name: 'caption',
              title: 'Legenda',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'caption', subtitle: 'type' },
            prepare({ title, subtitle }) {
              return {
                title: title || 'Vídeo sem legenda',
                subtitle: subtitle === 'url' ? '🔗 Link' : '📁 Upload',
              }
            },
          },
        },
      ],
    }),

    // ═══════════════════════════════════════════════════════
    // ESPECIFICAÇÕES TÉCNICAS
    // ═══════════════════════════════════════════════════════
    defineField({
      name: 'totalArea',
      title: 'Área Total (m²)',
      type: 'number',
      fieldset: 'specs',
    }),
    defineField({
      name: 'privateArea',
      title: 'Área Privativa (m²)',
      type: 'number',
      fieldset: 'specs',
    }),
    defineField({
      name: 'landArea',
      title: 'Área do Terreno',
      type: 'number',
      fieldset: 'specs',
      description: 'Para terrenos, sítios e fazendas.',
    }),
    defineField({
      name: 'landAreaUnit',
      title: 'Unidade da área do terreno',
      type: 'string',
      fieldset: 'specs',
      options: {
        list: [
          { title: 'm²', value: 'sqm' },
          { title: 'Hectares (ha)', value: 'ha' },
          { title: 'Alqueires', value: 'alq' },
        ],
      },
      initialValue: 'sqm',
      hidden: ({ document }: any) => !document?.landArea,
    }),
    defineField({
      name: 'bedrooms',
      title: 'Dormitórios',
      type: 'number',
      fieldset: 'specs',
    }),
    defineField({
      name: 'suites',
      title: 'Suítes',
      type: 'number',
      fieldset: 'specs',
    }),
    defineField({
      name: 'bathrooms',
      title: 'Banheiros',
      type: 'number',
      fieldset: 'specs',
    }),
    defineField({
      name: 'parkingSpots',
      title: 'Vagas de Garagem',
      type: 'number',
      fieldset: 'specs',
    }),
    defineField({
      name: 'floors',
      title: 'Andares / Pavimentos',
      type: 'number',
      fieldset: 'specs',
    }),
    defineField({
      name: 'yearBuilt',
      title: 'Ano de Construção',
      type: 'number',
      fieldset: 'specs',
    }),

    // ═══════════════════════════════════════════════════════
    // VALORES FINANCEIROS
    // ═══════════════════════════════════════════════════════
    defineField({
      name: 'salePrice',
      title: 'Preço de Venda (R$)',
      type: 'number',
      fieldset: 'financial',
      description: 'Deixe vazio se "valor sob consulta".',
    }),
    defineField({
      name: 'rentPrice',
      title: 'Valor do Aluguel (R$)',
      type: 'number',
      fieldset: 'financial',
    }),
    defineField({
      name: 'condoFee',
      title: 'Condomínio (R$)',
      type: 'number',
      fieldset: 'financial',
    }),
    defineField({
      name: 'iptu',
      title: 'IPTU (R$)',
      type: 'number',
      fieldset: 'financial',
    }),
    defineField({
      name: 'iptuPeriod',
      title: 'Período do IPTU',
      type: 'string',
      fieldset: 'financial',
      options: {
        list: [
          { title: 'Mensal', value: 'monthly' },
          { title: 'Anual', value: 'yearly' },
        ],
        layout: 'radio',
      },
      initialValue: 'monthly',
      hidden: ({ document }: any) => !document?.iptu,
    }),
    defineField({
      name: 'priceOnRequest',
      title: 'Valor sob consulta?',
      type: 'boolean',
      fieldset: 'financial',
      initialValue: false,
    }),

    // ═══════════════════════════════════════════════════════
    // LOCALIZAÇÃO
    // ═══════════════════════════════════════════════════════
    defineField({
      name: 'geopoint',
      title: 'Localização no Mapa',
      type: 'geopoint',
      fieldset: 'location',
      description: 'Busque o endereço ou clique no mapa para marcar.',
      components: {
        input: MapInput,
      },
    }),
    defineField({
      name: 'address',
      title: 'Endereço',
      type: 'string',
      fieldset: 'location',
      description: 'Rua e número. Busque pelo endereço ou preencha manualmente.',
      components: {
        input: AddressLookup,
      },
    }),
    defineField({
      name: 'zipCode',
      title: 'CEP',
      type: 'string',
      fieldset: 'location',
      components: {
        input: CepLookup,
      },
    }),
    defineField({
      name: 'neighborhood',
      title: 'Bairro',
      type: 'string',
      fieldset: 'location',
      description: 'Deixe vazio se não se aplica (fazendas, terrenos rurais).',
    }),
    defineField({
      name: 'city',
      title: 'Cidade',
      type: 'string',
      fieldset: 'location',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'state',
      title: 'Estado',
      type: 'string',
      fieldset: 'location',
      options: {
        list: [
          { title: 'Minas Gerais', value: 'MG' },
          { title: 'Goiás', value: 'GO' },
          { title: 'São Paulo', value: 'SP' },
          { title: 'Mato Grosso do Sul', value: 'MS' },
          { title: 'Mato Grosso', value: 'MT' },
          { title: 'Bahia', value: 'BA' },
          { title: 'Distrito Federal', value: 'DF' },
          { title: 'Rio de Janeiro', value: 'RJ' },
          { title: 'Paraná', value: 'PR' },
          { title: 'Santa Catarina', value: 'SC' },
          { title: 'Rio Grande do Sul', value: 'RS' },
          { title: 'Pernambuco', value: 'PE' },
          { title: 'Ceará', value: 'CE' },
        ],
      },
      initialValue: 'MG',
    }),
    defineField({
      name: 'region',
      title: 'Região',
      type: 'string',
      fieldset: 'location',
      description: 'Ex: "Triângulo Mineiro", "Setor Marista".',
    }),
    defineField({
      name: 'showExactAddress',
      title: 'Mostrar endereço exato no site?',
      type: 'boolean',
      fieldset: 'location',
      initialValue: false,
      description: 'Se desativado, mostra apenas bairro/cidade.',
    }),
    defineField({
      name: 'locationLabel',
      title: 'Rótulo de localização no card',
      type: 'string',
      fieldset: 'location',
      description: 'Texto que aparece no card. Ex: "Uberlândia, MG" ou "Triângulo Mineiro".',
    }),

    // ═══════════════════════════════════════════════════════
    // CARACTERÍSTICAS
    // ═══════════════════════════════════════════════════════
    defineField({
      name: 'characteristics',
      title: 'Características do Imóvel',
      type: 'array',
      fieldset: 'features',
      of: [{ type: 'reference', to: [{ type: 'characteristic' }] }],
      description: 'Selecione da lista: Cozinha Planejada, Piscina, Churrasqueira...',
    }),

    // ═══════════════════════════════════════════════════════
    // DESCRIÇÃO
    // ═══════════════════════════════════════════════════════
    defineField({
      name: 'shortDescription',
      title: 'Descrição Curta',
      type: 'text',
      fieldset: 'description',
      rows: 3,
      description: 'Aparece no card do portfólio. Máximo 200 caracteres.',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'fullDescription',
      title: 'Descrição Completa',
      type: 'array',
      fieldset: 'description',
      of: [{ type: 'block' }],
      description: 'Descrição detalhada com formatação (negrito, listas, etc.).',
    }),

    // ═══════════════════════════════════════════════════════
    // EXIBIÇÃO NO SITE
    // ═══════════════════════════════════════════════════════
    defineField({
      name: 'tag',
      title: 'Etiqueta do Card',
      type: 'string',
      fieldset: 'display',
      description: 'Ex: "Alto Padrão · Uberlândia", "Fazenda Produtiva".',
    }),
    defineField({
      name: 'displayAttributes',
      title: 'Atributos do Card (máx. 4)',
      type: 'array',
      fieldset: 'display',
      description: 'Ícones e textos que aparecem no card.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'icon',
              title: 'Ícone',
              type: 'string',
              options: {
                list: [
                  { title: '🛏 Quartos/Suítes', value: 'bed' },
                  { title: '🚗 Vagas', value: 'car' },
                  { title: '🌳 Hectares/Área', value: 'trees' },
                  { title: '📐 Metragem', value: 'area' },
                  { title: '🚿 Banheiros', value: 'bath' },
                ],
              },
            }),
            defineField({
              name: 'label',
              title: 'Texto',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'label' },
          },
        },
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'whatsappMessage',
      title: 'Mensagem do WhatsApp',
      type: 'text',
      fieldset: 'display',
      rows: 2,
      description: 'Mensagem pré-preenchida. O sistema codifica automaticamente.',
    }),
    defineField({
      name: 'featured',
      title: 'Destaque na home?',
      type: 'boolean',
      fieldset: 'display',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Ordem de exibição',
      type: 'number',
      fieldset: 'display',
      initialValue: 0,
    }),
    defineField({
      name: 'active',
      title: 'Publicado no site?',
      type: 'boolean',
      fieldset: 'display',
      initialValue: true,
    }),

    // ═══════════════════════════════════════════════════════
    // DADOS INTERNOS
    // ═══════════════════════════════════════════════════════
    defineField({
      name: 'status',
      title: 'Status Interno',
      type: 'string',
      fieldset: 'internal',
      options: {
        list: [
          { title: '🟢 Disponível', value: 'available' },
          { title: '🟡 Reservado', value: 'reserved' },
          { title: '🔴 Vendido', value: 'sold' },
          { title: '🟠 Em negociação', value: 'negotiating' },
          { title: '⚪ Suspenso', value: 'suspended' },
        ],
        layout: 'radio',
      },
      initialValue: 'available',
    }),
    defineField({
      name: 'ownerName',
      title: 'Nome do Proprietário',
      type: 'string',
      fieldset: 'internal',
    }),
    defineField({
      name: 'ownerPhone',
      title: 'Telefone do Proprietário',
      type: 'string',
      fieldset: 'internal',
    }),
    defineField({
      name: 'ownerEmail',
      title: 'E-mail do Proprietário',
      type: 'string',
      fieldset: 'internal',
    }),
    defineField({
      name: 'commission',
      title: 'Comissão (%)',
      type: 'number',
      fieldset: 'internal',
    }),
    defineField({
      name: 'exclusivity',
      title: 'Exclusividade?',
      type: 'boolean',
      fieldset: 'internal',
      initialValue: false,
    }),
    defineField({
      name: 'exclusivityExpiration',
      title: 'Validade da Exclusividade',
      type: 'date',
      fieldset: 'internal',
      hidden: ({ document }: any) => !document?.exclusivity,
    }),
    defineField({
      name: 'internalNotes',
      title: 'Anotações Internas',
      type: 'text',
      fieldset: 'internal',
      rows: 5,
      description: 'Notas visíveis apenas no painel. Nunca aparece no site.',
    }),
    defineField({
      name: 'keyLocation',
      title: 'Onde está a chave?',
      type: 'string',
      fieldset: 'internal',
    }),
    defineField({
      name: 'capturedAt',
      title: 'Data de Captação',
      type: 'date',
      fieldset: 'internal',
    }),
    defineField({
      name: 'source',
      title: 'Origem do Imóvel',
      type: 'string',
      fieldset: 'internal',
      options: {
        list: [
          'Captação própria',
          'Indicação',
          'Parceria com corretor',
          'Imobiliária parceira',
          'Proprietário direto',
          'Outro',
        ],
      },
    }),
  ],

  // ─── Preview no painel ─────────────────────────────────
  preview: {
    select: {
      title: 'title',
      code: 'code',
      neighborhood: 'neighborhood',
      city: 'city',
      status: 'status',
      media: 'mainImage',
    },
    prepare({ title, code, neighborhood, city, status, media }) {
      const statusEmoji: Record<string, string> = {
        available: '🟢',
        reserved: '🟡',
        sold: '🔴',
        negotiating: '🟠',
        suspended: '⚪',
      }
      const emoji = statusEmoji[status || ''] || ''
      const sub = [code && `Cod: ${code}`, neighborhood, city].filter(Boolean).join(' · ')
      return {
        title: `${emoji} ${title || 'Sem título'}`,
        subtitle: sub,
        media,
      }
    },
  },

  orderings: [
    { title: 'Ordem de exibição', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    {
      title: 'Mais recentes',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
    { title: 'Código', name: 'codeAsc', by: [{ field: 'code', direction: 'asc' }] },
    { title: 'Status', name: 'statusAsc', by: [{ field: 'status', direction: 'asc' }] },
  ],
})