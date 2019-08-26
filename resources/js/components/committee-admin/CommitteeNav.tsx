import React from "react";
import { Link } from "react-router-dom";
import { Layout, Result, Icon, Button  } from "antd";
import CommitteeContentWrapper from "./CommitteeContentWrapper";

const { Content } = Layout;

interface ICommitteeNavProps {
    user: { type: string, name: string }
}

class CommitteeNav extends React.Component<ICommitteeNavProps> {
    render() {
        const content =  (
            <>
                {/*<h1>Hi {this.props.user.name}!</h1>*/}
                {/*<Link to="/committee/admin/users">X</Link>*/}
                {/*<div>{JSON.stringify(this.props)}</div>*/}
                <Result
                    icon={<Icon type="smile" theme="twoTone" />}
                    title="Have a lovely day!"
                    extra={<Button type="primary"><Link to={"attendees"}>See attendees</Link></Button>}
                />
            </>
        );
        return <CommitteeContentWrapper node={content} title={`Hi ${this.props.user.name}!`}/>
    }
}

export default CommitteeNav;
