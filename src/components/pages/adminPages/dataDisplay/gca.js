"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../../actions/usersActions";
import { randomInt } from "../../../../miscFunctions";
import colors from "../../../../colors";
import { button } from "../../../../classes";
import { Tabs, Tab, MenuItem, Select } from "@material-ui/core";
import "./dataDisplay.css";
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

const sites = ["All", "Insights", "Learning"];

class GCA extends Component {
    constructor(props) {
        super(props);

        this.state = {
            site: sites[0],
            tab: "distribution",
            dots: false,
            chartType: "line",
            rpms: [],
            distribution: [],
            chartType: "line",
            dots: false,
            average: 0,
            stdDev: 1,
            tab: "distribution",
            sortBy: "Name"
        };
    }

    componentDidMount() {
        this.updateData();
    }

    // when tab or site is updated, update the data shown
    componentDidUpdate(prevProps, prevState) {
        if (prevState.tab !== this.state.tab || prevState.site !== this.state.site) {
            this.updateData();
        }
    }

    updateData() {
        if (this.state.tab === "distribution") {
            this.getGcaData();
        } else {
            this.getRpmData();
        }
    }

    // get the data for overall gca distribution
    getGcaData() {
        let distribution = [];
        for (let i = 50; i <= 150; i += 5) {
            distribution.push({
                score: i,
                quantity: randomInt(0, 1000)
            });
        }

        this.setState({ distribution });
    }

    // get data for all the individual rpms
    getRpmData() {
        const rpms = [
            {
                name: "RPM1",
                proportion: 0.23,
                time: 38,
                n: 400,
                correct: 4
            },
            {
                name: "RPM2",
                proportion: 0.49,
                time: 23,
                n: 506,
                correct: 7
            },
            {
                name: "RPM1",
                proportion: 0.23,
                time: 38,
                n: 400,
                correct: 4
            },
            {
                name: "RPM2",
                proportion: 0.49,
                time: 23,
                n: 506,
                correct: 7
            },
            {
                name: "RPM1",
                proportion: 0.23,
                time: 38,
                n: 400,
                correct: 4
            },
            {
                name: "RPM2",
                proportion: 0.49,
                time: 23,
                n: 506,
                correct: 7
            },
            {
                name: "RPM1",
                proportion: 0.23,
                time: 38,
                n: 400,
                correct: 4
            },
            {
                name: "RPM2",
                proportion: 0.49,
                time: 23,
                n: 506,
                correct: 7
            },
            {
                name: "RPM1",
                proportion: 0.23,
                time: 38,
                n: 400,
                correct: 4
            },
            {
                name: "RPM2",
                proportion: 0.49,
                time: 23,
                n: 506,
                correct: 7
            }
        ];

        this.setState({ rpms });
    }

    // sort the rpms by some criteria
    sortRpms = () => {
        let { rpms, sortBy } = this.state;

        let sortFunc;
        if (sortBy === "Number") {
            sortFunc = this.numberSort;
        } else if (sortBy === "Time") {
            sortFunc = this.timeSort;
        } else if (sortBy === "Correct") {
            sortFunc = this.proportionSort;
        } else {
            sortFunc = this.nameSort;
        }

        rpms = rpms.sort(sortFunc);

        this.setState({ rpms });
    };

    // sort the rpms by name
    nameSort = (rpm1, rpm2) => {
        if (rpm1.name > rpm2.name) {
            return -1;
        } else if (rpm1.name < rpm2.name) {
            return 1;
        } else {
            return 0;
        }
    };

    // sort the rpms by the number of people who have done it
    numberSort = (rpm1, rpm2) => {
        return rpm1.n - rpm2.n;
    };

    // sort by the average amount of time it takes to complete the rpm
    timeSort = (rpm1, rpm2) => {
        return rpm1.time - rpm2.time;
    };

    // sort by the proportion of people who got the rpm correct
    proportionSort = (rpm1, rpm2) => {
        return rpm1.proportion - rpm2.proportion;
    };

    // toggle whether you can see line chart dots
    toggleDots = () => {
        this.setState({ dots: !this.state.dots });
    };

    // change the sorting dropdown item that is selected
    handleChangeSortBy = event => {
        const sortBy = event.target.value;
        this.setState({ sortBy }, this.sortRpms);
    };

