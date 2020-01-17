export interface IDashboardProps {
    baseUrl: string,
    baseStorageUrl: string,
    canApply: boolean,
    user: {
        name: string,
        email: string,
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
    country: string,
    isSubmitted: boolean,
    visaRequired: boolean,
    visaRequiredDate: string,
    acceptedConduct: boolean,
    acceptedPrivacy: boolean,
    acceptedTerms: boolean,
    invited_on: string,
}

export interface ITeamMember {
    user_id: number,
    user_name: string,
    user_email_hash: string,
    team_id: string,
    team_owner: boolean,
}

export interface ISponsorChallenge {
    id: string,
    title: string,
    description: string,
    content: string,
    logoUrl: string,
    slackChannel?: string   
}

export interface IScheduleItem {
    id: string,
    time: string,
    title: string,
    desc: string,
    location: string,
    logoUrl: string,
}