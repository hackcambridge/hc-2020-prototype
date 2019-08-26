import React, { Component } from "react";
import {ActionList, AppProvider, Card, Frame, TopBar, Navigation, Icon} from "@shopify/polaris";

interface ITopBarProps {

}

interface ITopBarState {
    userMenuOpen: boolean,
    searchActive: boolean,
    searchText: string
}

class AdminTopBar extends React.Component<ITopBarProps, ITopBarState> {

    constructor(props: ITopBarProps) {
        super(props);
        this.state = {
            userMenuOpen: false,
            searchActive: false,
            searchText: ""
        } as ITopBarState;
    }

    render() {
        const {userMenuOpen, searchText, searchActive} = this.state;

        const theme = {
            colors: {
                topBar: {
                    background: '#357997',
                },
            },
            logo: {
                width: 124,
                topBarSource:
                    'https://cdn.shopify.com/s/files/1/0446/6937/files/jaded-pixel-logo-color.svg?6215648040070010999',
                url: 'http://jadedpixel.com',
                accessibilityLabel: 'Jaded Pixel',
            },
        };

        const userMenuMarkup = (
            <TopBar.UserMenu
                actions={[
                    {
                        items: [{content: 'Back to Shopify'}],
                    },
                    {
                        items: [{content: 'Community forums'}],
                    },
                ]}
                name="Dharma"
                detail="Jaded Pixel"
                initials="D"
                open={userMenuOpen}
                onToggle={this.toggleUserMenu}
            />
        );

        const searchResultsMarkup = (
            <Card>
                <ActionList
                    items={[
                        {content: 'Shopify help center'},
                        {content: 'Community forums'},
                    ]}
                />
            </Card>
        );

        const searchFieldMarkup = (
            <TopBar.SearchField
                onChange={this.handleSearchChange}
                value={searchText}
                placeholder="Search"
            />
        );

        const topBarMarkup = (
            <TopBar
                showNavigationToggle={true}
                userMenu={userMenuMarkup}
                searchResultsVisible={searchActive}
                searchField={searchFieldMarkup}
                searchResults={searchResultsMarkup}
                onSearchResultsDismiss={this.handleSearchResultsDismiss}
                onNavigationToggle={() => {
                    console.log('toggle navigation visibility');
                }}
            />
        );

        return (
            <div style={{height: '250px'}}>
                <AppProvider theme={theme}>
                    <>
                        <Frame topBar={topBarMarkup} />
                        <Navigation location="/">
                            <Navigation.Section
                                items={[
                                    {
                                        url: '/path/to/place',
                                        label: 'Home',
                                        icon: "HomeMajorMonotone",
                                    },
                                    {
                                        url: '/path/to/place',
                                        label: 'Orders',
                                        icon: "OrdersMajorTwotone",
                                        badge: '15',
                                    },
                                    {
                                        url: '/path/to/place',
                                        label: 'Products',
                                        icon: "ProductsMajorTwotone",
                                    },
                                ]}
                            />
                        </Navigation>
                    </>
                </AppProvider>
            </div>
        );
    }

    toggleUserMenu = () => {
        this.setState(({userMenuOpen}) => ({userMenuOpen: !userMenuOpen}));
    };

    handleSearchResultsDismiss = () => {
        this.setState(() => {
            return {
                searchActive: false,
                searchText: '',
            };
        });
    };

    handleSearchChange = (value: string) => {
        this.setState({searchText: value});
        if (value.length > 0) {
            this.setState({searchActive: true});
        } else {
            this.setState({searchActive: false});
        }
    };
}

export default AdminTopBar;
