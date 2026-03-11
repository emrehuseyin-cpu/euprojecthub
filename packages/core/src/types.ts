export interface Project {
    id: string;
    name: string;
    description: string | null;
    status: 'Aktif' | 'Tamamlandı' | 'Planlandı';
    budget: number;
    program: string;
    created_at: string;
}

export interface Activity {
    id: string;
    project_id: string;
    title: string;
    description: string | null;
    location: string;
    start_date: string;
    end_date: string;
    status: 'Planlandı' | 'Devam Ediyor' | 'Tamamlandı';
}

export interface Participant {
    id: string;
    project_id: string;
    first_name: string;
    last_name: string;
    email: string;
    country: string | null;
}
