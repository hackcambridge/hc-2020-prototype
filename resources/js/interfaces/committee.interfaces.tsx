export interface ICommitteeProps {
    baseUrl: string,
    user: {
        name: string,
        email: string,
        type: string,
    }
}

export interface IAdminOverview {
    users: number,
    applications: {
        total: number,
    }
}

export interface IApplicationSummary {
    id: number,
    user_id: number,
    name: string,
    email: string,
    hasSubmitted: boolean,
}