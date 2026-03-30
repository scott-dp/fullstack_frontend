/**
 * Suppliers API module.
 * Manages supplier CRUD operations for the traceability system.
 * @module
 */
import { request } from '../core/client.ts'

/** A supplier record. */
export interface Supplier {
  /** Unique supplier identifier. */
  id: number
  /** Supplier company name. */
  name: string
  /** Organization number (e.g. Norwegian org. nr.), optional. */
  organizationNumber?: string
  /** Primary contact person name, optional. */
  contactName?: string
  /** Contact email address, optional. */
  email?: string
  /** Contact phone number, optional. */
  phone?: string
  /** Supplier address, optional. */
  address?: string
  /** Internal notes about the supplier, optional. */
  notes?: string
  /** Whether the supplier is currently active. */
  active: boolean
  /** ISO-8601 creation timestamp. */
  createdAt: string
  /** ISO-8601 last-update timestamp. */
  updatedAt: string
}

/** Payload for creating a new supplier. */
export interface CreateSupplierRequest {
  /** Supplier company name. */
  name: string
  /** Organization number, optional. */
  organizationNumber?: string
  /** Primary contact person name, optional. */
  contactName?: string
  /** Contact email address, optional. */
  email?: string
  /** Contact phone number, optional. */
  phone?: string
  /** Supplier address, optional. */
  address?: string
  /** Internal notes, optional. */
  notes?: string
}

/** Payload for updating an existing supplier. */
export interface UpdateSupplierRequest {
  /** Supplier company name. */
  name?: string
  /** Organization number, optional. */
  organizationNumber?: string
  /** Primary contact person name, optional. */
  contactName?: string
  /** Contact email address, optional. */
  email?: string
  /** Contact phone number, optional. */
  phone?: string
  /** Supplier address, optional. */
  address?: string
  /** Internal notes, optional. */
  notes?: string
  /** Whether the supplier is active. */
  active?: boolean
}

/** Supplier API methods. */
export const supplierApi = {
  /**
   * Lists all suppliers for the current organization.
   */
  list: () => request<Supplier[]>('/suppliers'),

  /**
   * Fetches a single supplier by ID.
   * @param id - Supplier identifier
   */
  get: (id: number) => request<Supplier>(`/suppliers/${id}`),

  /**
   * Creates a new supplier.
   * @param data - Supplier creation payload
   */
  create: (data: CreateSupplierRequest) =>
    request<Supplier>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),

  /**
   * Updates an existing supplier.
   * @param id - Supplier identifier
   * @param data - Fields to update
   */
  update: (id: number, data: UpdateSupplierRequest) =>
    request<Supplier>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}
