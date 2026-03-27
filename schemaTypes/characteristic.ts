// schemaTypes/characteristic.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'characteristic',
  title: 'Característica',
  type: 'document',
  icon: () => '✅',
  fields: [
    defineField({
      name: 'title',
      title: 'Nome',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'group',
      title: 'Grupo da Característica',
      type: 'string',
      options: {
        list: [
          { title: 'Cozinha', value: 'kitchen' },
          { title: 'Banheiro', value: 'bathroom' },
          { title: 'Área Externa', value: 'outdoor' },
          { title: 'Lazer', value: 'leisure' },
          { title: 'Segurança', value: 'security' },
          { title: 'Infraestrutura', value: 'infrastructure' },
          { title: 'Outro', value: 'other' },
        ],
      },
    }),
  ],
  orderings: [
    { title: 'Alfabético', name: 'alpha', by: [{ field: 'title', direction: 'asc' }] },
    { title: 'Por grupo', name: 'byGroup', by: [{ field: 'group', direction: 'asc' }] },
  ],
})