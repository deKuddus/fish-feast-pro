import { createSupabaseServer } from '@/lib/supabase/server'

export async function getAllProducts() {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_available', true)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function getProductById(productId: string) {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), product_options(*)')
    .eq('id', productId)
    .single()

  if (error) throw error
  return data
}

export async function getProductsByCategory(categoryId: string) {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('category_id', categoryId)
    .eq('is_available', true)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function getFeaturedProducts(limit: number = 6) {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_available', true)
    .limit(limit)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
