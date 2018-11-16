"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../../actions/usersActions";
import {} from "../../../../miscFunctions";
import { button } from "../../../../classes";
import { Tabs, Tab } from "@material-ui/core";

import "./dataDisplay.css";

import {
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    Brush,
    ReferenceLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Label
} from "recharts";

import colors from "../../../../colors";
const strokes = [
    colors.primaryCyan,
    colors.primaryPurpleDark,
    colors.lightGreen,
    colors.primaryPeach,
    colors.primaryPurpleLight,
    colors.secondaryRed,
    colors.magenta
];

class CompareFactors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dot: false,
            chartType: "line",
            scatter: {
                points: [],
                bflPoints: [],
                x: "x",
                y: "y"
            },
            gcaScatterFacs: [
                {
                    name: "x",
                    points: []
                }
            ]
        };
    }

    componentDidMount() {
        this.getScatterData();
        this.getGcaScatterData();
    }

    // turn on/off the dots on the graph
    toggleDots = () => {
        this.setState({ dot: !this.state.dot });
    };

    // get data for the scatter plot
    getScatterData() {
        console.log("getting scatter data");

        const points = [
            { x: 1, y: 3 },
            { x: 4, y: -2 },
            { x: -3, y: 1 },
            { x: 1, y: 5 },
            { x: 2.4, y: -3 },
            { x: -4.6, y: 5 }
        ];
        const bflPoints = [{ x: -6, y: -4 }, { x: 6, y: 4 }];

        const x = "Agreeableness";
        const y = "Honesty-Humility";

        const scatter = { points, bflPoints, x, y };

        this.setState({ scatter });
    }

    // get data for the GCA scatter plot
    getGcaScatterData() {
        console.log("getting gca scatter data");

        const gcaScatterFacs = [
            {
                name: "Honesty-Humility",
                points: [
                    { score: 4, gca: 110 },
                    { score: 0, gca: 90 },
                    { score: -3, gca: 100 },
                    { score: 2, gca: 120 },
                    { score: -5, gca: 80 }
                ]
            },
            {
                name: "Agreeableness",
                points: [
                    { score: 1, gca: 105 },
                    { score: -2, gca: 100 },
                    { score: 5, gca: 70 },
                    { score: 1, gca: 90 },
                    { score: 3, gca: 100 }
                ]
            }
        ];

        this.setState({ gcaScatterFacs });
    }

    // return a line chart comparison between the factors
    lineChart = () => {
        const { factors } = this.props;

        // create a list of the combined data points
        const data = factors[0].dataPoints.map((point, pointIdx) => {
            let combinedPoint = {
                // "3.75" or "-2.25" etc
                name: point.name
            };
            // add the quantity for each factor
            factors.forEach(factor => {
                combinedPoint[factor.name] = factor.dataPoints[pointIdx].quantity;
            });
            return combinedPoint;
        });

        // create the Lines for the chart
        const lines = factors.map((f, idx) => (
            <Line
                key={`${f.name} Line`}
                type="monotone"
                dataKey={f.name}
                stroke={strokes[idx]}
                dot={this.state.dot ? undefined : null}
            />
        ));

        return [
            <LineChart
                width={600}
                height={300}
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                key="line chart"
            >
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend
                    verticalAlign="top"
                    wrapperStyle={{ lineHeight: "40px" }}
                    content={renderLegend}
                />
                <ReferenceLine y={0} stroke="#000" />
                <Brush dataKey="name" height={30} stroke="#8884d8" />
                {lines}
            </LineChart>,
            <div style={{ textAlign: "center" }} key="line chart toggle dots">
                <div
                    className={`font12px ${button.cyan}`}
                    style={{ display: "inline-block", margin: "10px 0", color: "white" }}
                    onClick={this.toggleDots}
                >
                    Toggle Dots
                </div>
            </div>
        ];
    };

    // return a scatter plot comparison between two factors (if there are exactly 2)
    scatterPlot = () => {
        if (this.props.factors.length !== 2) {
            return null;
        }

        const { scatter } = this.state;

        return [
            <ScatterChart
                width={600}
                height={400}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                key="scatter 1"
            >
                <CartesianGrid />
                <XAxis domain={[-6, 6]} type="number" dataKey={"x"} name={scatter.x} />
                <YAxis domain={[-6, 6]} type="number" dataKey={"y"} name={scatter.y} />

                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={scatter.points} fill={strokes[0]} />
                <Scatter
                    name="Best Fit Line"
                    data={scatter.bflPoints}
                    fill={strokes[1]}
                    line
                    shape={() => null}
                />
            </ScatterChart>,
            <div key="scatter x label" styleName="x-label">
                {scatter.x}
            </div>,
            <div key="scatter y label" styleName="y-label">
                {scatter.y}
            </div>
        ];
    };

    // compare the 1+ factors to GCA
    compareToGCA = () => {
        return null;

        const scatters = this.state.gcaScatterFacs.map((fac, idx) => (
            <Scatter
                key={`${fac.name} gca scatter`}
                name={fac.name}
                data={fac.points}
                fill={strokes[idx]}
            />
        ));

        return [
            <div key="gca graph title">Vs. GCA</div>,
            <ScatterChart
                width={600}
                height={400}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                key="gca graph"
            >
                <CartesianGrid />
                <XAxis domain={[-6, 6]} type="number" dataKey={"score"} name="Factor/Facet Score" />
                <YAxis domain={[-6, 6]} type="number" dataKey={"gca"} name="GCA" />

                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                {scatters}
            </ScatterChart>,
            <div key="gca scatter x label" styleName="x-label">
                Score
            </div>,
            <div key="gca scatter y label" styleName="y-label">
                GCA
            </div>
        ];
    };

    // change the chart being shown
    handleChartChange = (event, chartType) => {
        this.setState({ chartType });
    };

    render() {
        if (this.props.factors.length < 1) {
            return "Need at least one factor/facet to show.";
        }

        const { chartType } = this.state;

        return (
            <div className="background-primary-black-dark primary-white">
                <Tabs value={chartType} onChange={this.handleChartChange} centered>
                    <Tab label="Line" value="line" style={{ color: "white" }} />
                    <Tab label="Scatter" value="scatter" style={{ color: "white" }} />
                    <Tab label="GCA" value="gca" style={{ color: "white" }} />
                </Tabs>
                {chartType === "line" ? this.lineChart() : null}
                {chartType === "scatter" ? this.scatterPlot() : null}
                {chartType === "gca" ? this.compareToGCA() : null}
            </div>
        );
    }
}

// make the legend (had to custom-make it so the text color would be white)
const renderLegend = props => {
    const { payload } = props;

    return (
        <div style={styles.legend}>
            {payload.map((entry, index) => (
                <div key={`item-${index}`} style={styles.legendItem}>
                    <div style={{ ...styles.legendColor, backgroundColor: entry.color }} />
                    {entry.value}
                </div>
            ))}
        </div>
    );
};

const styles = {
    legend: { color: "white", textAlign: "center" },
    legendItem: { display: "inline-block", margin: "0 10px" },
    legendColor: {
        width: "16px",
        height: "16px",
        display: "inline-block",
        marginRight: "5px"
    }
};

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
)(CompareFactors);
