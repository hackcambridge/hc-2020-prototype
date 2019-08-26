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
            <Content style={{ padding: '0 30px', marginTop: "30px" }}>
                <div style={{ background: '#fff', padding: "36px 48px", minHeight: "280px" }}>
                    <h1 style={{ fontSize: "25px", fontWeight: 700 }}>{this.props.title}</h1>
                    {this.props.node}
                </div>
            </Content>
        );
    }
}

export default CommitteeContentWrapper;
