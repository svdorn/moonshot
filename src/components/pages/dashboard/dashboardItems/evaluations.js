"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import { generalAction, openAddPositionModal } from "../../../../actions/usersActions";
import { propertyExists, goTo } from "../../../../miscFunctions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
    primaryCyan,
    lightBlue,
    mediumBlue,
    magenta,
    primaryPurpleLight,
    secondaryCyan,
    lightGreen
} from "../../../../colors";

import { PieChart, Pie, Tooltip, Cell } from "recharts";

import "../dashboard.css";


const times = [ "Last Week", "Last Month", "Last 6 Months" ];
const colors = [
    primaryCyan,
    lightBlue,
    mediumBlue,
    magenta,
    primaryPurpleLight,
    secondaryCyan,
    lightGreen
];


class Evaluations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // how far back to graph evaluation data
            timeToGraph: times[0],
            // if there was an error getting any evaluations data
            fetchDataError: false,
            // data that will be shown in the graph
            graphData: undefined
        };
    }


    // load graph data for the candidate completions over last week
    componentDidMount() {
        this.getGraphData();
    }


    // change the amount of time being graphed
    handleTimeChange = () => event => {
        const self = this;
        self.setState({ timeToGraph: event.target.value }, self.getGraphData.bind(self));
    }


    getGraphData() {
        const self = this;
        const user = this.props.currentUser;

        const query = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId,
            interval: this.state.timeToGraph
        } };

        axios.get("/api/business/evaluationsGraphData", query)
        .then(response => {
            if (propertyExists(response, ["data", "counts"])) {
                self.setState({ graphData: response.data.counts });
            } else {
                self.setState({ fetchDataError: true });
            }
        }).catch(error => {
            self.setState({ fetchDataError: true });
        })
    }


    render() {
        // return error message if errored out
        if (this.state.fetchDataError) {
            return <div className="fully-center" style={{width:"100%"}}>Error fetching data.</div>;
        }

        // return progress bar if not ready yet
        if (!Array.isArray(this.state.graphData)) {
            return (
                <div className="fully-center">
                    <CircularProgress style={{ color: primaryCyan }} />
                </div>
            );
        }

        const timeOptions = times.map(time => {
            return <MenuItem value={time} key={time}>{ time }</MenuItem>;
        });

        // standard dashboard box header
        const header = (
            <div styleName="box-header">
                <div styleName="box-title">Evaluations</div>
                <Select
                    styleName="time-selector"
                    disableUnderline={true}
                    classes={{
                        root: "position-select-root selectRootWhite dashboard-select",
                        icon: "selectIconWhiteImportant",
                        select: "no-focus-change-important"
                    }}
                    value={this.state.timeToGraph}
                    onChange={this.handleTimeChange()}
                >
                    { timeOptions }
                </Select>
            </div>
        );

        const chartStyle = {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translateX(-50%) translateY(-50%)",
            margin: "4px 0 0 -6px"
        }

        let smallCTA = (
            <div styleName="box-cta" onClick={() => this.props.openAddPositionModal()}>
                Add Position <img src={`/icons/LineArrow${this.props.png}`}/>
            </div>
        );

        const { graphData } = this.state;
        // const graphData = [
        //     {name: "iOS Developer", candidates: 10},
        //     {name: "CEO", candidates: 4},
        //     {name: "Marketer", candidates: 2},
        //     {name: "Dude", candidates: 6},
        //     {name: "iOS Developer 2", candidates: 10},
        //     {name: "CEO 2", candidates: 4},
        //     {name: "Marketer 2", candidates: 2},
        //     {name: "Dude 2", candidates: 6}
        // ];

        let content = null;
        // if there are no candidate completions, tell the user
        if (graphData.length === 0) {
            content = (
                <div className="fully-center" style={{ width: "80%" }}>
                    No evaluations completed in the { this.state.timeToGraph.toLowerCase() }.
                </div>
            );
        }
        // if there are candidate completions, show the graph
        else {
            // get a count of the total number of completions
            let count = 0;
            graphData.forEach(d => count += d.candidates);

            // to make keys for the pie slices
            let keyCounter = 0;

            content = (
                <div>
                    <div style={{marginTop:"9px"}} className="fully-center font32px primary-cyan">{ count }</div>
                    <div className="center font12px">Candidate Completions</div>
                    <PieChart style={chartStyle} width={200} height={200}>
                        <Pie
                            data={graphData}
                            dataKey="candidates"
                            nameKey="name"
                            cx={100}
                            cy={100}
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            stroke="none"
                        >
                            { graphData.map((entry, index) => <Cell key={`${entry.name} ${keyCounter++}`} fill={ colors[index % colors.length] } />) }
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </div>
            );
        }

        return (
            <div>
                { header }
                { content }
                { smallCTA }
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
    return bindActionCreators({
        generalAction,
        openAddPositionModal
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Evaluations);
