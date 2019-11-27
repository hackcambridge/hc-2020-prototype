import React, { Component, ReactNode } from "react";
import { withRouter, RouteComponentProps, Link, Switch, Route, Redirect } from "react-router-dom";
import { ICommitteeProps } from "../../interfaces/committee.interfaces";
import {
    AppProvider,
    Frame,
    TopBar,
    Navigation,
    Banner,
} from "@shopify/polaris";
import {LogOutMinor, IqMajorMonotone, AddCodeMajorMonotone, CustomerPlusMajorMonotone, HomeMajorMonotone, PackageMajorMonotone} from '@shopify/polaris-icons';
import Dashboard404 from "../dashboard/Dashboard404";
import Applications from "./components/Applications";
import axios from 'axios';
import { ToastContainer, cssTransition } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import md5 from "md5";

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
                        }
                    ]}
                />

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
        return (
            <Switch>
                <Route exact path={`${this.props.baseUrl}/`} render={(props) => <h1>test</h1>} />
                <Route exact path={`${this.props.baseUrl}/applications`} render={(props) => <Applications {...props} />} />
                <Route component={Dashboard404}></Route>
            </Switch>
        );
    }

}

export default withRouter(Dashboard);