import type { ColourId } from './types'
import { supabase } from './supabase'

export interface ColourMeaning {
  colour: ColourId
  label: string
}

export interface Profile {
  id: string
  displayName: string
  isOwner: boolean
  colourMeanings: ColourMeaning[]
}

const DEFAULT_MEANINGS: ColourMeaning[] = [
  { colour: 'blue', label: 'Masculine noun' },
  { colour: 'pink', label: 'Feminine noun' },
  { colour: 'green', label: 'Verb ending' },
  { colour: 'orange', label: 'Irregular' },
  { colour: 'purple', label: 'Stressed syllable' },
  { colour: 'teal', label: 'Your own use' },
]

/**
 * Selects every column rather than naming them.
 *
 * `colour_meanings` arrives in migration 0002, and naming it explicitly would
 * make the whole app fail with an obscure error on any database where that
 * migration has not been run yet. This way the app works either side of it,
 * falling back to the default labels until the column exists. The table holds
 * nothing sensitive, and the database already restricts what comes back.
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return {
    id: data.id,
    displayName: data.display_name,
    isOwner: data.is_owner,
    colourMeanings: Array.isArray(data.colour_meanings)
      ? (data.colour_meanings as ColourMeaning[])
      : DEFAULT_MEANINGS,
  }
}
