"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../../actions/usersActions";
import {} from "../../../../miscFunctions";
import { Tabs, Tab } from "@material-ui/core";

const sites = ["All", "Insights", "Learning"];

class Psych extends Component {
    constructor(props) {
        super(props);

        this.state = {
            site: sites[0]
        };
    }

    handleTabChange = (event, site) => {
        console.log("setting from ", this.state.site, " to ", site);
        this.setState({ site });
    };

    siteSelector() {
        return (
            <Tabs value={this.state.site} onChange={this.handleTabChange}>
                {sites.map(site => (
                    <Tab label={site} value={site} key={site} style={{ color: "white" }} />
                ))}
            </Tabs>
        );
    }

    render() {
        return <div style={{ height: "100vh" }}>{this.siteSelector()}</div>;
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Psych);
