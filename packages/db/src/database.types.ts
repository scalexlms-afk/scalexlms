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
      ai_chat_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "ai_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chats: {
        Row: {
          created_at: string
          id: string
          student_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          student_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          student_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chats_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          published_at: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          published_at?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          metadata: Json | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          earned_at: string
          id: string
          key: string
          student_id: string
        }
        Insert: {
          earned_at?: string
          id?: string
          key: string
          student_id: string
        }
        Update: {
          earned_at?: string
          id?: string
          key?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          channel: Database["public"]["Enums"]["community_channel"]
          content: string
          created_at: string
          id: string
          like_count: number
          status: Database["public"]["Enums"]["post_status"]
          updated_at: string
        }
        Insert: {
          author_id: string
          channel: Database["public"]["Enums"]["community_channel"]
          content: string
          created_at?: string
          id?: string
          like_count?: number
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
        }
        Update: {
          author_id?: string
          channel?: Database["public"]["Enums"]["community_channel"]
          content?: string
          created_at?: string
          id?: string
          like_count?: number
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          status: Database["public"]["Enums"]["course_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["course_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["course_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completion_percent: number
          course_id: string
          created_at: string
          enrolled_at: string
          id: string
          plan: Database["public"]["Enums"]["plan_type"]
          student_id: string
          updated_at: string
        }
        Insert: {
          completion_percent?: number
          course_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          student_id: string
          updated_at?: string
        }
        Update: {
          completion_percent?: number
          course_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          id: string
          incurred_at: string
          note: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by: string
          id?: string
          incurred_at: string
          note?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          id?: string
          incurred_at?: string
          note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          id: string
          issued_at: string
          number: string
          payment_id: string
          pdf_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issued_at?: string
          number: string
          payment_id: string
          pdf_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issued_at?: string
          number?: string
          payment_id?: string
          pdf_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_sales_id: string | null
          converted_user_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          source: string | null
          stage: Database["public"]["Enums"]["lead_stage"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          assigned_sales_id?: string | null
          converted_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          source?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          assigned_sales_id?: string | null
          converted_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          source?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_sales_id_fkey"
            columns: ["assigned_sales_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_user_id_fkey"
            columns: ["converted_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_completions: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          student_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          student_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_completions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_text: string | null
          content_type: Database["public"]["Enums"]["lesson_content_type"]
          content_url: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          module_id: string
          order_index: number
          search_vector: unknown
          title: string
          updated_at: string
        }
        Insert: {
          content_text?: string | null
          content_type: Database["public"]["Enums"]["lesson_content_type"]
          content_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          module_id: string
          order_index: number
          search_vector?: unknown
          title: string
          updated_at?: string
        }
        Update: {
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["lesson_content_type"]
          content_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          module_id?: string
          order_index?: number
          search_vector?: unknown
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          audience: Database["public"]["Enums"]["session_audience"]
          created_at: string
          description: string | null
          host_id: string
          id: string
          meeting_url: string | null
          recording_url: string | null
          scheduled_at: string
          title: string
          type: Database["public"]["Enums"]["live_session_type"]
          updated_at: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["session_audience"]
          created_at?: string
          description?: string | null
          host_id: string
          id?: string
          meeting_url?: string | null
          recording_url?: string | null
          scheduled_at: string
          title: string
          type: Database["public"]["Enums"]["live_session_type"]
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["session_audience"]
          created_at?: string
          description?: string | null
          host_id?: string
          id?: string
          meeting_url?: string | null
          recording_url?: string | null
          scheduled_at?: string
          title?: string
          type?: Database["public"]["Enums"]["live_session_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_calls: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          mentor_id: string
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["mentor_call_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mentor_id: string
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["mentor_call_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mentor_id?: string
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["mentor_call_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_calls_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_calls_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          color: string | null
          course_id: string
          created_at: string
          icon: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          course_id: string
          created_at?: string
          icon?: string | null
          id?: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          course_id?: string
          created_at?: string
          icon?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          id: string
          milestone_id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          milestone_id: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          milestone_id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          payload: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plan_settings: {
        Row: {
          created_at: string
          first_payment_percent: number
          id: string
          is_active: boolean
          plan_key: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          remaining_percent: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_payment_percent: number
          id?: string
          is_active?: boolean
          plan_key: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          remaining_percent: number
          total_cents: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_payment_percent?: number
          id?: string
          is_active?: boolean
          plan_key?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          remaining_percent?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_session_id: string | null
          student_id: string
          type: Database["public"]["Enums"]["payment_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_session_id?: string | null
          student_id: string
          type: Database["public"]["Enums"]["payment_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_session_id?: string | null
          student_id?: string
          type?: Database["public"]["Enums"]["payment_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_stage: string | null
          email: string
          id: string
          level: Database["public"]["Enums"]["student_level"] | null
          mentor_id: string | null
          name: string
          phone: string | null
          plan: Database["public"]["Enums"]["plan_type"] | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_stage?: string | null
          email: string
          id: string
          level?: Database["public"]["Enums"]["student_level"] | null
          mentor_id?: string | null
          name: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_stage?: string | null
          email?: string
          id?: string
          level?: Database["public"]["Enums"]["student_level"] | null
          mentor_id?: string | null
          name?: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          decision: Database["public"]["Enums"]["review_decision"]
          feedback: string | null
          id: string
          reviewed_at: string
          reviewer_id: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          decision: Database["public"]["Enums"]["review_decision"]
          feedback?: string | null
          id?: string
          reviewed_at?: string
          reviewer_id: string
          submission_id: string
        }
        Update: {
          created_at?: string
          decision?: Database["public"]["Enums"]["review_decision"]
          feedback?: string | null
          id?: string
          reviewed_at?: string
          reviewer_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_registrations: {
        Row: {
          registered_at: string
          session_id: string
          student_id: string
        }
        Insert: {
          registered_at?: string
          session_id: string
          student_id: string
        }
        Update: {
          registered_at?: string
          session_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_registrations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          ai_notes: string | null
          ai_score: number | null
          content: Json
          created_at: string
          id: string
          status: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submitted_at: string | null
          task_id: string
          updated_at: string
        }
        Insert: {
          ai_notes?: string | null
          ai_score?: number | null
          content?: Json
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submitted_at?: string | null
          task_id: string
          updated_at?: string
        }
        Update: {
          ai_notes?: string | null
          ai_score?: number | null
          content?: Json
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["submission_status"]
          student_id?: string
          submitted_at?: string | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          body: string
          created_at: string
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          staff_replied_by: string | null
          staff_reply: string | null
          staff_reply_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          student_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          staff_replied_by?: string | null
          staff_reply?: string | null
          staff_reply_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          student_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          staff_replied_by?: string | null
          staff_reply?: string | null
          staff_reply_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          student_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_staff_replied_by_fkey"
            columns: ["staff_replied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          accepted_formats: Database["public"]["Enums"]["submission_format"][]
          created_at: string
          description: string | null
          id: string
          milestone_id: string
          title: string
          updated_at: string
        }
        Insert: {
          accepted_formats?: Database["public"]["Enums"]["submission_format"][]
          created_at?: string
          description?: string | null
          id?: string
          milestone_id: string
          title: string
          updated_at?: string
        }
        Update: {
          accepted_formats?: Database["public"]["Enums"]["submission_format"][]
          created_at?: string
          description?: string | null
          id?: string
          milestone_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: true
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_can_read_course: { Args: { p_course_id: string }; Returns: boolean }
      auth_is_active_student: { Args: never; Returns: boolean }
      auth_is_admin: { Args: never; Returns: boolean }
      auth_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_milestone_unlocked: {
        Args: { p_milestone_id: string; p_student_id: string }
        Returns: boolean
      }
      mentor_owns_student: { Args: { p_student_id: string }; Returns: boolean }
      refresh_enrollment_completion: {
        Args: { p_course_id: string; p_student_id: string }
        Returns: undefined
      }
      search_lessons_context: {
        Args: { query_text: string; result_limit?: number }
        Returns: {
          content_text: string
          id: string
          rank: number
          title: string
        }[]
      }
    }
    Enums: {
      community_channel:
        | "announcements"
        | "product_hunting"
        | "supplier_help"
        | "ppc_discussion"
        | "questions"
        | "student_wins"
      course_status: "draft" | "published" | "archived"
      lead_stage:
        | "new_lead"
        | "contacted"
        | "interested"
        | "demo"
        | "payment_pending"
        | "enrolled"
      lesson_content_type: "video" | "pdf" | "text" | "link"
      live_session_type: "batch_class" | "masterclass" | "qa" | "case_study"
      mentor_call_status: "scheduled" | "completed" | "cancelled" | "no_show"
      payment_status: "pending" | "paid" | "overdue" | "refunded"
      payment_type: "first_payment" | "remaining" | "installment"
      plan_type: "standard" | "premium"
      post_status: "pending_approval" | "approved" | "rejected"
      review_decision: "approved" | "revision_required"
      session_audience: "all_premium" | "selected"
      student_level:
        | "beginner_seller"
        | "research_expert"
        | "brand_builder"
        | "amazon_launcher"
      submission_format: "image" | "excel" | "pdf" | "link" | "text"
      submission_status:
        | "not_started"
        | "submitted"
        | "under_review"
        | "approved"
        | "revision_required"
      ticket_priority: "normal" | "high"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      user_role: "super_admin" | "instructor" | "mentor" | "sales" | "student"
      user_status: "active" | "inactive" | "suspended"
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
      community_channel: [
        "announcements",
        "product_hunting",
        "supplier_help",
        "ppc_discussion",
        "questions",
        "student_wins",
      ],
      course_status: ["draft", "published", "archived"],
      lead_stage: [
        "new_lead",
        "contacted",
        "interested",
        "demo",
        "payment_pending",
        "enrolled",
      ],
      lesson_content_type: ["video", "pdf", "text", "link"],
      live_session_type: ["batch_class", "masterclass", "qa", "case_study"],
      mentor_call_status: ["scheduled", "completed", "cancelled", "no_show"],
      payment_status: ["pending", "paid", "overdue", "refunded"],
      payment_type: ["first_payment", "remaining", "installment"],
      plan_type: ["standard", "premium"],
      post_status: ["pending_approval", "approved", "rejected"],
      review_decision: ["approved", "revision_required"],
      session_audience: ["all_premium", "selected"],
      student_level: [
        "beginner_seller",
        "research_expert",
        "brand_builder",
        "amazon_launcher",
      ],
      submission_format: ["image", "excel", "pdf", "link", "text"],
      submission_status: [
        "not_started",
        "submitted",
        "under_review",
        "approved",
        "revision_required",
      ],
      ticket_priority: ["normal", "high"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      user_role: ["super_admin", "instructor", "mentor", "sales", "student"],
      user_status: ["active", "inactive", "suspended"],
    },
  },
} as const

export type UserRole = Database["public"]["Enums"]["user_role"];
export type UserStatus = Database["public"]["Enums"]["user_status"];
export type PlanType = Database["public"]["Enums"]["plan_type"];
export type StudentLevel = Database["public"]["Enums"]["student_level"];
export type CourseStatus = Database["public"]["Enums"]["course_status"];
export type LessonContentType =
  Database["public"]["Enums"]["lesson_content_type"];
export type PaymentType = Database["public"]["Enums"]["payment_type"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type LeadStage = Database["public"]["Enums"]["lead_stage"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
export type Module = Database["public"]["Tables"]["modules"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Submission = Database["public"]["Tables"]["submissions"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];
export type LessonCompletion =
  Database["public"]["Tables"]["lesson_completions"]["Row"];
export type Announcement =
  Database["public"]["Tables"]["announcements"]["Row"];
export type PaymentPlanSetting =
  Database["public"]["Tables"]["payment_plan_settings"]["Row"];
