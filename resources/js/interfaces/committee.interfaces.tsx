export interface ICommitteeProps {
    baseUrl: string,
    user: IUserDetails,
}

export interface IAdminOverview {
    users: number,
    applications: {
        total: number,
    },
    reviews: { name: string, reviews: number }[]
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
    visaRequired: boolean,
    visaRequiredDate: string,
}

export interface IUserDetails {
    name: string,
    email: string,
    type: string,
    profile: string,
}

export interface IApplicationReview {
    review_details: string,
    review_total: number,
}