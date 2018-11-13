"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../../actions/usersActions";
import {} from "../../../../miscFunctions";
import { Tabs, Tab } from "@material-ui/core";

const sites = ["All", "Insights", "Learning"];
const categories = ["Factors", "Facets", "Questions", "Outputs"];

class Psych extends Component {
    constructor(props) {
        super(props);

        this.state = {
            site: sites[0],
            categoryIdx: 0
        };
    }

    // change the site we're getting data from (All, Insights, Learning)
    handleSiteChange = (event, site) => {
        this.setState({ site });
    };

    // change the type of data we're getting (questions, facets, etc)
    handleCategoryChange = (event, categoryIdx) => {
        this.setState({ categoryIdx });
    };

    // the tabs that show the different sites you can choose from
    siteSelector() {
        return (
            <Tabs value={this.state.site} onChange={this.handleSiteChange} centered>
                {sites.map(site => (
                    <Tab label={site} value={site} key={site} style={{ color: "white" }} />
                ))}
            </Tabs>
        );
    }

    // the tabs to show the different categories you can choose from
    categorySelector() {
        return (
            <Tabs value={this.state.categoryIdx} onChange={this.handleCategoryChange} centered>
                {categories.map(cat => <Tab label={cat} key={cat} style={{ color: "white" }} />)}
            </Tabs>
        );
    }

    // the display for factor data
    factors() {
        return "factors";
    }

    // the display for facet data
    facets() {
        return "facets";
    }

    // the display for question data
    questions() {
        return "questions";
    }

    // the display for output data
    outputs() {
        return "outputs";
    }

    render() {
        const { categoryIdx } = this.state;
        const categoryDisplays = [this.factors, this.facets, this.questions, this.outputs];
        console.log("categoryIdx: ", categoryIdx);

        return (
            <div style={{ height: "100vh" }}>
                {this.siteSelector()}
                {this.categorySelector()}
                {categoryDisplays[categoryIdx]()}
            </div>
        );
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
