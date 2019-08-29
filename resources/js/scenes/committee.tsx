import React, { Component } from "react";
import CommitteeNav from "../components/committee-admin/CommitteeNav";
import CommitteeNav2 from "../components/committee-admin/CommitteeNav2";
import Committee404 from "../components/committee-admin/Committee404";
import TopQuickNav from "../components/TopQuickNav";
import CommitteeAdminSidebar from "../components/committee-admin/CommitteeAdminSidebar";

//Import all needed Component for this tutorial
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link,
    Redirect
} from "react-router-dom";
import ReactDOM from "react-dom";
import { Layout, Menu, Icon, Breadcrumb } from 'antd';
import { AppProvider } from "@shopify/polaris";

const { Header, Content, Sider, Footer } = Layout;
const { SubMenu } = Menu;

export interface ICommitteeAdminProps {
    baseUrl: string;
    user: { type: string, name: string }
}

class CommitteeAdmin extends Component<ICommitteeAdminProps> {
    render(): React.ReactNode {
        const base = this.props.baseUrl;
        const logo = {
            maxHeight: "24px",
            verticalAlign: "sub"
        };
        const title = {
            display: "inline",
            color: "white",
            fontSize: "25px",
            lineHeight: "64px",
            paddingLeft: "15px",
            fontWeight: 500,
        };

        return (
            <AppProvider>
                <>
                    <Layout style={{ height: "100%" }}>
                        <TopQuickNav {...this.props}/>
                        <Header className="header" style={{ backgroundColor: "#CC0000", padding: "0 25px" }}>
                            <div className="logo">
                                <img src={"/images/101-white.png"} style={logo}/>
                                <h2 style={title}>Admin</h2>
                            </div>
                        </Header>
                        <Layout>
                            <Router>
                                <CommitteeAdminSidebar baseUrl={base} />
                                <Switch>
                                    <Route exact path={`${base}/`} render={ (props) => <CommitteeNav {...props} user={this.props.user} /> } />
                                    <Route exact path={`${base}/sponsors`} component={ CommitteeNav2 } />
                                    <Route component={ Committee404 } />
                                </Switch>
                            </Router>
                        </Layout>
                    </Layout>
                </>
            </AppProvider>
        );
    }
}

if (document.getElementById('committee-root')) {
    const element = document.getElementById('committee-root')
    if(element) {
        const propsString = element.dataset.props;
        const props : ICommitteeAdminProps = JSON.parse(propsString ? propsString : "{}");
        delete element.dataset.props;

        ReactDOM.render(<CommitteeAdmin {...props}/>, element);
        if(document.getElementById('loading')) {
            document.getElementById('loading').remove();
        }
    }
}
