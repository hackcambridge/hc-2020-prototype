export interface IDashboardProps {
    baseUrl: string,
    user: {
        name: string,
        type: string,
        application: IApplicationRecord | undefined,
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