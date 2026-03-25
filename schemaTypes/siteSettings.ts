// schemaTypes/siteSettings.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Configurações do Site',
  type: 'document',
  fields: [
    defineField({
      name: 'whatsappNumber',
      title: 'Número do WhatsApp',
      type: 'string',
      description: 'Com código do país, sem +. Ex: 5534999999999',
    }),
    defineField({
      name: 'defaultWhatsappMessage',
      title: 'Mensagem padrão do WhatsApp',
      type: 'text',
      description: 'Mensagem do botão "Ver Portfólio Completo"',
    }),
  ],
  // Impede criar mais de um documento desse tipo
//   __experimental_actions: ['update', 'publish'],
})