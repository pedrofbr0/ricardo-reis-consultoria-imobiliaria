// schemaTypes/neighborhood.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'neighborhood',
  title: 'Bairro / Região',
  type: 'document',
  icon: () => '📍',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome do Bairro',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'Cidade',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'state',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Minas Gerais', value: 'MG' },
          { title: 'Goiás', value: 'GO' },
          { title: 'São Paulo', value: 'SP' },
          // adicione outros conforme necessário
        ],
      },
      initialValue: 'MG',
    }),
    defineField({
      name: 'region',
      title: 'Região / Zona',
      type: 'string',
      description: 'Ex: "Zona Sul", "Triângulo Mineiro", "Setor Marista"',
    }),
  ],
  preview: {
    select: { title: 'name', s1: 'city', s2: 'state' },
    prepare({ title, s1, s2 }) {
      return { title, subtitle: `${s1} - ${s2}` }
    },
  },
})