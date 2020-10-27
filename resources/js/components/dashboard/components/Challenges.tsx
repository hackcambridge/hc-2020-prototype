import React, { Component } from "react";
import { Layout, Card, Page, Modal, Heading } from "@shopify/polaris";
import ReactMarkdown from "react-markdown";
import { SocialPostMajor } from "@shopify/polaris-icons";
import axios from 'axios';
import { toast } from "react-toastify";
import { IDashboardProps, ISponsorChallenge } from "../../../interfaces/dashboard.interfaces";


interface IChallengesState {
    loaded: boolean,
    modalContent: string,
    modalShowing: boolean,
    modalTitle: string,
    challenges: ISponsorChallenge[],
    challengesLive: boolean,
}

class Challenges extends Component<IDashboardProps, IChallengesState> {

    private slackWorkspaceBaseUrl = "https://hackcambridge101.slack.com/app_redirect?channel=";
    state = {
        loaded: false,
        modalContent: "",
        modalTitle: "",
        modalShowing: false,
        challenges: [],
        challengesLive: false,
    }

    componentDidMount() {
        this.loadChallenges();
    }

    render() {
        const { modalShowing, modalContent, modalTitle, loaded } = this.state;
        return (
            <>
                <div id={"sponsor-challenges"}>
                    <Page title={"Challenges"}>
                        {loaded 
                            ? this.renderChallenges()
                            : <Card sectioned><Heading>Loading challenges...</Heading></Card>
                        }
                    </Page>
                </div>

                <Modal
                    open={modalShowing}
                    onClose={() => this.setState({ modalShowing: false })}
                    title={modalTitle}
                >
                    <Modal.Section>
                        <ReactMarkdown source={modalContent} className={"markdown-source markdown-body"} />
                        <br />
                    </Modal.Section>
                </Modal>
            </>
        );
    }


    private renderChallenges() {
        const { challenges, challengesLive } = this.state;
        if(!challengesLive) {
            return <Card sectioned><Heading>Details will be published soon!</Heading></Card>; 
        }

        if(challenges.length == 0) {
            return <Card sectioned><Heading>No challenges to show.</Heading></Card>;
        }

        return (<>{challenges.map(c => this.renderSponsorChallengeCard(c))}</>);
    }

    private renderSponsorChallengeCard(data: ISponsorChallenge) {
        return (
            <Card key={`${Math.random()}`} sectioned   
                secondaryFooterActions={data.slackChannel ? [{
                    content: 'Slack Channel', icon: SocialPostMajor, 
                    onAction: () => window.open(`${this.slackWorkspaceBaseUrl}${data.slackChannel}`, '_blank')
                }] : []}
                primaryFooterAction={{
                    content: 'Show Details',
                    onAction: () => this.setState({ modalShowing: true, modalContent: data.content, modalTitle: data.title })
                }}
            >
                <Layout>
                <Layout.Section secondary>
                    <div className={"sponsor-challenge-logo"}>
                        <img src={data.logoUrl} />
                    </div>
                </Layout.Section>
                <Layout.Section>
                    <div className={"sponsor-challenge-content"}>
                        <p>{data.description}</p>
                    </div>
                </Layout.Section>
                </Layout>
            </Card>
        );
    }

    private dataUrl = `${this.props.baseStorageUrl}event-data/challenges.json`;
    private loadChallenges() {
        axios.get(this.dataUrl).then(res => {
            const status = res.status;
            if(status >= 200 && status <= 300) {
                const payload = res.data;
                if("challenges" in payload) {
                    const challenges: ISponsorChallenge[] = payload["challenges"];
                    this.setState({
                        challenges: challenges,
                        challengesLive: payload["live"] || this.props.user.type == "admin",
                        loaded: true
                    });
                }
            } else {
                toast.error("Failed to load challenges");
                this.setState({ loaded: true });
            }
        });
    }
}

export default Challenges; 





