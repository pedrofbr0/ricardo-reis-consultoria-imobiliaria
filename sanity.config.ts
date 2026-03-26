import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import { ptBRLocale } from '@sanity/locale-pt-br'

export default defineConfig({
  name: 'default',
  title: 'ricardo-reis-consultoria-imobiliaria',

  projectId: 'bfw6ro7b',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), ptBRLocale()],

  schema: {
    types: schemaTypes,
  },
})
