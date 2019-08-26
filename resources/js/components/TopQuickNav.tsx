import React, { Component } from "react";
import { ICommitteeAdminProps } from "../scenes/committee"

class TopQuickNav extends Component<ICommitteeAdminProps> {
    render() {
        const style = {
            width: "100%",
            backgroundColor: "black",
            color: "white",
            padding: "10px",
        };
        console.log("TopQuickNav", this.props);
        return <div style={style}>{this.props.user.name}, {this.props.user.type}</div>
    }
}

export default TopQuickNav;