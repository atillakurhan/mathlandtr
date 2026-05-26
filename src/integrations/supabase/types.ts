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
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          ability_de: string | null
          emoji: string
          id: string
          is_starter: boolean
          mentor_for_game: string | null
          name: string
          price: number
        }
        Insert: {
          ability_de?: string | null
          emoji?: string
          id: string
          is_starter?: boolean
          mentor_for_game?: string | null
          name: string
          price?: number
        }
        Update: {
          ability_de?: string | null
          emoji?: string
          id?: string
          is_starter?: boolean
          mentor_for_game?: string | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      classroom_members: {
        Row: {
          classroom_id: string
          id: string
          joined_at: string
          student_id: string
        }
        Insert: {
          classroom_id: string
          id?: string
          joined_at?: string
          student_id: string
        }
        Update: {
          classroom_id?: string
          id?: string
          joined_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_members_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      classrooms: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
          school: string | null
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string
          name: string
          school?: string | null
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          school?: string | null
          teacher_id?: string
        }
        Relationships: []
      }
      owned_characters: {
        Row: {
          character_id: string
          id: string
          is_companion: boolean
          purchased_at: string
          user_id: string
        }
        Insert: {
          character_id: string
          id?: string
          is_companion?: boolean
          purchased_at?: string
          user_id: string
        }
        Update: {
          character_id?: string
          id?: string
          is_companion?: boolean
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owned_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          }
        ]
      }
      owned_items: {
        Row: {
          equipped_on_character: string | null
          id: string
          item_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          equipped_on_character?: string | null
          id?: string
          item_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          equipped_on_character?: string | null
          id?: string
          item_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owned_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          answer_numeric: number | null
          answer_text: string | null
          choices: Json | null
          class_level: number
          classroom_id: string | null
          created_at: string
          created_by: string | null
          difficulty: string
          game: string
          id: string
          locale: string
          owner_type: string | null
          payload: Json | null
          prompt: string
        }
        Insert: {
          answer_numeric?: number | null
          answer_text?: string | null
          choices?: Json | null
          class_level: number
          classroom_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: string
          game: string
          id?: string
          locale?: string
          owner_type?: string | null
          payload?: Json | null
          prompt: string
        }
        Update: {
          answer_numeric?: number | null
          answer_text?: string | null
          choices?: Json | null
          class_level?: number
          classroom_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: string
          game?: string
          id?: string
          locale?: string
          owner_type?: string | null
          payload?: Json | null
          prompt?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          class_level: number
          created_at: string
          game: string
          id: string
          player_name: string
          score: number
          user_id: string | null
        }
        Insert: {
          class_level: number
          created_at?: string
          game: string
          id?: string
          player_name: string
          score?: number
          user_id?: string | null
        }
        Update: {
          class_level?: number
          created_at?: string
          game?: string
          id?: string
          player_name?: string
          score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      streaks: {
        Row: {
          current_days: number
          freeze_used_at: string | null
          last_activity_date: string | null
          longest_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_days?: number
          freeze_used_at?: string | null
          last_activity_date?: string | null
          longest_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_days?: number
          freeze_used_at?: string | null
          last_activity_date?: string | null
          longest_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          coins: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          coins?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          coins?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      wardrobe_items: {
        Row: {
          id: string
          name_de: string
          price: number
          slot: string
          unlock_condition: string | null
        }
        Insert: {
          id: string
          name_de: string
          price?: number
          slot: string
          unlock_condition?: string | null
        }
        Update: {
          id?: string
          name_de?: string
          price?: number
          slot?: string
          unlock_condition?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
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
      app_role: ["admin", "teacher", "student"],
    },
  },
} as const
