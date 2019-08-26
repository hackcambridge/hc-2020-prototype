import React from "react";
import CommitteeContentWrapper from "./CommitteeContentWrapper";

class Committee404 extends React.Component {
    render() {
        const content =  (
            <>
                <h3>Page not found.</h3>
            </>
        );
        return <CommitteeContentWrapper node={content} title={"404"}/>
    }
}

export default Committee404;
