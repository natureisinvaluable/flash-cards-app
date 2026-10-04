/**
 * Builds every deck file.
 *
 * Run with:  npx tsx scripts/build-decks.ts
 */

import { writeDeck } from './deck-builder'
import * as batch1 from './decks/batch-1'
import * as batch2 from './decks/batch-2'
import * as batch3 from './decks/batch-3'

writeDeck('starter-decks/starter-50.json', batch1.entries, batch1.GENERATED_AT)
writeDeck('starter-decks/batch-2-100.json', batch2.entries, batch2.GENERATED_AT)
writeDeck('starter-decks/batch-3-100.json', batch3.entries, batch3.GENERATED_AT)
