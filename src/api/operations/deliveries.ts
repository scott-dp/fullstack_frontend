/**
 * Deliveries API module.
 * Manages delivery records, delivery items, and traceability searches.
 * @module
 */
import { request } from '../core/client.ts'

/** A single item within a delivery record. */
export interface DeliveryItem {
  /** Unique item identifier. */
  id: number
  /** Name of the delivered product. */
  productName: string
  /** Quantity received, optional. */
  quantity?: number
  /** Unit of measure (e.g. kg, pcs, liters), optional. */
  unit?: string
  /** Batch or lot number for traceability, optional. */
  batchLot?: string
  /** ISO-8601 expiry date, optional. */
  expiryDate?: string
  /** Internal ingredient reference, optional. */
  internalIngredientRef?: string
}

/** A delivery record from a supplier. */
export interface DeliveryRecord {
  /** Unique delivery identifier. */
  id: number
  /** ID of the supplier who made the delivery. */
  supplierId: number
  /** Display name of the supplier. */
  supplierName: string
  /** ISO-8601 date the delivery was received. */
  deliveryDate: string
  /** Document or invoice number, optional. */
  documentNumber?: string
  /** Username of the person who received the delivery. */
  receivedByUsername: string
  /** Notes about the delivery, optional. */
  notes?: string
  /** Items included in this delivery. */
  items: DeliveryItem[]
  /** ISO-8601 creation timestamp. */
  createdAt: string
}

/** A traceability search result linking a delivery item back to its source. */
export interface TraceabilityResult {
  /** Delivery item identifier. */
  deliveryItemId: number
  /** Parent delivery record identifier. */
  deliveryRecordId: number
  /** Name of the supplier. */
  supplierName: string
  /** Name of the product. */
  productName: string
  /** Batch or lot number, optional. */
  batchLot?: string
  /** ISO-8601 delivery date. */
  deliveryDate: string
  /** ISO-8601 expiry date, optional. */
  expiryDate?: string
}

/** Payload for creating a delivery item within a new delivery. */
export interface CreateDeliveryItemRequest {
  /** Name of the delivered product. */
  productName: string
  /** Quantity received, optional. */
  quantity?: number
  /** Unit of measure, optional. */
  unit?: string
  /** Batch or lot number, optional. */
  batchLot?: string
  /** ISO-8601 expiry date, optional. */
  expiryDate?: string
  /** Internal ingredient reference, optional. */
  internalIngredientRef?: string
}

/** Payload for creating a new delivery record. */
export interface CreateDeliveryRequest {
  /** ID of the supplier. */
  supplierId: number
  /** ISO-8601 date the delivery was received. */
  deliveryDate: string
  /** Document or invoice number, optional. */
  documentNumber?: string
  /** Notes about the delivery, optional. */
  notes?: string
  /** Items included in this delivery. */
  items: CreateDeliveryItemRequest[]
}

/** Delivery API methods. */
export const deliveryApi = {
  /**
   * Lists all delivery records for the current organization.
   */
  list: () => request<DeliveryRecord[]>('/deliveries'),

  /**
   * Fetches a single delivery record by ID, including its items.
   * @param id - Delivery record identifier
   */
  get: (id: number) => request<DeliveryRecord>(`/deliveries/${id}`),

  /**
   * Creates a new delivery record with items.
   * @param data - Delivery creation payload
   */
  create: (data: CreateDeliveryRequest) =>
    request<DeliveryRecord>('/deliveries', { method: 'POST', body: JSON.stringify(data) }),

  /**
   * Searches delivery items for traceability by product name and/or batch/lot number.
   * @param params - Search parameters (productName and/or batchLot)
   */
  searchTraceability: (params: { productName?: string; batchLot?: string }) => {
    const query = new URLSearchParams()
    if (params.productName) query.set('productName', params.productName)
    if (params.batchLot) query.set('batchLot', params.batchLot)
    const qs = query.toString()
    return request<TraceabilityResult[]>(`/deliveries/search/traceability${qs ? '?' + qs : ''}`)
  },
}
