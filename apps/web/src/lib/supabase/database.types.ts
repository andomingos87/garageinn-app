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
        Relationships: [
          {
            foreignKeyName: "accredited_suppliers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "checklist_answers_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "checklist_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "checklist_questions"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_executions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "checklist_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "claim_communications_claim_details_id_fkey"
            columns: ["claim_details_id"]
            isOneToOne: false
            referencedRelation: "ticket_claim_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_communications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "claim_purchase_items_claim_purchase_id_fkey"
            columns: ["claim_purchase_id"]
            isOneToOne: false
            referencedRelation: "claim_purchases"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "claim_purchase_quotations_claim_purchase_id_fkey"
            columns: ["claim_purchase_id"]
            isOneToOne: false
            referencedRelation: "claim_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_purchase_quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_purchase_quotations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "accredited_suppliers"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "claim_purchases_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_purchases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_purchases_claim_details_id_fkey"
            columns: ["claim_details_id"]
            isOneToOne: false
            referencedRelation: "ticket_claim_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_selected_quotation"
            columns: ["selected_quotation_id"]
            isOneToOne: false
            referencedRelation: "claim_purchase_quotations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "ticket_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_approvals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
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
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "ticket_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "ticket_categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "ticket_claim_details_related_maintenance_ticket_id_fkey"
            columns: ["related_maintenance_ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_claim_details_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "ticket_maintenance_details_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_details_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "ticket_maintenance_executions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "fk_approved_quotation"
            columns: ["approved_quotation_id"]
            isOneToOne: false
            referencedRelation: "ticket_quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_purchase_details_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "ticket_quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_quotations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "ticket_rh_details_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "uniform_transactions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniform_transactions_uniform_id_fkey"
            columns: ["uniform_id"]
            isOneToOne: false
            referencedRelation: "uniforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniform_transactions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniform_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "unit_checklist_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_checklist_templates_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_units_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
