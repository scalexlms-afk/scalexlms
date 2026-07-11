export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          published_at: string;
          title: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          published_at?: string;
          title: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          published_at?: string;
          title?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          status: Database["public"]["Enums"]["course_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["course_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["course_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          completion_percent: number;
          course_id: string;
          created_at: string;
          enrolled_at: string;
          id: string;
          plan: Database["public"]["Enums"]["plan_type"];
          student_id: string;
          updated_at: string;
        };
        Insert: {
          completion_percent?: number;
          course_id: string;
          created_at?: string;
          enrolled_at?: string;
          id?: string;
          plan?: Database["public"]["Enums"]["plan_type"];
          student_id: string;
          updated_at?: string;
        };
        Update: {
          completion_percent?: number;
          course_id?: string;
          created_at?: string;
          enrolled_at?: string;
          id?: string;
          plan?: Database["public"]["Enums"]["plan_type"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          created_at: string;
          id: string;
          issued_at: string;
          number: string;
          payment_id: string;
          pdf_url: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          issued_at?: string;
          number: string;
          payment_id: string;
          pdf_url?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          issued_at?: string;
          number?: string;
          payment_id?: string;
          pdf_url?: string | null;
        };
        Relationships: [];
      };
      lesson_completions: {
        Row: {
          completed_at: string;
          id: string;
          lesson_id: string;
          student_id: string;
        };
        Insert: {
          completed_at?: string;
          id?: string;
          lesson_id: string;
          student_id: string;
        };
        Update: {
          completed_at?: string;
          id?: string;
          lesson_id?: string;
          student_id?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          content_text: string | null;
          content_type: Database["public"]["Enums"]["lesson_content_type"];
          content_url: string | null;
          created_at: string;
          duration_seconds: number | null;
          id: string;
          module_id: string;
          order_index: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          content_text?: string | null;
          content_type: Database["public"]["Enums"]["lesson_content_type"];
          content_url?: string | null;
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          module_id: string;
          order_index: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          content_text?: string | null;
          content_type?: Database["public"]["Enums"]["lesson_content_type"];
          content_url?: string | null;
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          module_id?: string;
          order_index?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      milestones: {
        Row: {
          color: string | null;
          course_id: string;
          created_at: string;
          icon: string | null;
          id: string;
          order_index: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          color?: string | null;
          course_id: string;
          created_at?: string;
          icon?: string | null;
          id?: string;
          order_index: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          color?: string | null;
          course_id?: string;
          created_at?: string;
          icon?: string | null;
          id?: string;
          order_index?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          created_at: string;
          id: string;
          milestone_id: string;
          order_index: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          milestone_id: string;
          order_index: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          milestone_id?: string;
          order_index?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_plan_settings: {
        Row: {
          created_at: string;
          first_payment_percent: number;
          id: string;
          is_active: boolean;
          plan_key: string;
          remaining_percent: number;
          total_cents: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          first_payment_percent: number;
          id?: string;
          is_active?: boolean;
          plan_key: string;
          remaining_percent: number;
          total_cents: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          first_payment_percent?: number;
          id?: string;
          is_active?: boolean;
          plan_key?: string;
          remaining_percent?: number;
          total_cents?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          method: string | null;
          paid_at: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          stripe_session_id: string | null;
          student_id: string;
          type: Database["public"]["Enums"]["payment_type"];
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          method?: string | null;
          paid_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          stripe_session_id?: string | null;
          student_id: string;
          type: Database["public"]["Enums"]["payment_type"];
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          method?: string | null;
          paid_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          stripe_session_id?: string | null;
          student_id?: string;
          type?: Database["public"]["Enums"]["payment_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          current_stage: string | null;
          email: string;
          id: string;
          level: Database["public"]["Enums"]["student_level"] | null;
          mentor_id: string | null;
          name: string;
          phone: string | null;
          plan: Database["public"]["Enums"]["plan_type"] | null;
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["user_status"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          current_stage?: string | null;
          email: string;
          id: string;
          level?: Database["public"]["Enums"]["student_level"] | null;
          mentor_id?: string | null;
          name: string;
          phone?: string | null;
          plan?: Database["public"]["Enums"]["plan_type"] | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          current_stage?: string | null;
          email?: string;
          id?: string;
          level?: Database["public"]["Enums"]["student_level"] | null;
          mentor_id?: string | null;
          name?: string;
          phone?: string | null;
          plan?: Database["public"]["Enums"]["plan_type"] | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      course_status: "draft" | "published" | "archived";
      lesson_content_type: "video" | "pdf" | "text" | "link";
      payment_status: "pending" | "paid" | "overdue" | "refunded";
      payment_type: "first_payment" | "remaining" | "installment";
      plan_type: "standard" | "premium";
      student_level:
        | "beginner_seller"
        | "research_expert"
        | "brand_builder"
        | "amazon_launcher";
      user_role: "super_admin" | "instructor" | "mentor" | "sales" | "student";
      user_status: "active" | "inactive" | "suspended";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type UserRole = Database["public"]["Enums"]["user_role"];
export type UserStatus = Database["public"]["Enums"]["user_status"];
export type PlanType = Database["public"]["Enums"]["plan_type"];
export type StudentLevel = Database["public"]["Enums"]["student_level"];
export type CourseStatus = Database["public"]["Enums"]["course_status"];
export type LessonContentType =
  Database["public"]["Enums"]["lesson_content_type"];
export type PaymentType = Database["public"]["Enums"]["payment_type"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
export type Module = Database["public"]["Tables"]["modules"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type LessonCompletion =
  Database["public"]["Tables"]["lesson_completions"]["Row"];
export type Announcement =
  Database["public"]["Tables"]["announcements"]["Row"];
