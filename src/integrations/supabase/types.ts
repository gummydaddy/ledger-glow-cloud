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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          created_at: string
          id: string
          is_active: boolean | null
          parent_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          contact_person: string | null
          country: string | null
          created_at: string
          customer_code: string | null
          email: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tax_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          customer_code?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          customer_code?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          account_id: string | null
          amount: number
          category: string | null
          created_at: string
          description: string
          expense_date: string
          expense_number: string | null
          id: string
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          reference_number: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount?: number
          category?: string | null
          created_at?: string
          description: string
          expense_date?: string
          expense_number?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reference_number?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          expense_number?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reference_number?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          discount_percentage: number | null
          id: string
          invoice_id: string
          line_total: number
          product_id: string | null
          quantity: number
          tax_percentage: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_percentage?: number | null
          id?: string
          invoice_id: string
          line_total?: number
          product_id?: string | null
          quantity?: number
          tax_percentage?: number | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_percentage?: number | null
          id?: string
          invoice_id?: string
          line_total?: number
          product_id?: string | null
          quantity?: number
          tax_percentage?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance_due: number | null
          created_at: string
          customer_id: string
          discount_amount: number | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          is_recurring: boolean | null
          next_recurrence_date: string | null
          notes: string | null
          paid_amount: number | null
          parent_invoice_id: string | null
          recurrence_end_date: string | null
          recurrence_frequency: string | null
          recurrence_start_date: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          terms: string | null
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_due?: number | null
          created_at?: string
          customer_id: string
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          is_recurring?: boolean | null
          next_recurrence_date?: string | null
          notes?: string | null
          paid_amount?: number | null
          parent_invoice_id?: string | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          recurrence_start_date?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          terms?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_due?: number | null
          created_at?: string
          customer_id?: string
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          is_recurring?: boolean | null
          next_recurrence_date?: string | null
          notes?: string | null
          paid_amount?: number | null
          parent_invoice_id?: string | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          recurrence_start_date?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          terms?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_parent_invoice_id_fkey"
            columns: ["parent_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost_price: number | null
          created_at: string
          current_stock: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_service: boolean | null
          name: string
          product_code: string | null
          reorder_level: number | null
          track_inventory: boolean | null
          unit_of_measure: string | null
          unit_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_service?: boolean | null
          name: string
          product_code?: string | null
          reorder_level?: number | null
          track_inventory?: boolean | null
          unit_of_measure?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_service?: boolean | null
          name?: string
          product_code?: string | null
          reorder_level?: number | null
          track_inventory?: boolean | null
          unit_of_measure?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          description: string
          id: string
          line_total: number
          product_id: string | null
          purchase_order_id: string
          quantity: number
          received_quantity: number | null
          tax_percentage: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          line_total?: number
          product_id?: string | null
          purchase_order_id: string
          quantity?: number
          received_quantity?: number | null
          tax_percentage?: number | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          line_total?: number
          product_id?: string | null
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number | null
          tax_percentage?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tax_number: string | null
          updated_at: string
          user_id: string
          vendor_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_number?: string | null
          updated_at?: string
          user_id: string
          vendor_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_number?: string | null
          updated_at?: string
          user_id?: string
          vendor_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "accountant" | "user"
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
    Enums: {
      app_role: ["admin", "accountant", "user"],
    },
  },
} as const
