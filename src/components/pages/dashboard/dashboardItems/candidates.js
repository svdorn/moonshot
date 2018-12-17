"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import { generalAction, openSignupModal } from "../../../../actions/usersActions";
import { propertyExists, goTo } from "../../../../miscFunctions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../colors";

import { LineChart, XAxis, YAxis, Line } from "recharts";

import "../dashboard.css";

const times = ["Days", "Weeks", "Months"];

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

        // if there is no user, say there are no candidates waiting for review
        if (!user) {
            self.setState({ newCandidates: 0 });
        }
        // otherwise get real number of candidates who are not reviewed yet
        else {
            const query = {
                params: {
                    userId: user._id,
                    verificationToken: user.verificationToken,
                    businessId: user.businessInfo.businessId
                }
            };

            axios
                .get("/api/business/candidatesAwaitingReview", query)
                .then(response => {
                    if ((propertyExists(response, ["data", "newCandidates"]), "number")) {
                        self.setState({ newCandidates: response.data.newCandidates });
                    } else {
                        self.setState({ fetchDataError: true });
                    }
                })
                .catch(error => {
                    self.setState({ fetchDataError: true });
                });
        }

        this.getGraphData();
    }

    // change the amount of time being graphed
    handleTimeChange = () => event => {
        const self = this;
        self.setState({ timeToGraph: event.target.value }, self.getGraphData.bind(self));
    };

    getGraphData() {
        const user = this.props.currentUser;
        const self = this;

        // if there is no user, set fake graph data instead of getting real data
        if (!user) {
            const fakeGraphData = Array(5).fill({ users: 0, date: "" });
            return self.setState({ graphData: fakeGraphData });
        }

        const params = {
            params: {
                userId: user._id,
                verificationToken: user.verificationToken,
                businessId: user.businessInfo.businessId,
                interval: this.state.timeToGraph
            }
        };

        axios
            .get("/api/business/newCandidateGraphData", params)
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
            return (
                <div className="fully-center" style={{ width: "100%" }}>
                    Error fetching data.
                </div>
            );
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
            return (
                <MenuItem value={time} key={time}>
                    5 {time}
                </MenuItem>
            );
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
                    {timeOptions}
                </Select>
            </div>
        );

        const chartStyle = {
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            marginLeft: "-22px",
            marginTop: "20px"
        };

        const { graphData } = this.state;

        let candidateAction = "Review";
        let onClick = () => goTo("/myCandidates");
        if (this.state.newCandidates === 0) {
            candidateAction = "Invite";
            onClick = () => this.props.generalAction("OPEN_INVITE_CANDIDATES_MODAL");
        }
        if (!this.props.currentUser) {
            onClick = () => this.props.openSignupModal("boxes", "Candidate");
        }
        const smallCTA = (
            <div styleName="box-cta" onClick={onClick}>
                {candidateAction} Candidates <img src={`/icons/LineArrow${this.props.png}`} />
            </div>
        );

        const twoOrMoreCandidates = graphData.some(d => d.users > 1);

        const yAxisAttrs = twoOrMoreCandidates ? {} : { ticks: [1, 2] };

        return (
            <div>
                {header}
                <div styleName="important-stat">
                    <div styleName="important-number">{this.state.newCandidates}</div> Awaiting
                    Review
                </div>

                <LineChart style={chartStyle} width={250} height={120} data={graphData}>
                    <XAxis dataKey="date" padding={{ right: 10, left: 10 }} />
                    <YAxis {...yAxisAttrs} />
                    <Line
                        type="monotone"
                        dataKey="users"
                        stroke={primaryCyan}
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>

                {smallCTA}
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
    return bindActionCreators(
        {
            generalAction,
            openSignupModal
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Candidates);
