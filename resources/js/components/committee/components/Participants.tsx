import React, { Component } from 'react';
import { Page, Card, Layout, DescriptionList } from "@shopify/polaris";
import axios from 'axios';
import { toast } from 'react-toastify';
import { IParticipantsOverview } from '../../../interfaces/dashboard.interfaces';


interface IParticipantsProps {

}

interface IParticipantsState {
    isLoading: boolean,
    overview: IParticipantsOverview | undefined,
}


class Participants extends Component<IParticipantsProps, IParticipantsState> {

    state = {
        isLoading: true,
        overview: undefined,
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        const { isLoading, overview } = this.state;
        return (
            <Page title="Participants Overview">
                {isLoading ? <p>Loading...</p> : this.renderLoadedContent(overview)}
            </Page>
        );
    }

    private renderLoadedContent(overview: IParticipantsOverview | undefined) {
        if (!overview) {
            return <p>No data.</p>
        }

        return (
            <Layout>
                <Layout.Section oneHalf>
                    <Card title={"Universities Leaderboard"}>
                        <div style={{ padding: "0 2rem" }}>
                            <DescriptionList
                                items={overview.universities ? overview.universities.sort((a, b) => (a.participants < b.participants) ? 1 : -1).map(u => {
                                    return { term: u.participants, description: u.name };
                                }) : []}
                            />
                        </div>
                    </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                    <Card title={"Majors Leaderboard"}>
                        <div style={{ padding: "0 2rem" }}>
                            <DescriptionList
                                items={overview.majors ? overview.majors.sort((a, b) => (a.participants < b.participants) ? 1 : -1).map(m => {
                                    return { term: m.participants, description: m.name };
                                }) : []}
                            />
                        </div>
                    </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                    <Card title={"Level of Study Leaderboard"}>
                        <div style={{ padding: "0 2rem" }}>
                            <DescriptionList
                                items={overview.levels ? overview.levels.sort((a, b) => (a.participants < b.participants) ? 1 : -1).map(l => {
                                    return { term: l.participants, description: l.name };
                                }) : []}
                            />
                        </div>
                    </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                    <Card title={"Profession Type Leaderboard"}>
                        <div style={{ padding: "0 2rem" }}>
                            <DescriptionList
                                items={overview.professions ? overview.professions.sort((a, b) => (a.participants < b.participants) ? 1 : -1).map(p => {
                                    return { term: p.participants, description: p.name };
                                }) : []}
                            />
                        </div>
                    </Card>
                </Layout.Section>
            </Layout>
        );
    }

    private loadData = () => {
        this.setState({ isLoading: true });
        axios.get(`/dashboard-api/participants-overview.json`).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const overview: IParticipantsOverview = payload["overview"];
                    this.setState({
                        overview: overview,
                        isLoading: false,
                    });
                    return;
                }
            }
            toast.error("Failed to load data.");
            this.setState({ isLoading: false });
        });
    }
}

export default Participants;
