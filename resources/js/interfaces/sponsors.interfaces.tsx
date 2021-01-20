export interface ISponsorDashboardProps {
    baseUrl: string;
    user: {
        type: string,
        name: string,
        email: string,
    }
    sponsors: ISponsorData[]
}

export interface ISponsorData {
    id: string,
    name: string,
    slug: string,
    tier: string,
    privileges: string,
    image: string,
}

export interface ISponsorAgent {
    id: number,
    name: string,
    email: string,
    type: string,
}

export interface IResourceDefinition {
    id: number,
    urls: string[],
    name: string,
    type: string,
    description: string,
}

export interface ISwagItemDefinition {
    id: number,
    quantity: string,
    name: string,
    type: string,
    description: string,
}

export interface IAssetInformation {
    name: string,
    url: string
}

export interface SingleItemFormFields {
    title: string,
    description: string,
    files: IAssetInformation[],
}

export interface IPortalDefinition {
    data: {
        description: string,
        url: string,
        "discord invite link": string,
    },
    files: IAssetInformation[],
}
