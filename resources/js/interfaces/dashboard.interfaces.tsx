import { IAssetInformation } from "./sponsors.interfaces";

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

export interface IUserDetails {
    name: string,
    email: string,
    type: string,
    profile: string,
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
    resourceLink: string,
    discordChannel?: string,
}

export interface IScheduleItem {
    id: string,
    time: string,
    title: string,
    desc: string,
    location: string,
    logoUrl: string,
}

export interface ISponsor {
    id: string,
    name: string,
    tier: string,
    payload: string,
    slug: string,
}

export interface IFAQItem {
    id: string,
    title: string,
    answer: string,
}

export interface IParticipantsOverview {
    universities: { name: string, participants: number }[],
    majors: { name: string, participants: number }[],
    professions: { name: string, participants: number }[],
    levels: { name: string, participants: number }[],
}

export interface IResourceCard {
    title: string,
    description: string,
    files: IAssetInformation[],
    mainType: string,
}
