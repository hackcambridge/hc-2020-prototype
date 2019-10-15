import React, { Component, ReactNode } from "react";
import { withRouter, RouteComponentProps, Link, Switch, Route, Redirect } from "react-router-dom";
import { IDashboardProps, IApplicationRecord } from "../../interfaces/dashboard.interfaces";
import {
    ActionList,
    AppProvider,
    Card,
    Frame,
    TopBar,
    Navigation,
    Banner,
} from "@shopify/polaris";
import {DnsSettingsMajorMonotone, HomeMajorMonotone, CirclePlusOutlineMinor, SmileyJoyMajorMonotone, MentionMajorMonotone, ConfettiMajorMonotone, CodeMajorMonotone, DataVisualizationMajorMonotone, SandboxMajorMonotone, GamesConsoleMajorMonotone, MobileBackArrowMajorMonotone, LogOutMinor, MobileChevronMajorMonotone, TransferWithinShopifyMajorMonotone, PackageMajorMonotone, LockMajorMonotone, IqMajorMonotone, AddCodeMajorMonotone, CustomerPlusMajorMonotone} from '@shopify/polaris-icons';
import Dashboard404 from "./Dashboard404";
import Overview from "./components/Overview";
import Apply from "./components/Apply";
import TeamApplication from "./components/TeamApplication";
import axios from 'axios';

type IDashboardPropsWithRouter = RouteComponentProps & IDashboardProps;
interface IDashboardState {
    isLoading: boolean,
    searchActive: boolean,
    searchText: string,
    userMenuOpen: boolean,
    showMobileNavigation: boolean,
    createSponsorFormShowing: boolean,
    currentLocation: string,
    application?: IApplicationRecord | undefined,
}

const applicationsOpen = true;

class Dashboard extends Component<IDashboardPropsWithRouter, IDashboardState> {

    state = {
        isLoading: false,
        searchActive: false,
        searchText: '',
        userMenuOpen: false,
        showMobileNavigation: false,
        createSponsorFormShowing: false,
        currentLocation: this.props.location.pathname,
        application: this.props.user.application,
    };

    componentDidMount() {
        this.loadApplicationRecord();
    }

    private theme = {
        colors: {
            topBar: {
                background: '#4B0082',
                backgroundLighter: '#8A2BE2',
                color: '#FFFFFF',
            },
        },
        logo: {
            width: 40,
            topBarSource: '/images/101-white.png',
            url: `${this.props.baseUrl}/`,
            accessibilityLabel: 'Hack Cambridge',
        },
    };

    private adapterLink = ({ url, ...rest }) => {
        const _url = url as string;
        if(_url.startsWith(this.props.baseUrl)) {
            return <Link to={url} {...rest} />
        } else {
            return <a href={url} {...rest} />
        }
    }

    private toggleState = (key: string) => {
        return () => {
            this.setState(prev => {
                const newState = prev;
                newState[key] = !prev[key];
                return newState;
            });
        };
    };

    private topBarMarkup = (userMenuMarkup: ReactNode) => (
        <TopBar
            showNavigationToggle={true}
            userMenu={userMenuMarkup}
            // searchResultsVisible={searchActive}
            // searchField={searchFieldMarkup}
            // searchResults={searchResultsMarkup}
            // onSearchResultsDismiss={this.handleSearchResultsDismiss}
            onNavigationToggle={this.toggleState('showMobileNavigation')}
        />
    );

