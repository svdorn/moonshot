"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import {} from "../../../../actions/usersActions";
import {} from "../../../../miscFunctions";
import { button } from "../../../../classes";
import { Tabs, Tab } from "@material-ui/core";
import { round } from "../../../../miscFunctions";

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

        const { currentUser } = props;
        if (currentUser) {
            var { _id: userId, verificationToken } = currentUser;
        } else {
            var userId = undefined;
            var verificationToken = undefined;
        }

        this.state = {
            dot: false,
            chartType: "scatter",
            scatter: {
                points: [],
                bflPoints: [],
                x: "x",
                y: "y",
                slope: 1,
                intercept: 0,
                correlation: 0
            },
            gcaScatterFacs: [
                {
                    name: "",
                    points: [],
                    bflPoints: [],
                    slope: 1,
                    intercept: 0,
                    correlation: 0
                }
            ],
            GETparams: { userId, verificationToken }
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

        const self = this;

        axios
            .get("/api/admin/dataDisplay/scatter", {
                params: {
                    ...this.state.GETparams,
                    facType: this.props.facType,
                    facNames: this.props.facs.map(fac => fac.name),
                    site: this.props.site
                }
            })
            .then(response => self.setState({ scatter: response.data.scatter }))
            .catch(error => console.log("error getting scatter data: ", error));
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
                ],
                bflPoints: [{ score: -6, gca: 75 }, { score: 6, gca: 125 }],
                slope: 2,
                intercept: 1,
                correlation: 0.34
            },
            {
                name: "Agreeableness",
                points: [
                    { score: 1, gca: 105 },
                    { score: -2, gca: 100 },
                    { score: 5, gca: 70 },
                    { score: 1, gca: 90 },
                    { score: 3, gca: 100 }
                ],
                bflPoints: [{ score: -6, gca: 60 }, { score: 6, gca: 140 }],
                slope: 1,
                intercept: -2,
                correlation: 0.88
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
        if (this.props.facs.length !== 2) {
            return (
                <div style={{ textAlign: "center", margin: "200px auto" }}>
                    Need two factors/facets for a scatter plot.
                </div>
            );
        }

        const { scatter } = this.state;

        let intercept = round(scatter.intercept, 2);
        let absIntercept = intercept;
        let plusMinus = "+";
        if (intercept < 0) {
            absIntercept = intercept * -1;
            plusMinus = "-";
        }

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
            </div>,
            <div styleName="fac-scatter">
                <div>
                    Best Fit Line:
                    <span style={{ marginLeft: "10px" }}>
                        {scatter.y} = {round(scatter.slope, 2)}
                        {scatter.x} {plusMinus} {absIntercept}
                    </span>
                </div>
                <div>
                    Slope: <span>{round(scatter.slope, 2)}</span>
                </div>
                <div>
                    Intercept: <span>{intercept}</span>
                </div>
                <div>
                    Correlation: <span>{round(scatter.correlation, 2)}</span>
                </div>
            </div>
        ];
    };

    // compare the 1+ factors to GCA
    compareToGCA = () => {
        let stats = [];
        const scatters = this.state.gcaScatterFacs.map((fac, idx) => {
            stats.push(
                <div styleName="compare-gca-stats">
                    <div>{fac.name} vs GCA</div>
                    <div>
                        Best Fit Line:
                        <span>
                            gca = {fac.slope}x + {fac.intercept}
                        </span>
                    </div>
                    <div>
                        Correlation: <span>{fac.correlation}</span>
                    </div>
                </div>
            );
            return [
                <Scatter
                    key={`${fac.name} gca scatter`}
                    name={fac.name}
                    data={fac.points}
                    fill={strokes[idx]}
                />,
                <Scatter
                    key={`${fac.name} gca scatter bfl`}
                    data={fac.bflPoints}
                    fill={strokes[idx]}
                    line
                    shape={() => null}
                />
            ];
        });

        return [
            <ScatterChart
                width={600}
                height={400}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                key="gca graph"
            >
                <CartesianGrid />
                <XAxis domain={[-6, 6]} type="number" dataKey={"score"} name="Factor/Facet Score" />
                <YAxis domain={[50, 150]} type="number" dataKey={"gca"} name="GCA" />

                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                {scatters}
            </ScatterChart>,
            <div key="gca scatter x label" styleName="x-label">
                Score
            </div>,
            <div key="gca scatter y label" styleName="y-label">
                GCA
            </div>,
            <div styleName="all-compare-gca-stats">{stats}</div>
        ];
    };

    // change the chart being shown
    handleChartChange = (event, chartType) => {
        this.setState({ chartType });
    };

    render() {
        if (this.props.facs.length < 1) {
            return "Need at least one factor/facet to show.";
        }

        const { chartType } = this.state;

        return (
            <div className="background-primary-black-dark primary-white">
                <Tabs value={chartType} onChange={this.handleChartChange} centered>
                    <Tab label="Scatter" value="scatter" style={{ color: "white" }} />
                    <Tab label="Line" value="line" style={{ color: "white" }} />
                    <Tab label="GCA" value="gca" style={{ color: "white" }} />
                </Tabs>
                {chartType === "scatter" ? this.scatterPlot() : null}
                {chartType === "line" ? this.lineChart() : null}
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
