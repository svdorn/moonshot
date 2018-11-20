"use strict";
import React, { Component } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification } from "../../../../actions/usersActions";
import { randomInt } from "../../../../miscFunctions";
import { Tabs, Tab, Dialog } from "@material-ui/core";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
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

        const { currentUser } = props;
        if (currentUser) {
            var { _id: userId, verificationToken } = currentUser;
        } else {
            var userId = undefined;
            var verificationToken = undefined;
        }

        this.state = {
            site: sites[0],
            factors: [],
            facets: [],
            questions: [],
            outputs: [],
            categoryIdx: 0,
            comparableFactors: [],
            comparableFacets: [],
            compareOpen: false,
            chartType: "line",
            dots: false,
            GETparams: { userId, verificationToken }
        };
    }

    componentDidMount() {
        this.updateData();
    }

    // when tab or site is updated, update the data shown
    componentDidUpdate(prevProps, prevState) {
        if (
            prevState.categoryIdx !== this.state.categoryIdx ||
            prevState.site !== this.state.site
        ) {
            this.updateData();
        }
    }

    // the functions used to update each category
    updateData = () => {
        const updateFunctions = [
            this.getFactorData,
            this.getFacetData,
            this.getQuestionData,
            this.getOutputData
        ];

        console.log("updating");

        updateFunctions[this.state.categoryIdx]();
    };

    // get data about every factor
    getFactorData = () => {
        const self = this;
        axios
            .get("/api/admin/dataDisplay/factors", {
                params: { ...this.state.GETparams, site: this.state.site }
            })
            .then(result => {
                self.setState({ factors: result.data.factors });
            })
            .catch(error => {
                console.log("error getting factor data: ", error);
            });
    };

    // get data about every facet
    getFacetData = () => {
        const facets = [
            {
                name: "Ambiguity",
                dataPoints: randomData[3],
                average: 2.3,
                interRel: 0.87,
                stdDev: 0.41
            },
            {
                name: "Your Mom",
                dataPoints: randomData[4],
                average: 2.3,
                interRel: 0.87,
                stdDev: 0.41
            },
            { name: "Hope", dataPoints: randomData[5], average: -1.6, interRel: 0.82, stdDev: 0.53 }
        ];

        this.setState({ facets });
    };

    // get data about the questions that are asked in the test
    getQuestionData = () => {
        const questions = [
            {
                question: "What's yo poison?",
                rightOption: "moydah",
                leftOption: "luv",
                interRel: 0.3,
                average: 1.3,
                stdDev: 2,
                factor: "Honesty-Humility",
                facet: "Shamefulness"
            },
            {
                question:
                    "aa pa paweiflnj asdp asfkajsdlfj anjwodfipa 8sijahowpf9 adisfjlahsof awefpi auhwef lasjdf a?",
                rightOption: "auhsd98fpuia nawf awef pawe",
                leftOption: "aweoifhuawe falsdawef awefasdw awef wef wef",
                interRel: 0.5,
                average: -0.8,
                stdDev: 1.69,
                factor: "Emotionality",
                facet: "Crybabiness"
            }
        ];

        this.setState({ questions });
    };

    // get data about the outputs that are given to people who take the test for fun
    getOutputData = () => {
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

        this.setState({ outputs });
    };

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
        if (facArray.length < 1) {
            return this.props.addNotification("Need something to compare", "error");
        }
        // pop up a modal with the comparison
        this.setState({ compareOpen: true });
    };

    // close the comparison dialog
    closeCompare = () => {
        this.setState({ compareOpen: false });
    };

    // change whether we see a line chart or a bar chart
    changeChartType = () => {
        const newType = this.state.chartType === "line" ? "bar" : "line";
        this.setState({ chartType: newType });
    };

    // toggle whether you can see line chart dots
    toggleDots = () => {
        this.setState({ dots: !this.state.dots });
    };

    // the tabs that show the different sites you can choose from
    siteSelector() {
        return (
            <Tabs
                value={this.state.site}
                onChange={this.handleSiteChange}
                centered
                className="no-focus-outline"
            >
                {sites.map(site => (
                    <Tab label={site} value={site} key={site} style={{ color: "white" }} />
                ))}
            </Tabs>
        );
    }

    // the tabs to show the different categories you can choose from
    categorySelector() {
        return (
            <Tabs
                value={this.state.categoryIdx}
                onChange={this.handleCategoryChange}
                centered
                className="no-focus-outline"
            >
                {categories.map(cat => <Tab label={cat} key={cat} style={{ color: "white" }} />)}
            </Tabs>
        );
    }

    // the display for factor data
    factors = () => {
        const self = this;

        const factorGraphs = this.state.factors.map(factor => {
            // the parts of the chart that are common to Bar and Line Charts
            const chartParts = [
                <CartesianGrid strokeDasharray="3 3" />,
                <XAxis dataKey="name" />,
                <YAxis />,
                <Tooltip />,
                <ReferenceLine y={0} stroke="#000" />,
                <Brush dataKey="name" height={30} stroke={colors.primaryCyan} />
            ];
            // the attributes for the overall chart
            const chartAttrs = {
                style: { display: "inline-block" },
                width: 600,
                height: 300,
                data: factor.dataPoints,
                margin: { top: 5, right: 30, left: 20, bottom: 5 }
            };
            if (this.state.chartType === "bar") {
                chartParts.push(<Bar dataKey="quantity" fill={colors.primaryCyan} />);
                var chart = <BarChart {...chartAttrs}>{chartParts}</BarChart>;
            } else {
                chartParts.push(
                    <Line
                        type="monotone"
                        dataKey="quantity"
                        stroke={colors.primaryCyan}
                        dot={this.state.dots ? undefined : null}
                    />
                );
                var chart = <LineChart {...chartAttrs}>{chartParts}</LineChart>;
            }

            return [
                <div styleName="facet-graph" key={factor.name}>
                    <div>
                        <div>{factor.name}</div>
                        <br />
                        {chart}
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
                <div
                    styleName="chart-type-button"
                    className={button.cyan}
                    onClick={this.changeChartType}
                >
                    {this.state.chartType === "bar" ? "Switch to Lines" : "Switch to Bars"}
                </div>
                {this.state.chartType === "line" ? (
                    <div
                        styleName="toggle-dots-button"
                        className={button.cyan}
                        onClick={this.toggleDots}
                    >
                        Toggle Dots
                    </div>
                ) : null}
                {factorGraphs}
            </div>
        );
    };

    // the display for facet data
    facets = () => {
        const self = this;

        const facetLis = this.state.facets.map((facet, fIdx) => {
            // the parts of the chart that are common to Bar and Line Charts
            const chartParts = [
                <CartesianGrid strokeDasharray="3 3" />,
                <XAxis dataKey="name" />,
                <YAxis />,
                <Tooltip />,
                <ReferenceLine y={0} stroke="#000" />,
                <Brush dataKey="name" height={30} stroke={colors.primaryCyan} />
            ];
            // the attributes for the overall chart
            const chartAttrs = {
                style: { display: "inline-block" },
                width: 600,
                height: 300,
                data: facet.dataPoints,
                margin: { top: 5, right: 30, left: 20, bottom: 5 }
            };
            if (this.state.chartType === "bar") {
                chartParts.push(<Bar dataKey="quantity" fill={colors.primaryCyan} />);
                var chart = <BarChart {...chartAttrs}>{chartParts}</BarChart>;
            } else {
                chartParts.push(
                    <Line
                        type="monotone"
                        dataKey="quantity"
                        stroke={colors.primaryCyan}
                        dot={this.state.dots ? undefined : null}
                    />
                );
                var chart = <LineChart {...chartAttrs}>{chartParts}</LineChart>;
            }
            return [
                <div styleName="facet-graph" key={`facet ${fIdx}`}>
                    <div>
                        <div>{facet.name}</div>
                        <br />
                        {chart}
                    </div>
                    <div>
                        <div>Average: {facet.average}</div>
                        <div>Interreliability: {facet.interRel}</div>
                        <div>Std. dev.: {facet.stdDev}</div>
                    </div>
                    <div
                        className="checkbox smallCheckbox whiteCheckbox"
                        onClick={() => self.handleCheckMarkClick(facet)}
                    >
                        <img
                            alt=""
                            className={
                                "checkMark" +
                                self.state.comparableFacets.some(cf => cf.name === facet.name)
                            }
                            src={"/icons/CheckMarkRoundedWhite" + self.props.png}
                        />
                    </div>
                </div>,
                <br key={`facet ${fIdx} br`} />
            ];
        });

        return (
            <div>
                <div className={button.cyan} styleName="compare-button" onClick={this.compare}>
                    Compare
                </div>
                <div
                    styleName="chart-type-button"
                    className={button.cyan}
                    onClick={this.changeChartType}
                >
                    {this.state.chartType === "bar" ? "Switch to Lines" : "Switch to Bars"}
                </div>
                {this.state.chartType === "line" ? (
                    <div
                        styleName="toggle-dots-button"
                        className={button.cyan}
                        onClick={this.toggleDots}
                    >
                        Toggle Dots
                    </div>
                ) : null}
                {facetLis}
            </div>
        );
    };

    // the display for question data
    questions = () => {
        return this.state.questions.map((q, qIdx) => {
            return [
                <div styleName="facet-graph" key={`facet ${qIdx}`}>
                    <div style={{ marginRight: "20px", textAlign: "left", width: "600px" }}>
                        <div style={{ fontWeight: "initial" }}>
                            <span>Question:</span> {q.question}
                        </div>
                        <div>
                            <span>Left: </span>
                            {q.leftOption}
                        </div>
                        <div>
                            <span>Right: </span>
                            {q.rightOption}
                        </div>
                        <div>
                            <span>Factor: </span>
                            {q.factor}
                        </div>
                        <div>
                            <span>Facet: </span>
                            {q.facet}
                        </div>
                    </div>
                    <div>
                        <div>Average: {q.average}</div>
                        <div>Interreliability: {q.interRel}</div>
                        <div>Std. dev.: {q.stdDev}</div>
                    </div>
                </div>,
                <br key={`facet ${qIdx} br`} />
            ];
        });
    };

    // the display for output data
    outputs = () => {
        // map each of the outputs to a list item
        let outputItems = this.state.outputs.map((output, index) => {
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
            <div style={{ textAlign: "center" }}>
                {this.siteSelector()}
                {this.categorySelector()}
                {categoryDisplays[categoryIdx]()}
                <Dialog open={compareOpen} onClose={this.closeCompare}>
                    <CompareFactors
                        factors={
                            categoryIdx === 0
                                ? this.state.comparableFactors
                                : this.state.comparableFacets
                        }
                    />
                </Dialog>
            </div>
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
