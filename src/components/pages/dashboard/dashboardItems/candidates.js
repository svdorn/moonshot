"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import { generalAction } from "../../../../actions/usersActions";
import { propertyExists, goTo } from "../../../../miscFunctions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../colors";

import { LineChart, XAxis, YAxis, Line } from "recharts";

import "../dashboard.css";


const times = [ "Days", "Weeks", "Months" ];


class Candidates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // how far back to graph new candidate data
            timeToGraph: times[0],
            // the number of candidates that have not yet been reviewed
            newCandidates: undefined,
            // if there was an error getting any candidates data
            fetchDataError: false,
            // data that will be shown in the graph
            graphData: undefined
        };
    }


    // load data for the number of candidates that need review as well as the
    // graph for new candidates over the last 7 days
    componentDidMount() {
        const self = this;
        const user = this.props.currentUser;

        const query = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId
        } };

        axios.get("/api/business/candidatesAwaitingReview", query )
        .then(response => {
            if (propertyExists(response, ["data", "newCandidates"]), "number") {
                self.setState({ newCandidates: response.data.newCandidates });
            } else {
                self.setState({ fetchDataError: true });
            }
        })
        .catch(error => {
            self.setState({ fetchDataError: true });
        });

        this.getGraphData();
    }


    // change the amount of time being graphed
    handleTimeChange = () => event => {
        const self = this;
        self.setState({ timeToGraph: event.target.value }, self.getGraphData.bind(self));
    }


    getGraphData() {
        const user = this.props.currentUser;
        const self = this;

        const params = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId,
            interval: this.state.timeToGraph
        } };

        axios.get("/api/business/newCandidateGraphData", params)
        .then(response => {
            if (propertyExists(response, ["data", "counts"])) {
                self.setState({ graphData: response.data.counts });
            } else {
                self.setState({ fetchDataError: true });
            }
        })
        .catch(error => {
            this.setState({ fetchDataError: true });
        });
    }


    render() {
        // return error message if errored out
        if (this.state.fetchDataError) {
            return <div className="fully-center" style={{width:"100%"}}>Error fetching data.</div>;
        }

        // return progress bar if not ready yet
        if (this.state.newCandidates === undefined || !Array.isArray(this.state.graphData)) {
            return (
                <div className="fully-center">
                    <CircularProgress style={{ color: primaryCyan }} />
                </div>
            );
        }

        const timeOptions = times.map(time => {
            return <MenuItem value={time} key={time}>5 { time }</MenuItem>;
        });

        // standard dashboard box header
        const header = (
            <div styleName="box-header">
                <div styleName="box-title">Candidates</div>
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
            transform: "translateX(-50%)",
            marginLeft: "-22px",
            marginTop: "10px"
        }

        let candidateAction = "Review";
        let onClick = () => goTo("/myCandidates");
        if (this.state.newCandidates === 0) {
            candidateAction = "Invite";
            onClick = () => this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL");
        }
        let smallCTA = <div styleName="box-cta" onClick={onClick}>{ candidateAction } Candidates</div>

        return (
            <div>
                { header }
                <div styleName="important-stat">
                    <div styleName="important-number">{ this.state.newCandidates }</div> Awaiting Review
                </div>

                <LineChart style={chartStyle} width={250} height={120} data={this.state.graphData}>
                    <XAxis dataKey="ago" padding={{right:10,left:10}}/>
                    <YAxis />
                    <Line type="monotone" dataKey="users" stroke={primaryCyan} dot={null}/>
                </LineChart>
                <div className="center" styleName="graph-x-label">{this.state.timeToGraph} Ago</div>

                { smallCTA }
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
    return bindActionCreators({
        generalAction
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Candidates);
