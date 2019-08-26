import { Layout, Menu, Icon, Breadcrumb } from 'antd';
import React, { Component } from "react";
import { BrowserRouter, Link } from "react-router-dom";
import { withRouter, RouteComponentProps } from 'react-router';

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;


interface ICommitteeAdminSidebarProps extends RouteComponentProps<any> {
    baseUrl: string,
    currentUrl: string,
}

interface ISidebarMenuItem {
    title: string,
    url: string,
    icon: string,
    key: string,
}

const menuItems : Array<ISidebarMenuItem> = [
    { title: "Home", key: "home", url: "/", icon: "pic-center" },
    { title: "Home 2", key: "home2",url: "/users", icon: "pic-left" }
];

class CommitteeAdminSidebar extends Component<ICommitteeAdminSidebarProps> {
    render() {
        console.log("CommitteeAdminSidebar", this.props);
        const currentView = menuItems.find(item => {
            return this.props.location.pathname == `${this.props.baseUrl}${item.url}`;
        });

       const currentViewKey = currentView ? currentView.key : menuItems[0].key;

        return (
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                onBreakpoint={broken => {
                    console.log(broken);
                }}
                onCollapse={(collapsed, type) => {
                    console.log(collapsed, type);
                }}
                width={200} style={{ background: '#fff' }}
            >
                <Menu
                    mode="inline"
                    defaultSelectedKeys={[currentViewKey]}
                    defaultOpenKeys={['g1']}
                    style={{ height: '100%', borderRight: 0 }}
                    theme={"light"}
                >
                    <Menu.ItemGroup key="g1" title="Home">
                    { menuItems.map(item => {
                        return (
                            <Menu.Item key={item.key} style={{ margin: "0px" }}>
                                <Link to={`${this.props.baseUrl}${item.url}`}>
                                    <Icon type={item.icon} style={{ display: "inline" }}/>
                                    {item.title}
                                </Link>
                            </Menu.Item>
                        );
                    }) }
                    </Menu.ItemGroup>
                </Menu>
            </Sider>
        );
    }
}

export default withRouter<ICommitteeAdminSidebarProps, any>(CommitteeAdminSidebar);


// <Menu.ItemGroup key="g1" title="Item 1">
//     <Menu.Item key="1">Option 1</Menu.Item>
//     <Menu.Item key="2">Option 2</Menu.Item>
// </Menu.ItemGroup>