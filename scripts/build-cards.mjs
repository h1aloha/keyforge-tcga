// Genera cards.json y translations.json para TCG Arena a partir de keyteki-json-data.
//
// Uso:
//   git clone --depth 1 https://github.com/keyteki/keyteki-json-data.git
//   node scripts/build-cards.mjs ./keyteki-json-data .
//
// Las imágenes de las cartas se enlazan directamente (hotlink) desde el CDN original
// que usa keyteki-json-data; no hace falta descargarlas ni subirlas.
import fs from 'fs'
import path from 'path'

const [srcDir = './keyteki-json-data', outDir = '.'] = process.argv.slice(2)
const packsDir = path.join(srcDir, 'packs')

const HOUSES = {
  untamed: 'Untamed', logos: 'Logos', shadows: 'Shadows', dis: 'Dis', brobnar: 'Brobnar',
  sanctum: 'Sanctum', saurian: 'Saurian', staralliance: 'Star Alliance', mars: 'Mars',
  unfathomable: 'Unfathomable', geistoid: 'Geistoid', ekwidon: 'Ekwidon', skyborn: 'Skyborn',
  redemption: 'Redemption', ouboros: 'Ouroboros', archonpower: 'Archon Power',
  keyraken: 'Keyraken', prophecy: 'Prophecy', thetide: 'The Tide'
}
const titleCase = (s) => s.replace(/\b\w/g, (m) => m.toUpperCase())

const cards = {}
const perPack = {}

for (const file of fs.readdirSync(packsDir).filter((f) => f.endsWith('.json')).sort()) {
  const pack = JSON.parse(fs.readFileSync(path.join(packsDir, file), 'utf-8'))
  perPack[pack.code] = 0
  for (const c of pack.cards) {
    const id = `${pack.code}-${c.number}-${c.id}`
    // Algunas cartas especiales aparecen una vez por cada casa posible: se fusionan en una sola.
    if (cards[id]) {
      for (const h of [].concat(c.house).map((h) => HOUSES[h] ?? titleCase(h))) {
        if (!cards[id].house.includes(h)) cards[id].house.push(h)
      }
      continue
    }

    const en = c.locale?.en?.name ?? c.name
    const es = c.locale?.es?.name ?? en
    const type = titleCase(c.type)
    const house = [].concat(c.house).map((h) => HOUSES[h] ?? titleCase(h))

    // NAME_MODE=bilingual (por defecto): "Furia / Anger", así la búsqueda funciona en ambos idiomas.
    // NAME_MODE=translated: objeto {en, es} que depende del selector de idioma de la app.
    const bilingual = es && es !== en ? `${es} / ${en}` : en
    const translated = process.env.NAME_MODE === 'translated'
    const card = {
      id,
      face: {
        front: {
          name: translated ? { name: en, en, es } : { name: bilingual },
          type,
          cost: 0,
          image: c.image
        }
      },
      name: translated ? { en, es } : bilingual,
      type,
      cost: 0,
      house,
      rarity: c.rarity,
      set: pack.name,
      number: c.number
    }
    if (c.traits?.length) card.traits = c.traits
    if (c.keywords?.length) card.keywords = c.keywords
    if (typeof c.amber === 'number') card.amber = c.amber
    if (typeof c.power === 'number') card.power = c.power
    if (typeof c.armor === 'number') card.armor = c.armor
    if (c.type === 'token creature') card.isToken = true

    cards[id] = card
    perPack[pack.code]++
  }
}

fs.writeFileSync(path.join(outDir, 'cards.json'), JSON.stringify(cards))
console.log(`cards.json: ${Object.keys(cards).length} cartas`, perPack)

const translations = {
  additionalLanguages: ['es'],
  en: {
    'Card types': { Creature: 'Creature', Action: 'Action', Artifact: 'Artifact', Upgrade: 'Upgrade' }
  },
  es: {
    'Card types': {
      Creature: 'Criatura', Action: 'Acción', Artifact: 'Artefacto', Upgrade: 'Mejora',
      'Token Creature': 'Criatura ficha', 'Archon Power': 'Poder de Archon',
      Prophecy: 'Profecía', 'The Tide': 'La Marea'
    },
    Rarities: {
      Common: 'Común', Uncommon: 'Poco común', Rare: 'Rara', Special: 'Especial',
      Variant: 'Variante', Token: 'Ficha', FIXED: 'Fija', 'Evil Twin': 'Gemelo malvado',
      'The Tide': 'La Marea'
    },
    Sections: {
      Battleline: 'Línea de batalla', Artifacts: 'Artefactos', Archives: 'Archivos',
      Hand: 'Mano', Deck: 'Mazo', Discard: 'Descarte'
    },
    Formats: { 'Archon Standard': 'Estándar de Archon' },
    Tokens: {
      'Aember': 'Æmber', Damage: 'Daño', 'Power counter': 'Contador de poder',
      Stun: 'Aturdido', Ward: 'Protección', Enrage: 'Enfurecido',
      RedKey: 'Llave roja', BlueKey: 'Llave azul', YellowKey: 'Llave amarilla'
    },
    'UI text': {
      'Aember pool = player counter. Forge keys by dragging the key tokens.\nExhaust a card = rotate it. Draw back up to 6 cards at the end of your turn.':
        'Reserva de Æmber = contador del jugador. Forja llaves arrastrando las fichas de llave.\nAgotar una carta = girarla. Roba hasta tener 6 cartas al final de tu turno.'
    }
  }
}
fs.writeFileSync(path.join(outDir, 'translations.json'), JSON.stringify(translations, null, 2))
console.log('translations.json escrito')
