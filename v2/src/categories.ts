import type { Category } from './types'
import { supabase } from './supabase'

/**
 * Your own categories.
 *
 * Every query here is silently limited to your rows by the database, so there
 * is no need - and no way - to ask for anyone else's.
 */

interface CategoryRow {
  id: string
  name: string
  sort_order: number
}

const toCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  sortOrder: row.sort_order,
})

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, sort_order')
    .order('sort_order')
  if (error) throw new Error(error.message)
  return (data as CategoryRow[]).map(toCategory)
}

export async function addCategory(userId: string, name: string, sortOrder: number): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: userId, name, sort_order: sortOrder })
    .select('id, name, sort_order')
    .single()
  if (error) throw new Error(error.message)
  return toCategory(data as CategoryRow)
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('categories').update({ name }).eq('id', id)
  if (error) throw new Error(error.message)
}

/** Swap two categories' positions. Called with the pair being exchanged. */
export async function swapCategoryOrder(
  a: { id: string; sortOrder: number },
  b: { id: string; sortOrder: number },
): Promise<void> {
  const first = await supabase.from('categories').update({ sort_order: b.sortOrder }).eq('id', a.id)
  if (first.error) throw new Error(first.error.message)
  const second = await supabase.from('categories').update({ sort_order: a.sortOrder }).eq('id', b.id)
  if (second.error) throw new Error(second.error.message)
}

/**
 * Delete a category, first moving anything filed in it.
 *
 * Passing null for `moveCardsTo` leaves those cards unsorted, which is a
 * legitimate place for them to be in v2 - unlike v1, where every card had to
 * belong to a bucket.
 */
export async function deleteCategory(
  userId: string,
  id: string,
  moveCardsTo: string | null,
): Promise<void> {
  const moved = await supabase
    .from('card_states')
    .update({ category_id: moveCardsTo })
    .eq('user_id', userId)
    .eq('category_id', id)
  if (moved.error) throw new Error(moved.error.message)

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
