export interface ISponsorDashboardProps {
    baseUrl: string;
    user: { 
        type: string, 
        name: string,
    }
    sponsors: ISponsorData[]
}

export interface ISponsorData {
    id: string,
    name: string,
    slug: string,
    tier: string,
    privileges: string,
}

export interface ISponsorAgent {
    id: number,
    name: string,
    email: string,
    type: string,
}