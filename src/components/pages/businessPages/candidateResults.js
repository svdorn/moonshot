"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { closeNotification, addNotification } from "../../../actions/usersActions";
import { bindActionCreators } from "redux";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { Tabs, Tab, Slider, CircularProgress } from "material-ui";
import axios from "axios";
import PredictiveGraph from "../../miscComponents/predictiveGraph";
import PredictiveGraphDescriptors from "../../miscComponents/predictiveGraphDescriptors";
import CognitiveAbility from "../../childComponents/cognitiveAbility";
import PsychBreakdown from "../../childComponents/psychBreakdown";
import HoverTip from "../../miscComponents/hoverTip";
import { qualifierFromScore, getFirstName } from "../../../miscFunctions";

import "./candidateResults.css";

class CandidateResults extends Component {
    constructor(props) {
        super(props);

        this.bound_updateGraphHeight = this.updateGraphHeight.bind(this);

        this.state = {
            candidate: {},
            overallScore: undefined,
            gca: undefined,
            hardSkillPoints: [],
            predictivePoints: [],
            psychScores: [],
            loading: true,
            areaSelected: undefined,
            windowWidth: undefined,
            // if this is true, didn't get enough props, so can't display results
            invalidProps: false,
            // if there was an error loading in results
            error: false,
            // how tall the predictive graphs should be
            graphHeight: 300
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.candidateId !== prevProps.candidateId) {
            this.reset();
        }
    }

    componentDidMount() {
        // TODO: this isn't working, so fix this
        // set the height of the graphs
        this.updateGraphHeight();
        // set resize listener
        window.addEventListener("resize", this.bound_updateGraphHeight);
        // get the candidate's results
        this.reset();
    }

    isInProgress(value) {
        return typeof value !== "number";
    }

    // load a new candidate's info and reset the component
    reset() {
        this.setState({ loading: true });

        const { currentUser } = this.props;
        if (!currentUser) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        const userId = currentUser._id;
        const positionId = this.props.positionId;
        const candidateId = this.props.candidateId;
        const mockData = this.props.mockData;

        if (!mockData) {
            // backend call to get results info
            axios
                .get("/api/business/evaluationResults", {
                    params: {
                        userId: currentUser._id,
                        verificationToken: currentUser.verificationToken,
                        positionId,
                        candidateId
                    }
                })
                .then(res => {
                    this.candidateData(res.data);
                })
                .catch(error => {
                    this.setState({
                        error: true,
                        loading: false
                    });
                });
        } else {
            const candidateIndex = this.props.candidates.findIndex(candidate => {
                return candidate._id.toString() === candidateId.toString();
            });
            this.candidateData(this.props.candidates[candidateIndex]);
        }
    }

