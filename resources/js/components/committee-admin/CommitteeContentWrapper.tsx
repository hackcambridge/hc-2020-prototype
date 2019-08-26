import React, { Component, ReactNode } from "react";
import { Layout, PageHeader } from "antd";
import {Link} from "react-router-dom";

const { Content } = Layout;

interface ICommitteeContentWrapper {
    node: ReactNode;
    title: string
}

class CommitteeContentWrapper extends Component<ICommitteeContentWrapper> {
    render() {
        return (
            <Layout>
                <Content className={"committee-content-wrapper"}>
                    <div className={"wrapper-inner"} style={{ background: '#fff', padding: "36px 48px", minHeight: "280px" }}>
                        <h1 style={{ fontSize: "3rem", fontWeight: 700 }}>{this.props.title}</h1>
                        {this.props.node}
                    </div>
                </Content>
                <footer style={{ padding: "12px", textAlign: "center"}}>© HackCambridge {new Date().getFullYear()}</footer>
            </Layout>
        );
    }
}

export default CommitteeContentWrapper;
