import React, { Component } from "react";
import { Page, Layout, Card, ProgressBar, DisplayText, TextStyle, Subheading } from "@shopify/polaris";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { ISponsorData, SingleItemFormFields } from "../../../interfaces/sponsors.interfaces";
import axios from "axios";

interface ISponsorAdminProps extends RouteComponentProps {
    baseSponsorPath: string,
    sponsor: ISponsorData,
}

interface ISponsorAdminState {
    completeness: number,
    recruiters: number,
    mentors: number,
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
    }

    componentDidMount() {
        this.loadInformation();
    }

    render() {
        const { completeness, mentors, recruiters } = this.state;
        return (
            <Page title={this.props.sponsor.name}>
                <Layout>
                    <Layout.Section>
                        <Card sectioned>
                            <DisplayText size="small"><TextStyle variation="strong">Welcome to Hack Cambridge!</TextStyle></DisplayText>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Posuere urna nec tincidunt praesent semper feugiat. Sagittis eu volutpat odio facilisis. In metus vulputate eu scelerisque felis imperdiet proin fermentum. Vitae congue eu consequat ac felis. A erat nam at lectus urna duis convallis convallis tellus. Facilisi morbi tempus iaculis urna id volutpat lacus laoreet non. Diam vel quam elementum pulvinar etiam non quam lacus. Amet consectetur adipiscing elit duis. Donec et odio pellentesque diam. Ut lectus arcu bibendum at varius vel pharetra vel turpis. Amet luctus venenatis lectus magna fringilla urna porttitor rhoncus. Commodo ullamcorper a lacus vestibulum sed arcu non odio euismod. Eget mauris pharetra et ultrices neque ornare. Ut sem nulla pharetra diam sit amet. Enim ut tellus elementum sagittis vitae et. Ultrices in iaculis nunc sed.</p>
                        </Card>
                    </Layout.Section>
                    <Layout.Section secondary>
                        <Card sectioned>
                            <DisplayText size="small"><TextStyle variation="strong">{Math.round(completeness)}%</TextStyle> completed.</DisplayText>
                            <br />
                            <ProgressBar progress={completeness} size="small" />
                        </Card>
                        <br />
                        <Card sectioned>
                            <DisplayText size="small">You're bringing {recruiters + mentors} {(recruiters + mentors == 1) ? "person" : "people"}.</DisplayText>
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
        axios.post(`/sponsors/dashboard-api/load-resources.json`, {
            sponsor_id: this.props.sponsor.id,
            sponsor_slug: this.props.sponsor.slug,
        }).then(res => {
            const status = res.status;
            if(status == 200) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    const detailWrappers = payload["details"];
                    if(Array.isArray(detailWrappers)) {
                        const details: SponsorDetailModelObject[] = detailWrappers;
                        const percentage = this.calculateCompletenessPercentage(detailWrappers);
                        this.setState({ completeness: percentage });
                        return;
                    }
                }
            }
            console.log(res.data);
        });
    }

    private calculateCompletenessPercentage(details: SponsorDetailModelObject[]): number {
        if(details) {
            const keys = this.props.sponsor.privileges.split(";").filter(p => !p.includes("[") && p.length > 0);
            const foundKeys = details.map(d => d.type);
            const missing = keys.filter(item => foundKeys.indexOf(item) < 0);
            const allowedObjects = details.filter(d => keys.includes(d.type));

            let count = 0;
            allowedObjects.forEach(k => {
                if (k.complete == "yes") count++;
                else if (k.complete == "partial") count = count + 0.5;
            })
            
            return (keys.length > 0) ? 100*(count / keys.length) : 100;
        }
        return 0;
    }
}

export default withRouter(SponsorHome);