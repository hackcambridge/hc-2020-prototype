import React, { Component, ReactNode } from "react";
import { withRouter, RouteComponentProps, Link, Switch, Route, Redirect } from "react-router-dom";
import { IDashboardProps, IApplicationRecord } from "../../interfaces/dashboard.interfaces";
import {
    AppProvider,
    Frame,
    TopBar,
    Navigation,
    Banner,
} from "@shopify/polaris";
import { LogOutMinor, IqMajorMonotone, AddCodeMajorMonotone, CustomerPlusMajorMonotone, HomeMajorMonotone, ConfettiMajorMonotone } from '@shopify/polaris-icons';
import Dashboard404 from "./Dashboard404";
import Overview from "./components/Overview";
import Apply from "./components/Apply";
import TeamApplication from "./components/TeamApplication";
import axios from 'axios';
import { ToastContainer, cssTransition } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import md5 from "md5";
import Invitation from "./components/Invitation";

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
    applicationOpen: boolean,
}


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
        applicationOpen: true,
    };

    componentDidMount() {
        if (this.props.user.application) {
            this.setState({ applicationOpen: !this.props.user.application.reviewed });
            this.updateApplicationRecord(this.props.user.application);
        } else {
            this.loadApplicationRecord();
        }
    }

    private theme = {
        colors: {
            topBar: {
                background: '#212b36',
                backgroundLighter: '#334150',
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
        if (_url.startsWith(this.props.baseUrl)) {
            return <Link to={url} {...rest} onClick={() => {
                if (this.state.showMobileNavigation) {
                    this.setState({ showMobileNavigation: false });
                }
            }} />
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

    private userMenuActions = [
        {
            id: "logout",
            items: [
                { content: 'Frontpage', url: "/", icon: HomeMajorMonotone },
                { content: 'Logout', url: "/logout", icon: LogOutMinor },
            ],
        },
    ];

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
                actions={this.userMenuActions}
                name={this.props.user.name.split(" ")[0]}
                initials={this.props.user.name.charAt(0)}
                avatar={`https://www.gravatar.com/avatar/${md5(this.props.user.email.toLowerCase())}?d=retro`}
                open={this.state.userMenuOpen}
                onToggle={this.toggleState('userMenuOpen')}
            />
        );

        const applicationNavigationItems = [
            { url: `${this.props.baseUrl}/apply/individual`, label: `Details`, icon: AddCodeMajorMonotone },
            { url: `${this.props.baseUrl}/apply/team`, label: `Team`, icon: CustomerPlusMajorMonotone },
        ];
        if (application && application.invited) {
            applicationNavigationItems.push({ url: `${this.props.baseUrl}/apply/invitation`, label: `Invitation`, icon: ConfettiMajorMonotone });
        }

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
                    <>{this.renderApplicationBanner()}
                        <div style={{ marginTop: "-1.6rem" }}>
                            <Navigation.Section items={applicationNavigationItems} />
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
            <>
                <AppProvider theme={this.theme} linkComponent={this.adapterLink}>
                    <Frame
                        topBar={this.topBarMarkup(userMenuMarkup)}
                        navigation={navigationMarkup}
                        showMobileNavigation={showMobileNavigation}
                        onNavigationDismiss={this.toggleState('showMobileNavigation')}
                    >
                        <div className={"inner-wrapper"}>
                            {this.renderContent()}
                        </div>
                    </Frame>
                </AppProvider>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    transition={cssTransition({
                        enter: 'zoomIn',
                        exit: 'zoomOut',
                        duration: 400
                    })}
                    newestOnTop
                    closeOnClick
                    draggable
                    pauseOnHover
                />
            </>
        );
    }

    private renderContent(): JSX.Element {
        const { applicationOpen } = this.state;
        return (
            <Switch>
                <Redirect exact path={`${this.props.baseUrl}`} to={`${this.props.baseUrl}/overview`} />
                <Route exact path={`${this.props.baseUrl}/overview`} render={(props) => <Overview {...props} {...this.props} />} />
                <Redirect exact path={`${this.props.baseUrl}/apply`} to={`${this.props.baseUrl}/apply/individual`} />
                <Route exact path={`${this.props.baseUrl}/apply/individual`} render={(_) => <Apply canEdit={applicationOpen} updateApplication={this.updateApplicationRecord} initialRecord={this.props.user.application} applicationsOpen={this.props.canApply} />} />
                <Route exact path={`${this.props.baseUrl}/apply/team`} render={(_) => <TeamApplication canEdit={applicationOpen} isSubmitted={this.props.user.application ? this.props.user.application.isSubmitted : false} teamID={this.props.user.team.id} teamMembers={this.props.user.team.members} teamOwner={this.props.user.team.owner} />} />
                <Route exact path={`${this.props.baseUrl}/apply/invitation`} render={(_) => <Invitation application={this.props.user.application} updateApplication={this.updateApplicationRecord} />} />
                <Route component={Dashboard404}></Route>
            </Switch>
        );
    }

    private renderApplicationBanner(): JSX.Element {
        const states: {
            [key: string]: {
                status: "warning" | "info" | "critical" | "success" | undefined,
                text: string,
                noLink?: boolean
            }
        } = {
            "notStarted": { status: undefined, text: "Start Application" },
            "started": { status: "warning", text: "Finish Application" },
            "pending": { status: "info", text: "Application Pending" },
            "rejected": { status: "critical", text: "Unsuccessful" },
            "declined": { status: "critical", text: "Place Declined" },
            "invited": { status: "warning", text: "Accept Invite" },
            "confirmed": { status: "success", text: "Place Confirmed", noLink: true },
        }
        const currentState = states[this.getApplicationStateKey()];

        if (currentState) {
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

    private getApplicationStateKey(): string {
        const { application, applicationOpen } = this.state;
        if (application) {
            if (application.reviewed || application.invited) {
                if (application.invited) {
                    if (application.rejected) return "declined";
                    else if (application.confirmed) return "confirmed";
                    else return "invited";
                }
                else if (application.rejected) return "rejected";
                else return "pending";
            }

            var complete = application.cvFilename && application.cvUrl && true;
            const responses = JSON.parse(application.questionResponses) as { [key: string]: string };
            for (let key in responses) {
                complete = complete && responses[key].length > 0;
            }

            if (applicationOpen) {
                return application.isSubmitted ? (complete ? "pending" : "started") : "started";
            } else {
                return application.isSubmitted ? (complete ? "pending" : "rejected") : "rejected";
            }
        }

        return applicationOpen ? "notStarted" : "rejected";
    }

    private loadApplicationRecord() {
        axios.get(`/dashboard-api/application-record.json`).then(res => {
            const status = res.status;
            if (status == 200) {
                const obj = res.data;
                if ("success" in obj && obj["success"]) {
                    const record: IApplicationRecord = obj["record"];
                    this.setState({ applicationOpen: !record.reviewed });
                    this.updateApplicationRecord(record);
                    return;
                }
            }
            // console.log("fail");
        });
    }

    private updateApplicationRecord = (record: IApplicationRecord) => {
        this.setState({ application: record });
    }
}

export default withRouter(Dashboard);