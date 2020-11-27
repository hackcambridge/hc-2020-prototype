import React, { Component } from "react";
import { Layout, Card, Page, Heading, TextStyle, ResourceList, Thumbnail } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";
import { IDashboardProps, ISponsor } from "../../../interfaces/dashboard.interfaces";


interface ISponsorState {
    loaded: boolean,
    sponsors: ISponsor[],
    sponsorLive: boolean,
}

class Sponsor extends Component<IDashboardProps, ISponsorState> {

    state = {
        loaded: false,
        sponsors: [],
        sponsorLive: false,
    }

    componentDidMount() {
        this.loadSponsor();
    }

    render() {
        const { loaded } = this.state;
        return (
            <>
                <div id={"sponsor-schedule"}>
                    <Page title={"Sponsor"}>
                        <Layout key={`${Math.random()}`}>

                        {loaded 
                            ? this.renderSponsor()
                            : <Card sectioned><Heading>Loading sponsors...</Heading></Card>
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

        return (<>{sponsors.map(c => this.renderSponsorChallengeCard(c))}</>);
    }

    private renderSponsorChallengeCard(data: ISponsor) {
        return (
            <Layout.Section oneThird>
            <Card title={data.name} actions={[{content: 'Manage'}]} key={data.id}>
                <Card.Section>
                    <TextStyle variation="subdued">Tier{data.tier}</TextStyle>
                </Card.Section>
                <Card.Section title="Items">
                    <div style={{ padding: "1.5rem" }}>
                        <Heading>{data.tier}</Heading>
                        {data.privileges.trim().length > 0
                            ? <><p style={{ marginBottom: "1rem" }}><em>{data.name}</em></p><p>{data.desc}</p></>
                            : <p><em>{data.name}</em></p>
                        }
                    </div>
                </Card.Section>
            </Card>
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

    private loadSponsor() {
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

export default Sponsor; 