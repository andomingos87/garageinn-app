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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            foreignKeyName: "checklist_answers_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "checklist_executions_with_details"
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "checklist_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "checklist_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "checklist_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_with_staff"
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "checklist_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
          email: string
          full_name: string
          id: string
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
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
          {
            foreignKeyName: "roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["department_id"]
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_approvals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_approvals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_approvals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
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
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
          {
            foreignKeyName: "ticket_categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "ticket_categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["department_id"]
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
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            foreignKeyName: "ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            foreignKeyName: "ticket_maintenance_details_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_details_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_details_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_details_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_details_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets_with_details"
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            foreignKeyName: "ticket_maintenance_executions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_maintenance_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_with_staff"
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
          {
            foreignKeyName: "ticket_purchase_details_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_purchase_details_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets_with_details"
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "ticket_quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "ticket_quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_quotations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_quotations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_quotations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            foreignKeyName: "tickets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "tickets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "tickets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "tickets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "tickets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "tickets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_with_staff"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "unit_checklist_templates_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "unit_checklist_templates_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "unit_checklist_templates_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_checklist_templates_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_with_staff"
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "user_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "user_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "user_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_with_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_units_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "user_units_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_units_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "user_units_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "user_units_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "user_units_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "user_units_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      checklist_executions_with_details: {
        Row: {
          completed_at: string | null
          created_at: string | null
          executed_by: string | null
          executed_by_avatar: string | null
          executed_by_email: string | null
          executed_by_name: string | null
          general_observations: string | null
          has_non_conformities: boolean | null
          id: string | null
          non_conformities_count: number | null
          started_at: string | null
          status: string | null
          template_id: string | null
          template_name: string | null
          template_type: string | null
          total_answers: number | null
          total_questions: number | null
          unit_code: string | null
          unit_id: string | null
          unit_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["assigned_to_id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["created_by_id"]
          },
          {
            foreignKeyName: "checklist_executions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "pending_approvals_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "checklist_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "checklist_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "checklist_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_executions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units_with_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_approvals_with_details: {
        Row: {
          approval_created_at: string | null
          approval_id: string | null
          approval_level: number | null
          approval_role: string | null
          approval_status: string | null
          created_by_avatar: string | null
          created_by_id: string | null
          created_by_name: string | null
          description: string | null
          item_name: string | null
          quantity: number | null
          ticket_created_at: string | null
          ticket_id: string | null
          ticket_number: number | null
          ticket_status: string | null
          title: string | null
          unit_code: string | null
          unit_id: string | null
          unit_name: string | null
          unit_of_measure: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_approvals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_approvals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_maintenance_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_approvals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_maintenance_with_details: {
        Row: {
          approvals_approved_count: number | null
          approvals_count: number | null
          assigned_to_avatar: string | null
          assigned_to_id: string | null
          assigned_to_name: string | null
          attachments_count: number | null
          category_id: string | null
          category_name: string | null
          closed_at: string | null
          comments_count: number | null
          completion_notes: string | null
          completion_rating: number | null
          created_at: string | null
          created_by_avatar: string | null
          created_by_id: string | null
          created_by_name: string | null
          denial_reason: string | null
          department_id: string | null
          department_name: string | null
          description: string | null
          due_date: string | null
          equipment_affected: string | null
          executions_count: number | null
          id: string | null
          location_description: string | null
          maintenance_details_id: string | null
          maintenance_type: string | null
          perceived_urgency: string | null
          priority: string | null
          resolved_at: string | null
          status: string | null
          ticket_number: number | null
          title: string | null
          unit_code: string | null
          unit_id: string | null
          unit_name: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      tickets_with_details: {
        Row: {
          approved_quotation_id: string | null
          assigned_to_avatar: string | null
          assigned_to_id: string | null
          assigned_to_name: string | null
          attachments_count: number | null
          category_id: string | null
          category_name: string | null
          closed_at: string | null
          comments_count: number | null
          created_at: string | null
          created_by_avatar: string | null
          created_by_id: string | null
          created_by_name: string | null
          delivery_confirmed_at: string | null
          delivery_date: string | null
          delivery_rating: number | null
          denial_reason: string | null
          department_id: string | null
          department_name: string | null
          description: string | null
          due_date: string | null
          estimated_price: number | null
          id: string | null
          item_name: string | null
          perceived_urgency: string | null
          priority: string | null
          quantity: number | null
          quotations_count: number | null
          resolved_at: string | null
          status: string | null
          ticket_number: number | null
          title: string | null
          unit_code: string | null
          unit_id: string | null
          unit_name: string | null
          unit_of_measure: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_approved_quotation"
            columns: ["approved_quotation_id"]
            isOneToOne: false
            referencedRelation: "ticket_quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      units_with_staff: {
        Row: {
          address: string | null
          administrator: string | null
          capacity: number | null
          city: string | null
          cnpj: string | null
          code: string | null
          created_at: string | null
          id: string | null
          name: string | null
          neighborhood: string | null
          phone: string | null
          region: string | null
          staff: Json | null
          staff_count: number | null
          state: string | null
          status: string | null
          supervisor_name: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Relationships: []
      }
      users_with_roles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          phone: string | null
          roles: Json | null
          status: string | null
          updated_at: string | null
        }
        Relationships: []
      }
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
      is_admin: { Args: never; Returns: boolean }
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ============================================
// Custom Types (não gerados automaticamente)
// ============================================

/**
 * Status possíveis de um usuário
 */
export type UserStatus = 'active' | 'pending' | 'inactive'

/**
 * Status possíveis de uma unidade
 */
export type UnitStatus = 'active' | 'inactive'

/**
 * Unidade básica
 */
export interface Unit {
  id: string
  code: string
  name: string
  address: string
  city: string | null
  state: string | null
  zip_code: string | null
  neighborhood: string | null
  phone: string | null
  email: string | null
  cnpj: string | null
  capacity: number | null
  region: string | null
  administrator: string | null
  supervisor_name: string | null
  status: UnitStatus
  created_at: string | null
  updated_at: string | null
}

/**
 * Membro da equipe de uma unidade
 */
export interface UnitStaffMember {
  user_id: string
  user_name: string
  user_email: string
  user_avatar: string | null
  is_coverage: boolean
  role_name: string | null
  department_name: string | null
}

/**
 * Unidade com contagem de equipe
 */
export interface UnitWithStaffCount extends Unit {
  staff_count: number
  staff?: UnitStaffMember[]
}

/**
 * Informações de cargo de um usuário
 */
export interface UserRoleInfo {
  role_id: string
  role_name: string
  department_id: string | null
  department_name: string | null
  is_global: boolean
}

/**
 * Informações de unidade vinculada a um usuário
 */
export interface UserUnitInfo {
  id: string
  unit_id: string
  unit_name: string
  unit_code: string
  is_coverage: boolean
}

/**
 * Usuário com seus cargos
 */
export interface UserWithRoles {
  id: string
  full_name: string
  email: string
  phone: string | null
  cpf: string | null
  avatar_url: string | null
  status: UserStatus
  created_at: string
  updated_at: string
  deleted_at: string | null
  invitation_sent_at: string | null
  invitation_expires_at: string | null
  roles: UserRoleInfo[]
  units?: UserUnitInfo[]
}

/**
 * Status do convite do usuário
 */
export type InvitationStatus = 'not_sent' | 'pending' | 'expired' | 'accepted'

/**
 * Helper para calcular status do convite
 */
export function getInvitationStatus(user: Pick<UserWithRoles, 'status' | 'invitation_sent_at' | 'invitation_expires_at'>): InvitationStatus {
  // Se já está ativo, o convite foi aceito
  if (user.status === 'active') {
    return 'accepted'
  }
  
  // Se não tem data de envio, convite não foi enviado
  if (!user.invitation_sent_at) {
    return 'not_sent'
  }
  
  // Se tem data de expiração e já passou, está expirado
  if (user.invitation_expires_at && new Date(user.invitation_expires_at) < new Date()) {
    return 'expired'
  }
  
  // Caso contrário, está pendente
  return 'pending'
}

/**
 * Log de auditoria
 */
export interface AuditLog {
  id: string
  user_id: string | null
  entity_type: string
  entity_id: string
  action: string
  old_data: Json | null
  new_data: Json | null
  metadata: Json | null
  created_at: string | null
}