import React, { Component } from 'react';
import { Page, Button, Card, ResourceList, Avatar, TextStyle, TextContainer, Heading, Filters, SettingToggle, Icon } from "@shopify/polaris";
import { MobileAcceptMajorMonotone, MobileCancelMajorMonotone } from "@shopify/polaris-icons";
import axios from 'axios';
import { IHacker } from '../../../interfaces/committee.interfaces';
import { toast } from 'react-toastify';
import md5 from 'md5';

interface ICheckInProps {

}

interface ICheckInState {
    isLoading: boolean,
    hackers: IHacker[],
    filterValue: string,
}

class CheckIn extends Component<ICheckInProps, ICheckInState> {

    private dummyRecord: IHacker = { name: "", email: "", id: 0, user_id: 0, hasCheckedIn: false }
    state = {
        isLoading: true,
        hackers: [this.dummyRecord],
        filterValue: "",
    }

    componentDidMount() {
        this.loadHackers();
    }

    render() {
        const { isLoading, hackers, filterValue } = this.state;

        const filterControl = (
            <Filters
                queryValue={filterValue}
                filters={[]}
                appliedFilters={[]}
                onQueryChange={(m) => this.setState({ filterValue: m })}
                onQueryClear={() => this.setState({ filterValue: "" })}
                onClearAll={() => { }}
            />
        );
        const titlePrefix = (hackers.length > 0 && !isLoading) ? `${hackers.length} ` : "";
        return (
            <Page title={`${titlePrefix}Hacker Check-in`}>
                <Card>
                    {hackers && hackers.length > 0 ?
                        <ResourceList
                            loading={isLoading}
                            resourceName={{ singular: 'hacker', plural: 'hackers' }}
                            items={hackers.filter((hacker) => {
                                return (hacker.name.toLowerCase().includes(filterValue.toLowerCase()) || hacker.email.toLowerCase().includes(filterValue));
                            })}
                            renderItem={this.renderHackerRow}
                            filterControl={filterControl}
                        />
                        :
                        <Heading>Loading...</Heading>
                    }
                </Card>
            </Page>
        );
    }

    private loadHackers = () => {
        // this.setState({ isLoading: true });
        // axios.get(`/committee/admin-api/applications-summary.json`).then(res => {
        //     const status = res.status;
        //     if(status == 200) {
        //         const payload = res.data;
        //         if("success" in payload && payload["success"]) {
        //             const applications: IApplicationSummary[] = payload["applications"];
        //             this.setState({ 
        //                 applications: applications,
        //                 isLoading: false,
        //             });
        //             return;
        //         }
        //     }
        //     toast.error("Failed to load applications.");
        //     // console.log(status, res.data);
        //     this.setState({ isLoading: false });
        // });
        this.setState({ isLoading: true });
        this.setState({ hackers: [{ name: "a", user_id: 0, id: 0, hasCheckedIn: false, email: "a@h" }, { name: "b", user_id: 0, id: 1, hasCheckedIn: false, email: "b@h" }] });
        this.setState({ isLoading: false });
    }

    private renderHackerRow = (hacker: IHacker) => {
        const { isLoading } = this.state;

        const media = <span style={{ paddingTop: "10px", display: "block" }} ><Icon source={hacker.hasCheckedIn ? MobileAcceptMajorMonotone : <></>} /></span>;;

        const active = hacker.hasCheckedIn;
        const buttonContent = active ? 'Un Check-in' : 'Check-in';

        return (
            <ResourceList.Item
                id={`${hacker.id}`}
                onClick={() => {}}
                media={media}
                accessibilityLabel={`Check-in ${hacker.name}`}
            >
                <span style={{ display: "inline-block" }}>
                <h3>
                    <TextStyle variation="strong">{hacker.name}</TextStyle>
                </h3>
                <div>{hacker.email}</div>
                </span>
                <div style={{ float: "right" }}><Button primary={active} loading={isLoading} onClick={() => this.toggleAndSaveCheckIn(hacker.id)}>{buttonContent}</Button></div>
            </ResourceList.Item>
        );
    }

    private toggleAndSaveCheckIn(hacker_id: number) {
        var hackers = this.state.hackers.slice();
        const idx = hackers.findIndex((h) => h.id === hacker_id);
        hackers[idx].hasCheckedIn = !hackers[idx].hasCheckedIn;
        this.setState({hackers: hackers});
    }
}

export default CheckIn;