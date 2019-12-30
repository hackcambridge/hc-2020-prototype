import React, { Component, ReactNode } from "react";
import { IApplicationRecord } from "../../../interfaces/dashboard.interfaces";
import { Page, Heading, Card, ButtonGroup, Button, Link } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";
import DestructiveConfirmation from "../../common/DestructiveConfirmation";

interface IInvitationProps {
    application: IApplicationRecord | undefined,
    updateApplication: (application: IApplicationRecord) => void,
}

interface IInvitationState {
    attending: boolean | undefined,
    loading: boolean,
    expiration: number,
    showDestructiveForm: JSX.Element | undefined,
}

class Invitation extends Component<IInvitationProps, IInvitationState> {
    
    private expires_after = 3; // days
    state = {
        attending: undefined,
        loading: false,
        expiration: -1,
        showDestructiveForm: undefined
    }

    componentDidMount() {
        if(this.props.application) {
            const confirmed = this.props.application.confirmed;
            const declined = this.props.application.rejected;

            var expiresOn = Date.parse(this.props.application.invited_on) + (this.expires_after * 24 * 60 * 60 * 1000);
            expiresOn = Math.floor(expiresOn / 3600000) * 3600000;
            this.setState({ expiration: expiresOn });

            if(confirmed || declined) {
                this.setState({ attending: !declined });
            } else if(new Date().getTime() > expiresOn) {
                this.setState({ attending: false });
            }
        }
        
    }

    render() {
        const app = this.props.application;
        const { showDestructiveForm } = this.state;
        return (<>
            {/* <img src="/images/HC-HackerHeader-bg.png" style={{ position: "absolute", width: "100%", marginTop: "-30px", zIndex: -1000 }}/> */}
            <Page title={"Your Invitation"} thumbnail={<img style={{ height: "5rem", verticalAlign: "middle", padding: "0.8rem 0" }} src="/images/invitation-ticket.png" />}>
                {app && app.invited
                    ? this.renderContent()
                    : <Card sectioned><Heading>An error occurred.</Heading></Card>
                }
                {showDestructiveForm || <></>}
            </Page>
        </>);
    }

    renderContent(): ReactNode {
        const { attending, expiration } = this.state;
        var expirationBlock = <><p>Expiration: <strong>31st December</strong></p><br /></>;
        if(this.props.application) {
            expirationBlock = <><p>Expiration: <strong>{new Date(expiration).toLocaleString()}</strong></p><br /></>;
        }
        return (<>
            <Card sectioned title="RSVP for Hack Cambridge 101 &nbsp; 🥳">
                <p>We're delighted to offer you a place at Hack Cambridge this year. The standard of applications this year was higher than ever, and you made the cut. Please accept the invite below — it will expire a week after it was sent, so be sure to let us know if you can come as soon as possible. We can't wait to meet all of you in Cambridge!</p>
                <br />
                <p>The event will take place on the weekend of the <strong>18-19th January 2020 in central Cambridge</strong>. No worries if you can't now come, but please let us know so we can invite someone else to come along and enjoy the event instead.</p>
                <br />
                {attending !== true ? expirationBlock : <></>}
                <div style={{ margin: "0.5rem 0" }}>
                    {attending == undefined
                        ? this.renderButtons_NoDecision()
                        : attending ? this.renderButtons_Accepted() : this.renderButtons_Declined()
                    }
                </div>
            </Card>
        </>);
    }

    renderButtons_NoDecision(): ReactNode {
        const { loading } = this.state;
        return (
            <ButtonGroup>
                <Button loading={loading} primary onClick={this.handleAcceptInvitation}>Sign me up!</Button>
                <Button loading={loading} destructive onClick={this.checkDeclineInvitation}>I can't make it</Button>
            </ButtonGroup>
        );
    }

    renderButtons_Accepted(): ReactNode {
        return (
            <ButtonGroup>
                <Button disabled={true} primary>You're signed up!</Button>
                <p>&nbsp; If you can no longer attend please email <Link url="mailto:team@hackcambridge.com">team@hackcambridge.com</Link>.</p>
            </ButtonGroup>
        );
    }

    renderButtons_Declined(): ReactNode {
        return (
            <ButtonGroup>
                <Button disabled={true} destructive>Invitation declined</Button>
                <p>&nbsp; No hard feelings! Thank you for applying for Hack Cambridge.</p>
            </ButtonGroup>
        );
    }

    private handleAcceptInvitation = () => {
        this.setState({ loading: true });
        axios.get(`/dashboard-api/accept-invitation.json`).then(res => {
            const status = res.status;
            if(status == 200) {
                const obj = res.data;
                if ("success" in obj && obj["success"]) {
                    const record: IApplicationRecord = obj["application"] as IApplicationRecord;
                    if(record) {
                        this.props.updateApplication(record);
                        toast.success("You're coming to Hack Cambridge!");
                        this.setState({ attending: true });
                    } else {
                        toast.error("An error occurred. Please refresh the page.");
                    }
                    this.setState({ loading: false });
                    return;
                }
                toast.error(obj["message"]);
                this.setState({ loading: false });
                return;
            }
            toast.error("An error occurred.");
            this.setState({ loading: false });
        });
    }

    private checkDeclineInvitation = () => {
        const destructor : JSX.Element = (
            <DestructiveConfirmation 
                title={`Are you sure you don't want to come?`}
                onConfirm={this.handleDeclineInvitation}
                bodyContent={"This is permanent; your place will be reassigned immediately."}
                onClose={() => this.setState({ showDestructiveForm: undefined })}
            />
        );
        this.setState({ showDestructiveForm: destructor });
    }

    private handleDeclineInvitation = () => {
        this.setState({ loading: true });
        axios.get(`/dashboard-api/decline-invitation.json`).then(res => {
            const status = res.status;
            if(status == 200) {
                const obj = res.data;
                if ("success" in obj && obj["success"]) {
                    const record: IApplicationRecord = obj["application"] as IApplicationRecord;
                    if(record) {
                        this.props.updateApplication(record);
                        toast.success("Invitation declined");
                        this.setState({ attending: false });
                    } else {
                        toast.error("An error occurred. Please refresh the page.");
                    }
                    this.setState({ loading: false });
                    return;
                }
                toast.error(obj["message"]);
                this.setState({ loading: false });
                return;
            }
            toast.error("An error occurred.");
            this.setState({ loading: false });
        });
    }
}

export default Invitation;