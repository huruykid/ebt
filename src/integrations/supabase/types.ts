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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_usage_ledger: {
        Row: {
          billable: number | null
          count: number | null
          created_at: string | null
          estimated_cost_usd: number | null
          free_remaining: number | null
          id: string
          month: string
          sku: string
          updated_at: string | null
        }
        Insert: {
          billable?: number | null
          count?: number | null
          created_at?: string | null
          estimated_cost_usd?: number | null
          free_remaining?: number | null
          id?: string
          month: string
          sku: string
          updated_at?: string | null
        }
        Update: {
          billable?: number | null
          count?: number | null
          created_at?: string | null
          estimated_cost_usd?: number | null
          free_remaining?: number | null
          id?: string
          month?: string
          sku?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          body: string
          category_id: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author: string
          body: string
          category_id?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author?: string
          body?: string
          category_id?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      budget_events: {
        Row: {
          action: string
          created_at: string | null
          id: string
          meta: Json | null
          month: string
          threshold: number
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          month: string
          threshold: number
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          month?: string
          threshold?: number
        }
        Relationships: []
      }
      comment_seed_runs: {
        Row: {
          comments_inserted: number | null
          created_at: string
          error_message: string | null
          id: string
          preset_used: string | null
          stores_processed: number | null
          success: boolean
        }
        Insert: {
          comments_inserted?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          preset_used?: string | null
          stores_processed?: number | null
          success?: boolean
        }
        Update: {
          comments_inserted?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          preset_used?: string | null
          stores_processed?: number | null
          success?: boolean
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          store_id?: string
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
      google_places_cache: {
        Row: {
          business_data: Json
          cache_expires_at: string
          created_at: string
          fields_hash: string | null
          fresh_until: string | null
          id: string
          last_updated: string
          params_hash: string | null
          place_id: string | null
          search_query: string
        }
        Insert: {
          business_data: Json
          cache_expires_at?: string
          created_at?: string
          fields_hash?: string | null
          fresh_until?: string | null
          id?: string
          last_updated?: string
          params_hash?: string | null
          place_id?: string | null
          search_query: string
        }
        Update: {
          business_data?: Json
          cache_expires_at?: string
          created_at?: string
          fields_hash?: string | null
          fresh_until?: string | null
          id?: string
          last_updated?: string
          params_hash?: string | null
          place_id?: string | null
          search_query?: string
        }
        Relationships: []
      }
      google_places_sync_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          priority: number
          retry_count: number
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          priority?: number
          retry_count?: number
          status?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          priority?: number
          retry_count?: number
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_places_sync_queue_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "snap_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          category: string | null
          cook_time_minutes: number | null
          cost_per_serving: number | null
          created_at: string
          description: string | null
          featured_image: string | null
          id: string
          ingredients: Json
          instructions: Json
          is_published: boolean | null
          name: string
          nutrition_info: Json | null
          prep_time_minutes: number | null
          published_at: string | null
          servings: number | null
          slug: string
          snap_eligible: boolean | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          cook_time_minutes?: number | null
          cost_per_serving?: number | null
          created_at?: string
          description?: string | null
          featured_image?: string | null
          id?: string
          ingredients: Json
          instructions: Json
          is_published?: boolean | null
          name: string
          nutrition_info?: Json | null
          prep_time_minutes?: number | null
          published_at?: string | null
          servings?: number | null
          slug: string
          snap_eligible?: boolean | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          cook_time_minutes?: number | null
          cost_per_serving?: number | null
          created_at?: string
          description?: string | null
          featured_image?: string | null
          id?: string
          ingredients?: Json
          instructions?: Json
          is_published?: boolean | null
          name?: string
          nutrition_info?: Json | null
          prep_time_minutes?: number | null
          published_at?: string | null
          servings?: number | null
          slug?: string
          snap_eligible?: boolean | null
          updated_at?: string
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
            foreignKeyName: "fk_reviews_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      snap_stores: {
        Row: {
          Additional_Address: string | null
          City: string | null
          County: string | null
          google_business_status: string | null
          google_formatted_address: string | null
          google_formatted_phone_number: string | null
          google_geometry: Json | null
          google_icon: string | null
          google_icon_background_color: string | null
          google_icon_mask_base_uri: string | null
          google_last_updated: string | null
          google_name: string | null
          google_opening_hours: Json | null
          google_photos: Json | null
          google_place_id: string | null
          google_plus_code: string | null
          google_price_level: number | null
          google_rating: number | null
          google_reviews: Json | null
          google_types: Json | null
          google_user_ratings_total: number | null
          google_vicinity: string | null
          google_website: string | null
          Grantee_Name: string | null
          id: string
          Incentive_Program: string | null
          Latitude: number | null
          Longitude: number | null
          ObjectId: string | null
          Record_ID: string | null
          State: string | null
          Store_Name: string | null
          Store_Street_Address: string | null
          Store_Type: string | null
          X: string | null
          Y: string | null
          Zip_Code: string | null
          Zip4: string | null
        }
        Insert: {
          Additional_Address?: string | null
          City?: string | null
          County?: string | null
          google_business_status?: string | null
          google_formatted_address?: string | null
          google_formatted_phone_number?: string | null
          google_geometry?: Json | null
          google_icon?: string | null
          google_icon_background_color?: string | null
          google_icon_mask_base_uri?: string | null
          google_last_updated?: string | null
          google_name?: string | null
          google_opening_hours?: Json | null
          google_photos?: Json | null
          google_place_id?: string | null
          google_plus_code?: string | null
          google_price_level?: number | null
          google_rating?: number | null
          google_reviews?: Json | null
          google_types?: Json | null
          google_user_ratings_total?: number | null
          google_vicinity?: string | null
          google_website?: string | null
          Grantee_Name?: string | null
          id?: string
          Incentive_Program?: string | null
          Latitude?: number | null
          Longitude?: number | null
          ObjectId?: string | null
          Record_ID?: string | null
          State?: string | null
          Store_Name?: string | null
          Store_Street_Address?: string | null
          Store_Type?: string | null
          X?: string | null
          Y?: string | null
          Zip_Code?: string | null
          Zip4?: string | null
        }
        Update: {
          Additional_Address?: string | null
          City?: string | null
          County?: string | null
          google_business_status?: string | null
          google_formatted_address?: string | null
          google_formatted_phone_number?: string | null
          google_geometry?: Json | null
          google_icon?: string | null
          google_icon_background_color?: string | null
          google_icon_mask_base_uri?: string | null
          google_last_updated?: string | null
          google_name?: string | null
          google_opening_hours?: Json | null
          google_photos?: Json | null
          google_place_id?: string | null
          google_plus_code?: string | null
          google_price_level?: number | null
          google_rating?: number | null
          google_reviews?: Json | null
          google_types?: Json | null
          google_user_ratings_total?: number | null
          google_vicinity?: string | null
          google_website?: string | null
          Grantee_Name?: string | null
          id?: string
          Incentive_Program?: string | null
          Latitude?: number | null
          Longitude?: number | null
          ObjectId?: string | null
          Record_ID?: string | null
          State?: string | null
          Store_Name?: string | null
          Store_Street_Address?: string | null
          Store_Type?: string | null
          X?: string | null
          Y?: string | null
          Zip_Code?: string | null
          Zip4?: string | null
        }
        Relationships: []
      }
      store_clicks: {
        Row: {
          clicked_at: string | null
          id: string
          store_id: string
          user_id: string
          user_latitude: number
          user_longitude: number
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          store_id: string
          user_id: string
          user_latitude: number
          user_longitude: number
        }
        Update: {
          clicked_at?: string | null
          id?: string
          store_id?: string
          user_id?: string
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
      store_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          store_id: string
          updated_at: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          comment_text: string
          created_at: string
          id?: string
          store_id: string
          updated_at?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          store_id?: string
          updated_at?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
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
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_reviews: {
        Row: {
          created_at: string | null
          id: string | null
          rating: number | null
          review_text: string | null
          store_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          rating?: number | null
          review_text?: string | null
          store_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          rating?: number | null
          review_text?: string | null
          store_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      public_store_comments: {
        Row: {
          comment_text: string | null
          created_at: string | null
          id: string | null
          store_id: string | null
          updated_at: string | null
          user_name: string | null
        }
        Insert: {
          comment_text?: string | null
          created_at?: string | null
          id?: string | null
          store_id?: string | null
          updated_at?: string | null
          user_name?: string | null
        }
        Update: {
          comment_text?: string | null
          created_at?: string | null
          id?: string | null
          store_id?: string | null
          updated_at?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      reviews_public: {
        Row: {
          created_at: string | null
          id: string | null
          rating: number | null
          review_text: string | null
          store_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          rating?: number | null
          review_text?: string | null
          store_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          rating?: number | null
          review_text?: string | null
          store_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      store_review_stats_secure: {
        Row: {
          average_rating: number | null
          five_star_count: number | null
          four_star_count: number | null
          latest_review_date: string | null
          one_star_count: number | null
          review_count: number | null
          store_id: number | null
          three_star_count: number | null
          two_star_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      cleanup_old_store_clicks: { Args: never; Returns: undefined }
      get_nearby_stores: {
        Args: {
          radius_miles?: number
          result_limit?: number
          store_types?: string[]
          user_lat: number
          user_lng: number
        }
        Returns: {
          city: string
          distance_miles: number
          id: string
          latitude: number
          longitude: number
          state: string
          store_name: string
          store_street_address: string
          store_type: string
          zip_code: string
        }[]
      }
      get_next_sync_batch: {
        Args: { batch_size?: number }
        Returns: {
          city: string
          latitude: number
          longitude: number
          priority: number
          queue_id: string
          state: string
          store_address: string
          store_id: string
          store_name: string
        }[]
      }
      get_store_click_analytics: {
        Args: { days_back?: number; store_id_filter?: string }
        Returns: {
          avg_distance_km: number
          click_count: number
          most_common_region: string
          store_id: string
          unique_users: number
        }[]
      }
      get_stores_with_fresh_google_data: {
        Args: { days_threshold?: number }
        Returns: {
          google_last_updated: string
          google_place_id: string
          id: string
          store_name: string
        }[]
      }
      get_user_stats: {
        Args: { target_user_id?: string }
        Returns: {
          hours_count: number
          photos_count: number
          reviews_count: number
          stores_contributed_to: number
          total_contributions: number
          total_points: number
          user_id: string
          verified_contributions: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_store_click_with_privacy: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_store_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      is_admin_user: { Args: never; Returns: boolean }
      safe_newsletter_subscribe: {
        Args: { subscriber_email: string }
        Returns: Json
      }
      smart_store_search: {
        Args: {
          result_limit?: number
          search_city?: string
          search_state?: string
          search_text?: string
          search_zip?: string
          similarity_threshold?: number
        }
        Returns: {
          city: string
          id: string
          latitude: number
          longitude: number
          similarity_score: number
          state: string
          store_name: string
          store_street_address: string
          store_type: string
          zip_code: string
        }[]
      }
      truncate_coordinates: {
        Args: { lat: number; lng: number }
        Returns: {
          truncated_lat: number
          truncated_lng: number
        }[]
      }
      update_store_with_google_data: {
        Args: {
          p_business_status?: string
          p_formatted_address: string
          p_geometry?: Json
          p_icon?: string
          p_icon_background_color?: string
          p_icon_mask_base_uri?: string
          p_name: string
          p_opening_hours: Json
          p_phone: string
          p_photos: Json
          p_place_id: string
          p_plus_code?: string
          p_price_level?: number
          p_rating: number
          p_reviews?: Json
          p_store_id: string
          p_types?: Json
          p_user_ratings_total: number
          p_vicinity?: string
          p_website: string
        }
        Returns: undefined
      }
      update_sync_queue_status: {
        Args: { error_msg?: string; new_status: string; queue_id: string }
        Returns: undefined
      }
      upsert_usage_ledger: {
        Args: {
          p_billable_inc?: number
          p_cost_inc?: number
          p_count_inc?: number
          p_free_dec?: number
          p_month: string
          p_sku: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
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
