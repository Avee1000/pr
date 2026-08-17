export interface Profile {
    id: string;
    avatar_url: string | null;
    bio: string | null;
    currency: string;
    locale: string;
    timezone: string;
    date_format: string;
    time_format: string;
    updated_at?: string | null;
    created_at?: string | null;
    country: string;
    phone?: string;
}

