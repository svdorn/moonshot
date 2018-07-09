"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {Tabs, Tab, Slider, CircularProgress} from 'material-ui';
import {ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, LabelList} from 'recharts';
import axios from 'axios';
import PredictiveGraph from '../../miscComponents/predictiveGraph';
import PsychBreakdown from '../../childComponents/psychBreakdown';
import HoverTip from "../../miscComponents/hoverTip";

class CandidateResults extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: {},
            overallScore: undefined,
            hardSkillPoints: [],
            predictivePoints: [],
            freeResponses: [],
            psychScores: [],
            loading: true,
            areaSelected: undefined,
            windowWidth: window.innerWidth,
            // if this is true, didn't get enough props, so can't display results
            invalidProps: false,
            // the currently selected tab
            tab: "Analysis",
            // if there was an error loading in results
            error: false
        };
    }


    componentDidUpdate(prevProps, prevState) {
        console.log("id: ", this.props.candidateId);
        if (this.props.candidateId !== prevProps.candidateId) {
            this.reset();
        }
    }


    componentDidMount() {
        // set resize listener
        window.addEventListener('resize', this.updateWindowDimensions.bind(this));
        // get the candidate's results
        this.reset();
    }


    // load a new candidate's info and reset the component
    reset() {
        this.setState({ loading: true });

        const userId = this.props.currentUser._id;
        const positionId = this.props.positionId;
        const candidateId = this.props.candidateId;

        // backend call to get results info
        axios.get("/api/business/evaluationResults", {
            params: {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken,
                positionId, candidateId
            }
        })
        .then(res => {
            const candidate = {
                name: res.data.name,
                title: res.data.title ? res.data.title : "",
                email: res.data.email,
                interest: res.data.interest,
                hiringStage: res.data.hiringStage
            }
            const hardSkillPoints = res.data.skillScores.map(skill => {
                return {
                    x: skill.name,
                    y: this.round(skill.mostRecentScore),
                    confidenceInterval: 16
                }
            });
            const freeResponses = res.data.frqs;
            const overallScore = res.data.performanceScores.overall;
            // they all have a confidence interval of 16 for now
            const predictivePoints = [
                {
                    x: "Growth",
                    y: this.round(res.data.performanceScores.growth),
                    confidenceInterval: 16
                },
                {
                    x: "Performance",
                    y: this.round(res.data.performanceScores.performance),
                    confidenceInterval: 16
                },
                {
                    x: "Longevity",
                    y: this.round(res.data.performanceScores.longevity),
                    confidenceInterval: 0,
                    unavailable: true
                },
                {
                    x: "Culture",
                    y: this.round(res.data.performanceScores.culture),
                    confidenceInterval: 0,
                    unavailable: true
                }
            ];

            let self = this;
            self.setState({
                ...self.state,
                loading: false,
                psychScores: res.data.psychScores,
                candidate,
                overallScore,
                predicted: res.data.performanceScores.predicted,
                skill: res.data.performanceScores.skill,
                hardSkillPoints,
                predictivePoints,
                freeResponses,
                windowWidth: window.innerWidth
            });
        })
        .catch(error => {
            this.setState({
                error: true,
                loading: false
            });
        });
    }


    componentWillUnmount() {
        window.addEventListener('resize', this.updateWindowDimensions.bind(this));
    }


    updateWindowDimensions() {
        this.setState({ windowWidth: window.innerWidth });
    }


    qualifier(score, scoreType) {
        const qualifiers = scoreType === "predicted" ?
            ["BELOW AVERAGE", "AVERAGE", "ABOVE AVERAGE"] :
            ["NOVICE", "INTERMEDIATE", "EXPERT"]
        if (score < 90) {
            return qualifiers[0];
        } else if (score < 110) {
            return qualifiers[1];
        } else {
            return qualifiers[2];
        }
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    round(number) {
        const rounded = Math.round(number);
        if (isNaN(rounded)) { return number; }
        return rounded;
    }


    getSliderValue(score) {
        let value = score;
        if (score > 150) { value = 150; }
        else if (value < 50) { value = 50; }
        return value;
    }


    makeAnalysisSection() {
        if (!Array.isArray(this.state.hardSkillPoints)) { return null; }

        const hardSkillsDataPoints = this.state.hardSkillPoints;

        const windowWidth = window.innerWidth;
        let graphHeight;
        if (windowWidth > 800) {
            graphHeight = 400;
        } else if (windowWidth > 600) {
            graphHeight = 350;
        } else if (windowWidth > 400) {
            graphHeight = 300;
        } else {
            graphHeight = 250;
        }

        return (
            <div className="analysis center aboutMeSection" style={style.tabContent}>
                <div style={style.candidateScore}>
                    <div className="resultTopShadow center lightBlackBackground paddingTop20px">
                        <div className="font24px font20pxUnder700 font16pxUnder500 grayText candidateScore inlineBlock">
                            Candidate Score <b style={style.lightBlue}><u>{this.round(this.state.overallScore)}</u></b>
                        </div>
                        <HoverTip style={{marginTop: "35px", marginLeft: "-14px"}} text="This is the candidate's overall score based on personality and skill proficiencies. It is based on a normal curve where 100 is average." />
                        <div className="resultsSlidersContainer">
                            <div>
                                <div
                                    className="horizListText grayText font18px font16pxUnder800 font12pxUnder700">
                                    Predicted Performance<br/>
                                    <p style={style.lightBlue}>{this.qualifier(this.state.predicted, "predicted")}</p>
                                </div>
                                <Slider disabled={true}
                                        value={this.getSliderValue(this.state.predicted)}
                                        min={50}
                                        max={150}
                                        className="resultsSlider"
                                />
                            </div>
                            <div>
                                <div
                                    className="horizListText grayText font18px font16pxUnder800 font12pxUnder700">
                                    Skill Level<br/>
                                    <p style={style.lightBlue}>{this.qualifier(this.state.skill, "skill")}</p>
                                </div>
                                <Slider disabled={true}
                                        value={this.getSliderValue(this.state.skill)}
                                        min={50}
                                        max={150}
                                        className="resultsSlider"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <PredictiveGraph
                        title={"Predicted Performance"}
                        dataPoints={this.state.predictivePoints}
                        height={graphHeight}
                    />
                </div>

                <div className="resultsPageSpacer" />

                 <PsychBreakdown
                     psychScores={this.state.psychScores}
                     forCandidate={false}
                 />

                 <div className="resultsPageSpacer" />

                <div
                    className="whiteText center font24px font20pxUnder700 font16pxUnder500">
                    Skills Evaluation
                </div>
                <div>
                    <PredictiveGraph
                        dataPoints={this.state.hardSkillPoints}
                        height={graphHeight}
                    />
                </div>
            </div>
        );
    }


    makeResponsesSection() {
        let freeResponses = [];
        if (typeof this.state === "object" && Array.isArray(this.state.freeResponses)) {
            freeResponses = this.state.freeResponses;
        }

        let responses = freeResponses.map(freeResponse => {
            return (
                <div className="employerDiv freeResponse" key={freeResponse.question}>
                    <span className="lightBlueText">{freeResponse.question}</span>
                    <div className="answer">{freeResponse.answer}</div>
                </div>
            )
        });

        return (
            <div className="fillScreen candidateResponses">
                {responses}
            </div>
        )
    }


    handleTabChange = (value) => {
        this.setState({ tab: value });
    }


    // rate how interested the company is in the candidate
    rateInterest(candidateId, interest) {
        // rate the interest in the db and in the list view
        this.props.rateInterest(candidateId, interest);
        // change the interest in the results view
        let candidate = Object.assign({}, this.state.candidate);
        candidate.interest = interest;
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
                    style={{marginRight: "5px"}}
                    key={`${candidateId}star${starNumber}`}
                />
            );
        }
        return (
            <div className="starsArea">
                {stars}
            </div>
        );
    }


    // create the dropdown for a candidate's hiring stage
    makeHiringStage() {
        const candidateId = this.props.candidateId;
        let hiringStage = this.state.candidate.hiringStage;
        const isDismissed = this.state.candidate.isDismissed;

        const stageNames = ["Dismissed", "Not Contacted", "Contacted", "Interviewing", "Offered", "Hired"];
        // if no stage is recorded, assume the candidate has not been contacted
        if (!hiringStage) { hiringStage = "Not Contacted"; }
        // if the candidate is dismissed, show that
        if (isDismissed) { hiringStage = "Dismissed"; }

        // create the stage name menu items
        const stages = stageNames.map(stage => {
            return (
                <MenuItem
                    value={stage}
                    key={`${candidateId}hiringStage${stage}`}
                >
                    { stage }
                </MenuItem>
            )
        });

        return (
            <Select
                style={{paddingLeft: "32px"}}
                disableUnderline={true}
                classes={{
                    root: "selectRootWhite",
                    icon: "selectIconWhiteImportant"
                }}
                value={hiringStage}
                onChange={this.handleChangeHiringStage(candidateId)}
            >
                { stages }
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
        this.setState({ candidate });
    }


    render() {
        const user = this.props.currentUser;
        const candidate = this.state.candidate;
        const hardSkills = this.state.hardSkills;
        const predictiveInsights = this.state.predictiveInsights;

        let mailtoEmail = undefined;
        if (typeof candidate === "object") {
            // use the email meant for contacting if available
            if (candidate.emailToContact) { mailtoEmail = candidate.emailToContact; }
            // otherwise use the default email
            else { mailtoEmail = "mailto:" + candidate.email; }
        }

        const loading = this.state.loading;
        const loadingArea = <div className="center fillScreen" style={{paddingTop: "40px"}}><CircularProgress color="grayText" /></div>
        const analysisSection = loading ? loadingArea : this.makeAnalysisSection();
        const responsesSection = loading ? loadingArea : this.makeResponsesSection();

        let content = null;

        // if there was an error getting the user's results
        if (this.state.error) {
            content = "Error getting results.";
        }

        // if loading the user's results
        else if (this.state.loading) {
            content = <CircularProgress color="#FB553A" style={{marginTop: "20px"}}/>;
        }

        // populate the results if the candidate exists
        else if (candidate) {
            const iconClass = this.props.fullScreen ? "collapseIcon" : "expandIcon";

            content = (
                <div className="profileInfoSkills blackBackground candidateResults" style={{position:"relative"}}>
                    <div className="resultsHeader">
                        <div className="center relative">
                            <div>
                                {candidate.name ?
                                    <div>
                                        <div className="grayText font26px font14pxUnder700 candidateName">
                                            {candidate.name}
                                        </div>
                                        <a  className="font18px font12pxUnder500 grayText grayTextOnHover underline"
                                            href={mailtoEmail}
                                        >
                                            Contact
                                        </a>
                                    </div>
                                    : null
                                }
                            </div>
                            <div className="interestArea">
                                <div>{"Interest"}</div>
                                { this.makeStars() }
                            </div>
                            <div className="hiringStageArea">
                                <div>{"Stage"}</div>
                                { this.makeHiringStage() }
                            </div>
                            <div className="fullScreenIconContainer">
                                <div className={iconClass} onClick={() => this.props.toggleFullScreen()}/>
                            </div>
                            <div className="exitIconContainer">
                                <div className="pointer" onClick={() => this.props.exitResults()}>x</div>
                            </div>
                        </div>
                        <Tabs
                            style={style.topTabs}
                            inkBarStyle={{background: 'white'}}
                            tabItemContainerStyle={{width: '40%'}}
                            className="myPathwaysTabs"
                            onChange={this.handleTabChange.bind(this)}
                        >
                            <Tab label="Analysis" style={style.topTab} value="Analysis">
                                <div className="tabsShadow" style={{position:"absolute"}}>
                                    <div/>
                                </div>
                            </Tab>
                            <Tab label="Responses" style={style.topTab} value="Responses">
                                <div className="tabsShadow">
                                    <div/>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                    <div className="resultsContent">
                        {this.state.tab === "Analysis" ?
                            analysisSection
                            :
                            responsesSection
                        }
                    </div>
                </div>
            );
        }

        return (
            <div className={"blackBackground candidateEvalResults " + this.props.className}>
                { content }
            </div>
        );
    }
}


const style = {
    topTabs: {
        marginTop: '20px',
    },
    topTab: {
        color: 'white',
    },
    tabContent: {
        paddingBottom: '30px',
    },
    lightBlue: {
        color: '#75dcfc'
    },
    candidateScore: {
        minHeight: '200px',
        padding: "20px",
        overflow: "auto"
    }
};


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CandidateResults);