    // makes a dropdown to select how the rpms should be sorted
    sortDropDown() {
        const sortTerms = ["Time", "Correct", "Number", "Name"];

        // create the stage name menu items
        const sortItems = sortTerms.map(sortTerm => {
            return (
                <MenuItem value={sortTerm} key={sortTerm}>
                    {sortTerm}
                </MenuItem>
            );
        });

        return (
            <Select
                disableUnderline={true}
                classes={{
                    root: "selectRootWhite myCandidatesSelect",
                    icon: "selectIconWhiteImportant"
                }}
                style={{ marginTop: "20px" }}
                value={this.state.sortBy}
                onChange={this.handleChangeSortBy}
            >
                {sortItems}
            </Select>
        );
    }

    rpmsDisplay = () => {
        const { png } = this.props;

        const rpms = this.state.rpms.map(rpm => {
            return (
                <div styleName="rpm-display">
                    <div>
                        <div>Name: {rpm.name}</div>
                        <div>
                            N = <span>{rpm.n}</span>
                        </div>
                        <div>
                            Correct: <span>{rpm.proportion}%</span>
                        </div>
                        <div>
                            Average time: <span>{rpm.time}</span>
                        </div>
                    </div>
                    <div styleName="rpm">
                        <img src={`/images/cognitiveTest/${rpm.name}${png}`} />
                        <br />
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                            <img
                                src={`/images/cognitiveTest/${rpm.name}-${num}${png}`}
                                styleName={rpm.correct == num ? "correct" : ""}
                            />
                        ))}
                    </div>
                </div>
            );
        });

        return (
            <div>
                {this.sortDropDown()}
                <br />
                {rpms}
            </div>
        );
    };

    distributionGraph() {
        const self = this;
        const { distribution, average, stdDev, dots, chartType } = this.state;

        // the parts of the chart that are common to Bar and Line Charts
        const chartParts = [
            <CartesianGrid strokeDasharray="3 3" />,
            <XAxis dataKey="score" />,
            <YAxis />,
            <Tooltip />,
            <ReferenceLine y={0} stroke="#000" />,
            <Brush dataKey="score" height={30} stroke={colors.primaryCyan} />
        ];
        // the attributes for the overall chart
        const chartAttrs = {
            style: { display: "inline-block" },
            width: 600,
            height: 300,
            data: distribution,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };
        if (chartType === "bar") {
            chartParts.push(<Bar dataKey="quantity" fill={colors.primaryCyan} />);
            var chart = <BarChart {...chartAttrs}>{chartParts}</BarChart>;
        } else {
            chartParts.push(
                <Line
                    type="monotone"
                    dataKey="quantity"
                    stroke={colors.primaryCyan}
                    dot={dots ? undefined : null}
                />
            );
            var chart = <LineChart {...chartAttrs}>{chartParts}</LineChart>;
        }

        const graph = (
            <div styleName="facet-graph">
                <div>
                    <div>Score Distribution</div>
                    <br />
                    {chart}
                </div>
                <div>
                    <div>Average: {average}</div>
                    <div>Std. dev.: {stdDev}</div>
                </div>
            </div>
        );

        return (
            <div>
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
                {graph}
            </div>
        );
    }

    // switch between distribution and rpms
    handleTabChange = (event, tab) => {
        this.setState({ tab });
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

    // change the site we're getting data from (All, Insights, Learning)
    handleSiteChange = (event, site) => {
        this.setState({ site });
    };

    render() {
        const { tab } = this.state;

        return (
            <div style={{ minHeight: "100vh", textAlign: "center" }}>
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
                <Tabs
                    value={tab}
                    onChange={this.handleTabChange}
                    centered
                    className="no-focus-outline"
                >
                    <Tab
                        label="Distribution"
                        value="distribution"
                        key="distribution"
                        style={{ color: "white" }}
                    />
                    <Tab label="RPMs" value="rpms" key="rpms" style={{ color: "white" }} />
                </Tabs>
                {tab === "distribution" ? this.distributionGraph() : null}
                {tab === "rpms" ? this.rpmsDisplay() : null}
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
    return bindActionCreators({}, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GCA);
