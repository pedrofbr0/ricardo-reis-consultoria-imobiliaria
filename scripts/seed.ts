// scripts/seed.ts
// ─────────────────────────────────────────────────────────
// Script para popular os dados iniciais (categorias, tipos, características).
//
// COMO USAR:
//   npx sanity exec scripts/seed.ts --with-user-token
//
// Ele vai criar automaticamente as categorias, tipos e características
// baseados na estrutura do Loft CRM. Rode apenas uma vez.
// ─────────────────────────────────────────────────────────

import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-01-01' })

// Gera um slug a partir de um texto
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ═══════════════════════════════════════════════════════════
// CATEGORIAS
// ═══════════════════════════════════════════════════════════

const categories = [
  { title: 'Imóveis Residenciais', color: '#162940', order: 1 },
  { title: 'Comerciais e Industriais', color: '#4A5568', order: 2 },
  { title: 'Terrenos', color: '#B8935A', order: 3 },
  { title: 'Empreendimento', color: '#162940', order: 4 },
  { title: 'Rural', color: '#2d4a22', order: 5 },
]

// ═══════════════════════════════════════════════════════════
// TIPOS (vinculados às categorias)
// ═══════════════════════════════════════════════════════════

const typesByCategory: Record<string, string[]> = {
  'Imóveis Residenciais': [
    'Apartamento',
    'Casa',
    'Casa em Condomínio',
    'Chácara',
    'Cobertura',
    'Kitnet',
    'Loft',
    'Sobrado',
    'Sítio',
  ],
  'Comerciais e Industriais': [
    'Box',
    'Built to Suit',
    'Casa Comercial',
    'Condomínio Industrial',
    'Coworking',
    'Depósito',
    'Galpão',
    'Galpão Industrial',
    'Loja',
    'Pavilhão',
    'Ponto Comercial',
    'Prédio Comercial',
    'Sala Comercial',
  ],
  Terrenos: ['Terreno', 'Terreno Comercial', 'Terreno Industrial', 'Área'],
  Empreendimento: ['Empreendimento'],
  Rural: ['Fazenda', 'Sítio de Lazer', 'Haras', 'Chácara Rural'],
}

// ═══════════════════════════════════════════════════════════
// CARACTERÍSTICAS
// ═══════════════════════════════════════════════════════════

const characteristics = [
  // Cozinha
  { title: 'Cozinha', group: 'kitchen' },
  { title: 'Cozinha Americana', group: 'kitchen' },
  { title: 'Cozinha Planejada', group: 'kitchen' },
  { title: 'Despensa', group: 'kitchen' },

  // Banheiro
  { title: 'Banheiro Social', group: 'bathroom' },
  { title: 'Banheiro Suíte', group: 'bathroom' },
  { title: 'Lavabo', group: 'bathroom' },
  { title: 'Banheira', group: 'bathroom' },

  // Área Externa
  { title: 'Área de Serviço', group: 'outdoor' },
  { title: 'Varanda', group: 'outdoor' },
  { title: 'Varanda Gourmet', group: 'outdoor' },
  { title: 'Sacada', group: 'outdoor' },
  { title: 'Quintal', group: 'outdoor' },
  { title: 'Jardim', group: 'outdoor' },
  { title: 'Terraço', group: 'outdoor' },

  // Lazer
  { title: 'Piscina', group: 'leisure' },
  { title: 'Churrasqueira', group: 'leisure' },
  { title: 'Espaço Gourmet', group: 'leisure' },
  { title: 'Salão de Festas', group: 'leisure' },
  { title: 'Playground', group: 'leisure' },
  { title: 'Academia', group: 'leisure' },
  { title: 'Sauna', group: 'leisure' },
  { title: 'Quadra Esportiva', group: 'leisure' },
  { title: 'Lago', group: 'leisure' },

  // Segurança
  { title: 'Portaria 24h', group: 'security' },
  { title: 'Câmeras de Segurança', group: 'security' },
  { title: 'Cerca Elétrica', group: 'security' },
  { title: 'Condomínio Fechado', group: 'security' },
  { title: 'Alarme', group: 'security' },

  // Infraestrutura
  { title: 'Elevador', group: 'infrastructure' },
  { title: 'Garagem Coberta', group: 'infrastructure' },
  { title: 'Lavanderia', group: 'infrastructure' },
  { title: 'Aquecimento Solar', group: 'infrastructure' },
  { title: 'Ar Condicionado', group: 'infrastructure' },
  { title: 'Móveis Planejados', group: 'infrastructure' },
  { title: 'Energia Solar', group: 'infrastructure' },
  { title: 'Água Inclusa', group: 'infrastructure' },
  { title: 'Poço Artesiano', group: 'infrastructure' },

  // Outro
  { title: 'Pasto Formado', group: 'other' },
  { title: 'Curral', group: 'other' },
  { title: 'Escritura Definitiva', group: 'other' },
  { title: 'Aceita Financiamento', group: 'other' },
  { title: 'Aceita Permuta', group: 'other' },
]

// ═══════════════════════════════════════════════════════════
// EXECUÇÃO
// ═══════════════════════════════════════════════════════════

async function seed() {
  console.log('🌱 Iniciando seed...\n')

  // 1. Criar categorias
  console.log('📁 Criando categorias...')
  const categoryRefs: Record<string, string> = {}

  for (const cat of categories) {
    const id = `category-${toSlug(cat.title)}`
    await client.createOrReplace({
      _id: id,
      _type: 'propertyCategory',
      title: cat.title,
      slug: { _type: 'slug', current: toSlug(cat.title) },
      color: cat.color,
      order: cat.order,
    })
    categoryRefs[cat.title] = id
    console.log(`   ✅ ${cat.title}`)
  }

  // 2. Criar tipos
  console.log('\n🏷️  Criando tipos de imóvel...')
  for (const [categoryTitle, types] of Object.entries(typesByCategory)) {
    const categoryId = categoryRefs[categoryTitle]
    for (const typeName of types) {
      const id = `type-${toSlug(typeName)}`
      await client.createOrReplace({
        _id: id,
        _type: 'propertyType',
        title: typeName,
        slug: { _type: 'slug', current: toSlug(typeName) },
        category: { _type: 'reference', _ref: categoryId },
      })
      console.log(`   ✅ ${typeName} (${categoryTitle})`)
    }
  }

  // 3. Criar características
  console.log('\n✅ Criando características...')
  for (const char of characteristics) {
    const id = `char-${toSlug(char.title)}`
    await client.createOrReplace({
      _id: id,
      _type: 'characteristic',
      title: char.title,
      group: char.group,
    })
    console.log(`   ✅ ${char.title}`)
  }

  // 4. Criar documento de configurações (se não existir)
  console.log('\n⚙️  Criando configurações do site...')
  const existing = await client.getDocument('siteSettings')
  if (!existing) {
    await client.createOrReplace({
      _id: 'siteSettings',
      _type: 'siteSettings',
      brokerName: 'Ricardo',
      creci: 'MG24283',
      email: 'ricardoaugustoreis@gmail.com',
      companyName: 'Premium Imóveis',
      whatsappNumber: '5534996896161',
      defaultWhatsappMessage:
        'Olá Ricardo, gostaria de conhecer todo o portfólio disponível.',
    })
    console.log('   ✅ Configurações criadas')
  } else {
    console.log('   ⏭  Configurações já existem, pulando.')
  }

  console.log('\n🎉 Seed concluído! Abra o Studio para verificar.')
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err)
  process.exit(1)
})
