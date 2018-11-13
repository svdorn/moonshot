"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../../actions/usersActions";
import {} from "../../../../miscFunctions";
import { Tabs, Tab } from "@material-ui/core";
import {
    BarChart,
    Bar,
    Brush,
    ReferenceLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

import colors from "../../../../colors";
import "./dataDisplay.css";

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
        const data = [
            { name: "-4.75", uv: 300, pv: 456 },
            { name: "-4.25", uv: -145, pv: 230 },
            { name: "-3.75", uv: -100, pv: 345 },
            { name: "-3.25", uv: -8, pv: 450 },
            { name: "-2.75", uv: 100, pv: 321 },
            { name: "-2.25", uv: 9, pv: 235 },
            { name: "-1.75", uv: 53, pv: 267 },
            { name: "-1.25", uv: 252, pv: 378 },
            { name: "-0.75", uv: 79, pv: 210 },
            { name: "-0.25", uv: 294, pv: 23 },
            { name: "0.25", uv: 43, pv: 45 },
            { name: "0.75", uv: -74, pv: 90 },
            { name: "1.25", uv: -71, pv: 130 },
            { name: "1.75", uv: -117, pv: 11 },
            { name: "2.25", uv: -186, pv: 107 },
            { name: "2.75", uv: -16, pv: 926 },
            { name: "3.25", uv: -125, pv: 653 },
            { name: "3.75", uv: 222, pv: 366 },
            { name: "4.25", uv: 372, pv: 486 },
            { name: "4.75", uv: 182, pv: 512 }
        ];

        const facets = [
            { name: "Ambiguity", dataPoints: data, average: 2.3, interRel: 0.87, stdDev: 0.41 },
            { name: "Your Mom", dataPoints: data, average: 2.3, interRel: 0.87, stdDev: 0.41 },
            { name: "Hope", dataPoints: data, average: -1.6, interRel: 0.82, stdDev: 0.53 }
        ];

        const facetLis = facets.map(facet => {
            return (
                <div styleName="facet-graph">
                    <div>
                        <div>{facet.name}</div>
                        <br />
                        <BarChart
                            style={{ display: "inline-block" }}
                            width={600}
                            height={300}
                            data={facet.dataPoints}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <ReferenceLine y={0} stroke="#000" />
                            <Brush dataKey="name" height={30} stroke={colors.primaryCyan} />
                            <Bar dataKey="pv" fill={colors.primaryCyan} />
                        </BarChart>
                    </div>
                    <div>
                        <div>Average: {facet.average}</div>
                        <div>Interreliability: {facet.interRel}</div>
                        <div>Std. dev.: {facet.stdDev}</div>
                    </div>
                </div>
            );
        });

        return facetLis;
    }

    // the display for question data
    questions() {
        return "questions";
    }

    // the display for output data
    outputs() {
        const outputs = [
            {
                text:
                    "You love to diggity dongus, but are generally hesitant to \
                    scrim your scrongus. You love to diggity dongus, but are \
                    generally hesitant to scrim your scrongus.",
                disagree: 0.05,
                neutral: 0.12,
                agree: 0.83,
                proportion: 0.14
            },
            {
                text:
                    "You love to diggity dongus, but are generally hesitant to \
                    scrim your scrongus. You love to diggity dongus, but are \
                    generally hesitant to scrim your scrongus.",
                disagree: 0.15,
                neutral: 0.2,
                agree: 0.65,
                proportion: 0.3
            }
        ];
        // map each of the outputs to a list item
        let outputItems = outputs.map((output, index) => {
            return (
                <li key={`output ${index}`} styleName="psych-output-item">
                    <div>{output.text}</div>
                    <div>{output.disagree}</div>
                    <div>{output.neutral}</div>
                    <div>{output.agree}</div>
                    <div>{output.proportion}</div>
                </li>
            );
        });
        // add in the headers
        outputItems.unshift(
            <li key="output titles" styleName="psych-output-item">
                <div />
                <div>Disagree</div>
                <div>Neutral</div>
                <div>Agree</div>
                <div>Proportion</div>
            </li>
        );
        return <ul>{outputItems}</ul>;
    }

    render() {
        const { categoryIdx } = this.state;
        const categoryDisplays = [this.factors, this.facets, this.questions, this.outputs];
        console.log("categoryIdx: ", categoryIdx);

        return (
            <div>
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
