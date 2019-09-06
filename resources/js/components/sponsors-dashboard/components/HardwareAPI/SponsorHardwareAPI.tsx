import React, { Component } from "react";
import { ResourceList, TextStyle, Button, Card, Avatar, Page, Stack, Heading } from "@shopify/polaris";
import { RouteComponentProps } from "react-router-dom";
import { ISponsorData } from "../../../../interfaces/sponsors.interfaces";
import { AddMajorMonotone } from "@shopify/polaris-icons";
import SponsorResourceForm from "./SponsorResourceForm";

interface IHardwareAPIDefinition {
    id: number,
    url: string, 
    name: string, 
    location: string,
}

interface ISponsorHardwareAPIProps extends RouteComponentProps {
    baseSponsorPath: string,
    sponsor: ISponsorData
}

interface ISponsorHardwareAPIState {
    resources: IHardwareAPIDefinition[],
    resourceFormShowing: boolean
}

class SponsorHardwareAPI extends Component<ISponsorHardwareAPIProps, ISponsorHardwareAPIState> {

    state = {
        resources: [
            {id:0, url:"a", name:"The Spotify API", location:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Phasellus vestibulum lorem sed risus ultricies. Dolor sit amet consectetur adipiscing elit ut aliquam purus sit. Integer malesuada nunc vel risus. Diam vel quam elementum pulvinar etiam non. Phasellus vestibulum lorem sed risus ultricies tristique nulla aliquet enim. Commodo odio aenean sed adipiscing. In pellentesque massa placerat duis ultricies lacus. Feugiat in ante metus dictum at tempor. Tincidunt id aliquet risus feugiat in ante metus dictum at. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper. Ipsum suspendisse ultrices gravida dictum. Laoreet suspendisse interdum consectetur libero id faucibus nisl. Amet nisl suscipit adipiscing bibendum. Ullamcorper malesuada proin libero nunc consequat interdum varius sit amet. Amet purus gravida quis blandit turpis cursus in hac. Scelerisque eleifend donec pretium vulputate. A arcu cursus vitae congue mauris."}
        ],
        resourceFormShowing: false
    }

    render() {
        const { resources, resourceFormShowing } = this.state;
        return (
            <Page
                breadcrumbs={[{
                    content: this.props.sponsor.name, 
                    url: this.props.baseSponsorPath
                }]}
                title="Hardware / API"
                // titleMetadata={<Badge status="attention">Outstanding</Badge>}
                // primaryAction={{content: 'Save', disabled: false}}
                // secondaryActions={[{content: 'Duplicate'}, {content: 'View on your store'}]}
            >
                <Card>
                    {resources.length > 0 ?
                        <ResourceList
                            items={resources}
                            renderItem={this.renderRow}
                            showHeader={true}
                            resourceName={{
                                singular: 'resource',
                                plural: 'resources',
                            }}
                            alternateTool={
                                <Button 
                                    plain icon={AddMajorMonotone} 
                                    onClick={() => this.setState({ resourceFormShowing: true })}>
                                </Button>
                            }
                        />
                        :
                        <Card.Section>
                            <Button 
                                icon={AddMajorMonotone} 
                                onClick={() => console.log("asd")}
                            >
                                &nbsp;Add a Resource
                            </Button>
                        </Card.Section>
                    }
                </Card>
                {resourceFormShowing ? 
                    <SponsorResourceForm onClose={() => this.setState({ resourceFormShowing: false })}/>
                    : <></>
                }
            </Page>
          );
    }

    renderRow = (item: IHardwareAPIDefinition) => {
        const {id, url, name, location} = item;
        const media = <Avatar customer size="medium" name={name} />;
    
        return (
            <ResourceList.Item
                id={`${id}`}
                url={url}
                // media={media}
                accessibilityLabel={`View details for ${name}`}
                shortcutActions={[
                    {
                        content: 'Edit', 
                        onAction: () => console.log("asd")
                    },
                    {
                        content: 'Delete', 
                        onAction: () => console.log("asd")
                    },
                ]}
            >
                <div style={{ padding: "10px" }}>
                    <div style={{ marginBottom: "10px" }}>
                        <Heading>{name}</Heading>
                    </div>
                    <div style={{ marginBottom: "10px" }}>{location}</div>
                    <Stack>
                        <Button size="slim" outline url={"https://google.com"}>Add product</Button>
                        <Button size="slim" outline url={"#"}>Add product</Button>
                        <Button size="slim" outline url={"#"}>Add product</Button>
                        <Button size="slim" outline url={"#"}>Add product</Button>
                        <Button size="slim" outline url={"#"}>Add product</Button>
                        <Button size="slim" outline url={"#"}>Add product</Button>
                    </Stack>
                </div>
            </ResourceList.Item>
        );
    };
}

export default SponsorHardwareAPI;