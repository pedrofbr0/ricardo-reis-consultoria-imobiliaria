import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'property',
  title: 'Imóvel',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required().error('O título é obrigatório'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Foto Principal',
      type: 'image',
      options: { hotspot: true }, // permite crop inteligente
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tag',
      title: 'Etiqueta',
      type: 'string',
      description: 'Ex: "Alto Padrão · Uberlândia" ou "Fazenda Produtiva"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagType',
      title: 'Tipo da Etiqueta',
      type: 'string',
      options: {
        list: [
          { title: 'Urbano (azul escuro)', value: 'urban' },
          { title: 'Rural (verde)', value: 'farm' },
        ],
        layout: 'radio',
      },
      initialValue: 'urban',
    }),
    defineField({
      name: 'price',
      title: 'Preço',
      type: 'string',
      description: 'Ex: "R$ 2.800.000" ou "Valor sob consulta"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Localização',
      type: 'string',
      description: 'Ex: "Uberlândia, MG"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'attributes',
      title: 'Atributos',
      type: 'array',
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
                  { title: '🚪 Banheiros', value: 'bath' },
                  { title: '🌋 Piscina', value: 'pool' },

                  { title: '🚗 Vagas', value: 'car' },
                  { title: '🌳 Hectares/Área verde', value: 'trees' },
                  { title: '📐 Área/Metragem', value: 'area' },
                  
                ],
              },
            }),
            defineField({
              name: 'label',
              title: 'Descrição',
              type: 'string',
              description: 'Ex: "5 Suítes", "480 m²"',
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'icon' },
          },
        },
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'whatsappMessage',
      title: 'Mensagem do WhatsApp',
      type: 'text',
      rows: 3,
      description: 'Mensagem que será enviada quando clicarem no botão. Não precisa codificar URL, faremos isso automaticamente.',
    }),
    defineField({
      name: 'order',
      title: 'Ordem de Exibição',
      type: 'number',
      initialValue: 0,
      description: 'Menor número aparece primeiro',
    }),
    defineField({
      name: 'active',
      title: 'Ativo no site?',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  // Preview no painel do Sanity
  preview: {
    select: {
      title: 'title',
      subtitle: 'location',
      media: 'image',
    },
  },

  // Ordenação padrão no Studio
  orderings: [
    {
      title: 'Ordem de exibição',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})