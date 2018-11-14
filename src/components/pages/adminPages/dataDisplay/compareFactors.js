"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../../actions/usersActions";
import {} from "../../../../miscFunctions";

import {
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

        this.state = {};
    }

    render() {
        const { factors } = this.props;

        if (factors.length < 2) {
            return "Cannot compare fewer than 2 factors.";
        }

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
            <Line key={`${f.name} Line`} type="monotone" dataKey={f.name} stroke={strokes[idx]} />
        ));

        return (
            <div className="background-primary-black-dark">
                <LineChart
                    width={600}
                    height={300}
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                </LineChart>
            </div>
        );
    }
}

const renderLegend = props => {
    const { payload } = props;

    console.log("payload: ", payload);

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
