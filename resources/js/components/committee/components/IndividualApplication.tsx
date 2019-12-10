import React, { Component } from 'react';
import {withRouter, RouteComponentProps} from 'react-router';
import { Page, Card, SkeletonBodyText, Thumbnail, Layout, Heading, TextContainer, DescriptionList, Button, Link, Badge } from '@shopify/polaris';
import Committee404 from '../Committee404';
import { IApplicationDetail, IUserDetails } from '../../../interfaces/committee.interfaces';
import axios from 'axios';
import { toast } from 'react-toastify';
import md5 from 'md5';
import { textFieldQuestions } from '../../dashboard/components/Apply';

interface IIndividualApplicationProps {
    applicationId: string
}

interface IIndividualApplicationState {
    applicationId: number | undefined,
    loading: boolean,
    application: IApplicationDetail | undefined,
    user: IUserDetails | undefined,
}


class IndividualApplication extends Component<IIndividualApplicationProps & RouteComponentProps, IIndividualApplicationState> {
    
    state = {
        applicationId: undefined,
        loading: true,
        application: undefined,
        user: undefined,
    }
    componentDidMount() {
        const applicationId = +this.props.applicationId;
        if (Number.isNaN(applicationId)) {
            this.setState({ loading: false });
        } else {
            axios.post("/committee/admin-api/get-application.json", {
                id: applicationId
            }).then(res => {
                const status = res.status;
                if(status == 200) {
                    const payload = res.data;
                    console.log(payload);
                    if("success" in payload && payload["success"]) {
                        const application : IApplicationDetail = payload["application"];
                        const user : IUserDetails = payload["user"];
                        this.setState({ 
                            loading: false, 
                            applicationId: applicationId, 
                            application: application,
                            user: user
                        });
                    } else {
                        toast.error(payload["message"]);
                    }
                } else {
                    toast.error("Failed to load application.");
                }
                
                // console.log(status, res.data);
                this.setState({ loading: false });
            });

        }
    }

    render() {
        const { applicationId, loading } = this.state;
        return (<>
            { loading 
                ? this.loadingMarkup
                : applicationId 
                    ? this.renderApplication()
                    : this.invalidApplication()
            } 
        </>);
    }

    private loadingMarkup = <>
        <Page title={"Loading"}>
            <Card sectioned>
                <SkeletonBodyText />
            </Card>
        </Page>
    </>;

    private renderApplication = () => {
        const { application, user }: { application: IApplicationDetail | undefined, user: IUserDetails | undefined} = this.state;
        if(application && user) {
            const app: IApplicationDetail = application;
            const usr: IUserDetails = user;
            const questions = JSON.parse(app.questionResponses);
            const profile = JSON.parse(usr.profile);
            const cvButton = app.cvUrl.length > 0 
                ? <a style={{ marginTop: "-0.3rem", textDecoration: "none" }} href={app.cvUrl} target="_blank"><Badge status="info">Open CV</Badge></a>
                : <div style={{ marginTop: "-0.3rem" }}><Badge status="warning">Missing</Badge></div>;
            return (
                <Page 
                    breadcrumbs={[{content: 'Applications', url: '../applications'}]}
                    title={`${usr.name}`} 
                    subtitle={`Application #${app.id}`}
                    primaryAction={{content: 'Review', disabled: true}}
                    thumbnail={<Thumbnail
                        source={`https://www.gravatar.com/avatar/${md5(usr.email.toLowerCase())}?d=retro&s=200`}
                        size="large"
                        alt={`${usr.name}`}
                    />}
                    separator>
                    <Layout>
                        <Layout.Section secondary>
                            <Card>
                                <div style={{ padding: "0 2rem" }}>
                                    <DescriptionList
                                        items={[
                                            { term: 'CV', description: cvButton },
                                            { term: 'Email', description: profile["email"] },
                                            { term: 'Gender', description: profile["gender"] },
                                            { term: 'School', description: profile["school"]["name"] },
                                            { term: 'Subject', description: profile["major"] },
                                            { term: 'Level', description: profile["level_of_study"] },
                                        ]}
                                    />
                                </div>
                                {/* <br />
                                {usr.profile} */}
                            </Card>
                        </Layout.Section>
                        <Layout.Section>
                            <Card>
                                {textFieldQuestions.map((value) => {
                                    const answer: string = questions[value.id];
                                    return (<div style={{ padding: "1.4rem 2rem" }} key={value.id}>
                                        <Heading>{value.title}</Heading>
                                        <br style={{ lineHeight: "3px" }} />
                                        <TextContainer>{answer.length > 0 ? answer : "(Blank)"}</TextContainer>
                                    </div>);
                                })}
                            </Card>
                        </Layout.Section>
                    </Layout>
                </Page>
            );
        }
    };

    private invalidApplication = () => {
        return <Committee404 />;
    };

    private retrieveApplication = (applicationId: number) => {

    }
}

export default withRouter(IndividualApplication);