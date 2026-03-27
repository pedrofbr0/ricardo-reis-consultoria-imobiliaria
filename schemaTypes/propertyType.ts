// schemaTypes/propertyType.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'propertyType',
  title: 'Tipo de Imóvel',
  type: 'document',
  icon: () => '🏷️',
  fields: [
    defineField({
      name: 'title',
      title: 'Nome do Tipo',
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
      name: 'category',
      title: 'Categoria (grupo pai)',
      type: 'reference',
      to: [{ type: 'propertyCategory' }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category.title',
    },
  },
})