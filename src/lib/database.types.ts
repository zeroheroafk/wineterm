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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          organisation: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          organisation?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          organisation?: string | null
          subject?: string
        }
        Relationships: []
      }
      import_runs: {
        Row: {
          dispatched_at: string | null
          error: string | null
          finished_at: string | null
          id: number
          job: Json
          note: string | null
          queued_at: string
          rows_deleted: number | null
          rows_upserted: number | null
          scope: string
          source_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          dispatched_at?: string | null
          error?: string | null
          finished_at?: string | null
          id?: never
          job: Json
          note?: string | null
          queued_at?: string
          rows_deleted?: number | null
          rows_upserted?: number | null
          scope: string
          source_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          dispatched_at?: string | null
          error?: string | null
          finished_at?: string | null
          id?: never
          job?: Json
          note?: string | null
          queued_at?: string
          rows_deleted?: number | null
          rows_upserted?: number | null
          scope?: string
          source_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      mapa_market_reports: {
        Row: {
          error: string | null
          label: string
          link_week: string | null
          observations: Json
          read_at: string
          unknown_markets: string[]
          uploaded_at: string | null
          url: string
          week: string | null
          year: number
        }
        Insert: {
          error?: string | null
          label: string
          link_week?: string | null
          observations?: Json
          read_at?: string
          unknown_markets?: string[]
          uploaded_at?: string | null
          url: string
          week?: string | null
          year: number
        }
        Update: {
          error?: string | null
          label?: string
          link_week?: string | null
          observations?: Json
          read_at?: string
          unknown_markets?: string[]
          uploaded_at?: string | null
          url?: string
          week?: string | null
          year?: number
        }
        Relationships: []
      }
      market_observations: {
        Row: {
          max_value: number | null
          min_value: number | null
          observed_on: string
          published_at: string
          revised: boolean
          series_code: string
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          max_value?: number | null
          min_value?: number | null
          observed_on: string
          published_at: string
          revised?: boolean
          series_code: string
          status: string
          updated_at?: string
          value: number
        }
        Update: {
          max_value?: number | null
          min_value?: number | null
          observed_on?: string
          published_at?: string
          revised?: boolean
          series_code?: string
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "market_observations_series_code_fkey"
            columns: ["series_code"]
            isOneToOne: false
            referencedRelation: "market_series"
            referencedColumns: ["code"]
          },
        ]
      }
      market_series: {
        Row: {
          appellation: string | null
          campaign: string
          category: string | null
          classification: string | null
          code: string
          colour: string | null
          country: string
          currency: string
          harvest_year: number | null
          kind: string
          methodology: string
          must_product: string | null
          name: string
          product: string
          quality_category: string | null
          region: string
          source_id: string
          source_type: string
          spec: string | null
          unit: string
          variety: string | null
          verification: string
        }
        Insert: {
          appellation?: string | null
          campaign: string
          category?: string | null
          classification?: string | null
          code: string
          colour?: string | null
          country: string
          currency?: string
          harvest_year?: number | null
          kind: string
          methodology: string
          must_product?: string | null
          name: string
          product: string
          quality_category?: string | null
          region: string
          source_id: string
          source_type: string
          spec?: string | null
          unit: string
          variety?: string | null
          verification: string
        }
        Update: {
          appellation?: string | null
          campaign?: string
          category?: string | null
          classification?: string | null
          code?: string
          colour?: string | null
          country?: string
          currency?: string
          harvest_year?: number | null
          kind?: string
          methodology?: string
          must_product?: string | null
          name?: string
          product?: string
          quality_category?: string | null
          region?: string
          source_id?: string
          source_type?: string
          spec?: string | null
          unit?: string
          variety?: string | null
          verification?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_series_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          cadence: string
          classification: string
          coverage: string
          id: string
          is_sample: boolean
          kind: string
          name: string
          note: string
          url: string | null
        }
        Insert: {
          cadence: string
          classification: string
          coverage: string
          id: string
          is_sample?: boolean
          kind: string
          name: string
          note: string
          url?: string | null
        }
        Update: {
          cadence?: string
          classification?: string
          coverage?: string
          id?: string
          is_sample?: boolean
          kind?: string
          name?: string
          note?: string
          url?: string | null
        }
        Relationships: []
      }
      supply_figures: {
        Row: {
          colour: string
          country: string
          measure: string
          period: string
          presentation: string
          product: string
          published_at: string
          revised: boolean
          source_id: string
          updated_at: string
          volume_hl: number
        }
        Insert: {
          colour: string
          country: string
          measure: string
          period: string
          presentation: string
          product: string
          published_at: string
          revised?: boolean
          source_id: string
          updated_at?: string
          volume_hl: number
        }
        Update: {
          colour?: string
          country?: string
          measure?: string
          period?: string
          presentation?: string
          product?: string
          published_at?: string
          revised?: boolean
          source_id?: string
          updated_at?: string
          volume_hl?: number
        }
        Relationships: [
          {
            foreignKeyName: "supply_figures_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_flows: {
        Row: {
          flow: string
          imported_at: string
          partner: string
          period: string
          product: string
          quantity_kg: number | null
          quantity_l: number | null
          reporter: string
          source_id: string
          value_eur: number | null
        }
        Insert: {
          flow: string
          imported_at?: string
          partner: string
          period: string
          product: string
          quantity_kg?: number | null
          quantity_l?: number | null
          reporter: string
          source_id: string
          value_eur?: number | null
        }
        Update: {
          flow?: string
          imported_at?: string
          partner?: string
          period?: string
          product?: string
          quantity_kg?: number | null
          quantity_l?: number | null
          reporter?: string
          source_id?: string
          value_eur?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_flows_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      trade_destinations: {
        Args: { end_month: string; top_n?: number }
        Returns: {
          litres: number
          litres_complete: boolean
          litres_month: number
          litres_prior_month: number
          litres_prior_year: number
          partner: string
          product: string
          value_eur: number
          value_eur_prior_year: number
        }[]
      }
      trade_latest_month: { Args: never; Returns: string }
      trade_monthly: {
        Args: { end_month: string; months?: number }
        Returns: {
          litres: number
          litres_complete: boolean
          period: string
          product: string
          value_eur: number
        }[]
      }
      trade_top_flows: {
        Args: { end_month: string; top_n?: number }
        Returns: {
          litres: number
          litres_complete: boolean
          litres_prior_year: number
          partner: string
          product: string
          reporter: string
          value_eur: number
          value_eur_prior_year: number
        }[]
      }
      trade_totals: {
        Args: { end_month: string }
        Returns: {
          flow: string
          litres: number
          litres_complete: boolean
          litres_month: number
          litres_prior_month: number
          litres_prior_year: number
          product: string
          reporter: string
          value_eur: number
          value_eur_prior_year: number
        }[]
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
