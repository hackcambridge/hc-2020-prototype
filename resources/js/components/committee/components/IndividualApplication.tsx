import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Page, Card, SkeletonBodyText, Layout, Heading, TextContainer, DescriptionList, Button, Badge, Modal, Stack, RangeSlider, KeyboardKey, Avatar } from '@shopify/polaris';
import Committee404 from '../Committee404';
import { IApplicationDetail, IUserDetails, IApplicationReview } from '../../../interfaces/committee.interfaces';
import axios from 'axios';
import { toast } from 'react-toastify';
import md5 from 'md5';
import { textFieldQuestions } from '../../dashboard/components/Apply';
import Linkify from 'linkifyjs/react';

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
    savingReview: boolean,
    alreadyReviewed: boolean,
    isSubmitted: boolean,
    team: string,
}


export const reviewQuestions = [
    { id: 1, question: "Technical Ability [0-1], greater is better", range: 100, step: 5, default: 20, weight: 1 },
    { id: 2, question: "Enthusiasm [0-1], greater is better", range: 100, step: 5, default: 20, weight: 1 },
    { id: 3, question: "Bonus [0-1]", range: 1, step: 1, default: 0, weight: 30, width: "10rem" },
]

class IndividualApplication extends Component<IIndividualApplicationProps & RouteComponentProps, IIndividualApplicationState> {

    state = {
        applicationId: undefined,
        loading: true,
        application: undefined,
        user: undefined,
        team: "(None)",
        cvModalOpen: false,
        reviewModalOpen: false,
        reviewAnswers: reviewQuestions.reduce<{ [id: number]: number }>((map, obj) => {
            map[obj.id] = obj.default;
            return map;
        }, {}),
        reviewTotal: reviewQuestions.reduce((a, b) => a + (b.default * b.weight), 0),
        reviewMax: reviewQuestions.reduce((a, b) => a + (b.range * b.weight), 0),
        savingReview: false,
        alreadyReviewed: false,
        isSubmitted: false,
    }

    constructor(props: IIndividualApplicationProps & RouteComponentProps) {
        super(props);
        this.arrowFunctions = this.arrowFunctions.bind(this);
    }

