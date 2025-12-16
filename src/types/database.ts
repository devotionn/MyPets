export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type UserRole = "user" | "publisher" | "admin";
export type PetSpecies = "dog" | "cat" | "rabbit" | "bird" | "other";
export type PetGender = "male" | "female" | "unknown";
export type PetSize = "small" | "medium" | "large";
export type PetStatus = "available" | "pending" | "adopted";
export type ApplicationStatus = "pending" | "approved" | "rejected" | "withdrawn";
export type NotificationType = "application_received" | "application_status_changed" | "message_received";

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    role: UserRole;
                    display_name: string | null;
                    avatar_url: string | null;
                    bio: string | null;
                    location: string | null;
                    phone: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    role?: UserRole;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    location?: string | null;
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    role?: UserRole;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    location?: string | null;
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            pets: {
                Row: {
                    id: string;
                    publisher_id: string;
                    name: string;
                    species: PetSpecies;
                    breed: string | null;
                    age_years: number;
                    age_months: number;
                    gender: PetGender;
                    size: PetSize;
                    location: string;
                    description: string;
                    health_status: string | null;
                    vaccination_status: string | null;
                    adoption_requirements: string | null;
                    status: PetStatus;
                    photos: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    publisher_id: string;
                    name: string;
                    species: PetSpecies;
                    breed?: string | null;
                    age_years?: number;
                    age_months?: number;
                    gender?: PetGender;
                    size?: PetSize;
                    location: string;
                    description: string;
                    health_status?: string | null;
                    vaccination_status?: string | null;
                    adoption_requirements?: string | null;
                    status?: PetStatus;
                    photos?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    publisher_id?: string;
                    name?: string;
                    species?: PetSpecies;
                    breed?: string | null;
                    age_years?: number;
                    age_months?: number;
                    gender?: PetGender;
                    size?: PetSize;
                    location?: string;
                    description?: string;
                    health_status?: string | null;
                    vaccination_status?: string | null;
                    adoption_requirements?: string | null;
                    status?: PetStatus;
                    photos?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
            };
            adoption_applications: {
                Row: {
                    id: string;
                    pet_id: string;
                    applicant_id: string;
                    status: ApplicationStatus;
                    living_situation: string;
                    has_other_pets: boolean;
                    other_pets_details: string | null;
                    experience_with_pets: string;
                    why_adopt: string;
                    submitted_at: string;
                    reviewed_at: string | null;
                    reviewer_notes: string | null;
                };
                Insert: {
                    id?: string;
                    pet_id: string;
                    applicant_id: string;
                    status?: ApplicationStatus;
                    living_situation: string;
                    has_other_pets?: boolean;
                    other_pets_details?: string | null;
                    experience_with_pets: string;
                    why_adopt: string;
                    submitted_at?: string;
                    reviewed_at?: string | null;
                    reviewer_notes?: string | null;
                };
                Update: {
                    id?: string;
                    pet_id?: string;
                    applicant_id?: string;
                    status?: ApplicationStatus;
                    living_situation?: string;
                    has_other_pets?: boolean;
                    other_pets_details?: string | null;
                    experience_with_pets?: string;
                    why_adopt?: string;
                    submitted_at?: string;
                    reviewed_at?: string | null;
                    reviewer_notes?: string | null;
                };
            };
            favorites: {
                Row: {
                    id: string;
                    user_id: string;
                    pet_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    pet_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    pet_id?: string;
                    created_at?: string;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    type: NotificationType;
                    title: string;
                    message: string;
                    related_id: string | null;
                    is_read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type: NotificationType;
                    title: string;
                    message: string;
                    related_id?: string | null;
                    is_read?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    type?: NotificationType;
                    title?: string;
                    message?: string;
                    related_id?: string | null;
                    is_read?: boolean;
                    created_at?: string;
                };
            };
            messages: {
                Row: {
                    id: string;
                    sender_id: string;
                    receiver_id: string;
                    pet_id: string | null;
                    content: string;
                    is_read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    sender_id: string;
                    receiver_id: string;
                    pet_id?: string | null;
                    content: string;
                    is_read?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    sender_id?: string;
                    receiver_id?: string;
                    pet_id?: string | null;
                    content?: string;
                    is_read?: boolean;
                    created_at?: string;
                };
            };
            success_stories: {
                Row: {
                    id: string;
                    pet_id: string;
                    adopter_id: string;
                    title: string;
                    story: string;
                    photos: string[];
                    is_published: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    pet_id: string;
                    adopter_id: string;
                    title: string;
                    story: string;
                    photos?: string[];
                    is_published?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    pet_id?: string;
                    adopter_id?: string;
                    title?: string;
                    story?: string;
                    photos?: string[];
                    is_published?: boolean;
                    created_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            user_role: UserRole;
            pet_species: PetSpecies;
            pet_gender: PetGender;
            pet_size: PetSize;
            pet_status: PetStatus;
            application_status: ApplicationStatus;
            notification_type: NotificationType;
        };
        CompositeTypes: Record<string, never>;
    };
}

// Helper types for easier usage
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Pet = Database["public"]["Tables"]["pets"]["Row"];
export type AdoptionApplication = Database["public"]["Tables"]["adoption_applications"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type SuccessStory = Database["public"]["Tables"]["success_stories"]["Row"];

// Extended types with relations
export type PetWithPublisher = Pet & {
    publisher: User;
};

export type ApplicationWithDetails = AdoptionApplication & {
    pet: Pet;
    applicant: User;
};
