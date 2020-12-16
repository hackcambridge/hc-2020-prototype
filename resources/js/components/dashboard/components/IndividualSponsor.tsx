import React, { Component } from 'react';
import {withRouter, RouteComponentProps} from 'react-router';
import { Page, Card, SkeletonBodyText, Thumbnail, Layout, Heading, TextContainer, DescriptionList, Button, Badge, Modal, Stack, RangeSlider, KeyboardKey } from '@shopify/polaris';
import Dashboard404 from '../Dashboard404';
import { ISponsor, IUserDetails } from '../../../interfaces/dashboard.interfaces';
import axios from 'axios';
import { toast } from 'react-toastify';
import md5 from 'md5';
import { textFieldQuestions } from './Apply';
import Linkify from 'linkifyjs/react';

interface IIndividualSponsorProps {
    SponsorId: string
}

interface IIndividualSponsorState {
    SponsorId: number | undefined,
    loading: boolean,
    Sponsor: ISponsor | undefined,
    spon_name: string,
    user: IUserDetails | undefined,
}


export const reviewQuestions = [
    { id: 1, question: "Technical Ability [0-100, greater is better]", range: 100, step: 5, default: 20, weight: 1 },
    { id: 2, question: "Enthusiasm [0-100, greater is better]", range: 100, step: 5, default: 20, weight: 1 },
    { id: 3, question: "Bonus [0-1]", range: 1, step: 1, default: 0, weight: 30, width: "10rem" },
]

class IndividualSponsor extends Component<IIndividualSponsorProps & RouteComponentProps, IIndividualSponsorState> {
    
    state = {
        SponsorId: undefined,
        loading: true,
        Sponsor: undefined,
        user: undefined,
        team: "(None)",
        cvModalOpen: false,
        reviewModalOpen: false,
        reviewAnswers: reviewQuestions.reduce<{ [id: number]: number }>((map, obj) => {
            map[obj.id] = obj.default;
            return map;
        }, {}),
        reviewTotal: reviewQuestions.reduce((a, b) => a + (b.default * b.weight), 0),
        reviewMax: reviewQuestions.reduce((a, b) => a + (b.range * b.weight), 0),
        savingReview: false,
        alreadyReviewed: false,
        isSubmitted: false,
    }

    constructor(props: IIndividualSponsorProps & RouteComponentProps){
        super(props);
    }

    componentDidMount() {
        const SponsorId = +this.props.SponsorId;
        if (Number.isNaN(SponsorId)) {
            this.setState({ loading: false });
        } else {
            this.retrieveSponsor(SponsorId);
        }
    }

    render() {
        const { SponsorId, loading } = this.state;
        return (<>
            { loading 
                ? this.loadingMarkup
                : SponsorId 
                    ? this.renderSponsor()
                    : this.invalidSponsor()
            } 
        </>);
    }

    private loadingMarkup = <>
        <Page title={"Loading..."}>
            <Card sectioned>
                <SkeletonBodyText />
            </Card>
        </Page>
    </>;

    private nextSponsor = () => {
        this.setState({ loading: true });
        // axios.get("/committee/admin-api/random-application-for-review.json").then(res => {
        //     const status = res.status;
        //     const currentUrl = this.props.history.location.pathname;
        //     const base = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
        //     if(status == 200) {
        //         const payload = res.data;
        //         if("success" in payload && payload["success"]) {
        //             const next = +payload["message"];
        //             if (!Number.isNaN(next) && next >= 0) {
        //                 this.props.history.push(`${base}/${next}`);
        //             } else {
        //                 toast.error("Invalid next application.");
        //                 this.props.history.push(`${base}`);
        //             }
        //         } else {
        //             toast.error(payload["message"]);
        //             this.props.history.push(`${base}`);
        //         }
        //     } else {
        //         toast.error("Failed to load next application.");
        //         this.props.history.push(`${base}`);
        //     }
        // });
    }

    private renderSponsor = () => {
        const { sponsor, user }: { sponsor: ISponsor | undefined, user: IUserDetails | undefined } = this.state;
        const { cvModalOpen, reviewModalOpen, reviewAnswers, reviewTotal, reviewMax, savingReview, alreadyReviewed, team } = this.state;
        if(sponsor) {
            console.log("rendering stuff here!",user,sponsor);
            const app: ISponsor = sponsor;
            // const usr: IUserDetails = user;
            // const profile = JSON.parse(usr.profile);
            const metadata = <>
                {alreadyReviewed ? <Badge status="success">Reviewed</Badge> : <></>}
                {/* {usr.type != "hacker" ? <Badge status="warning">{"Type: " + usr.type}</Badge> : <></>} */}
            </>;
            const logoUrl = "https://media-exp1.licdn.com/dms/image/C560BAQERNw3GMGLaoA/company-logo_200_200/0/1519856895092?e=2159024400&v=beta&t=wdo1GL0aCmBg-RMThc030aMoUk2ZgT7NFxlRlUPG_B0"
            return (
                <Page 
                    breadcrumbs={[{content: 'Sponsors', url: '../sponsors'}]}
                    title={`${app.name}`}
                    titleMetadata={metadata}
                    subtitle={`Sponsor #${app.id}`}
                    pagination={{
                        hasPrevious: false,
                        hasNext: true,
                        onNext: this.nextSponsor
                    }}
                    primaryAction={{content: 'Review', destructive: true, onAction: () => {}}}
                    thumbnail={<Thumbnail
                        source={logoUrl}
                        size="large"
                        alt={`${app.name}`}
                    />}
                >
                    <Layout>
                        <Layout.Section secondary>
                            <br />
                            <Card>
                                <div style={{ padding: "0 2rem" }}>
                                    <DescriptionList
                                        items={[
                                            { term: 'Temp', description: "Temp" }]
                                        }
                                    />
                                </div>
                            </Card>
                        </Layout.Section>
                        <Layout.Section>
                            <Card>
                                {textFieldQuestions.map((value) => {
                                    <Linkify tagName="a" options={{ target: {url: '_blank'} }}>
                                        <div style={{ padding: "1.4rem 2rem" }} key={value.id}>
                                            <Heading>{value.title}</Heading>
                                            <br style={{ lineHeight: "3px" }} />
                                            <TextContainer>Test text</TextContainer>
                                        </div>
                                    </Linkify>;
                                })}
                            </Card>
                        </Layout.Section>
                    </Layout>
                </Page>
            );
        }
    };

    private invalidSponsor = () => {
        return <Dashboard404 />;
    };

    private retrieveSponsor = (SponsorId: number) => {
        this.setState({ loading: true });
        axios.get(`/sponsors/dashboard-api/get-sponsors.json`).then(res => {
            const status = res.status;
            console.log("Here",res)
            if(status >= 200 && status <= 300) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    const target: ISponsor = payload["data"].find(sponsor =>{
                        return sponsor.id === SponsorId
                    })
                    this.setState({ 
                        loading: false, 
                        SponsorId: SponsorId,
                        sponsor: target,
                        spon_name: target.name
                        // name:payload["data"]["name"],
                    });
                    //{"id":2,"name":"Chuen","slug":"chuen","tier":"Chuen2","privileges":";swag;resources;workshop;social_media;mentors[42];recruiters[42]","created_at":"2020-10-31 15:27:29","updated_at":"2020-10-31 15:28:08"}
                    return;
                } else {
                    console.log(payload);
                    toast.error(payload["message"]);
                }
            } else {
                toast.error("Failed to load sponsors");
                this.setState({ loading: false });
            }
        });
    }
}

export default withRouter(IndividualSponsor);