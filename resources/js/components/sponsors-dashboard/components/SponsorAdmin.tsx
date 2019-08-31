import React, { Component, useState, useCallback } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Page, ChoiceList, TextField, Layout, Card, RangeSlider, Avatar, ResourceList, TextStyle, Button, Icon } from "@shopify/polaris";
import { AddMajorMonotone } from '@shopify/polaris-icons';
import { ISponsorData } from "../../../interfaces/sponsors.interfaces";
import axios from "axios";

interface ISponsorAdminProps extends RouteComponentProps {
    baseSponsorPath: string,
    sponsor: ISponsorData,
    onUpdate: () => void
}

interface ISponsorAdminState {
    selected: string[]
    packageName: string,
    recruiters: number,
    mentors: number,
    doingSave: boolean
}

class SponsorAdmin extends Component<ISponsorAdminProps, ISponsorAdminState> {

    state = {
        selected: this.parsePrivilegeString(),
        packageName: this.props.sponsor.tier,
        recruiters: this.getParameterisedPrivilege("recruiters"),
        mentors: this.getParameterisedPrivilege("mentors"),
        doingSave: false,
    };

    private privilegeTextOptions = [
        {
            label: 'Can bring swag',
            value: 'swag',
        },
        {
            label: 'Can advertise hardware or an API',
            value: 'resources',
        },
        {
            label: 'Can do a workshop',
            value: 'workshop',
        },
        {
            label: 'Can have a social media shoutout',
            value: 'social_media',
        }
    ];
  
    
    render() {
        const { selected, packageName, recruiters, mentors, doingSave } = this.state;
        const resourceName = {
            singular: 'sponsor agent',
            plural: 'sponsor agents',
          };
      
          const items = [
            {
              id: 341,
              name: 'Harri Bell-Thomas',
              location: 'harribt@live.co.uk',
            },
            {
              id: 256,
              name: 'Tim Lazarus',
              location: 'ahb36@cam.ac.uk',
            },
          ];
        return (
            <Page
                breadcrumbs={[{content: `${this.props.sponsor.name}`, url: `${this.props.baseSponsorPath}/overview`}]}
                title="Admin"
                primaryAction={{content: 'Save', onAction: this.handleSaveClicked, loading: doingSave}}
            >
                <Layout>
                    <Layout.Section oneHalf>
                        <Card title="Details">
                            <Card.Section>
                                <TextField label="Package Name" value={packageName} onChange={this.handlePackageNameChange} />
                                <br style={{ margin: "20px" }} />
                                <ChoiceList
                                    allowMultiple
                                    title={'Privileges'}
                                    choices={this.privilegeTextOptions}
                                    selected={selected}
                                    onChange={this.handlePrivilegeChange}
                                />
                                <br style={{ margin: "20px" }} />
                                <TextField
                                    label="Recruiters"
                                    type="number"
                                    value={`${recruiters}`}
                                    onChange={this.handleRecruiterNumberChange}
                                />
                                <br style={{ margin: "20px" }} />
                                <TextField
                                    label="Mentors"
                                    type="number"
                                    value={`${mentors}`}
                                    onChange={this.handleMentorNumberChange}
                                />
                            </Card.Section>
                        </Card>
                    </Layout.Section>
                    <Layout.Section oneHalf>
                        <Card title="Access">
                            <Card.Section>
                                <ResourceList
                                    items={items}
                                    renderItem={this.renderItem}
                                    resourceName={resourceName}
                                    alternateTool={<Button plain icon={AddMajorMonotone} onClick={() => console.log("Adding a person...")}></Button>}
                                />
                            </Card.Section>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    handlePrivilegeChange = (value: string[]) => {
        this.setState({selected: value});
    };

    handlePackageNameChange = (value: string) => {
        this.setState({packageName: value});
    }

    handleRecruiterNumberChange = (value: string) => {
        this.setState({recruiters: +value});
    }

    handleMentorNumberChange = (value: string) => {
        this.setState({mentors: +value});
    }

    handleSaveClicked = () => {
        this.setState({ doingSave: true });
        axios.post(`/sponsors/dashboard-api/update-sponsor.json`, {
            slug: this.props.sponsor.slug || "",
            tier: this.state.packageName || "",
            privileges: this.generatePrivilegeString()
        }).then(res => {
            const status = res.status;
            if(status) {
                this.props.onUpdate();
            }
            this.setState({ doingSave: false });
        });
    }

    private generatePrivilegeString() : string {
        const textOptions = this.state.selected.join(";");
        const optionsArray = [textOptions];
        if(this.state.mentors > 0) {
            optionsArray.push(`mentors[${this.state.mentors}]`);
        }
        if(this.state.recruiters > 0) {
            optionsArray.push(`recruiters[${this.state.recruiters}]`);
        }
        return optionsArray.join(";");
    }

    private parsePrivilegeString() : string[] {
        return this.props.sponsor.privileges.split(";").filter(i => !i.includes("["));   
    }

    private getParameterisedPrivilege(name: string) : number {
        const option = this.props.sponsor.privileges.split(";").filter(i => i.startsWith(name));
        if(option.length > 0) {
            const parts = (option[0].split(/\[([^\]]*)\]/));
            if(parts.length == 3) {
                return +(parts[1]);
            }
        }
        return 0;
    }

    private renderItem = (item: { id: any; name: any; location: any; }) => {
        const {id, name, location} = item;
        const media = <Avatar customer size="medium" name={name} />;
    
        return (
          <ResourceList.Item
            id={id}
            url={this.props.location.pathname}
            media={media}
            accessibilityLabel={`View details for ${name}`}
            shortcutActions={[{content: 'Edit', url: this.props.location.pathname}]}
          >
            <h3>
              <TextStyle variation="strong">{name}</TextStyle>
            </h3>
            <div>{location}</div>
          </ResourceList.Item>
        );
      };
    
}

export default SponsorAdmin;