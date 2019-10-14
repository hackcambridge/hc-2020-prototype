import React, { Component } from "react";
import { Page, Card, Banner, DropZone, Layout, Subheading, FormLayout, TextField, Button, Stack, Heading, TextStyle, DisplayText, ResourceList, Avatar } from "@shopify/polaris";
import { MobilePlusMajorMonotone, CirclePlusMajorMonotone } from "@shopify/polaris-icons";


interface ITeamApplicationState {
    initialState: boolean,
    doingAction: boolean,
}

class TeamApplication extends Component<{}, ITeamApplicationState> {

    state = {
        initialState: true,
        doingAction: false,
    }
    render() {
        const { initialState, doingAction } = this.state;
        return (
            <Page title={"Team Information"}>
                <Banner status="info">
                    <p>You change this information at any time before the 10th November application deadline.</p>
                </Banner>
                <br />
                {initialState ? this.buildInitialStateForm(doingAction) : this.buildTeamOverview(doingAction)}
            </Page>
        );
    }

    private buildInitialStateForm(busyState: boolean) {
        return (
            <Layout>
                <Layout.Section oneHalf>
                    <Card sectioned title={"Create a New Team"}>
                        <Button 
                            loading={busyState}
                            primary 
                            fullWidth 
                            onClick={this.createNewTeam}
                            icon={CirclePlusMajorMonotone}>
                                &nbsp;New Team
                        </Button>
                    </Card>
                </Layout.Section>
                <Layout.Section oneHalf>
                    <Card sectioned title={"Join Existing Team"}>
                        <TextField
                            label=""
                            placeholder="Team ID"
                            value={""}
                            onChange={() => ""}
                            disabled={busyState}
                            connectedRight={
                                <Button loading={busyState} primary icon={MobilePlusMajorMonotone} />
                            }
                        />
                    </Card>
                </Layout.Section>
            </Layout>
        );
    }

    private buildTeamOverview(busyState: boolean) {
        return (
            <Card>
                <div style={{ padding: "22px" }}>
                    <div style={{ float: "right", color: '#bf0711' }}>
                        <Button onClick={() => this.setState({ initialState: true })} monochrome outline>Leave Team</Button>
                    </div>
                    <DisplayText size="large">Team <TextStyle variation="code">absNeh4Fa</TextStyle></DisplayText>
                </div>
                <ResourceList
                    resourceName={{singular: 'customer', plural: 'customers'}}
                    items={[
                    {
                        id: 341,
                        url: 'customers/341',
                        name: 'Mae Jemison',
                        location: 'Decatur, USA',
                    },
                    {
                        id: 256,
                        url: 'customers/256',
                        name: 'Ellen Ochoa',
                        location: 'Los Angeles, USA',
                    },
                    ]}
                    renderItem={(item) => {
                    const {id, url, name, location} = item;
                    const media = <Avatar customer size="medium" name={name} />;

                    return (
                        <ResourceList.Item
                        id={id}
                        url={url}
                        media={media}
                        accessibilityLabel={`View details for ${name}`}
                        >
                        <h3>
                            <TextStyle variation="strong">{name}</TextStyle>
                        </h3>
                        <div>{location}</div>
                        </ResourceList.Item>
                    );
                    }}
                />
            </Card>
        );
    }

    private createNewTeam = () => {
        this.setState({ initialState: false });
    }
}

export default TeamApplication;