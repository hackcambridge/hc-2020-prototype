export interface IDashboardProps {
    baseUrl: string,
    user: {
        name: string,
        type: string,
    }
}

export interface IApplicationRecord {
    cvFilename: string,
    cvUrl: string,
    questionResponses: { [key: string]: string },
    isSubmitted: boolean,

    reviewed: boolean,
    invited: boolean,
    confirmed: boolean,
    rejected: boolean,
}