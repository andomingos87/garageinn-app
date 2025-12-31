/**
 * Este arquivo é gerado automaticamente pelo Supabase CLI.
 * NÃO EDITE MANUALMENTE - suas alterações serão perdidas.
 * 
 * Para tipos customizados, use o arquivo custom-types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accredited_suppliers: {
        Row: {
          address: string | null
          category: string | null
          cnpj: string | null
          contact_name: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      checklist_answers: {
        Row: {
          answer: boolean
          created_at: string | null
          execution_id: string
          id: string
          observation: string | null
          question_id: string
        }
        Insert: {
          answer: boolean
          created_at?: string | null
          execution_id: string
          id?: string
          observation?: string | null
          question_id: string
        }
        Update: {
          answer?: boolean
          created_at?: string | null
          execution_id?: string
          id?: string
          observation?: string | null
          question_id?: string
        }
        Relationships: []
      }
      checklist_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          executed_by: string
          general_observations: string | null
          has_non_conformities: boolean | null
          id: string
          started_at: string
          status: string
          template_id: string
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          executed_by: string
          general_observations?: string | null
          has_non_conformities?: boolean | null
          id?: string
          started_at?: string
          status?: string
          template_id: string
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          executed_by?: string
          general_observations?: string | null
          has_non_conformities?: boolean | null
          id?: string
          started_at?: string
          status?: string
          template_id?: string
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      checklist_questions: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          order_index: number
          question_text: string
          requires_observation_on_no: boolean | null
          status: string
          template_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          order_index: number
          question_text: string
          requires_observation_on_no?: boolean | null
          status?: string
          template_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          order_index?: number
          question_text?: string
          requires_observation_on_no?: boolean | null
          status?: string
          template_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      checklist_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      claim_communications: {
        Row: {
          channel: string
          claim_details_id: string
          communication_date: string
          created_at: string | null
          created_by: string
          id: string
          next_contact_date: string | null
          summary: string
        }
        Insert: {
          channel: string
          claim_details_id: string
          communication_date?: string
          created_at?: string | null
          created_by: string
          id?: string
          next_contact_date?: string | null
          summary: string
        }
        Update: {
          channel?: string
          claim_details_id?: string
          communication_date?: string
          created_at?: string | null
          created_by?: string
          id?: string
          next_contact_date?: string | null
          summary?: string
        }
        Relationships: []
      }
      claim_purchase_items: {
        Row: {
          claim_purchase_id: string
          created_at: string | null
          description: string | null
          estimated_unit_price: number | null
          final_unit_price: number | null
          id: string
          item_name: string
          quantity: number
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          claim_purchase_id: string
          created_at?: string | null
          description?: string | null
          estimated_unit_price?: number | null
          final_unit_price?: number | null
          id?: string
          item_name: string
          quantity?: number
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          claim_purchase_id?: string
          created_at?: string | null
          description?: string | null
          estimated_unit_price?: number | null
          final_unit_price?: number | null
          id?: string
          item_name?: string
          quantity?: number
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      claim_purchase_quotations: {
        Row: {
          claim_purchase_id: string
          created_at: string | null
          created_by: string
          delivery_deadline: string | null
          id: string
          is_selected: boolean | null
          items_breakdown: Json | null
          notes: string | null
          payment_terms: string | null
          status: string
          supplier_cnpj: string | null
          supplier_contact: string | null
          supplier_id: string | null
          supplier_name: string
          supplier_phone: string | null
          total_price: number
          updated_at: string | null
          validity_date: string | null
        }
        Insert: {
          claim_purchase_id: string
          created_at?: string | null
          created_by: string
          delivery_deadline?: string | null
          id?: string
          is_selected?: boolean | null
          items_breakdown?: Json | null
          notes?: string | null
          payment_terms?: string | null
          status?: string
          supplier_cnpj?: string | null
          supplier_contact?: string | null
          supplier_id?: string | null
          supplier_name: string
          supplier_phone?: string | null
          total_price: number
          updated_at?: string | null
          validity_date?: string | null
        }
        Update: {
          claim_purchase_id?: string
          created_at?: string | null
          created_by?: string
          delivery_deadline?: string | null
          id?: string
          is_selected?: boolean | null
          items_breakdown?: Json | null
          notes?: string | null
          payment_terms?: string | null
          status?: string
          supplier_cnpj?: string | null
          supplier_contact?: string | null
          supplier_id?: string | null
          supplier_name?: string
          supplier_phone?: string | null
          total_price?: number
          updated_at?: string | null
          validity_date?: string | null
        }
        Relationships: []
      }
      claim_purchases: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_total: number | null
          assigned_to: string | null
          claim_details_id: string
          completed_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          estimated_total: number | null
          id: string
          purchase_number: number
          rejection_reason: string | null
          selected_quotation_id: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_total?: number | null
          assigned_to?: string | null
          claim_details_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          estimated_total?: number | null
          id?: string
          purchase_number?: number
          rejection_reason?: string | null
          selected_quotation_id?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_total?: number | null
          assigned_to?: string | null
          claim_details_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          estimated_total?: number | null
          id?: string
          purchase_number?: number
          rejection_reason?: string | null
          selected_quotation_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          invitation_expires_at: string | null
          invitation_sent_at: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          full_name: string
          id: string
          invitation_expires_at?: string | null
          invitation_sent_at?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          invitation_expires_at?: string | null
          invitation_sent_at?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          department_id: string | null
          id: string
          is_global: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_global?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_global?: boolean | null
          name?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      ticket_approvals: {
        Row: {
          approval_level: number
          approval_role: string
          approved_by: string | null
          created_at: string | null
          decision_at: string | null
          id: string
          notes: string | null
          status: string
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          approval_level: number
          approval_role: string
          approved_by?: string | null
          created_at?: string | null
          decision_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          approval_level?: number
          approval_role?: string
          approved_by?: string | null
          created_at?: string | null
          decision_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_attachments: {
        Row: {
          category: string | null
          comment_id: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          category?: string | null
          comment_id?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          category?: string | null
          comment_id?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      ticket_categories: {
        Row: {
          created_at: string | null
          department_id: string
          id: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id: string
          id?: string
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_claim_details: {
        Row: {
          company_liability: number | null
          created_at: string | null
          customer_cpf: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_satisfaction_rating: number | null
          deductible_value: number | null
          estimated_damage_value: number | null
          final_repair_cost: number | null
          has_third_party: boolean | null
          id: string
          liability_determination: string | null
          location_description: string | null
          occurrence_date: string
          occurrence_time: string | null
          occurrence_type: string
          police_report_date: string | null
          police_report_number: string | null
          related_maintenance_ticket_id: string | null
          resolution_notes: string | null
          resolution_type: string | null
          third_party_info: Json | null
          third_party_name: string | null
          third_party_phone: string | null
          third_party_plate: string | null
          ticket_id: string
          updated_at: string | null
          vehicle_color: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_year: number | null
        }
        Insert: {
          company_liability?: number | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          deductible_value?: number | null
          estimated_damage_value?: number | null
          final_repair_cost?: number | null
          has_third_party?: boolean | null
          id?: string
          liability_determination?: string | null
          location_description?: string | null
          occurrence_date: string
          occurrence_time?: string | null
          occurrence_type: string
          police_report_date?: string | null
          police_report_number?: string | null
          related_maintenance_ticket_id?: string | null
          resolution_notes?: string | null
          resolution_type?: string | null
          third_party_info?: Json | null
          third_party_name?: string | null
          third_party_phone?: string | null
          third_party_plate?: string | null
          ticket_id: string
          updated_at?: string | null
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: number | null
        }
        Update: {
          company_liability?: number | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          deductible_value?: number | null
          estimated_damage_value?: number | null
          final_repair_cost?: number | null
          has_third_party?: boolean | null
          id?: string
          liability_determination?: string | null
          location_description?: string | null
          occurrence_date?: string
          occurrence_time?: string | null
          occurrence_type?: string
          police_report_date?: string | null
          police_report_number?: string | null
          related_maintenance_ticket_id?: string | null
          resolution_notes?: string | null
          resolution_type?: string | null
          third_party_info?: Json | null
          third_party_name?: string | null
          third_party_phone?: string | null
          third_party_plate?: string | null
          ticket_id?: string
          updated_at?: string | null
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: number | null
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ticket_history: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          ticket_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_maintenance_details: {
        Row: {
          completion_notes: string | null
          completion_rating: number | null
          created_at: string | null
          equipment_affected: string | null
          id: string
          location_description: string | null
          maintenance_type: string | null
          subject_id: string | null
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          completion_notes?: string | null
          completion_rating?: number | null
          created_at?: string | null
          equipment_affected?: string | null
          id?: string
          location_description?: string | null
          maintenance_type?: string | null
          subject_id?: string | null
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          completion_notes?: string | null
          completion_rating?: number | null
          created_at?: string | null
          equipment_affected?: string | null
          id?: string
          location_description?: string | null
          maintenance_type?: string | null
          subject_id?: string | null
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_maintenance_executions: {
        Row: {
          actual_cost: number | null
          actual_end_date: string | null
          assigned_to: string | null
          created_at: string | null
          created_by: string
          description: string
          estimated_cost: number | null
          estimated_end_date: string | null
          id: string
          materials_needed: string | null
          notes: string | null
          start_date: string | null
          status: string
          supplier_contact: string | null
          supplier_name: string | null
          ticket_id: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_end_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by: string
          description: string
          estimated_cost?: number | null
          estimated_end_date?: string | null
          id?: string
          materials_needed?: string | null
          notes?: string | null
          start_date?: string | null
          status?: string
          supplier_contact?: string | null
          supplier_name?: string | null
          ticket_id: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_end_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          estimated_cost?: number | null
          estimated_end_date?: string | null
          id?: string
          materials_needed?: string | null
          notes?: string | null
          start_date?: string | null
          status?: string
          supplier_contact?: string | null
          supplier_name?: string | null
          ticket_id?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_purchase_details: {
        Row: {
          approved_quotation_id: string | null
          created_at: string | null
          delivery_address: string | null
          delivery_confirmed_at: string | null
          delivery_date: string | null
          delivery_notes: string | null
          delivery_rating: number | null
          estimated_price: number | null
          id: string
          item_name: string
          quantity: number
          ticket_id: string
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          approved_quotation_id?: string | null
          created_at?: string | null
          delivery_address?: string | null
          delivery_confirmed_at?: string | null
          delivery_date?: string | null
          delivery_notes?: string | null
          delivery_rating?: number | null
          estimated_price?: number | null
          id?: string
          item_name: string
          quantity: number
          ticket_id: string
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_quotation_id?: string | null
          created_at?: string | null
          delivery_address?: string | null
          delivery_confirmed_at?: string | null
          delivery_date?: string | null
          delivery_notes?: string | null
          delivery_rating?: number | null
          estimated_price?: number | null
          id?: string
          item_name?: string
          quantity?: number
          ticket_id?: string
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_quotations: {
        Row: {
          created_at: string | null
          created_by: string
          delivery_deadline: string | null
          id: string
          is_selected: boolean | null
          notes: string | null
          payment_terms: string | null
          quantity: number
          status: string
          supplier_cnpj: string | null
          supplier_contact: string | null
          supplier_name: string
          supplier_response_date: string | null
          ticket_id: string
          total_price: number
          unit_price: number
          updated_at: string | null
          validity_date: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          delivery_deadline?: string | null
          id?: string
          is_selected?: boolean | null
          notes?: string | null
          payment_terms?: string | null
          quantity: number
          status?: string
          supplier_cnpj?: string | null
          supplier_contact?: string | null
          supplier_name: string
          supplier_response_date?: string | null
          ticket_id: string
          total_price: number
          unit_price: number
          updated_at?: string | null
          validity_date?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          delivery_deadline?: string | null
          id?: string
          is_selected?: boolean | null
          notes?: string | null
          payment_terms?: string | null
          quantity?: number
          status?: string
          supplier_cnpj?: string | null
          supplier_contact?: string | null
          supplier_name?: string
          supplier_response_date?: string | null
          ticket_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string | null
          validity_date?: string | null
        }
        Relationships: []
      }
      ticket_rh_details: {
        Row: {
          created_at: string | null
          id: string
          rh_type: string
          specific_fields: Json | null
          ticket_id: string
          updated_at: string | null
          withdrawal_reason: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rh_type: string
          specific_fields?: Json | null
          ticket_id: string
          updated_at?: string | null
          withdrawal_reason?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rh_type?: string
          specific_fields?: Json | null
          ticket_id?: string
          updated_at?: string | null
          withdrawal_reason?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          closed_at: string | null
          created_at: string | null
          created_by: string
          denial_reason: string | null
          department_id: string
          description: string
          due_date: string | null
          id: string
          perceived_urgency: string | null
          priority: string | null
          resolved_at: string | null
          status: string
          ticket_number: number
          title: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by: string
          denial_reason?: string | null
          department_id: string
          description: string
          due_date?: string | null
          id?: string
          perceived_urgency?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          ticket_number?: number
          title: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string
          denial_reason?: string | null
          department_id?: string
          description?: string
          due_date?: string | null
          id?: string
          perceived_urgency?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          ticket_number?: number
          title?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      uniform_transactions: {
        Row: {
          created_at: string | null
          id: string
          quantity: number
          ticket_id: string | null
          type: string
          uniform_id: string
          unit_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          quantity: number
          ticket_id?: string | null
          type: string
          uniform_id: string
          unit_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          quantity?: number
          ticket_id?: string | null
          type?: string
          uniform_id?: string
          unit_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      uniforms: {
        Row: {
          created_at: string | null
          current_stock: number | null
          description: string | null
          id: string
          min_stock: number | null
          name: string
          size: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          min_stock?: number | null
          name: string
          size?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          min_stock?: number | null
          name?: string
          size?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      unit_checklist_templates: {
        Row: {
          created_at: string | null
          id: string
          template_id: string
          unit_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          template_id: string
          unit_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          template_id?: string
          unit_id?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          address: string
          administrator: string | null
          capacity: number | null
          city: string | null
          cnpj: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          neighborhood: string | null
          phone: string | null
          region: string | null
          state: string | null
          status: string
          supervisor_name: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          administrator?: string | null
          capacity?: number | null
          city?: string | null
          cnpj?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          phone?: string | null
          region?: string | null
          state?: string | null
          status?: string
          supervisor_name?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          administrator?: string | null
          capacity?: number | null
          city?: string | null
          cnpj?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          phone?: string | null
          region?: string | null
          state?: string | null
          status?: string
          supervisor_name?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_units: {
        Row: {
          created_at: string | null
          id: string
          is_coverage: boolean | null
          unit_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_coverage?: boolean | null
          unit_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_coverage?: boolean | null
          unit_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_ticket_approval: {
        Args: {
          p_approval_level: number
          p_approved: boolean
          p_notes?: string
          p_ticket_id: string
        }
        Returns: string
      }
      create_ticket_approvals: {
        Args: { p_ticket_id: string }
        Returns: undefined
      }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_invitation_expired: { Args: { p_user_id: string }; Returns: boolean }
      is_rh: { Args: Record<PropertyKey, never>; Returns: boolean }
      restore_deleted_user: { Args: { p_user_id: string }; Returns: boolean }
      soft_delete_user: { Args: { p_user_id: string }; Returns: boolean }
      ticket_needs_approval: {
        Args: { p_created_by: string; p_department_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
