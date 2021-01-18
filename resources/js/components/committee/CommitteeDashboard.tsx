import React, { Component, ReactNode } from "react";
import { withRouter, RouteComponentProps, Link, Switch, Route, Redirect } from "react-router-dom";
import { ICommitteeProps } from "../../interfaces/committee.interfaces";
import {
    AppProvider,
    Frame,
    TopBar,
    Navigation,
} from "@shopify/polaris";
import { LogOutMinor, IqMajor, HomeMajor, PackageMajor, CustomersMajor, ProfileMajor, BillingStatementPoundMajor, SmileyJoyMajor, FilterMajor, CodeMajor, FlagMajor, SocialAdMajor, QuestionMarkMajor, ChecklistMajor, EmailMajor, CustomerPlusMajor } from '@shopify/polaris-icons';
import Applications from "./components/Applications";
import CheckIn from "./components/CheckIn";
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
import FAQEditor from "./components/FAQEditor";
import Mailing from "./components/Mailing";
import Participants from "./components/Participants";
import Mentors from "./components/Mentors";

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
            width: 65,
            topBarSource: '/images/logo_white.png',
            url: `${this.props.baseUrl}/`,
            accessibilityLabel: 'Hex Cambridge',
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
                { content: 'Frontpage', url: "/", icon: HomeMajor },
                { content: 'Hackers\' Dashboard', url: "/dashboard", icon: SmileyJoyMajor },
                { content: 'Sponsors\' Portal', url: "/sponsors/dashboard", icon: BillingStatementPoundMajor },
                { content: 'Logout', url: "/logout", icon: LogOutMinor },
            ],
        },
    ];

    private topBarMarkup = (userMenuMarkup: ReactNode) => (
        <TopBar
            showNavigationToggle={true}
            userMenu={userMenuMarkup}
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
                            icon: IqMajor
                        },
                        {
                            url: `${this.props.baseUrl}/applications`,
                            label: "Applications",
                            icon: PackageMajor
                        },
                        {
                            url: `${this.props.baseUrl}/participants`,
                            label: "Participants",
                            icon: CustomersMajor
                        },
                        {
                            url: `${this.props.baseUrl}/checkin`,
                            label: "Check-in",
                            icon: ChecklistMajor,
                            disabled: this.props.user.type == "sponsor-reviewer"
                        },
                        {
                            onClick: this.startReviewing,
                            label: "Start Reviewing",
                            icon: FilterMajor
                        },
                    ]}
                />
                {this.props.user.type == "admin" ?
                    <Navigation.Section title="Admin"
                        items={[
                            {
                                url: `${this.props.baseUrl}/members`,
                                label: "Members",
                                icon: ProfileMajor
                            },
                            {
                                url: `${this.props.baseUrl}/mentors`,
                                label: "Mentors",
                                icon: CustomerPlusMajor
                            },
                            {
                                url: `${this.props.baseUrl}/mailing`,
                                label: "Mailing",
                                icon: EmailMajor
                            },
                            {
                                url: `${this.props.baseUrl}/omnitool`,
                                label: "Omnitool",
                                icon: CodeMajor
                            },
                            {
                                url: `${this.props.baseUrl}/challenges`,
                                label: "Challenges",
                                icon: FlagMajor
                            },
                            {
                                url: `${this.props.baseUrl}/schedule`,
                                label: "Schedule",
                                icon: SocialAdMajor
                            },
                            {
                                url: `${this.props.baseUrl}/faqs`,
                                label: "FAQs",
                                icon: QuestionMarkMajor
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
                <AppProvider i18n={{
                    Polaris: {
                        Frame: { skipToContent: 'Skip to content' },
                        TopBar: {
                        },
                    },
                }} theme={this.theme} linkComponent={this.adapterLink}>
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
            <Route key="members" exact path={`${this.props.baseUrl}/members`} render={(props) => <MemberList {...props} {...this.props} />} />,
            <Route key="mentors" exact path={`${this.props.baseUrl}/mentors`} render={(props) => <Mentors {...props} {...this.props} />} />,
            <Route key="mailing" exact path={`${this.props.baseUrl}/mailing`} render={(props) => <Mailing {...props} />} />,
            <Route key="omnitool" exact path={`${this.props.baseUrl}/omnitool`} render={(props) => <Omnitool {...props} />} />,
            <Route key="challenges" exact path={`${this.props.baseUrl}/challenges`} render={(props) => <ChallengesEditor {...props} />} />,
            <Route key="schedule" exact path={`${this.props.baseUrl}/schedule`} render={(props) => <ScheduleEditor {...props} />} />,
            <Route key="faqs" exact path={`${this.props.baseUrl}/faqs`} render={(props) => <FAQEditor {...props} />} />,
        ] : [];
        return (
            <Switch>
                <Redirect exact path={`${this.props.baseUrl}`} to={`${this.props.baseUrl}/overview`} />
                <Route exact path={`${this.props.baseUrl}/overview`} render={(props) => <Overview {...props} />} />
                <Route exact path={`${this.props.baseUrl}/applications`} render={(props) => <Applications {...props} />} />
                <Route exact path={`${this.props.baseUrl}/participants`} render={(props) => <Participants {...props} />} />
                <Route exact path={`${this.props.baseUrl}/checkin`} render={(props) => <CheckIn {...props} />} />
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
            if (status == 200) {
                const payload = res.data;
                if ("success" in payload && payload["success"]) {
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
