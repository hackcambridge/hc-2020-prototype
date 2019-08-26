import React from "react";
import { Link } from "react-router-dom";
import CommitteeContentWrapper from "./CommitteeContentWrapper";
import { Users } from "./CommitteeUsersOverview";
import axios from 'axios';

class CommitteeNav2 extends React.Component {

    componentDidMount(): void {
        axios.post(`/committee/admin-api/add-sponsor.json`, {
            name: "My New Sponsor 23"
        }).then(res => {
            const status = res.status;
            console.log(`Status: ${status}`);
            console.log(res.data);
        })
    }

    render() {
        return <Users />;
        // const content = (
        //     <>
        //         {/*<h1>Committee Nav 2</h1>*/}
        //         {/*<Link to="/committee/admin/">X</Link>*/}
        //         {/*<div>{JSON.stringify(this.props)}</div>*/}
        //         <Users />
        //     </>
        // );
        // return <CommitteeContentWrapper node={content} title={"Beta"}/>
    }
}

export default CommitteeNav2;
