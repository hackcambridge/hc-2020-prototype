import React, { Component } from 'react';
import { Page, Button, Card, ResourceList, Avatar, TextStyle, TextContainer, Heading, Filters, Stack, Layout, DescriptionList } from "@shopify/polaris";
import axios from 'axios';
import { toast } from 'react-toastify';
import { IAdminOverview } from '../../../interfaces/committee.interfaces';


interface IAdminOverviewProps {

}

interface IAdminOverviewState {
    isLoading: boolean,
    overview: IAdminOverview | undefined,
}


class Overview extends Component<IAdminOverviewProps, IAdminOverviewState> {

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
            <Page title="Admin Overview">
                {isLoading ? <p>Loading...</p> : this.renderLoadedContent(overview)}
            </Page>
        );
    }

    private renderLoadedContent(overview: IAdminOverview | undefined) {
        if(!overview) {
            return <p>No data.</p>
        }

        return (
            <Layout>
                <Layout.Section oneHalf>
                    <Card sectioned title={""}>
                        <Stack>
                            <Button monochrome outline>{`${overview.users}`} registrations</Button>
                            <Button url={`applications`} monochrome outline>{`${overview.applications.total}`} applications</Button>
                        </Stack>
                    </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                    <Card title={"Review Leaderboard"}>
                        <div style={{ padding: "0 2rem" }}>
                            <DescriptionList
                                items={overview.reviews.sort((a, b) => (a.reviews > b.reviews) ? 1 : -1).map(r => {
                                    return { term: r.reviews, description: r.name };
                                })}
                            />
                        </div>
                    </Card>
                </Layout.Section>
            </Layout>
        );
    }

    private loadData = () => {
        this.setState({ isLoading: true });
        axios.get(`/committee/admin-api/admin-overview.json`).then(res => {
            const status = res.status;
            if(status == 200) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    const overview: IAdminOverview = payload["overview"];
                    console.log(overview);
                    this.setState({ 
                        overview: overview,
                        isLoading: false,
                    });
                    return;
                }
            }
            toast.error("Failed to load data.");
            // console.log(status, res.data);
            this.setState({ isLoading: false });
        });
    }
}

export default Overview;