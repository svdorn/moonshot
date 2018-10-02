"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import axios from "axios";
import {  } from "../../../../actions/usersActions";
import { propertyExists } from "../../../../miscFunctions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../colors";

import { LineChart, XAxis, YAxis, Line } from "recharts";

import "../dashboard.css";


const times = [ "7 Days", "2 Weeks", "1 Month", "3 Months" ];


class Candidates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // how far back to graph new candidate data
            timeToGraph: "7 Days",
            // the number of candidates that have not yet been reviewed
            newCandidates: undefined,
            // if there was an error getting any candidates data
            fetchDataError: false
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
            console.log(error);
            self.setState({ fetchDataError: true });
        });


        axios.get("/api/business/newCandidateGraphData", query)
        .then(response => {
            console.log("response: ", response);
        }).catch(error => {
            console.log("error: ", error);
        })
    }


    // change the amount of time being graphed
    handleTimeChange = () => event => {
        console.log("here");
        this.setState({ timeToGraph: event.target.value });
    }


    render() {
        // return progress bar if not ready yet
        if (this.state.newCandidates === undefined) {
            return (
                <div className="fully-center"><CircularProgress style={{ color: primaryCyan }} /></div>
            );
        }

        const timeOptions = times.map(time => {
            return <MenuItem value={time} key={time}>{ time }</MenuItem>;
        });

        // standard dashboard box header
        const header = (
            <div styleName="box-header">
                <div styleName="box-title">Candidates</div>
                <Select
                    styleName="time-selector"
                    disableUnderline={true}
                    classes={{
                        root: "position-select-root selectRootWhite myCandidatesSelect",
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

        let days = ["S", "M", "T", "W", "Th", "F", "Sa"];
        let currDay = (new Date).getDay();

        const data = [3, 5, 1, 6, 2, 4, 1].map(n => {
            currDay += 1;
            if (currDay > 6) { currDay = 0; }
            return { day: days[currDay], users: n };
        });

        const chartStyle = {
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            marginLeft: "-22px",
            marginTop: "10px"
        }

        return (
            <div>
                { header }
                <div styleName="important-stat">
                    <div styleName="important-number">{ this.state.newCandidates }</div> awaiting review
                </div>

                <LineChart style={chartStyle} width={250} height={120} data={data}>
                    <XAxis dataKey="day" padding={{right:10,left:10}}/>
                    <YAxis />
                    <Line type="monotone" dataKey="users" stroke={primaryCyan} />
                </LineChart>

                <div styleName="box-cta">Review Candidates</div>
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

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Candidates);
