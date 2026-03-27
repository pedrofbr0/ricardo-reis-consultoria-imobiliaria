// schemaTypes/propertyCategory.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'propertyCategory',
  title: 'Categoria de Imóvel',
  type: 'document',
  icon: () => '📁',
  fields: [
    defineField({
      name: 'title',
      title: 'Nome da Categoria',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Ordem de exibição',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'color',
      title: 'Cor da etiqueta no site',
      type: 'string',
      options: {
        list: [
          { title: 'Azul escuro (urbano)', value: '#162940' },
          { title: 'Verde (rural)', value: '#2d4a22' },
          { title: 'Dourado (premium)', value: '#B8935A' },
          { title: 'Cinza (comercial)', value: '#4A5568' },
        ],
      },
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
})