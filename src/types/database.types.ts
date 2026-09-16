export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserType = 'voyageur' | 'animateur';
export type MissionStatus = 'active' | 'completed';
export type StructureStatus = 'à valider playlife' | 'validée' | 'refusée';
export type MediaType = 'photo' | 'video';

type Table<Row, Required extends keyof Row = never> = {
    Row: Row;
    Insert: Partial<Row> & Pick<Row, Required>;
    Update: Partial<Row>;
    Relationships: [];
};

export interface Database {
    public: {
        Tables: {
            profiles: Table<{
                id: string;
                full_name: string | null;
                email: string | null;
                avatar_url: string | null;
                role: string | null;
                user_type: UserType | null;
                is_super_admin: boolean | null;
                created_at: string;
                updated_at: string;
            }, 'id'>;
            missions: Table<{
                id: string;
                title: string;
                description: string | null;
                location: string | null;
                start_date: string | null;
                end_date: string | null;
                image_url: string | null;
                mission_type: UserType | null;
                country: string | null;
                city: string | null;
                status: MissionStatus | null;
                fundraising_url: string | null;
                visible: boolean | null;
                created_at: string;
                created_by: string | null;
            }, 'title'>;
            mission_media: Table<{
                id: string;
                mission_id: string;
                media_url: string;
                media_type: MediaType;
                caption: string | null;
                created_at: string;
                created_by: string | null;
            }, 'mission_id' | 'media_url' | 'media_type'>;
            structures: Table<{
                id: string;
                name: string;
                description: string | null;
                type: string | null;
                address: string | null;
                postal_code: string | null;
                city: string | null;
                country: string | null;
                contact_name: string | null;
                contact_email: string | null;
                contact_phone: string | null;
                website_url: string | null;
                image_url: string | null;
                status: StructureStatus | null;
                validated_by_playlife: boolean | null;
                origin_info: string | null;
                created_by: string | null;
                created_at: string;
            }, 'name'>;
            site_config: Table<{
                key: string;
                value: Json;
                updated_at: string | null;
                updated_by: string | null;
            }, 'key' | 'value'>;
        };
        Views: { [_ in never]: never };
        Functions: { [_ in never]: never };
        Enums: { [_ in never]: never };
        CompositeTypes: { [_ in never]: never };
    };
}

type Tables = Database['public']['Tables'];
export type Profile = Tables['profiles']['Row'];
export type Mission = Tables['missions']['Row'];
export type MissionMedia = Tables['mission_media']['Row'];
export type Structure = Tables['structures']['Row'];

export interface ImpactMetrics {
    value1: string;
    label1: string;
    value2: string;
    label2: string;
}
