import React, { Component } from "react";
import { Page, Layout, Card, ProgressBar, DisplayText, TextStyle, Subheading } from "@shopify/polaris";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ISponsorData } from "../../../interfaces/sponsors.interfaces";
import axios from "axios";

interface ISponsorAdminProps extends RouteComponentProps {
    baseSponsorPath: string,
    sponsor: ISponsorData,
}

interface ISponsorAdminState {
    completeness: number,
    recruiters: number,
    mentors: number,
    loading: boolean,
}

interface SponsorDetailModelObject {
    id: number,
    payload: string,
    complete: string,
    type: string,
}

class SponsorHome extends Component<ISponsorAdminProps, ISponsorAdminState> {

    state = {
        completeness: 0,
        recruiters: 0,
        mentors: 0,
        loading: true,
    }

    componentDidMount() {
        this.loadInformation();
    }

    render() {
        const { completeness, mentors, recruiters, loading } = this.state;
        return (
            <Page title={this.props.sponsor.name}>
                <Layout>
                    <Layout.Section>
                        <Card sectioned>
                            <DisplayText size="small"><TextStyle variation="strong">Welcome to Hex Cambridge!</TextStyle></DisplayText>
                            <br style={{ lineHeight: "0.8rem" }} />
                            <p>We are extremely delighted to have <strong>{this.props.sponsor.name}</strong> onboard with Hex Cambridge this year.</p>
                            <br style={{ lineHeight: "0.8rem" }} />
                            <p>In this portal, you will be able to provide all of the information that we need in order for us to run Hex Cambridge smoothly. This would include information about your attending recruiters and mentors, details about your API, the swag that you would like to distribute, and other crucial pieces of information.</p>
                            <br style={{ lineHeight: "0.8rem" }} />
                            <p>Please do take your time to explore our Sponsors Portal, and fill in all the relevant details to the best of your knowledge.<br></br>The more information that you can provide, the better it is for us!<br />Do send us an email if you have any issues or questions regarding our portal.</p>
                        </Card>
                    </Layout.Section>
                    <Layout.Section secondary>
                        <Card sectioned>
                            <Subheading>Package:</Subheading>
                            <div style={{ wordBreak: "break-word", textAlign: "center" }}><DisplayText size={this.props.sponsor.tier.length < 10 ? "medium" : "small"}><TextStyle variation="strong">{this.props.sponsor.tier}</TextStyle></DisplayText></div>
                        </Card>
                        <br />
                        <Card sectioned>
                            {loading ?
                                <DisplayText size="small">Loading...</DisplayText> :
                                <DisplayText size="small"><TextStyle variation="strong">{Math.round(completeness)}%</TextStyle> completed.</DisplayText>
                            }
                            <br />
                            <ProgressBar progress={completeness} size="small" />
                        </Card>
                        <br />
                        <Card sectioned>
                            {loading ?
                                <DisplayText size="small">Loading...</DisplayText> :
                                <DisplayText size="small">You're bringing {recruiters + mentors} {(recruiters + mentors == 1) ? "person" : "people"}.</DisplayText>
                            }
                            {/* <Subheading>You're bringing;</Subheading> */}
                            {/* <div style={{ textAlign: "left" }}>
                                <DisplayText size="small">
                                    <TextStyle variation="strong">{recruiters} / 4 recruiters</TextStyle><br />
                                    <TextStyle variation="strong">{mentors} / 4 mentors</TextStyle>
                                </DisplayText>
                            </div> */}
                        </Card>
                    </Layout.Section>
                </Layout>

                <br /><br />
                <Layout>
                    {/* <Layout.Section><Card sectioned title="FAQs"></Card></Layout.Section> */}
                    {/* <Layout.Section oneThird><Card sectioned title="Two"></Card></Layout.Section>
                    <Layout.Section oneThird><Card sectioned title="Three"></Card></Layout.Section> */}
                </Layout>
            </Page>
        );
    }

    private loadInformation() {
        this.setState({ loading: true });
        axios.post(`/sponsors/dashboard-api/load-resources.json`, {
            sponsor_id: this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const detailWrappers = payload["details"];
                    console.log(payload);
                    if (Array.isArray(detailWrappers)) {
                        // const details: SponsorDetailModelObject[] = detailWrappers;
                        const percentage = this.calculateCompletenessPercentage(detailWrappers);
                        this.setState({
                            loading: false,
                            completeness: percentage,
                            recruiters: +payload["recruiters"],
                            mentors: +payload["mentors"],
                        });
                        return;
                    }
                }
            }
            console.log(res.data);
            this.setState({ loading: false });
        });
    }

    private calculateCompletenessPercentage(details: SponsorDetailModelObject[]): number {
        if (details) {
            const keys = this.props.sponsor.privileges.split(";").filter(p => !p.includes("[") && p.length > 0);
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

export default withRouter(SponsorHome);
