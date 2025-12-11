/**
 * Tipos para produtos e comparação de preços
 */

export interface StoreOffer {
  id: string
  store_name: string
  store_url: string
  product_url: string
  price: number
  original_price?: number
  discount?: number
  is_trusted: boolean
  store_rating?: number
  installments?: string
  shipping?: string
  in_stock: boolean
  seller_name?: string
}

export interface Product {
  id: string
  name: string
  image?: string
  brand?: string
  category?: string
  rating?: number
  reviews?: number
  description?: string
  lowest_price: number
  highest_price: number
  offers: StoreOffer[]
}

export interface ProductSearchRequest {
  query: string
  max_results?: number
  min_price?: number
  max_price?: number
  category?: string
  sort_by?: "relevance" | "lowest_price" | "highest_price" | "rating"
}

export interface ProductSearchResponse {
  query: string
  total_products: number
  total_stores: number
  max_discount: number
  products: Product[]
  search_time: number
}

export interface TrendingProduct {
  query: string
  count: number
}

export interface ProductCategory {
  id: string
  name: string
  icon: string
}