    render() {
        const showApplicationItems = true;
        const { showMobileNavigation, application } = this.state;
        const userMenuMarkup = (
            <TopBar.UserMenu
                actions={[]}//{this.userMenuActions}
                name={this.props.user.name.split(" ")[0]}
                initials={this.props.user.name.charAt(0)}
                open={this.state.userMenuOpen}
                onToggle={this.toggleState('userMenuOpen')}
            />
        );
        const navigationMarkup = (
            <Navigation location={`${this.props.location.pathname}`}>
                <Navigation.Section
                    items={[{
                        url: `${this.props.baseUrl}/overview`,
                        label: "Overview",
                        icon: IqMajorMonotone
                    }]}
                />

                {showApplicationItems ? 
                <>{this.renderApplicationBanner(application)}
                <div style={{ marginTop: "-1.6rem" }}>
                    <Navigation.Section
                        items={[
                            { url: `${this.props.baseUrl}/apply/individual`, label: `Details`, icon: AddCodeMajorMonotone },
                            { url: `${this.props.baseUrl}/apply/team`, label: `Team`, icon: CustomerPlusMajorMonotone },
                        ]}
                    />
                </div></>
                : <></>}

                {/* {this.sponsorSectionsNavMarkup(navSection)} */}
                {/* {this.props.sponsors.length > 1 ? 
                <Navigation.Section
                    title="Sponsors"
                    items={sponsorItems}
                    action={renderAdminMenuItems ? {
                        accessibilityLabel: 'Add new sponsor',
                        icon: CirclePlusOutlineMinor,
                        onClick: () => this.setState({ createSponsorFormShowing: true }),
                    } : undefined}
                /> : <></>} */}
            </Navigation>
        );

        return (
            <AppProvider theme={this.theme} linkComponent={this.adapterLink}>
                <Frame
                    topBar={this.topBarMarkup(userMenuMarkup)}
                    navigation={navigationMarkup}
                    showMobileNavigation={showMobileNavigation}
                    onNavigationDismiss={this.toggleState('showMobileNavigation')}
                >
                    <div style={{ paddingTop: "30px" }}>
                        {this.renderContent()}
                    </div>
                </Frame>
            </AppProvider>
        );
    }

    private renderContent(): JSX.Element {
        return (
            <Switch>
                <Redirect exact path={`${this.props.baseUrl}`} to={`${this.props.baseUrl}/overview`} />
                <Route exact path={`${this.props.baseUrl}/overview`} render={(props) => <Overview {...props} {...this.props}/>} />
                <Redirect exact path={`${this.props.baseUrl}/apply`} to={`${this.props.baseUrl}/apply/individual`} />
                <Route exact path={`${this.props.baseUrl}/apply/individual`} render={(_) => <Apply canEdit={applicationsOpen} updateApplication={this.updateApplicationRecord} initialRecord={this.props.user.application} />}/>
                <Route exact path={`${this.props.baseUrl}/apply/team`} component={TeamApplication} />
                <Route component={Dashboard404}></Route>
            </Switch>
        );
    }

    private renderApplicationBanner(application: IApplicationRecord | undefined): JSX.Element {
        const states: { [key: string]: { 
            status: "warning" | "info" | "critical" | "success" | undefined, 
            text: string,
            noLink?: boolean
        }} = {
            "notStarted": { status: undefined, text: "Start Application" },
            "started": { status: "warning", text: "Finish Application" },
            "pending": { status: "info", text: "Application Pending" },
            "rejected": { status: "critical", text: "Unsuccessful" },
            "invited": { status: "warning", text: "Accept Invite" },
            "confirmed": { status: "success", text: "Place Confirmed", noLink: true },
        }
        const currentState = states[this.getApplicationStateKey(application, applicationsOpen)];

        if(currentState) {
            const banner = (
                <Banner status={currentState.status}>
                    <p style={{ fontWeight: 500 }}>{currentState.text}</p>
                </Banner>
            );

            return (
                currentState.noLink 
                    ? banner
                    : (
                        <Link to={"/dashboard/apply/individual"} style={{ textDecoration: "inherit", color: "inherit" }}>
                            {banner}
                        </Link>
                    )
            );
        } else {
            return <></>;
        }
    }

    private getApplicationStateKey(record: IApplicationRecord | undefined, canEdit: boolean): string {
        if(record) {
            if(record.reviewed) {
                if(record.invited) {
                    if(record.confirmed) return "confirmed";
                    else if(record.rejected) return "rejected";
                    else return "invited";
                }
                else return "rejected";
            }

            var complete = record.cvFilename && record.cvUrl && true;
            const responses = JSON.parse(record.questionResponses) as { [key: string]: string };
            for (let key in responses) {
                complete = complete && responses[key].length > 0;
            }

            if(canEdit) {
                return record.isSubmitted ? (complete ? "pending" : "started") : "started";
            } else {
                return record.isSubmitted ? (complete ? "pending" : "rejected") : "rejected";
            }
        }

        return canEdit ? "notStarted" : "rejected";
    }

    private loadApplicationRecord() {
        axios.get(`/dashboard-api/application-record.json`).then(res => {
            const status = res.status;
            if(status == 200) {
                const obj = res.data;
                if ("success" in obj && obj["success"]) {
                    const record: IApplicationRecord = obj["record"];
                    this.updateApplicationRecord(record);
                    return;
                }
            }
            console.log("fail");
        });
    }

    private updateApplicationRecord = (record: IApplicationRecord) => {
        this.setState({ application: record });
    }
}

export default withRouter(Dashboard);