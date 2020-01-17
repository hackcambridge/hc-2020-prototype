import React, { Component, ReactNode } from "react";
import { withRouter, RouteComponentProps, Link, Switch, Route, Redirect } from "react-router-dom";
import { ICommitteeProps } from "../../interfaces/committee.interfaces";
import {
    AppProvider,
    Frame,
    TopBar,
    Navigation,
} from "@shopify/polaris";
import {LogOutMinor, IqMajorMonotone, HomeMajorMonotone, PackageMajorMonotone, ProfileMajorMonotone, BillingStatementPoundMajorMonotone, SmileyJoyMajorMonotone, FilterMajorMonotone, CodeMajorMonotone, FlagMajorMonotone, SocialAdMajorMonotone} from '@shopify/polaris-icons';
import Applications from "./components/Applications";
import Overview from "./components/Overview";
import Committee404 from "./Committee404";
import axios from 'axios';
import { ToastContainer, cssTransition, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import md5 from "md5";
import MemberList from "./components/MemberList";
import IndividualApplication from "./components/IndividualApplication";
import Omnitool from "./components/Omnitool";
import ChallengesEditor from "./components/ChallengesEditor";
import ScheduleEditor from "./components/ScheduleEditor";

type IDashboardPropsWithRouter = RouteComponentProps & ICommitteeProps;
interface IDashboardState {
    isLoading: boolean,
    searchActive: boolean,
    searchText: string,
    userMenuOpen: boolean,
    showMobileNavigation: boolean,
    createSponsorFormShowing: boolean,
    currentLocation: string,
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
    };

    componentDidMount() {
        // this.loadApplicationRecord();
    }

    private theme = {
        colors: {
            topBar: {
                background: '#000',
                backgroundLighter: '#000',
                color: '#FFFFFF',
            },
        },
        logo: {
            width: 114,
            topBarSource: '/images/101-admin.png',
            url: `${this.props.baseUrl}/`,
            accessibilityLabel: 'Hack Cambridge',
        },
    };

    private adapterLink = ({ url, ...rest }) => {
        const _url = url as string;
        if(_url.startsWith(this.props.baseUrl)) {
            return <Link to={url} {...rest} onClick={() => {
                if(this.state.showMobileNavigation) {
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
                {content: 'Frontpage', url: "/", icon: HomeMajorMonotone},
                {content: 'Hackers\' Dashboard', url: "/dashboard", icon: SmileyJoyMajorMonotone},
                {content: 'Sponsors\' Portal', url: "/sponsors/dashboard", icon: BillingStatementPoundMajorMonotone},
                {content: 'Logout', url: "/logout", icon: LogOutMinor},
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
        const { showMobileNavigation } = this.state;
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

        const navigationMarkup = (
            <Navigation location={`${this.props.location.pathname}`}>
                <Navigation.Section
                    items={[
                        {
                            url: `${this.props.baseUrl}/overview`,
                            label: "Overview",
                            icon: IqMajorMonotone
                        },
                        {
                            url: `${this.props.baseUrl}/applications`,
                            label: "Applications",
                            icon: PackageMajorMonotone
                        },
                        {
                            onClick: this.startReviewing,
                            label: "Start Reviewing",
                            icon: FilterMajorMonotone
                        },
                    ]}
                />
                {this.props.user.type == "admin" ?
                    <Navigation.Section title="Admin"
                        items={[
                            {
                                url: `${this.props.baseUrl}/members`,
                                label: "Members",
                                icon: ProfileMajorMonotone
                            },
                            {
                                url: `${this.props.baseUrl}/omnitool`,
                                label: "Omnitool",
                                icon: CodeMajorMonotone
                            },
                            {
                                url: `${this.props.baseUrl}/challenges`,
                                label: "Challenges",
                                icon: FlagMajorMonotone
                            },
                            {
                                url: `${this.props.baseUrl}/schedule`,
                                label: "Schedule",
                                icon: SocialAdMajorMonotone
                            },
                        ]}
                    /> 
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
        const showAdmin = this.props.user.type == "admin";
        const adminRoutes = showAdmin ? [
            <Route exact path={`${this.props.baseUrl}/members`} render={(props) => <MemberList {...props} {...this.props} />} />,
            <Route exact path={`${this.props.baseUrl}/omnitool`} render={(props) => <Omnitool {...props} />} />,
            <Route exact path={`${this.props.baseUrl}/challenges`} render={(props) => <ChallengesEditor {...props} />} />,
            <Route exact path={`${this.props.baseUrl}/schedule`} render={(props) => <ScheduleEditor {...props} />} />,
        ] : [];
        return (
            <Switch>
                <Redirect exact path={`${this.props.baseUrl}`} to={`${this.props.baseUrl}/overview`} />
                <Route exact path={`${this.props.baseUrl}/overview`} render={(props) => <Overview {...props} />} />
                <Route exact path={`${this.props.baseUrl}/applications`} render={(props) => <Applications {...props} />} />
                <Route exact path={`${this.props.baseUrl}/applications/:id`} render={(props) => <IndividualApplication applicationId={props.match.params.id} {...props} />} />
                {adminRoutes.map(i => i)}
                <Route component={Committee404}></Route>
            </Switch>
        );
    }

    private startReviewing = () => {
        toast.info("Finding a random application...");
        axios.get("/committee/admin-api/random-application-for-review.json").then(res => {
            const status = res.status;
            if(status == 200) {
                const payload = res.data;
                if("success" in payload && payload["success"]) {
                    const next = +payload["message"];
                    if (!Number.isNaN(next) && next >= 0) {
                        this.props.history.push(`${this.props.baseUrl}/applications/${next}`);
                    } else {
                        toast.error("Couldn't find next application to review");
                    }
                } else {
                    toast.error(payload["message"]);
                }
            } else {
                toast.error("Failed to load application to review");
            }
        });
    }

}

export default withRouter(Dashboard);