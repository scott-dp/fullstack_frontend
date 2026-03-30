/**
 * Allergen management API module.
 * Manages allergens, ingredients, dishes, overrides, and the allergen sheet.
 * @module
 */
import { request } from '../core/client.ts'

/** A reference allergen (e.g. Gluten, Milk). */
export interface Allergen {
  id: number
  code: string
  nameNo: string
  nameEn: string
}

/** Allergen info embedded in an ingredient response. */
export interface IngredientAllergen {
  id: number
  code: string
  nameNo: string
  nameEn: string
}

/** An ingredient with its associated allergens. */
export interface Ingredient {
  id: number
  name: string
  notes: string | null
  allergens: IngredientAllergen[]
  createdAt: string
  updatedAt: string
}

/** Payload entry when attaching ingredients to a dish. */
export interface DishIngredientEntry {
  ingredientId: number
  quantityText?: string
}

/** An allergen override on a dish (manual include/exclude). */
export interface DishAllergenOverride {
  id: number
  allergen: Allergen
  included: boolean
  reason: string
}

/** Ingredient info embedded in a dish response. */
export interface DishIngredientInfo {
  id: number
  ingredientId: number
  ingredientName: string
  quantityText: string | null
}

/** A dish with ingredients, derived allergens, and overrides. */
export interface Dish {
  id: number
  name: string
  description: string | null
  active: boolean
  ingredients: DishIngredientInfo[]
  derivedAllergens: Allergen[]
  overrides: DishAllergenOverride[]
  changedSinceApproval: boolean
  lastApprovedAt: string | null
  lastApprovedByUsername: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

/** A single entry in the full allergen sheet matrix. */
export interface AllergenSheetEntry {
  dishName: string
  allergenCode: string
  allergenNameNo: string
  allergenNameEn: string
  present: boolean
  overridden: boolean
}

/** Allergen management API methods. */
export const allergenApi = {
  /** Lists all reference allergens. */
  listAllergens: () => request<Allergen[]>('/allergens'),

  /** Lists all ingredients. */
  listIngredients: () => request<Ingredient[]>('/ingredients'),

  /** Fetches a single ingredient by ID. */
  getIngredient: (id: number) => request<Ingredient>(`/ingredients/${id}`),

  /** Creates a new ingredient. */
  createIngredient: (data: { name: string; notes?: string; allergenIds: number[] }) =>
    request<Ingredient>('/ingredients', { method: 'POST', body: JSON.stringify(data) }),

  /** Updates an existing ingredient. */
  updateIngredient: (id: number, data: { name?: string; notes?: string; allergenIds?: number[] }) =>
    request<Ingredient>(`/ingredients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** Deletes an ingredient. */
  deleteIngredient: (id: number) =>
    request<void>(`/ingredients/${id}`, { method: 'DELETE' }),

  /** Lists all dishes. */
  listDishes: () => request<Dish[]>('/dishes'),

  /** Fetches a single dish by ID. */
  getDish: (id: number) => request<Dish>(`/dishes/${id}`),

  /** Creates a new dish. */
  createDish: (data: { name: string; description?: string; notes?: string; ingredientIds: DishIngredientEntry[] }) =>
    request<Dish>('/dishes', { method: 'POST', body: JSON.stringify(data) }),

  /** Updates an existing dish. */
  updateDish: (id: number, data: { name?: string; description?: string; notes?: string; ingredientIds?: DishIngredientEntry[] }) =>
    request<Dish>(`/dishes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** Deletes a dish. */
  deleteDish: (id: number) =>
    request<void>(`/dishes/${id}`, { method: 'DELETE' }),

  /** Approves the current allergen configuration of a dish. */
  approveDish: (id: number) => request<Dish>(`/dishes/${id}/approve`, { method: 'POST' }),

  /** Adds an allergen override to a dish. */
  addOverride: (dishId: number, data: { allergenId: number; included: boolean; reason: string }) =>
    request<DishAllergenOverride>(`/dishes/${dishId}/overrides`, { method: 'POST', body: JSON.stringify(data) }),

  /** Removes an allergen override from a dish. */
  removeOverride: (dishId: number, overrideId: number) =>
    request<void>(`/dishes/${dishId}/overrides/${overrideId}`, { method: 'DELETE' }),

  /** Fetches the full allergen sheet matrix for all active dishes. */
  getAllergenSheet: () => request<AllergenSheetEntry[]>('/dishes/allergen-sheet'),
}
