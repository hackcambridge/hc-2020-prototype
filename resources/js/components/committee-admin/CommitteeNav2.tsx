import React from "react";
import { Link } from "react-router-dom";
import CommitteeContentWrapper from "./CommitteeContentWrapper";
import { Users } from "./CommitteeUsersOverview";

class CommitteeNav2 extends React.Component {
    render() {
        const content = (
            <>
                {/*<h1>Committee Nav 2</h1>*/}
                {/*<Link to="/committee/admin/">X</Link>*/}
                {/*<div>{JSON.stringify(this.props)}</div>*/}
                <Users />
            </>
        );
        return <CommitteeContentWrapper node={content} title={"Beta"}/>
    }
}

export default CommitteeNav2;
