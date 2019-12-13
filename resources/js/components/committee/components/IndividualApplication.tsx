import React, { Component } from 'react';
import {withRouter, RouteComponentProps} from 'react-router';
import { Page, Card, SkeletonBodyText, Thumbnail, Layout, Heading, TextContainer, DescriptionList, Button, Link, Badge, Modal, Stack, RangeSlider } from '@shopify/polaris';
import Committee404 from '../Committee404';
import { IApplicationDetail, IUserDetails } from '../../../interfaces/committee.interfaces';
import axios from 'axios';
import { toast } from 'react-toastify';
import md5 from 'md5';
import { textFieldQuestions } from '../../dashboard/components/Apply';
import { RangeSliderValue } from '@shopify/polaris/types/components/RangeSlider';

interface IIndividualApplicationProps {
    applicationId: string
}

interface IIndividualApplicationState {
    applicationId: number | undefined,
    loading: boolean,
    application: IApplicationDetail | undefined,
    user: IUserDetails | undefined,
    cvModalOpen: boolean,
    reviewModalOpen: boolean,
    reviewAnswers: { [id: number]: number },
    reviewTotal: number,
    reviewMax: number,
}


export const reviewQuestions = [
    { id: 1, question: "Technical Ability [0-100, greater is better]", range: 100, step: 5, default: 20 },
    { id: 2, question: "Enthusiasm [0-50, greater is better]", range: 50, step: 5, default: 10 },
    { id: 3, question: "Bonus [0-5]", range: 5, step: 1, default: 0 },
]

class IndividualApplication extends Component<IIndividualApplicationProps & RouteComponentProps, IIndividualApplicationState> {
    
    state = {
        applicationId: undefined,
        loading: true,
        application: undefined,
        user: undefined,
        cvModalOpen: false,
        reviewModalOpen: false,
        reviewAnswers: reviewQuestions.reduce<{ [id: number]: number }>((map, obj) => {
            map[obj.id] = obj.default;
            return map;
        }, {}),
        reviewTotal: reviewQuestions.reduce((a, b) => a + b.default, 0),
        reviewMax: reviewQuestions.reduce((a, b) => a + b.range, 0),
    }
    componentDidMount() {
        const applicationId = +this.props.applicationId;
        if (Number.isNaN(applicationId)) {
            this.setState({ loading: false });
        } else {
            this.retrieveApplication(applicationId);
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
        <Page title={"Loading..."}>
            <Card sectioned>
                <SkeletonBodyText />
            </Card>
        </Page>
    </>;

    private renderApplication = () => {
        const { application, user }: { application: IApplicationDetail | undefined, user: IUserDetails | undefined } = this.state;
        const { cvModalOpen, reviewModalOpen, reviewAnswers, reviewTotal, reviewMax } = this.state;
        if(application && user) {
            const app: IApplicationDetail = application;
            const usr: IUserDetails = user;
            const questions = JSON.parse(app.questionResponses);
            const profile = JSON.parse(usr.profile);
            const cvButton = app.cvUrl.length > 0 
                ? <a style={{ marginTop: "-0.4rem", textDecoration: "none", cursor: "pointer" }} onClick={() => this.setState({ cvModalOpen: true })}><Badge status="success">Open CV</Badge></a>
                : <div style={{ marginTop: "-0.4rem" }}><Badge status="warning">Missing</Badge></div>;
            const cvIFrame = <iframe className="cv-frame" style={{ height: `${window.innerHeight * 0.9}px` }} src={`${app.cvUrl}#view=FitH`}></iframe>;
            return (
                <Page 
                    breadcrumbs={[{content: 'Applications', url: '../applications'}]}
                    title={`${usr.name}`} 
                    subtitle={`Application #${app.id}`}
                    primaryAction={{content: 'Review', onAction: () => this.setState({ reviewModalOpen: true })}}
                    thumbnail={<Thumbnail
                        source={`https://www.gravatar.com/avatar/${md5(usr.email.toLowerCase())}?d=retro&s=200`}
                        size="large"
                        alt={`${usr.name}`}
                    />}
                >
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

                    <Modal
                        size={"Full"}
                        large
                        open={cvModalOpen}
                        onClose={() => this.setState({ cvModalOpen: false })}
                        title="Viewing CV..."
                    >
                        <div className="cv-modal-container">
                            <Modal.Section subdued>{cvIFrame}</Modal.Section>
                        </div>
                    </Modal>

                    <Modal
                        open={reviewModalOpen}
                        onClose={() => this.setState({ reviewModalOpen: false })}
                        title="Review Application"
                        primaryAction={{
                            content: 'Submit',
                            onAction: () => {},
                        }}
                        secondaryActions={[{
                            content: 'Skip',
                            onAction: () => {},
                        }]}
                    >
                        <Modal.Section>
                            <Stack vertical>
                                {reviewQuestions.map(q => {
                                    return (
                                        <Stack.Item>
                                            <RangeSlider
                                                output
                                                label={q.question}
                                                min={0}
                                                max={q.range}
                                                step={q.step}
                                                value={reviewAnswers[q.id]}
                                                onChange={(n) => this.setReviewAnswer(q.id, n)}
                                            />
                                        </Stack.Item>
                                    );
                                })}
                                
                                <Stack.Item>
                                    <p style={{ textAlign: "center", fontWeight: 700, fontSize: "2rem", padding: "2rem 0 0.5rem" }}>Score: {(Math.round((reviewTotal/reviewMax) * 100) / 100).toFixed(2)}/1.00</p>
                                </Stack.Item>
                            </Stack>
                        </Modal.Section>
                    </Modal>
                </Page>
            );
        }
    };

    private invalidApplication = () => {
        return <Committee404 />;
    };

    private retrieveApplication = (applicationId: number) => {
        this.setState({ loading: true });
        axios.post("/committee/admin-api/get-application.json", {
            id: applicationId
        }).then(res => {
            const status = res.status;
            if(status == 200) {
                const payload = res.data;
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

    private randomNextApplication = () => {
        axios.get("/committee/admin-api/random-application-for-review.json").then(res => {
            const status = res.status;
            const currentUrl = this.props.history.location.pathname;
            const base = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
            if(status == 200) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    const next = +payload["message"];
                    if (!Number.isNaN(next) && next >= 0) {
                        this.props.history.push(`${base}/${next}`);
                    } else {
                        toast.error("Invalid next application.");
                        this.props.history.push(`${base}`);
                    }
                } else {
                    toast.error(payload["message"]);
                    this.props.history.push(`${base}`);
                }
            } else {
                toast.error("Failed to load next application.");
                this.props.history.push(`${base}`);
            }
        });
    }

    private setReviewAnswer(id: number, value: number | [number, number]) {
        const { reviewAnswers } = this.state;
        reviewAnswers[id] = Array.isArray(value) ? value[1] : value;
        const vals = reviewQuestions.map((q) => reviewAnswers[q.id]);
        const sum = vals.reduce((a, b) => a + b, 0);
        // const avg = (sum / vals.length) || 0;
        this.setState({ reviewAnswers: reviewAnswers, reviewTotal: sum });
    }
}

export default withRouter(IndividualApplication);