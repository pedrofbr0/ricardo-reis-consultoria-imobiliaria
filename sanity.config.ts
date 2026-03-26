import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import { ptBRLocale } from '@sanity/locale-pt-br'

export default defineConfig({
  name: 'default',
  title: 'Ricardo Reis Consultoria',

  projectId: 'bfw6ro7b',
  dataset: 'production',

  plugins: [
    ptBRLocale(),

    structureTool({
      structure: (S) =>
        S.list()
          .title('Painel')
          .items([
            // Imóveis — item principal
            S.listItem()
              .title('🏠 Imóveis')
              .child(
                S.list()
                  .title('Imóveis')
                  .items([
                    S.listItem()
                      .title('Todos os Imóveis')
                      .child(
                        S.documentTypeList('property')
                          .title('Todos os Imóveis')
                      ),
                    S.divider(),
                    S.listItem()
                      .title('🟢 Disponíveis')
                      .child(
                        S.documentList()
                          .title('Disponíveis')
                          .filter('_type == "property" && status == "available"')
                      ),
                    S.listItem()
                      .title('🟡 Reservados')
                      .child(
                        S.documentList()
                          .title('Reservados')
                          .filter('_type == "property" && status == "reserved"')
                      ),
                    S.listItem()
                      .title('🟠 Em Negociação')
                      .child(
                        S.documentList()
                          .title('Em Negociação')
                          .filter('_type == "property" && status == "negotiating"')
                      ),
                    S.listItem()
                      .title('🔴 Vendidos')
                      .child(
                        S.documentList()
                          .title('Vendidos')
                          .filter('_type == "property" && status == "sold"')
                      ),
                  ])
              ),

            S.divider(),

            // Taxonomias
            S.listItem()
              .title('📁 Categorias')
              .child(S.documentTypeList('propertyCategory').title('Categorias')),

            S.listItem()
              .title('🏷️ Tipos de Imóvel')
              .child(S.documentTypeList('propertyType').title('Tipos')),

            S.listItem()
              .title('✅ Características')
              .child(S.documentTypeList('characteristic').title('Características')),

            S.listItem()
              .title('📍 Bairros')
              .child(S.documentTypeList('neighborhood').title('Bairros')),

            S.divider(),

            // Configurações
            S.listItem()
              .title('⚙️ Configurações do Site')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})