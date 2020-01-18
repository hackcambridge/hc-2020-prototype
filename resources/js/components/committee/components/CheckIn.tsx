import React, { Component } from 'react';
import { Page, Button, Card, ResourceList, Avatar, TextStyle, TextContainer, Heading, Filters, SettingToggle, Icon } from "@shopify/polaris";
import { MobileAcceptMajorMonotone, MobileCancelMajorMonotone } from "@shopify/polaris-icons";
import axios from 'axios';
import { toast } from 'react-toastify';
import md5 from 'md5';

interface ICheckInProps {

}

interface ICheckInState {
    isLoading: boolean,
    hackers: ICheckinItem[],
    filterValue: string,
}

interface ICheckinItem {
    id: number,
    user_id: number,
    checkin: {} | undefined,
    user: {
        email: string,
        name: string,
    }
}

class CheckIn extends Component<ICheckInProps, ICheckInState> {

    private dummyRecord: ICheckinItem = { id:0, user_id:0, checkin:undefined, user: { email: "", name: ""} };
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
        return (
            <Page title={`Hacker Check-in`}>
                <Card>
                    {hackers && hackers.length > 0 ?
                        <ResourceList
                            loading={isLoading}
                            resourceName={{ singular: 'hacker', plural: 'hackers' }}
                            items={hackers.filter((hacker) => {
                                return (hacker.user.name.toLowerCase().includes(filterValue.toLowerCase()) || hacker.user.email.toLowerCase().includes(filterValue));
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
        this.setState({ isLoading: true });
        axios.get(`/committee/admin-api/init-checkin-tool.json`).then(res => {
            const status = res.status;
            if(status == 200) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    console.log(payload);
                    const hackers: ICheckinItem[] = payload["applications"];
                    this.setState({ 
                        hackers: hackers,
                        isLoading: false,
                    });
                    return;
                }
            }
            toast.error("Failed to load applications.");
            // console.log(status, res.data);
            this.setState({ isLoading: false });
        });
    }

    private renderHackerRow = (hacker: ICheckinItem) => {
        const { isLoading } = this.state;
        const hasCheckedIn = hacker.checkin != undefined;
        const media = <span style={{ paddingTop: "10px", display: "block" }} ><Icon source={hasCheckedIn ? MobileAcceptMajorMonotone : <></>} /></span>;;

        const active = hasCheckedIn;
        const buttonContent = active ? 'Un Check-in' : 'Check-in';

        return (
            <ResourceList.Item
                id={`${hacker.id}`}
                onClick={() => {}}
                media={media}
                accessibilityLabel={`Check-in ${hacker.user.name}`}
            >
                <span style={{ display: "inline-block" }}>
                <h3>
                    <TextStyle variation="strong">{hacker.user.name}</TextStyle>
                </h3>
                <div>{hacker.user.email}</div>
                </span>
                <div style={{ float: "right" }}><Button primary={!active} loading={isLoading} onClick={() => this.toggleAndSaveCheckIn(hacker.id)}>{buttonContent}</Button></div>
            </ResourceList.Item>
        );
    }

    private toggleAndSaveCheckIn(hacker_id: number) {
        this.setState({ isLoading: true });

        const {
            hackers,
        } = this.state;
        const idx = hackers.findIndex((h) => h.id === hacker_id);
        const checkedIn = hackers[idx].checkin != undefined;

        const endpoint = checkedIn ? "uncheckin-application" : "checkin-application";
        axios.post(`/committee/admin-api/${endpoint}.json`, {
            app_id: hackers[idx].id
        }).then(res => {
            const status = res.status;
            if(status == 200 || status == 201) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    hackers[idx].checkin = checkedIn ? undefined : {};
                    this.setState({ isLoading: false });
                    return;
                } else {
                    toast.error(payload["message"]);
                    this.setState({ isLoading: false });
                    return;
                }
            }
            toast.error("Failed to update status.");
            this.setState({ isLoading: false });
            console.log(status, res.data);
        });
    }
}

export default CheckIn;
