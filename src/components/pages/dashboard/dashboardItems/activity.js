"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addNotification } from "../../../../actions/usersActions";
import { propertyExists } from "../../../../miscFunctions";
import Carousel from "../../../miscComponents/carousel";
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../../../colors";
import axios from "axios";

import "../dashboard.css";

class Activity extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // the frame the activities box is on
            frame: undefined,
            // the number of candidates that have not yet been reviewed
            newCandidates: undefined,
            // the number of candidates that have not yet been reviewed
            newEmployees: undefined,
            // if there was an error getting any candidates or employees data
            fetchDataError: false,
            // the name of the business
            name: undefined,
            // the uniqueName of the business
            uniqueName: undefined,
            // the tab either Candidates or Employees
            tab: "Candidates"
         };

         this.getCandidateData = this.getCandidateData.bind(this);
         this.getEmployeeData = this.getEmployeeData.bind(this);
    }

    componentDidMount() {
        let self = this;
        const user = this.props.currentUser;

        const nameQuery = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
        } };

        const countQuery = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId
        } };

        axios.get("/api/business/uniqueName", nameQuery )
        .then(function (res) {
            axios.get("/api/business/candidatesTotal", countQuery )
            .then(response => {
                if (propertyExists(response, ["data", "totalCandidates"]), "number") {
                    let frame = "Awaiting Review";
                    if (response.data.totalCandidates < 1) {
                        frame = "Tips For Hiring"
                    }
                    self.setState({ frame, name: res.data.name, uniqueName: res.data.uniqueName });
                } else {
                    self.setState({ fetchDataError: true });
                }
            })
            .catch(error => {
                self.setState({ fetchDataError: true });
            });
        })
        .catch(function (err) {
            self.setState({ fetchDataError: true });
        });
    }

    getCandidateData() {
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
    }

    getEmployeeData() {
        const self = this;
        const user = this.props.currentUser;

        const query = { params: {
            userId: user._id,
            verificationToken: user.verificationToken,
            businessId: user.businessInfo.businessId
        } };

        axios.get("/api/business/employeesAwaitingReview", query )
        .then(response => {
            if (propertyExists(response, ["data", "newEmployees"]), "number") {
                self.setState({ newEmployees: response.data.newEmployees });
            } else {
                self.setState({ fetchDataError: true });
            }
        })
        .catch(error => {
            self.setState({ fetchDataError: true });
        });
    }

    tipsForHiring() {
        const frame1 = (
            <div styleName="carousel-frame">
                <div>
                    <div className="primary-cyan font20px font18pxUnder700 font16pxUnder500">Welcome to your</div>
                    <div>
                        This is your dashboard, where you can see all the most recent activity across every
                        project in this workspace. It is the perfect place to start your day.
                    </div>
                </div>
            </div>
        );
        const frame2 = (
            <div styleName="carousel-frame">
                <div>
                    <div className="primary-cyan font20px">Welcome to your</div>
                    <div>
                        Frame 2 this is your dashboard, where you can see all the most recent activity across every
                        project in this workspace. It is the perfect place to start your day.
                    </div>
                </div>
            </div>
        );
        return (
            <div styleName="tips-for-hiring">
                <div>
                    Tips for hiring supremacy while you{"'"}re<br/> waiting for candidates to complete your evaluation
                </div>
                <div>
                    <Carousel
                        frames={[frame1, frame2]}
                        transitionDuration={1000}
                    />
                </div>
            </div>
        );
    }

    awaitingReview() {
        return (
            <div styleName="awaiting-review">
                <div>
                </div>
                <div>
                </div>
            </div>
        );
    }

    render() {
        let content = null;
        switch (this.state.frame) {
            case "Tips For Hiring": { content = this.tipsForHiring(); break; }
            case "Awaiting Review": { content = this.awaitingReview(); break; }
            default: { content = null; break; }
        }

        return (
            <div>
                {this.state.name && !this.state.fetchDataError ?
                    <div styleName="activity-container">
                        <div>
                            {this.state.name}{"'"}s Activity
                        </div>
                        { content }
                    </div>
                :
                    <div className="fully-center">
                        <CircularProgress style={{ color: primaryCyan }} />
                    </div>
                }
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
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Activity);
