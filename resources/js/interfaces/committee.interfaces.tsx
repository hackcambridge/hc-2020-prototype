export interface ICommitteeProps {
    baseUrl: string,
    user: IUserDetails,
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

export interface IApplicationDetail {
    id: number,
    cvFilename: string,
    cvUrl: string,
    questionResponses: string,
}

export interface IUserDetails {
    name: string,
    email: string,
    type: string,
    profile: string,
}