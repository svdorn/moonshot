"use strict";
import React, { Component } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification } from "../../../../actions/usersActions";
import { round } from "../../../../miscFunctions";
import { Tabs, Tab, Dialog, CircularProgress } from "@material-ui/core";
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

const makePercent = num => {
    if (typeof num !== "number") {
        return "";
    }
    num *= 1000;
    num = Math.round(num);
    num /= 10;
    return `${num}%`;
};

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
            loading: false,
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
            // show the loading circle
            this.setState({ loading: true });
            // retrieve new data
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

        updateFunctions[this.state.categoryIdx]();
    };

    // get data about every factor
    getFactorData = () => {
        const self = this;
        axios
            .get("/api/admin/dataDisplay/factors", {
                params: { ...this.state.GETparams, site: this.state.site }
            })
            .then(result => self.setState({ factors: result.data.factors, loading: false }))
            .catch(error => console.log("error getting factor data: ", error));
    };

    // get data about every facet
    getFacetData = () => {
        const self = this;
        axios
            .get("/api/admin/dataDisplay/facets", {
                params: { ...this.state.GETparams, site: this.state.site }
            })
            .then(result => self.setState({ facets: result.data.facets, loading: false }))
            .catch(error => console.log("error getting facet data: ", error));
    };

    // get data about the questions that are asked in the test
    getQuestionData = () => {
        const self = this;

        axios
            .get("/api/admin/dataDisplay/questions", {
                params: { ...this.state.GETparams, site: this.state.site }
            })
            .then(response => self.setState({ questions: response.data.questions, loading: false }))
            .catch(error => console.log("Error getting data: ", error));
    };

    // get data about the outputs that are given to people who take the test for fun
    getOutputData = () => {
        const self = this;
        axios
            .get("/api/admin/dataDisplay/outputs", {
                params: { ...this.state.GETparams, site: this.state.site }
            })
            .then(result => self.setState({ outputs: result.data.outputs, loading: false }))
            .catch(error => console.log("error getting factor data: ", error));
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
        const facName = categoryIdx === 0 ? "factors" : "facets";
        const comparableType = categoryIdx === 0 ? "comparableFactors" : "comparableFacets";
        let compareArray = this.state[comparableType];
        let facArray = this.state[facName];

        // get the index of this fac in its array
        const facIndex = facArray.findIndex(f => f.name === fac.name);

        // if the "facs to compare" array has that index ...
        const idx = compareArray.indexOf(facIndex);
        if (idx > -1) {
            // ... remove the index
            compareArray = compareArray.slice(0, idx).concat(compareArray.slice(idx + 1));
        } else {
            // ... otherwise add the index
            compareArray.push(facIndex);
        }

        this.setState({ [comparableType]: compareArray });
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

    // get a list of factors/facets for the CompareFactors component
    getComparableFacs = () => {
        let { categoryIdx, compareOpen } = this.state;

        // find out if we're using factors or facets
        const facName = categoryIdx === 0 ? "factors" : "facets";
        const comparableType = categoryIdx === 0 ? "comparableFactors" : "comparableFacets";
        let facArray = this.state[facName];
        let compareArray = this.state[comparableType];

        return compareArray.map(idx => facArray[idx]);
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

        const factorGraphs = this.state.factors.map((factor, idx) => {
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
                        <div>Average: {round(factor.average, 2)}</div>
                        <div>Std. dev.: {round(factor.stdDev, 2)}</div>
                    </div>
                    <div
                        className="checkbox smallCheckbox whiteCheckbox"
                        onClick={() => self.handleCheckMarkClick(factor)}
                    >
                        <img
                            alt=""
                            className={"checkMark" + self.state.comparableFactors.includes(idx)}
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
                        <div>Average: {round(facet.average, 2)}</div>
                        <div>Chronbach's Alpha: {round(facet.interRel, 2)}</div>
                        <div>Std. dev.: {round(facet.stdDev, 2)}</div>
                    </div>
                    <div
                        className="checkbox smallCheckbox whiteCheckbox"
                        onClick={() => self.handleCheckMarkClick(facet)}
                    >
                        <img
                            alt=""
                            className={"checkMark" + self.state.comparableFacets.includes(fIdx)}
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
                        <div>Average: {round(q.average, 2)}</div>
                        <div>Facet Alpha: {round(q.facetAlpha, 2)}</div>
                        <div>Alpha Without This: {round(q.cAlphaWithoutQuestion, 2)}</div>
                        <div>Std. dev.: {round(q.stdDev, 2)}</div>
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
            let levels = ["high", "med", "low"].map(level => {
                const levelInfo = output[level];

                return (
                    <li key={`output ${index} ${level}`} styleName="psych-output-item">
                        <div>{levelInfo.text}</div>
                        <div>{makePercent(levelInfo.disagree)}</div>
                        <div>{makePercent(levelInfo.neutral)}</div>
                        <div>{makePercent(levelInfo.agree)}</div>
                        <div>{makePercent(levelInfo.proportion)}</div>
                        <div>{levelInfo.responded}</div>
                        <div>{levelInfo.n}</div>
                    </li>
                );
            });
            // add in the header
            levels.unshift(
                <li
                    key={`output ${index} header`}
                    styleName="psych-output-item"
                    style={{ listStyleType: "none" }}
                >
                    <div style={{ color: colors.primaryCyan }}>{output.name}</div>
                </li>
            );

            return levels;
        });
        // add in the headers
        outputItems.unshift(
            <li key="output titles" styleName="psych-output-item">
                <div />
                <div>Disagree</div>
                <div>Neutral</div>
                <div>Agree</div>
                <div>Proportion</div>
                <div>Responded</div>
                <div style={{ fontStyle: "italic" }}>n = </div>
            </li>
        );
        return <ul>{outputItems}</ul>;
    };

    render() {
        const { categoryIdx, compareOpen } = this.state;
        const categoryDisplays = [this.factors, this.facets, this.questions, this.outputs];

        return (
            <div style={{ textAlign: "center" }}>
                {this.siteSelector()}
                {this.categorySelector()}
                {this.state.loading ? <CircularProgress /> : null}
                {categoryDisplays[categoryIdx]()}
                <Dialog open={compareOpen} onClose={this.closeCompare}>
                    <CompareFactors
                        facs={this.getComparableFacs()}
                        facType={categoryIdx === 0 ? "factors" : "facets"}
                        site={this.state.site}
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
