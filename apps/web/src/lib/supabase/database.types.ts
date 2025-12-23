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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      is_admin: { Args: never; Returns: boolean }
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
