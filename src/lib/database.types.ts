export type UserRole = 'admin' | 'supervisor' | 'encargada'

export interface Zone {
  id: string
  name: string
  created_at: string
}

export interface Store {
  id: string
  name: string
  address: string
  zone_id: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  store_id: string | null
  created_at: string
}

export interface ChecklistCategory {
  id: string
  name: string
  order_index: number
  created_at: string
}

export interface ChecklistItem {
  id: string
  category_id: string
  description: string
  order_index: number
  created_at: string
}

export interface Audit {
  id: string
  store_id: string
  auditor_id: string
  status: 'in_progress' | 'completed'
  score: number | null
  notes: string | null
  created_at: string
  completed_at: string | null
}

export interface AuditResponse {
  id: string
  audit_id: string
  checklist_item_id: string
  compliant: boolean
  observation: string | null
  created_at: string
}

export interface AuditPhoto {
  id: string
  audit_id: string
  photo_url: string
  caption: string | null
  created_at: string
}

export interface PopMaterial {
  id: string
  name: string
  description: string | null
  category: string
  created_at: string
}

export interface StoreInventory {
  id: string
  store_id: string
  material_id: string
  quantity: number
  updated_at: string
}

export interface MaterialRequest {
  id: string
  store_id: string
  material_id: string
  quantity: number
  status: 'pending' | 'approved' | 'delivered' | 'rejected'
  requested_by: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      zones: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          id: string
          name: string
          address: string
          zone_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          zone_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          zone_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'stores_zone_id_fkey'
            columns: ['zone_id']
            isOneToOne: false
            referencedRelation: 'zones'
            referencedColumns: ['id']
          },
        ]
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          store_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: string
          store_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          store_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_profiles_store_id_fkey'
            columns: ['store_id']
            isOneToOne: false
            referencedRelation: 'stores'
            referencedColumns: ['id']
          },
        ]
      }
      checklist_categories: {
        Row: {
          id: string
          name: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          id: string
          category_id: string
          description: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          description: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          description?: string
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'checklist_items_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'checklist_categories'
            referencedColumns: ['id']
          },
        ]
      }
      audits: {
        Row: {
          id: string
          store_id: string
          auditor_id: string
          status: string
          score: number | null
          notes: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          store_id: string
          auditor_id: string
          status: string
          score?: number | null
          notes?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          store_id?: string
          auditor_id?: string
          status?: string
          score?: number | null
          notes?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'audits_store_id_fkey'
            columns: ['store_id']
            isOneToOne: false
            referencedRelation: 'stores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audits_auditor_id_fkey'
            columns: ['auditor_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      audit_responses: {
        Row: {
          id: string
          audit_id: string
          checklist_item_id: string
          compliant: boolean
          observation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          audit_id: string
          checklist_item_id: string
          compliant: boolean
          observation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          audit_id?: string
          checklist_item_id?: string
          compliant?: boolean
          observation?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'audit_responses_audit_id_fkey'
            columns: ['audit_id']
            isOneToOne: false
            referencedRelation: 'audits'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_responses_checklist_item_id_fkey'
            columns: ['checklist_item_id']
            isOneToOne: false
            referencedRelation: 'checklist_items'
            referencedColumns: ['id']
          },
        ]
      }
      audit_photos: {
        Row: {
          id: string
          audit_id: string
          photo_url: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          audit_id: string
          photo_url: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          audit_id?: string
          photo_url?: string
          caption?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'audit_photos_audit_id_fkey'
            columns: ['audit_id']
            isOneToOne: false
            referencedRelation: 'audits'
            referencedColumns: ['id']
          },
        ]
      }
      pop_materials: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          created_at?: string
        }
        Relationships: []
      }
      store_inventory: {
        Row: {
          id: string
          store_id: string
          material_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          material_id: string
          quantity: number
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          material_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'store_inventory_store_id_fkey'
            columns: ['store_id']
            isOneToOne: false
            referencedRelation: 'stores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'store_inventory_material_id_fkey'
            columns: ['material_id']
            isOneToOne: false
            referencedRelation: 'pop_materials'
            referencedColumns: ['id']
          },
        ]
      }
      material_requests: {
        Row: {
          id: string
          store_id: string
          material_id: string
          quantity: number
          status: string
          requested_by: string
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          material_id: string
          quantity: number
          status: string
          requested_by: string
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          material_id?: string
          quantity?: number
          status?: string
          requested_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'material_requests_store_id_fkey'
            columns: ['store_id']
            isOneToOne: false
            referencedRelation: 'stores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'material_requests_material_id_fkey'
            columns: ['material_id']
            isOneToOne: false
            referencedRelation: 'pop_materials'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
