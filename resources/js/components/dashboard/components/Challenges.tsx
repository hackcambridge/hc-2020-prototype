import React, { Component } from "react";
import { Layout, Card, Page, Modal, Heading } from "@shopify/polaris";
import ReactMarkdown from "react-markdown";
import { SocialPostMajorMonotone } from "@shopify/polaris-icons";
import axios from 'axios';
import { toast } from "react-toastify";
import { IDashboardProps } from "../../../interfaces/dashboard.interfaces";

interface IChallengesProps {

}

interface IChallengesState {
    loaded: boolean,
    modalContent: string,
    modalShowing: boolean,
    challenges: ISponsorChallenge[],
}

interface ISponsorChallenge {
    description: string,
    content: string,
    logoUrl: string,
    slackChannel?: string   
}

class Challenges extends Component<IDashboardProps, IChallengesState> {

    private slackWorkspaceBaseUrl = "https://hackcambridge101.slack.com/messages/";
    state = {
        loaded: false,
        modalContent: "",
        modalShowing: false,
        challenges: [],
    }

    componentDidMount() {
        this.loadChallenges();
    }

    render() {
        const sponsor: ISponsorChallenge = {
            description: "We would like you to write a game for Avast Secure Browser, taking the theme of 101 and adding a pinch of security or privacy. The game should be playable when the browser is offline, so we're looking for something that a player can engage with quickly and then enjoy for as long as they like.",
            content: "# Prize\n\nprize prize",
            logoUrl: "https://hackcambridge.com/images/sponsors/avast.png",
        };
        const { modalShowing, modalContent, loaded, challenges } = this.state;
        return (
            <>
                <div id={"sponsor-challenges"}>
                    <Page title={"Challenges"}>
                        {loaded 
                            ? this.renderChallenges()
                            : this.interstitial(loaded)
                        }
                    </Page>
                </div>

                <Modal
                    open={modalShowing}
                    onClose={() => this.setState({ modalShowing: false })}
                    title="Avast Prize"
                >
                    <Modal.Section>
                        <ReactMarkdown source={modalContent} className={"markdown-source"} />
                    </Modal.Section>
                </Modal>
            </>
        );
    }

    private interstitial(challenges: ISponsorChallenge[]) {
        return (
            <Card sectioned>
                {challenges.length 
                    ? <Heading>No challenges to show.</Heading>
                    : <Heading>Loading...</Heading>
                }
            </Card>
        );
    }

    private renderChallenges() {
        const { challenges } = this.state;
        if(challenges.length == 0) {
            return <Card sectioned><Heading>No challenges to show.</Heading></Card>;
        }

        return (<>{challenges.map(c => this.renderSponsorChallengeCard(c))}</>);
    }

    private renderSponsorChallengeCard(data: ISponsorChallenge) {
        return (
            <Card key={`${Math.random()}`} sectioned   
                secondaryFooterActions={data.slackChannel ? [{
                    content: 'Slack Channel', icon: SocialPostMajorMonotone, 
                    onAction: () => window.open(`${this.slackWorkspaceBaseUrl}${data.slackChannel}`, '_blank')
                }] : []}
                primaryFooterAction={{
                    content: 'Show Details',
                    onAction: () => this.setState({ modalShowing: true, modalContent: data.content })
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





