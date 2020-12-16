import React, { Component } from "react";
import { withRouter, RouteComponentProps, Link, Switch, Route, Redirect } from "react-router-dom";
import { Layout, Card, MediaCard, Spinner, Page, Heading, TextStyle, ResourceList, Thumbnail } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";
import { IDashboardProps, ISponsor } from "../../../interfaces/dashboard.interfaces";

type IDashboardPropsWithRouter = RouteComponentProps & IDashboardProps;

interface ISponsorState {
    loaded: boolean,
    sponsors: ISponsor[],
    sponsorLive: boolean,
}

class Sponsors extends Component<IDashboardPropsWithRouter, ISponsorState> {

    state = {
        loaded: false,
        sponsors: [],
        sponsorLive: false,
    }

    componentDidMount() {
        this.loadAllSponsors();
    }

    render() {
        const { loaded } = this.state;
        var loading = 
            <div style={{textAlign:"center"}}>
                <Spinner color="teal" /> 
                <Card sectioned><Heading>Loading sponsors...</Heading></Card>
            </div>
        return (
            <>
                <div id={"sponsor-schedule"}>
                    <Page title={"Sponsor"}>
                        <Layout key={`${Math.random()}`}>
                        {loaded 
                            ? this.renderSponsor()
                            : loading
                        }
                        </Layout>
                    </Page>
                </div>
            </>
        );
    }


    private renderSponsor() {
        const { sponsors, sponsorLive } = this.state;
        if(!sponsorLive) {
            return <Card sectioned><Heading>Details will be published soon!</Heading></Card>; 
        }

        if(sponsors.length == 0) {
            return <Card sectioned><Heading>No sponsor to show.</Heading></Card>;
        }

        return (<>{sponsors.map(c => this.renderSponsorCard(c))}</>);
    }

    private renderSponsorCard(data: ISponsor) {
        var logoUrl = "https://media-exp1.licdn.com/dms/image/C560BAQERNw3GMGLaoA/company-logo_200_200/0/1519856895092?e=2159024400&v=beta&t=wdo1GL0aCmBg-RMThc030aMoUk2ZgT7NFxlRlUPG_B0"
        // TODO: Replace with logo URL either on website or on S3 bucket.
        return (
            <Layout.Section oneThird>
            <MediaCard primaryAction={{
                    content: 'Learn more',
                    onAction: () => this.viewSponsor(data)
                }} 
                description="Testing description" 
                popoverActions={[{ content: 'Dismiss', onAction: () => {} }]} 
                title={data.name} portrait={true}
                key={data.id}>
                <img
                    alt=""
                    width="100%"
                    style={{
                    objectFit: "cover",
                    objectPosition: "center"
                    }}
                    src={logoUrl}
                />
                <div style={{ padding: "1.5rem" }}>
                </div>
                </MediaCard>
                {/*
                <div style={{
                    fontWeight: 400,
                    textAlign: "right",
                    fontSize: "2rem",
                    padding: "2rem",
                }}>
                    {data.name}
                </div>
                    {data.logoUrl.trim().length > 0 
                    ? <img style={{
                            maxWidth: "120px",
                            maxHeight: "60px",
                            float: "right",
                            padding: "0 2rem 1rem 0",
                        }} src={data.logoUrl} /> testing
                        
                    : <></>} */}
            </Layout.Section>
        );
    }

    private viewSponsor = (sponsorData: ISponsor) => {
        toast.info("Loading sponsor info...");
        var sponsorId = sponsorData.id;
        this.props.history.push(`${this.props.baseUrl}/sponsors/${sponsorId}`);
        // axios.get("/committee/admin-api/random-application-for-review.json").then(res => {
        //     const status = res.status;
        //     if(status == 200) {
        //         const payload = res.data;
        //         if("success" in payload && payload["success"]) {
        //             const next = +payload["message"];
        //             if (!Number.isNaN(next) && next >= 0) {
        //                 this.props.history.push(`${this.props.baseUrl}/applications/${next}`);
        //             } else {
        //                 toast.error("Couldn't find next application to review");
        //             }
        //         } else {
        //             toast.error(payload["message"]);
        //         }
        //     } else {
        //         toast.error("Failed to load application to review");
        //     }
        // });
    }

    private loadAllSponsors() {
        axios.get(`/sponsors/dashboard-api/get-sponsors.json`).then(res => {
            const status = res.status;
            console.log("Here",res)
            if(status >= 200 && status <= 300) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    const sponsors: ISponsor[] = payload["data"];
                    this.setState({ 
                        sponsors: sponsors.sort((a, b) => (a.name > b.name) ? 1 : -1),
                        sponsorLive: this.props.user.type == "admin",
                        loaded: true
                    });
                    return;
                } else {
                    console.log(payload);
                }
            } else {
                toast.error("Failed to load sponsors");
                this.setState({ loaded: true });
            }
        });
    }
}

export default Sponsors; 