import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "antd";
import CommitteeContentWrapper from "./CommitteeContentWrapper";

const { Content } = Layout;

class CommitteeNav extends React.Component {
    render() {
        const content =  (
            <>
                <h1>Committee</h1>
                <Link to="/committee/admin/users">X</Link>
                <div>{JSON.stringify(this.props)}</div>
            </>
        );
        return <CommitteeContentWrapper node={content} title={"Alpha"}/>
    }
}

export default CommitteeNav;
