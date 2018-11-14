"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {} from "../../../../actions/usersActions";
import {} from "../../../../miscFunctions";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

class CompareFactors extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        const data = [
            { x: 100, y: 200, z: 200 },
            { x: 120, y: 100, z: 260 },
            { x: 170, y: 300, z: 400 },
            { x: 140, y: 250, z: 280 },
            { x: 150, y: 400, z: 500 },
            { x: 110, y: 280, z: 200 }
        ];
        return (
            <div>
                <ScatterChart
                    width={400}
                    height={400}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                    <CartesianGrid />
                    <XAxis dataKey={"x"} type="number" name="stature" unit="cm" />
                    <YAxis dataKey={"y"} type="number" name="weight" unit="kg" />
                    <Scatter name="A school" data={data} fill="#8884d8" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                </ScatterChart>
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
)(CompareFactors);
