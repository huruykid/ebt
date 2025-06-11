export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          contributions_required: number | null
          created_at: string | null
          description: string
          icon: string | null
          id: string
          name: string
          points_required: number | null
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          contributions_required?: number | null
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          name: string
          points_required?: number | null
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          contributions_required?: number | null
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          store_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          store_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          store_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "snap_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          rating: number
          review_text: string | null
          store_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          store_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          store_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "snap_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      snap_stores: {
        Row: {
          additional_address: string | null
          city: string | null
          county: string | null
          created_at: string | null
          grantee_name: string | null
          id: number
          incentive_program: string | null
          latitude: number | null
          longitude: number | null
          object_id: string | null
          record_id: string | null
          state: string | null
          store_name: string
          store_street_address: string | null
          store_type: string | null
          x: number | null
          y: number | null
          zip_code: string | null
          zip4: string | null
        }
        Insert: {
          additional_address?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          grantee_name?: string | null
          id?: number
          incentive_program?: string | null
          latitude?: number | null
          longitude?: number | null
          object_id?: string | null
          record_id?: string | null
          state?: string | null
          store_name: string
          store_street_address?: string | null
          store_type?: string | null
          x?: number | null
          y?: number | null
          zip_code?: string | null
          zip4?: string | null
        }
        Update: {
          additional_address?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          grantee_name?: string | null
          id?: number
          incentive_program?: string | null
          latitude?: number | null
          longitude?: number | null
          object_id?: string | null
          record_id?: string | null
          state?: string | null
          store_name?: string
          store_street_address?: string | null
          store_type?: string | null
          x?: number | null
          y?: number | null
          zip_code?: string | null
          zip4?: string | null
        }
        Relationships: []
      }
      store_clicks: {
        Row: {
          clicked_at: string
          id: string
          store_id: number
          user_id: string | null
          user_latitude: number
          user_longitude: number
        }
        Insert: {
          clicked_at?: string
          id?: string
          store_id: number
          user_id?: string | null
          user_latitude: number
          user_longitude: number
        }
        Update: {
          clicked_at?: string
          id?: string
          store_id?: number
          user_id?: string | null
          user_latitude?: number
          user_longitude?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_clicks_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "snap_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          contribution_type: Database["public"]["Enums"]["contribution_type"]
          created_at: string | null
          description: string | null
          id: string
          points_earned: number
          store_id: number | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          contribution_type: Database["public"]["Enums"]["contribution_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          points_earned?: number
          store_id?: number | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          contribution_type?: Database["public"]["Enums"]["contribution_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          points_earned?: number
          store_id?: number | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_points_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "snap_stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      store_review_stats: {
        Row: {
          average_rating: number | null
          review_count: number | null
          store_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "snap_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          hours_count: number | null
          photos_count: number | null
          reviews_count: number | null
          stores_contributed_to: number | null
          total_contributions: number | null
          total_points: number | null
          user_id: string | null
          verified_contributions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      badge_type:
        | "neighborhood_scout"
        | "snap_hero"
        | "photo_contributor"
        | "reviewer"
        | "info_verifier"
        | "community_helper"
      contribution_type:
        | "store_hours"
        | "store_photo"
        | "store_review"
        | "store_tag"
        | "contact_info"
        | "report_incorrect_info"
        | "verify_info"
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

export const Constants = {
  public: {
    Enums: {
      badge_type: [
        "neighborhood_scout",
        "snap_hero",
        "photo_contributor",
        "reviewer",
        "info_verifier",
        "community_helper",
      ],
      contribution_type: [
        "store_hours",
        "store_photo",
        "store_review",
        "store_tag",
        "contact_info",
        "report_incorrect_info",
        "verify_info",
      ],
    },
  },
} as const
