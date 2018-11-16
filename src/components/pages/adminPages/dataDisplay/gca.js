"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../../actions/usersActions";
import { randomInt } from "../../../../miscFunctions";
import colors from "../../../../colors";
import { button } from "../../../../classes";
import { Tabs, Tab } from "@material-ui/core";
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

class BoilerPlate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: "distribution",
            dots: false,
            chartType: "line",
            rpms: [],
            distribution: [],
            chartType: "line",
            dots: false,
            average: 0,
            stdDev: 1,
            tab: "distribution"
        };
    }

    componentDidMount() {
        this.getGcaData();
    }

    // get the data for all the RPMs
    getGcaData() {
        const rpms = [
            {
                name: "RPM-1",
                proportion: 0.23,
                time: 38,
                n: 400
            },
            {
                name: "RPM-2",
                proportion: 0.49,
                time: 23,
                n: 506
            }
        ];

        let distribution = [];
        for (let i = 50; i <= 150; i += 5) {
            distribution.push({
                score: i,
                quantity: randomInt(0, 1000)
            });
        }

        this.setState({ rpms, distribution });
    }

    // toggle whether you can see line chart dots
    toggleDots = () => {
        this.setState({ dots: !this.state.dots });
    };

    rpmsDisplay = () => {
        const { png } = this.props;
        this.state.rpms.map(rpm => {
            return (
                <div>
                    <img src={`/images/cognitiveTest/${name}${png}`} />
                    <div>
                        <div>Name: {rpm.name}</div>
                        <div>N = {rpm.n}</div>
                        <div>Correct: {rpm.proportion}%</div>
                        <div>Average time: {rpm.time}</div>
                    </div>
                </div>
            );
        });
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
            <div style={{ textAlign: "center" }}>
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

    render() {
        const { tab } = this.state;

        return (
            <div style={{ height: "100vh" }}>
                <Tabs value={tab} onChange={this.handleTabChange} centered>
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
)(BoilerPlate);