    arrowFunctions(event: KeyboardEvent) {
        const { cvModalOpen, isSubmitted } = this.state;
        if (event.code === "Space") { // space
            this.setState({ cvModalOpen: !cvModalOpen });
        }
        if (event.code === "ArrowDown") { // down
            this.setState({ cvModalOpen: false });
        }
        if (event.code === "ArrowRight") { // right
            this.setState({ reviewModalOpen: true && isSubmitted });
        }
        if (event.code === "ArrowUp") { // up
            this.setState({ cvModalOpen: true });
        }
        if (event.code === "ArrowLeft") { // left
            this.setState({ reviewModalOpen: false });
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.arrowFunctions, false);
        const applicationId = +this.props.applicationId;
        if (Number.isNaN(applicationId)) {
            this.setState({ loading: false });
        } else {
            this.retrieveApplication(applicationId);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.arrowFunctions, false);
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
        const { cvModalOpen, reviewModalOpen, reviewAnswers, reviewTotal, reviewMax, savingReview, alreadyReviewed, team } = this.state;
        if (application && user) {
            const app: IApplicationDetail = application;
            const usr: IUserDetails = user;
            const questions = JSON.parse(app.questionResponses);
            const profile = JSON.parse(usr.profile);
            const cvButton = app.cvUrl.length > 0
                ? <a style={{ marginTop: "-0.4rem", textDecoration: "none", cursor: "pointer" }} onClick={() => this.setState({ cvModalOpen: true })}><Button fullWidth primary>View CV</Button></a>
                : <div style={{ marginTop: "-0.4rem" }}><Button disabled fullWidth primary>CV missing</Button></div>;

            const cvIFrame = (app.cvUrl || app.cvUrl.length > 0)
                ? <iframe className="cv-frame" style={{ height: `${window.innerHeight * 0.85}px` }} src={`https://docs.google.com/viewer?url=${app.cvUrl}&embedded=true`}></iframe>
                : <div style={{ height: `${window.innerHeight * 0.85}px`, padding: "1rem", width: "100%", textAlign: "center" }}>No file found</div>;

            const metadata = <>
                {alreadyReviewed ? <Badge status="success">Reviewed</Badge> : <></>}
                {!app.isSubmitted ? <Badge status="attention">Not submitted</Badge> : <></>}
                {usr.type != "hacker" ? <Badge status="warning">{"Type: " + usr.type}</Badge> : <></>}
            </>;
            const reviewable = app.isSubmitted && usr.type == "hacker";
            return (
                <Page
                    breadcrumbs={[{ content: 'Applications', url: '../applications' }]}
                    title={`${usr.name}`}
                    titleMetadata={metadata}
                    subtitle={`Application #${app.id}`}
                    pagination={{
                        hasPrevious: false,
                        hasNext: true,
                        onNext: this.randomNextApplication
                    }}
                    primaryAction={{ content: 'Review', disabled: !reviewable, destructive: true, onAction: () => this.setState({ reviewModalOpen: true }) }}
                    thumbnail={<Avatar
                        customer={true}
                        source={`https://www.gravatar.com/avatar/${md5(usr.email.toLowerCase())}?d=retro&s=200`}
                        size="large"
                        name={`${usr.name}`}
                        accessibilityLabel={`${usr.name}`}
                    />}
                >
                    <Layout>
                        <Layout.Section secondary>
                            {cvButton}
                            <br />
                            <Card>
                                <div style={{ padding: "0 1.5rem" }}>
                                    <DescriptionList
                                        items={[
                                            { term: 'Email', description: profile["email"] || "" },
                                            { term: 'Gender', description: profile["gender"] || "" },
                                            { term: 'School', description: "school" in profile ? (profile["school"]["name"] || "") : "" },
                                            { term: 'Subject', description: profile["major"] || "" },
                                            { term: 'Level', description: profile["level_of_study"] || "" },
                                            { term: 'Team', description: team }
                                        ]
                                            .concat(
                                                app.visaRequired ?
                                                    [{ term: 'Visa Deadline', description: new Date(app.visaRequiredDate).toDateString() }]
                                                    : []
                                            )}
                                    />
                                </div>
                            </Card>
                        </Layout.Section>
                        <Layout.Section>
                            <Card>
                                {textFieldQuestions.map((value) => {
                                    const answer: string = questions[value.id];
                                    const answerMarkup = answer.length > 0 ? answer.split('\n').map(i => {
                                        return <TextContainer key={i.length}>{i}</TextContainer>
                                    }) : <TextContainer>(Blank)</TextContainer>;
                                    return (<Linkify tagName="a" options={{ target: { url: '_blank' } }} key={value.id}>
                                        <div style={{ padding: "1.4rem 2rem" }}>
                                            <Heading>{value.title}</Heading>
                                            <br style={{ lineHeight: "3px" }} />
                                            {answerMarkup}
                                        </div>
                                    </Linkify>);
                                })}
                            </Card>
                        </Layout.Section>
                    </Layout>

                    <br />
                    <Card sectioned title="Hotkeys">
                        <KeyboardKey>↑</KeyboardKey> to open the CV preview, <KeyboardKey>↓</KeyboardKey> to close it. &nbsp;<KeyboardKey>→</KeyboardKey> to open the review form, <KeyboardKey>←</KeyboardKey> to close it.
                    </Card>

                    <Modal
                        key={1}
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
                        key={2}
                        open={reviewModalOpen}
                        onClose={() => this.setState({ reviewModalOpen: false })}
                        title="Review Application"
                        primaryAction={{
                            content: 'Submit',
                            onAction: this.saveReview,
                        }}
                        loading={savingReview}
                    >
                        <Modal.Section>
                            <Stack vertical>
                                {reviewQuestions.map(q => {
                                    return (
                                        <Stack.Item key={q.id}>
                                            <div style={{ width: (q.width || "100%"), maxWidth: "100%" }}>
                                                <RangeSlider
                                                    key={q.id}
                                                    output
                                                    label={q.question}
                                                    min={0}
                                                    max={q.range}
                                                    step={q.step}
                                                    value={reviewAnswers[q.id]}
                                                    onChange={(n) => this.setReviewAnswer(q.id, n)}
                                                />
                                            </div>
                                        </Stack.Item>
                                    );
                                })}

                                <Stack.Item key={-1}>
                                    <p style={{ textAlign: "center", fontWeight: 700, fontSize: "2rem", padding: "2rem 0 0.5rem" }}>Score: {(Math.round((reviewTotal / reviewMax) * 100) / 100).toFixed(2)}/1.00</p>
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
        this.setState({ loading: true, cvModalOpen: false, reviewModalOpen: false });
        axios.post("/committee/admin-api/get-application.json", {
            id: applicationId
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const application: IApplicationDetail = payload["application"];
                    const user: IUserDetails = payload["user"];
                    const team: string = payload["team"];
                    this.setState({
                        loading: false,
                        applicationId: applicationId,
                        application: application,
                        team: team,
                        user: user,
                        reviewAnswers: reviewQuestions.reduce<{ [id: number]: number }>((map, obj) => {
                            map[obj.id] = obj.default;
                            return map;
                        }, {}),
                        reviewTotal: reviewQuestions.reduce((a, b) => a + (b.default * b.weight), 0),
                        alreadyReviewed: false,
                        isSubmitted: application.isSubmitted,
                    });

                    const review: IApplicationReview = payload["review"];
                    if (review) {
                        const reviewDetails = JSON.parse(review.review_details);
                        if (reviewDetails) {
                            this.setState({
                                alreadyReviewed: true,
                                reviewAnswers: reviewDetails,
                                reviewTotal: review.review_total,
                            });
                        }
                    }
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
        this.setState({ loading: true });
        axios.get("/committee/admin-api/random-application-for-review.json").then(res => {
            const status = res.status;
            const currentUrl = this.props.history.location.pathname;
            const base = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    const next = +payload["message"];
                    if (!Number.isNaN(next) && next >= 0) {
                        this.props.history.push(`${base}/${next}`);
                        this.retrieveApplication(next);
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
        const vals = reviewQuestions.map((q) => reviewAnswers[q.id] * q.weight);
        const sum = vals.reduce((a, b) => a + b, 0);
        // const avg = (sum / vals.length) || 0;
        this.setState({ reviewAnswers: reviewAnswers, reviewTotal: sum });
    }


    private saveReview = () => {
        this.setState({ savingReview: true });
        const { applicationId, reviewAnswers, reviewTotal } = this.state;
        axios.post("/committee/admin-api/submit-review.json", {
            app_id: applicationId,
            review_details: JSON.stringify(reviewAnswers),
            review_total: reviewTotal,
        }).then(res => {
            const status = res.status;
            if (status == 200 || status == 201) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
                    toast.success("Successfully saved review.");
                    this.setState({ savingReview: false, alreadyReviewed: true });
                    this.randomNextApplication();
                    return;
                } else {
                    toast.error(payload["message"]);
                }
            } else {
                toast.error("Failed to save review.");
            }
            this.setState({ savingReview: false });
        });
    }
}

export default withRouter(IndividualApplication);
