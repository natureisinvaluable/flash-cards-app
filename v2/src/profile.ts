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

export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', userId)
  if (error) throw new Error(error.message)
}

/**
 * Save what the colours mean to you.
 *
 * The column arrives in migration 0002. If that has not been run the database
 * complains about an unknown column, which means nothing to anyone reading it,
 * so the message is replaced with one that says what to do.
 */
export async function updateColourMeanings(
  userId: string,
  meanings: ColourMeaning[],
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ colour_meanings: meanings })
    .eq('id', userId)

  if (error) {
    if (/colour_meanings/.test(error.message)) {
      throw new Error(
        'Colour labels cannot be saved yet: migration 0002 has not been run on the database.',
      )
    }
    throw new Error(error.message)
  }
}

export interface Member {
  id: string
  displayName: string
  isOwner: boolean
}

/** Everyone who has signed in. Visible to all members by design. */
export async function fetchMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, is_owner')
    .order('created_at')
  if (error) throw new Error(error.message)
  return (data as { id: string; display_name: string; is_owner: boolean }[]).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    isOwner: row.is_owner,
  }))
}
