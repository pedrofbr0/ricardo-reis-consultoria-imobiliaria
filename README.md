# Sanity CMS — Ricardo Reis Imóveis

## Setup Rápido

### 1. Criar o projeto Sanity

```bash
npm create sanity@latest
```

Quando perguntar:
- **Project name**: `ricardo-imoveis-cms`
- **Default dataset**: Yes (`production`)
- **Template**: Clean project (no predefined schemas)
- **TypeScript**: Yes

### 2. Copiar os arquivos deste pacote

Copie todas as pastas para dentro do projeto criado, substituindo os arquivos existentes:

```
schemaTypes/    → substitui o schemaTypes/ do projeto
components/     → pasta nova
actions/        → pasta nova
lib/            → pasta nova
scripts/        → pasta nova
sanity.config.ts → substitui o arquivo existente
```

### 3. Atualizar o `projectId`

Abra `sanity.config.ts` e substitua `'SEU_PROJECT_ID'` pelo ID real do seu projeto
(visível no arquivo `sanity.config.ts` original gerado ou em https://sanity.io/manage).

### 4. Instalar dependências extras

```bash
npm install @sanity/vision
```

Se decidir usar Google Maps no futuro:
```bash
npm install @sanity/google-maps-input
```

### 5. Popular dados iniciais

```bash
npx sanity exec scripts/seed.ts --with-user-token
```

Isso cria automaticamente:
- 5 categorias (Residencial, Comercial, Terrenos, Empreendimento, Rural)
- ~30 tipos de imóvel vinculados às categorias
- ~35 características (Cozinha Planejada, Piscina, etc.)
- Configurações do site com dados do Ricardo

### 6. Rodar o Studio

```bash
npm run dev
```

Acesse `http://localhost:3333` e pronto!

### 7. Deploy (para seu pai acessar online)

```bash
npx sanity deploy
```

Gera uma URL tipo `https://ricardo-imoveis.sanity.studio`.

---

## Trocar de Nominatim para Google Maps

1. Abra `lib/geocoding.ts`
2. Mude a linha `const ACTIVE_PROVIDER: Provider = 'nominatim'` para `'google'`
3. Preencha a `GOOGLE_API_KEY`
4. Descomente o plugin `googleMapsInput` no `sanity.config.ts`
5. Instale: `npm install @sanity/google-maps-input`

---

## Estrutura de Arquivos

```
├── sanity.config.ts           ← Configuração principal + desk structure
├── schemaTypes/
│   ├── index.ts               ← Registra todos os schemas
│   ├── property.ts            ← Schema principal (imóvel)
│   ├── propertyCategory.ts    ← Categorias (Residencial, Comercial...)
│   ├── propertyType.ts        ← Tipos (Apartamento, Casa, Galpão...)
│   ├── characteristic.ts      ← Características (Piscina, Cozinha Planejada...)
│   └── siteSettings.ts        ← Configurações globais
├── components/
│   ├── AddressLookup.tsx       ← Busca endereço → preenche coordenadas
│   ├── CoordinateLookup.tsx    ← Cola coordenadas → preenche endereço
│   └── CepLookup.tsx           ← Busca CEP → preenche rua/bairro/cidade
├── actions/
│   └── fillLocationAction.ts   ← Botão "Preencher localização" no Studio
├── lib/
│   └── geocoding.ts            ← Abstração Google Maps / Nominatim
└── scripts/
    └── seed.ts                 ← Popula dados iniciais
```