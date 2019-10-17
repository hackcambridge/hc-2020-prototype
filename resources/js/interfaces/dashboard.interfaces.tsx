export interface IDashboardProps {
    baseUrl: string,
    user: {
        name: string,
        type: string,
        application: IApplicationRecord | undefined,
        team: {
            members: ITeamMember[] | undefined,
            id: string,
            owner: boolean,
        }
    }
}

export interface IApplicationRecord extends IApplicationRecordContent {
    reviewed: boolean,
    invited: boolean,
    confirmed: boolean,
    rejected: boolean,
}

export interface IApplicationRecordContent {
    cvFilename: string,
    cvUrl: string,
    questionResponses: string,
    isSubmitted: boolean,
}

export interface ITeamMember {
    user_id: number,
    user_name: string,
    team_id: string,
    team_owner: boolean,
}