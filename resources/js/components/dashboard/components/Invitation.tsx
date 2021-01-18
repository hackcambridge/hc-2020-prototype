import React, { Component, ReactNode } from "react";
import { IApplicationRecord } from "../../../interfaces/dashboard.interfaces";
import { Page, Heading, Card, ButtonGroup, Button, Link, Checkbox, FormLayout } from "@shopify/polaris";
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
    agreedToMessages: boolean,
    agreedToInfo: boolean,
}

class Invitation extends Component<IInvitationProps, IInvitationState> {

    private expires_after = 15; // days
    state = {
        attending: undefined,
        loading: false,
        expiration: -1,
        showDestructiveForm: undefined,
        agreedToMessages: false,
        agreedToInfo: false,
    }

    componentDidMount() {
        if (this.props.application) {
            const confirmed = this.props.application.confirmed;
            const declined = this.props.application.rejected;

            var expiresOn = Date.parse(this.props.application.invited_on) + (this.expires_after * 24 * 60 * 60 * 1000);
            expiresOn = Math.floor(expiresOn / 3600000) * 3600000;
            this.setState({ expiration: expiresOn });

            if (confirmed || declined) {
                this.setState({ attending: !declined });
            } else if (new Date().getTime() > expiresOn) {
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
        const { attending, expiration, agreedToMessages, agreedToInfo } = this.state;
        var expirationBlock = <><p>Expiration: <strong>15th January</strong></p><br /></>;
        if (this.props.application && expiration) {
            expirationBlock = <><p>Expiration: <strong>{new Date(expiration).toLocaleString()}</strong></p><br /></>;
        }
        const hackathonsUKPolicy = "https://hackathons.org.uk/privacy-policy";
        return (<>
            <Card sectioned title="RSVP for Hex Cambridge &nbsp; 🥳">
                <p>We're delighted to offer you a place at Hex Cambridge this year. The standard of applications this year was higher than ever, and you made the cut. Please accept the invite below — it will expire {this.expires_after} days after it was sent, so be sure to let us know if you can participate as soon as possible. We can't wait to meet all of you on 23rd!</p>
                <br />
                <p>The event will take place on the weekend of the <strong>23-24th January 2021 virtually</strong>. No worries if you can't now participate, but please let us know so we can invite someone else to come along and enjoy the event instead.</p>
                <br />
                {attending !== true ? expirationBlock : <></>}
                {attending == undefined ? <Card sectioned title={"Small Legal Bit"}>
                    Before deciding we kindly ask you to accept the following terms and conditions by our partners:
                    <FormLayout>
                        <Checkbox
                            label={<span>(Optional) I authorise Hackathons UK Limited to send me occasional messages about hackathons and their activities.</span>}
                            checked={agreedToMessages}
                            onChange={(val) => this.setState({ agreedToMessages: val })}
                        />
                        <Checkbox
                            label={<span>I authorise you to share my application/registration information with Hackathons UK Limited for event administration, Hackathons UK Limited administration, and with my authorisation email in-line with the Hackathons UK Limited <Link external onClick={() => this.openInNewTab(hackathonsUKPolicy)}>Privacy Policy</Link>.</span>}
                            checked={agreedToInfo}
                            onChange={(val) => this.setState({ agreedToInfo: val })}
                        />
                    </FormLayout>
                </Card> : <></>}
                <div style={{ margin: "0.5rem 0" }}>
                    {attending == undefined
                        ? this.renderButtons_NoDecision()
                        : attending ? this.renderButtons_Accepted() : this.renderButtons_Declined()
                    }
                </div>
            </Card>
        </>);
    }
    
    private openInNewTab(url: string) {
        var w = window.open(url, '_blank');
        if (w) w.focus();
    }

    renderButtons_NoDecision(): ReactNode {
        const { loading, agreedToInfo } = this.state;
        return (
            <ButtonGroup>
                <Button loading={loading} disabled={!agreedToInfo} primary onClick={this.handleAcceptInvitation}>Sign me up!</Button>
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
        const { agreedToInfo, agreedToMessages} = this.state;

        this.setState({ loading: true });
        axios.post(`/dashboard-api/accept-invitation.json`, {
            info: agreedToInfo,
            messages: agreedToMessages,
        }).then(res => {
            const status = res.status;
            if (status == 200) {
                const obj = res.data;
                if ("success" in obj && obj["success"]) {
                    const record: IApplicationRecord = obj["application"] as IApplicationRecord;
                    if (record) {
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
        const destructor: JSX.Element = (
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
            if (status == 200) {
                const obj = res.data;
                if ("success" in obj && obj["success"]) {
                    const record: IApplicationRecord = obj["application"] as IApplicationRecord;
                    if (record) {
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
