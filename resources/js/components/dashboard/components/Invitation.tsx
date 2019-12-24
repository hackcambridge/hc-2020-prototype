import React, { Component, ReactNode } from "react";
import { IApplicationRecord } from "../../../interfaces/dashboard.interfaces";
import { Page, Heading, Card, ButtonGroup, Button, Link } from "@shopify/polaris";
import axios from 'axios';
import { toast } from "react-toastify";

interface IInvitationProps {
    application: IApplicationRecord | undefined,
    updateApplication: (application: IApplicationRecord) => void,
}

interface IInvitationState {
    attending: boolean | undefined,
    loading: boolean,
}

class Invitation extends Component<IInvitationProps, IInvitationState> {
    
    state = {
        attending: undefined,
        loading: false,
    }

    componentDidMount() {
        if(this.props.application) {
            const confirmed = this.props.application.confirmed;
            const declined = this.props.application.rejected;
            if(confirmed || declined) {
                this.setState({ attending: !declined });
            }
        }
        
    }

    render() {
        const app = this.props.application;
        return (<>
            {/* <img src="/images/HC-HackerHeader-bg.png" style={{ position: "absolute", width: "100%", marginTop: "-30px", zIndex: -1000 }}/> */}
            <Page title={"Your Invitation"} thumbnail={<img style={{ height: "5rem", verticalAlign: "middle", padding: "0.8rem 0" }} src="/images/invitation-ticket.png" />}>
                {app && app.invited
                    ? this.renderContent()
                    : <Card sectioned><Heading>An error occurred.</Heading></Card>
                }
            </Page>
        </>);
    }

    renderContent(): ReactNode {
        const { attending } = this.state;
        return (<>
            <Card sectioned title="RSVP for Hack Cambridge 101 &nbsp; 🥳">
                <p>We're delighted to offer you a place at Hack Cambridge this year. The standard of applications this year was higher than ever, and you made the cut. Please accept the invite below — it will expire a week after it was sent, so be sure to let us know if you can come as soon as possible. We can't wait to meet all of you in Cambridge!</p>
                <br />
                <p>The event will take place on the weekend of the <strong>18-19th January 2020 in central Cambridge</strong>. No worries if you can't now come, but please let us know so we can invite someone else to come along and enjoy the event instead.</p>
                <br />
                <p>Expiration: <strong>31st December 2019</strong></p>
                <br />
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
                <Button loading={loading} destructive onClick={this.handleDeclineInvitation}>I can't make it</Button>
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
                console.log(obj);
                if ("success" in obj && obj["success"]) {
                    const record: IApplicationRecord = obj["application"] as IApplicationRecord;
                    if(record) {
                        console.log(record);
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

    private handleDeclineInvitation = () => {
        this.setState({ loading: true });
        axios.get(`/dashboard-api/decline-invitation.json`).then(res => {
            const status = res.status;
            if(status == 200) {
                const obj = res.data;
                console.log(obj);
                if ("success" in obj && obj["success"]) {
                    const record: IApplicationRecord = obj["application"] as IApplicationRecord;
                    if(record) {
                        console.log(record);
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