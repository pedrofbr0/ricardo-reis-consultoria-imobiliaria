// schemaTypes/siteSettings.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Configurações do Site',
  type: 'document',
  icon: () => '⚙️',
  fields: [
    defineField({
      name: 'brokerName',
      title: 'Nome do Corretor',
      type: 'string',
      initialValue: 'Ricardo',
    }),
    defineField({
      name: 'creci',
      title: 'CRECI',
      type: 'string',
      initialValue: 'MG24283',
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'Número do WhatsApp',
      type: 'string',
      description: 'Com código do país, sem +. Ex: 5534996731968',
    }),
    defineField({
      name: 'email',
      title: 'E-mail de contato',
      type: 'string',
    }),
    defineField({
      name: 'defaultWhatsappMessage',
      title: 'Mensagem padrão do WhatsApp',
      type: 'text',
      rows: 2,
      description: 'Mensagem do botão "Ver Portfólio Completo".',
    }),
    defineField({
      name: 'brokerPhoto',
      title: 'Foto do Corretor',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'companyName',
      title: 'Nome da Imobiliária',
      type: 'string',
    }),
    defineField({
      name: 'companyAddress',
      title: 'Endereço da Imobiliária',
      type: 'text',
      rows: 2,
    }),
  ],
})