// sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import { ptBRLocale } from '@sanity/locale-pt-br'
import { FillLocationAction } from './actions/fillLocationAction'

// ─── IMPORTANTE ──────────────────────────────────────────
// Descomente a linha abaixo se decidir usar Google Maps.
// Antes disso, o campo geopoint usa o input padrão do Sanity
// (que já funciona com busca e clique no mapa).
//
// import { googleMapsInput } from '@sanity/google-maps-input'
// ──────────────────────────────────────────────────────────

export default defineConfig({
  name: 'default',
  title: 'Ricardo Reis Imóveis',

  projectId: 'bfw6ro7b',
  dataset: 'production',

  plugins: [
    ptBRLocale(),

    structureTool({
      structure: (S) =>
        S.list()
          .title('Painel')
          .items([
            // ─── Imóveis ───────────────────────────────
            S.listItem()
              .title('🏠 Imóveis')
              .child(
                S.list()
                  .title('Imóveis')
                  .items([
                    S.listItem()
                      .title('Todos os Imóveis')
                      .child(S.documentTypeList('property').title('Todos os Imóveis')),

                    S.divider(),

                    S.listItem()
                      .title('🟢 Disponíveis')
                      .child(
                        S.documentList()
                          .title('Disponíveis')
                          .filter('_type == "property" && status == "available"'),
                      ),
                    S.listItem()
                      .title('🟡 Reservados')
                      .child(
                        S.documentList()
                          .title('Reservados')
                          .filter('_type == "property" && status == "reserved"'),
                      ),
                    S.listItem()
                      .title('🟠 Em Negociação')
                      .child(
                        S.documentList()
                          .title('Em Negociação')
                          .filter('_type == "property" && status == "negotiating"'),
                      ),
                    S.listItem()
                      .title('🔴 Vendidos')
                      .child(
                        S.documentList()
                          .title('Vendidos')
                          .filter('_type == "property" && status == "sold"'),
                      ),

                    S.divider(),

                    S.listItem()
                      .title('⭐ Destaques (home)')
                      .child(
                        S.documentList()
                          .title('Destaques')
                          .filter('_type == "property" && featured == true'),
                      ),
                    S.listItem()
                      .title('🚫 Não publicados')
                      .child(
                        S.documentList()
                          .title('Não publicados')
                          .filter('_type == "property" && active == false'),
                      ),
                  ]),
              ),

            S.divider(),

            // ─── Taxonomias ────────────────────────────
            S.listItem()
              .title('📁 Categorias')
              .child(S.documentTypeList('propertyCategory').title('Categorias')),

            S.listItem()
              .title('🏷️ Tipos de Imóvel')
              .child(S.documentTypeList('propertyType').title('Tipos')),

            S.listItem()
              .title('✅ Características')
              .child(S.documentTypeList('characteristic').title('Características')),

            S.divider(),

            // ─── Configurações ─────────────────────────
            S.listItem()
              .title('⚙️ Configurações do Site')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
          ]),
    }),

    // GROQ playground — útil para testar queries
    visionTool(),

    // ─── Descomente se usar Google Maps ────────────────
    // googleMapsInput({
    //   apiKey: 'SUA_GOOGLE_MAPS_API_KEY',
    //   defaultZoom: 12,
    //   defaultLocation: {
    //     lat: -18.9186,
    //     lng: -48.2772,
    //   },
    // }),
  ],

  schema: {
    types: schemaTypes,
  },

  // ─── Document Actions (botão de auto-preencher localização) ──
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'property') {
        return [...prev, FillLocationAction]
      }
      return prev
    },
  },
})