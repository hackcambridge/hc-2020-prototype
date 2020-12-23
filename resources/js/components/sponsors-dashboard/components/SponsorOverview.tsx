import React, { Component } from "react";
import { Page, Card, ProgressBar, Layout, DisplayText, Stack, TextStyle, ResourceList, ResourceItem } from "@shopify/polaris";
import { ISponsorData } from "../../../interfaces/sponsors.interfaces";
import axios from "axios";

interface ISponsorOverview {
    sponsorData: ISponsorData[],
}

interface ISponsorStatusDisplay {
    sponsorName: string,
    complete: number,
}

interface SponsorDetailModelObject {
    id: number,
    payload: string,
    complete: string,
    type: string,
}

class SponsorOverview extends Component<ISponsorOverview> {

    state = {
        completeness: new Map(),
    }

    componentDidMount() {
        this.loadInformation();
    }

    render() {
        const { completeness } = this.state;
        const items = this.props.sponsorData.map(sponsor => {
            return {
                sponsorName: sponsor.name,
                complete: completeness.get(sponsor.slug),
            } as ISponsorStatusDisplay;
        });

        return (
            <Page title={"Overview"}>
                <Layout>
                    <Layout.Section>
                        <Card title="Statuses">
                            <Card.Section>
                                <ResourceList resourceName={{ singular: 'status', plural: 'statuses' }}
                                    items={items}
                                    renderItem={(item: ISponsorStatusDisplay) => {
                                        const { sponsorName, complete } = item;
                                        return ( <ResourceItem>
                                            <Stack>
                                                <Stack.Item fill><DisplayText size="medium">{sponsorName}</DisplayText></Stack.Item>
                                                <Stack.Item>
                                                    {completeness ?
                                                        <DisplayText size="small"><TextStyle variation="strong">{Math.round(complete)}%</TextStyle> completed.</DisplayText> :
                                                        <DisplayText size="small">Loading...</DisplayText>
                                                    }
                                                    <br />
                                                    <ProgressBar progress={complete} size="small" />
                                                </Stack.Item>
                                            </Stack>
                                        </ResourceItem>);
                                    }}
                                />
                            </Card.Section>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    private loadInformation() {
        this.props.sponsorData.forEach(sponsor => {
            axios.post(`/sponsors/dashboard-api/load-resources.json`, {
                sponsor_id: sponsor.id,
                sponsor_slug: sponsor.slug,
            }).then(res => {
                const status = res.status;
                if (status == 200) {
                    const payload = res.data;
                    if ("success" in payload && payload["success"]) {
                        const detailWrappers = payload["details"];
                        console.log(payload);
                        if (Array.isArray(detailWrappers)) {
                            const percentage = this.calculateCompletenessPercentage(detailWrappers, sponsor);
                            let completenessTrack = this.state.completeness;
                            completenessTrack.set(sponsor.slug, percentage);
                            this.setState({ completeness: completenessTrack });
                            return;
                        }
                    }
                }
            });
        });

    }

    private calculateCompletenessPercentage(details: SponsorDetailModelObject[], sponsor: ISponsorData): number {
        if (details) {
            const keys = sponsor.privileges.split(";").filter(p => !p.includes("[") && p.length > 0);
            const allowedObjects = details.filter(d => keys.includes(d.type));

            let count = 0;
            allowedObjects.forEach(k => {
                if (k.complete == "yes") count++;
                else if (k.complete == "partial") count = count + 0.5;
            })

            return (keys.length > 0) ? 100 * (count / keys.length) : 100;
        }
        return 0;
    }
}

export default SponsorOverview;
