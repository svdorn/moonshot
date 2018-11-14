"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { addNotification } from "../../../../actions/usersActions";
import { randomInt } from "../../../../miscFunctions";
import { Tabs, Tab, Dialog } from "@material-ui/core";
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
import CompareFactors from "./compareFactors";

import colors from "../../../../colors";
import { button } from "../../../../classes";
import "./dataDisplay.css";

const sites = ["All", "Insights", "Learning"];
const categories = ["Factors", "Facets", "Questions", "Outputs"];

const theme = createMuiTheme({
    palette: {
        primary: { main: "#76defe", dark: "#76defe", light: "#76defe" },
        secondary: { main: "#76defe", dark: "#76defe", light: "#76defe" },
        error: { main: "#eb394f", dark: "#eb394f", light: "#eb394f" },
        type: "dark"
    },
    typography: { fontFamily: "Muli,sans-serif" }
});

const nums = [
    "-4.75",
    "-4.25",
    "-3.75",
    "-3.25",
    "-2.75",
    "-2.25",
    "-1.75",
    "-1.25",
    "-0.75",
    "-0.25",
    "0.25",
    "0.75",
    "1.25",
    "1.75",
    "2.25",
    "2.75",
    "3.25",
    "3.75",
    "4.25",
    "4.75"
];

const randomData = [0, 1, 2, 3, 4, 5, 6].map(n =>
    nums.map(num => ({ name: num, quantity: randomInt(0, 400) }))
);

class Psych extends Component {
    constructor(props) {
        super(props);

        this.state = {
            site: sites[0],
            categoryIdx: 0,
            comparableFactors: [],
            comparableFacets: [],
            compareOpen: false
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

    // mark a factor/facet to compare
    handleCheckMarkClick = fac => {
        let { categoryIdx } = this.state;
        // find out if we're using factors or facets
        const facType = categoryIdx === 0 ? "comparableFactors" : "comparableFacets";
        let facArray = this.state[facType];
        console.log("facArray: ", facArray);
        // go through each factor/facet that's already clicked
        for (let cfIdx = 0; cfIdx < facArray.length; cfIdx++) {
            // if it's the same as the one that was clicked ...
            if (facArray[cfIdx].name === fac.name) {
                // ... remove it, then set the state to reflect the change
                facArray = facArray.slice(0, cfIdx).concat(facArray.slice(cfIdx + 1));
                return this.setState({ [facType]: facArray });
            }
        }
        // if the factor didn't exists within the array, add it, then set state
        facArray.push(fac);
        this.setState({ [facType]: facArray });
    };

    // pop up a modal comparing two factors/facets
    compare = () => {
        // find out whether we're getting facets or factors
        const facType = this.state.categoryIdx === 0 ? "comparableFactors" : "comparableFacets";
        const facArray = this.state[facType];
        // can't compare one factor to itself
        if (facArray.length < 2) {
            return this.props.addNotification(
                "Need at least two factors/facets to compare",
                "error"
            );
        }
        // pop up a modal with the comparison
        this.setState({ compareOpen: true });
    };

    // close the comparison dialog
    closeCompare = () => {
        this.setState({ compareOpen: false });
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
    factors = () => {
        const self = this;

        const data = [
            { name: "-4.75", quantity: 456 },
            { name: "-4.25", quantity: 230 },
            { name: "-3.75", quantity: 345 },
            { name: "-3.25", quantity: 450 },
            { name: "-2.75", quantity: 321 },
            { name: "-2.25", quantity: 235 },
            { name: "-1.75", quantity: 267 },
            { name: "-1.25", quantity: 378 },
            { name: "-0.75", quantity: 210 },
            { name: "-0.25", quantity: 23 },
            { name: "0.25", quantity: 45 },
            { name: "0.75", quantity: 90 },
            { name: "1.25", quantity: 130 },
            { name: "1.75", quantity: 11 },
            { name: "2.25", quantity: 107 },
            { name: "2.75", quantity: 926 },
            { name: "3.25", quantity: 653 },
            { name: "3.75", quantity: 366 },
            { name: "4.25", quantity: 486 },
            { name: "4.75", quantity: 512 }
        ];

        const factors = [
            {
                name: "Honesty-Humility",
                dataPoints: randomData[0],
                average: 2.3,
                stdDev: 0.41
            },
            { name: "Extraversion", dataPoints: randomData[1], average: 2.3, stdDev: 0.41 },
            {
                name: "Dinglification",
                dataPoints: randomData[2],
                average: -1.6,
                stdDev: 0.53
            }
        ];

        const factorGraphs = factors.map(factor => {
            return [
                <div styleName="facet-graph" key={factor.name}>
                    <div>
                        <div>{factor.name}</div>
                        <br />
                        <BarChart
                            style={{ display: "inline-block" }}
                            width={600}
                            height={300}
                            data={factor.dataPoints}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <ReferenceLine y={0} stroke="#000" />
                            <Brush dataKey="name" height={30} stroke={colors.primaryCyan} />
                            <Bar dataKey="quantity" fill={colors.primaryCyan} />
                        </BarChart>
                    </div>
                    <div>
                        <div>Average: {factor.average}</div>
                        <div>Std. dev.: {factor.stdDev}</div>
                    </div>
                    <div
                        className="checkbox smallCheckbox whiteCheckbox"
                        onClick={() => self.handleCheckMarkClick(factor)}
                    >
                        <img
                            alt=""
                            className={
                                "checkMark" +
                                self.state.comparableFactors.some(cf => cf.name === factor.name)
                            }
                            src={"/icons/CheckMarkRoundedWhite" + self.props.png}
                        />
                    </div>
                </div>,
                <br key={`${factor.name} br`} />
            ];
        });

        return (
            <div>
                <div className={button.cyan} styleName="compare-button" onClick={this.compare}>
                    Compare
                </div>
                {factorGraphs}
            </div>
        );
    };

    // the display for facet data
    facets = () => {
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
    };

    // the display for question data
    questions = () => {
        return "questions";
    };

    // the display for output data
    outputs = () => {
        const outputs = [
            {
                text:
                    "You love to diggity dongus, but are generally hesitant to \
                    scrim your scrongus. You love to diggity dongus, but are \
                    generally hesitant to scrim your scrongus.",
                disagree: 0.05,
                neutral: 0.12,
                agree: 0.83,
                proportion: 0.14,
                n: 403
            },
            {
                text:
                    "You love to diggity dongus, but are generally hesitant to \
                    scrim your scrongus. You love to diggity dongus, but are \
                    generally hesitant to scrim your scrongus.",
                disagree: 0.15,
                neutral: 0.2,
                agree: 0.65,
                proportion: 0.3,
                n: 64
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
                    <div>{output.n}</div>
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
                <div style={{ fontStyle: "italic" }}>n = </div>
            </li>
        );
        return <ul>{outputItems}</ul>;
    };

    render() {
        const { categoryIdx, compareOpen } = this.state;
        const categoryDisplays = [this.factors, this.facets, this.questions, this.outputs];
        console.log("categoryIdx: ", categoryIdx);

        return (
            <MuiThemeProvider theme={theme}>
                <div style={{ textAlign: "center" }}>
                    {this.siteSelector()}
                    {this.categorySelector()}
                    {categoryDisplays[categoryIdx]()}
                    <Dialog open={compareOpen} onClose={this.closeCompare}>
                        <CompareFactors factors={this.state.comparableFactors} />
                    </Dialog>
                </div>
            </MuiThemeProvider>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ addNotification }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Psych);