    candidateData(data) {
        const candidate = {
            name: data.name,
            title: data.title ? data.title : "",
            email: data.email,
            endDate: data.endDate,
            interest: data.interest,
            hiringStage: data.hiringStage,
            isDismissed: data.isDismissed
        };
        // if (data.skillScores) {
        //     var hardSkillPoints = data.skillScores.map(skill => {
        //         return {
        //             x: skill.name,
        //             y: this.round(skill.mostRecentScore),
        //             confidenceInterval: 16
        //         };
        //     });
        // } else {
        var hardSkillPoints = [];
        // }

        let scores = data.performanceScores;
        if (!data.performanceScores) {
            scores = data.scores;
        }
        const overallScore = scores.overall;
        const gca = data.gca;
        // they all have a confidence interval of 16 for now
        const predictivePoints = [
            {
                x: "Growth",
                y: this.round(scores.growth),
                confidenceInterval: this.isInProgress(scores.growth) ? 0 : 16,
                inProgress: this.isInProgress(scores.growth)
            },
            {
                x: "Performance",
                y: this.round(scores.performance),
                confidenceInterval: this.isInProgress(scores.performance) ? 0 : 16,
                inProgress: this.isInProgress(scores.performance)
            },
            {
                x: "Longevity",
                y: this.round(scores.longevity),
                confidenceInterval: scores.longevity ? 16 : 0,
                unavailable: !scores.longevity,
                inProgress: this.isInProgress(scores.longevity)
            },
            {
                x: "Culture",
                y: this.round(scores.culture),
                confidenceInterval: scores.culture ? 16 : 0,
                unavailable: !scores.culture,
                inProgress: this.isInProgress(scores.culture)
            }
        ];

        const performance = this.round(scores.performance);

        let self = this;
        self.setState({
            ...self.state,
            loading: false,
            psychScores: data.psychScores,
            candidate,
            overallScore,
            gca,
            performance,
            predicted: scores.predicted,
            skill: scores.skill,
            hardSkillPoints,
            predictivePoints,
            windowWidth: window.innerWidth
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.bound_updateGraphHeight);
    }

    updateGraphHeight() {
        this.setState({ graphHeight: this.getGraphHeight() });
    }

    getGraphHeight() {
        const windowWidth = window.innerWidth;
        let graphHeight;
        if (windowWidth > 800) {
            graphHeight = 250;
        } else if (windowWidth > 600) {
            graphHeight = 240;
        } else if (windowWidth > 400) {
            graphHeight = 230;
        } else {
            graphHeight = 220;
        }
        return graphHeight;
    }

    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    // make it full screen then update the
    toggleFullScreen() {
        this.props.toggleFullScreen();
        this.updateGraphHeight();
    }

    round(number) {
        const rounded = Math.round(number);
        if (isNaN(rounded)) {
            return number;
        }
        return rounded;
    }

    getSliderValue(score) {
        let value = score;
        if (score > 150) {
            value = 150;
        } else if (value < 50) {
            value = 50;
        }
        return value;
    }

    makeAnalysisSection() {
        // if loading the info, show loading spinner
        if (this.state.loading) {
            return (
                <div className="center fillScreen" style={{ paddingTop: "40px" }}>
                    <CircularProgress color="#76defe" />
                </div>
            );
        }

        if (!Array.isArray(this.state.hardSkillPoints)) {
            return null;
        }

        const hardSkillsDataPoints = this.state.hardSkillPoints;
        const candidate = this.state.candidate;
        const overallScore = this.round(this.state.overallScore);
        const gca = this.state.gca ? this.round(this.state.gca) : undefined;

        return !candidate.endDate ? (
            <div
                className="analysis center aboutMeSection blackBackground"
                style={{ paddingTop: "20px" }}
            >
                {candidate.name + " has not yet finished the evaluation."}
            </div>
        ) : (
            <div
                className="analysis center aboutMeSection blackBackground"
                style={{ paddingBottom: "30px" }}
            >
                <div className="center" style={{ backgroundColor: "#393939" }}>
                    <div
                        styleName="candidate-score"
                        className="font24px font20pxUnder700 font16pxUnder500 secondary-gray inlineBlock"
                    >
                        Candidate Score{" "}
                        <b style={style.lightBlue}>
                            <u>{overallScore}</u>
                        </b>
                    </div>
                    <HoverTip
                        style={{ marginTop: "65px", marginLeft: "-14px" }}
                        text="This score dynamically weights candidate data and is based on a normal curve where 100 is average."
                    />
                    <div styleName="results-slider-container">
                        <div>
                            <div className="horizListText secondary-gray font18px font16pxUnder800 font12pxUnder700">
                                <p style={style.lightBlue}>{qualifierFromScore(overallScore)}</p>
                            </div>
                            <Slider
                                disabled={true}
                                value={this.getSliderValue(overallScore)}
                                min={50}
                                max={150}
                                styleName="results-slider"
                            />
                        </div>
                    </div>
                </div>

                {this.state.windowWidth ? (
                    <div>
                        <div className="graphTitle primary-white center font24px font20pxUnder700 font16pxUnder500">
                            {"Predictive Insights"}
                        </div>
                        <div className="results">
                            <div className="statsAndDescription">
                                <div className="graph lightBlackBackground" id="graph">
                                    <PredictiveGraph
                                        dataPoints={this.state.predictivePoints}
                                        height={this.state.graphHeight}
                                        className="graph"
                                        containerName={"graph"}
                                        ref={instance => {
                                            this.child1 = instance;
                                        }}
                                    />
                                </div>
                                <div className="description lightBlackBackground">
                                    <PredictiveGraphDescriptors />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        ref={instance => {
                            this.child1 = instance;
                        }}
                    />
                )}

                {this.state.gca ? <CognitiveAbility score={this.state.gca} /> : null}

                <PsychBreakdown
                    className="candidateResultsPsychBreakdown"
                    psychScores={this.state.psychScores}
                    forCandidate={false}
                />

                {Array.isArray(this.state.hardSkillPoints) &&
                this.state.hardSkillPoints.length > 0 ? (
                    <div>
                        <div className="graphTitle primary-white center font24px font20pxUnder700 font16pxUnder500">
                            Skills Evaluation
                        </div>
                        {this.state.windowWidth ? (
                            <div>
                                <PredictiveGraph
                                    dataPoints={this.state.hardSkillPoints}
                                    height={this.state.graphHeight}
                                    className="graph"
                                    containerName={"candidateResults"}
                                    ref={instance => {
                                        this.child2 = instance;
                                    }}
                                />
                            </div>
                        ) : (
                            <div
                                ref={instance => {
                                    this.child2 = instance;
                                }}
                            />
                        )}
                    </div>
                ) : null}
            </div>
        );
    }

    // rate how interested the company is in the candidate
    rateInterest(candidateId, interest) {
        // rate the interest in the db and in the list view
        this.props.rateInterest(candidateId, interest);
        // change the interest in the results view
        let candidate = Object.assign({}, this.state.candidate);
        candidate.interest = interest;
        // set as reviewed if wasn't already
        candidate.reviewed = true;
        this.setState({ candidate });
    }

    // create the stars for the interest section
    makeStars() {
        const candidateId = this.props.candidateId;
        let interest = this.state.candidate.interest;

        // if interest in a candidate is not valid, set to 0 stars
        if (typeof interest !== "number" || interest < 0 || interest > 5) {
            interest = 0;
        }
        // make sure we have an integer
        interest = Math.round(interest);
        // create 5 stars
        let stars = [];
        for (let starNumber = 1; starNumber <= 5; starNumber++) {
            const colorClass = starNumber <= interest ? "white" : "gray";
            stars.push(
                <div
                    className={"inlineBlock clickableNoUnderline star " + colorClass}
                    onClick={() => this.rateInterest(candidateId, starNumber)}
                    style={{ marginRight: "5px" }}
                    key={`${candidateId}star${starNumber}`}
                />
            );
        }
        return <div className="starsArea">{stars}</div>;
    }

    // create the dropdown for a candidate's hiring stage
    makeHiringStage() {
        const candidateId = this.props.candidateId;
        let hiringStage = this.state.candidate.hiringStage;
        const isDismissed = this.state.candidate.isDismissed;

        const stageNames = [
            "Not Contacted",
            "Contacted",
            "Interviewing",
            "Offered",
            "Hired",
            "Dismissed"
        ];
        // if no stage is recorded, assume the candidate has not been contacted
        if (!hiringStage) {
            hiringStage = "Not Contacted";
        }

        // create the stage name menu items
        const stages = stageNames.map(stage => {
            return (
                <MenuItem value={stage} key={`${candidateId}hiringStage${stage}`}>
                    {stage}
                </MenuItem>
            );
        });

        return (
            <Select
                className="resultsHiringStage"
                disableUnderline={true}
                classes={{
                    root: "selectRootWhite",
                    icon: "selectIconWhiteImportant"
                }}
                value={hiringStage}
                onChange={this.handleChangeHiringStage(candidateId)}
            >
                {stages}
            </Select>
        );
    }

    // change a candidate's hiring stage
    handleChangeHiringStage = candidateId => event => {
        const hiringStage = event.target.value;
        // CHANGE HIRING STAGE IN BACK END AND LIST VIEW
        this.props.hiringStageChange(this.props.candidateId, hiringStage);

        // CHANGE HIRING STAGE IN RESULTS VIEW
        let candidate = this.state.candidate;
        if (hiringStage === "Dismissed") {
            candidate.isDismissed = true;
        } else {
            candidate.isDismissed = false;
            candidate.hiringStage = hiringStage;
        }
        // set as reviewed if wasn't already
        //candidates[candIndex].reviewed = true;
        // make the changes visible
        this.setState({ candidate });
    };

    toggleDismissed = () => {
        // get a copy of the candidate
        let candidate = Object.assign({}, this.state.candidate);
        const dismissingCandidate = !candidate.isDismissed;

        // toggle dismissed in db and list view
        const newHiringStage = dismissingCandidate ? "Dismissed" : candidate.hiringStage;
        this.props.hiringStageChange(this.props.candidateId, newHiringStage);

        // toggle dismissed in results view
        candidate.isDismissed = dismissingCandidate;
        // set as reviewed if wasn't already
        candidate.reviewed = true;
        // make changes visible
        this.setState({ candidate });
    };

    // open up an email template to send to the candidate
    contact() {
        const candidate = this.state.candidate;
        const user = this.props.currentUser;
        if (!user) {
            return this.props.addNotification(
                "You aren't logged in! Try refreshing the page.",
                "error"
            );
        }

        let candidateName = "",
            candidateEmail = candidate.email ? candidate.email : "",
            outro = user.name ? `Thanks,%0d${user.name}` : "Thanks!";

        try {
            candidateName = " " + getFirstName(candidate.name);
        } catch (e) {
            /* some field did not exist */
        }

        // window.location.href =
        //     `mailto:${candidateEmail}
        //      ?subject=Let's Get to Know Each Other
        //      &Body=Hi${candidateName},
        //      %0d%0dI'd love to hear more about your interest in working with us.
        //      %0d%0d${outro}`;

        window.location.href = `mailto:${candidateEmail}`;
    }

    render() {
        const user = this.props.currentUser;
        if (!user) {
            return null;
        }
        const candidate = this.state.candidate;
        const hardSkills = this.state.hardSkills;
        const predictiveInsights = this.state.predictiveInsights;

        let content = null;

        // if there was an error getting the user's results
        if (this.state.error) {
            content = (
                <div style={{ marginTop: "20px" }}>Error getting results. Try refreshing.</div>
            );
        }

        // if loading the user's results
        else if (this.state.loading) {
            content = <CircularProgress color="#76defe" style={{ marginTop: "20px" }} />;
        }

        // populate the results if the candidate exists
        else if (candidate) {
            const iconClass = this.props.fullScreen ? "collapseIcon" : "expandIcon";
            const dismissDiv = (
                <div
                    onClick={this.toggleDismissed}
                    className={"noselect " + (candidate.isDismissed ? "dismissed" : "dismiss")}
                >
                    {candidate.isDismissed ? "Dismissed" : "Dismiss"}
                </div>
            );

            content = (
                <div
                    id="candidateResults"
                    className="profileInfoSkills blackBackground candidateResults"
                    style={{ position: "relative" }}
                >
                    <div className="resultsHeader">
                        <div className="center relative">
                            <div>
                                {candidate.name ? (
                                    <div>
                                        <div className="secondary-gray font26px font18pxUnder700 candidateName">
                                            {candidate.name}
                                        </div>
                                        <div style={{ marginTop: "8px" }}>
                                            {dismissDiv}
                                            <div
                                                className="button medium round-4px primary-white gradient-transition gradient-1-cyan gradient-2-purple-light noselect"
                                                onClick={this.contact.bind(this)}
                                            >
                                                {"Contact"}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            <div className="interestArea">
                                <div className="label">{"Interest"}</div>
                                {this.makeStars()}
                            </div>
                            <div className="hiringStageArea">
                                <div className="label">{"Stage"}</div>
                                {this.makeHiringStage()}
                            </div>
                            {this.props.mobile ? null : (
                                <div className="fullScreenIconContainer">
                                    <div
                                        className={iconClass}
                                        onClick={() => this.toggleFullScreen()}
                                    />
                                </div>
                            )}
                            <div className="exitIconContainer">
                                <div className="pointer" onClick={() => this.props.exitResults()}>
                                    x
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="resultsContent">{this.makeAnalysisSection()}</div>
                </div>
            );
        }

        const mobileClass = this.props.mobile ? "mobile " : "";

        return (
            <div
                className={
                    "blackBackground candidateEvalResults " + mobileClass + this.props.className
                }
                onTransitionEnd={() => {
                    if (candidate.endDate) {
                        try {
                            this.child1.parentTransitioned();
                            this.child2.parentTransitioned();
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }}
            >
                {content}
            </div>
        );
    }
}

const style = {
    topTabs: {
        marginTop: "9px"
    },
    topTab: {
        color: "white"
    },
    lightBlue: {
        color: "#75dcfc"
    }
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            closeNotification,
            addNotification
        },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CandidateResults);
