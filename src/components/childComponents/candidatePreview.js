import React, {Component} from 'react';
import {
    Paper,
    Stepper,
    Step,
    StepButton,
    FlatButton,
    RaisedButton,
    MenuItem,
    DropDownMenu,
    Slider
} from 'material-ui';
import axios from 'axios';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import HoverTip from "../miscComponents/hoverTip";

class CandidatePreview extends Component {
    constructor(props) {
        //TODO ONLY SHOW THE CANDIDATE PREVIEW WHEN A PATHWAY HAS BEEN SELECTED
        super(props);

        const candidate = props.candidate;

        let isDismissed = candidate.isDismissed;
        if (isDismissed === undefined) {
            isDismissed = false;
        }

        const possibleStages = ["Not Contacted", "Contacted", "Interviewing", "Hired"];
        const validStage = possibleStages.includes(candidate.hiringStage);
        const hiringStage = validStage ? candidate.hiringStage : possibleStages[0];
        const stageChanges = candidate.hiringStageChanges;
        const lastEdited = Array.isArray(stageChanges) && stageChanges.length > 0 ? this.formatDateString(stageChanges[stageChanges.length - 1].dateChanged) : undefined;

        this.state = {
            hiringStage,
            dismissed: isDismissed,
            possibleStages,
            lastEdited
        }
    }


    // create date string from db date string
    formatDateString(dateString) {
        const BASE10 = 10;
        if (dateString && dateString != null && dateString != "" && dateString.length > 10) {
            const date = new Date(dateString);
            const year = date.getFullYear().toString().substr(-2);
            let month = date.getMonth().toString();
            let day = date.getDate().toString();
            if (month.length === 1) { month = "0" + month; }
            if (day.length === 1) { day = "0" + day; }

            return `${month}/${day}/${year}`;
        } else {
            return "N/A";
        }
    }



    // since some components will be rendered in the same place but be for
    // different people, need to update state when new props are received
    componentWillReceiveProps(nextProps) {
        // make sure the stage we're getting is valid
        const validStage = this.state.possibleStages.includes(nextProps.candidate.hiringStage);
        // default to "Not Contacted" if invalid property given
        const hiringStage = validStage ? nextProps.candidate.hiringStage : this.state.possibleStages[0];

        let isDismissed = nextProps.candidate.isDismissed;
        // default to not dismissed if invalid property given
        if (typeof isDismissed !== "boolean") {
            isDismissed = false;
        }

        const stageChanges = nextProps.candidate.hiringStageChanges;
        const lastEdited = Array.isArray(stageChanges) && stageChanges.length > 0 ? this.formatDateString(stageChanges[stageChanges.length - 1].dateChanged) : undefined;

        this.setState({
            ...this.state,
            hiringStage: nextProps.candidate.hiringStage,
            dismissed: isDismissed,
            lastEdited
        });
    }


    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }


    // when Dismiss button is clicked
    handleClick() {
        this.updateHiringStageInDB(this.state.hiringStage, !this.state.dismissed);
        this.setState({ ...this.state, dismissed: !this.state.dismissed, lastEdited: this.formatDateString((new Date()).toString()) });
    }


    // when hiring stage changed in menu
    handleHiringStageChange = (event, index, hiringStage) => {
        this.setState({ ...this.state, hiringStage, lastEdited: this.formatDateString((new Date()).toString()) })
        this.updateHiringStageInDB(hiringStage, this.state.dismissed);
    }


    updateHiringStageInDB(hiringStage, dismissed) {
        const stages = this.state.possibleStages;

        // ensure inputs are valid
        if (stages.includes(hiringStage) && typeof dismissed === "boolean") {
            const currentUser = this.props.currentUser;
            const hiringStageInfo = {
                userId: currentUser._id,
                verificationToken: currentUser.verificationToken,
                candidateId: this.props.candidate.candidateId,
                hiringStage: hiringStage,
                isDismissed: dismissed,
                positionId: this.props.positionId
            }
            axios.post("/api/business/updateHiringStage", hiringStageInfo)
            // do nothing on success
            .then(result => {})
            .catch(err => {
                // console.log("error updating hiring stage: ", err);
            });
        }
    }


    makePredictiveSection(sectionType, score) {
        let prediction = "";
        let image = null;
        let sectionStyle = {};
        let ratings = [];
        const sliderStyle = {
            width: "80%",
            marginLeft: "10%"
        }

        switch (sectionType) {
            case "Predicted":
                sectionStyle = { left: "10%" };
                ratings = ["BELOW AVERAGE", "AVERAGE", "ABOVE AVERAGE"];
                break;
            case "Skill":
                sectionStyle = { right: "10%" };
                ratings = ["NOVICE", "INTERMEDIATE", "EXPERT"];
                break;
            default:
                break;
        }

        if (typeof score !== "number") { prediction = "N/A" }
        else {
            if (score < 90) { prediction = ratings[0]; }
            else if (score < 110) { prediction = ratings[1]; }
            else { prediction = ratings[2]; }

            let sliderValue = score;
            // very unlikely someone would get a value under 50 or above 150
            if (sliderValue < 50) { sliderValue = 50; }
            else if (sliderValue > 150 ) { sliderValue = 150; }

            image = (
                <Slider disabled={true}
                        min={50}
                        max={150}
                        value={sliderValue}
                        style={sliderStyle}
                        className="candidatePreviewSlider"
                />
            );
        }

        return (
            <div className="candidatePreviewPredictiveSection font14px" style={sectionStyle}>
                {sectionType}<br/>
                <span style={{color: "#D1576F"}}>{prediction}</span><br/>
                {image}
            </div>
        )
    }


    round(number) {
        const rounded = Math.round(number);
        if (isNaN(rounded)) { return number; }
        return rounded;
    }


    render() {
        const style = {
            redLink: {
                color: "#D1576F",
                textDecoration: "underline"
            },
            anchorOrigin: {
                vertical: "top",
                horizontal: "middle"
            },
            targetOrigin: {
                vertical: "top",
                horizontal: "middle"
            },
            menuStyle: {
                marginLeft: "20px"
            },
            menuLabelStyle: {
                color: "rgba(255, 255, 255, .8)",
                fontSize: "14px"
            },
            menuUnderlineStyle: {
                display: "none"
            },
            menuItemStyle: {
                textAlign: "center",
                fontSize: "14px"
            },
            darkenerStyle: {
                width: "100%",
                height: "100%",
                left: "0",
                top: "0",
                position: "absolute",
                backgroundColor: "rgba(46,46,46,.7)",
                // only show the darkener if the candidate has been dismissed
                display: this.state.dismissed ? "inline-block" : "none",
                zIndex: "4"
            },
            dismissText: {
                cursor: "pointer"
            },
            dismissButton: {
                textDecoration: "underline",
                fontStyle: this.state.dismissed ? "italic" : "normal",
                zIndex: "5",
                position: "absolute",
                bottom: "5px",
                left: "0",
                right: "0",
                margin: "auto",
                width: "80px"
            },
            seeResults: {
                position: "absolute",
                left: "12px",
                bottom: "5px",
                zIndex: "7"
            },
            lastUpdated: {
                position: "absolute",
                textAlign: "center",
                width: "92px",
                bottom: "3px",
                right: "8px",
                zIndex: "6",
            }
        };

        const location = this.props.candidate.location ? this.props.candidate.location : "No location given";
        const overallScore = this.props.candidate.scores && this.props.candidate.scores.overall ? this.props.candidate.scores.overall : "N/A";

        const finishedEval = overallScore !== "N/A";

        let middlePortion = <div style={{marginTop: "85px", color: "gray", fontStyle: "italic"}}>{"Hasn't finished evaluation yet"}</div>



        if (finishedEval) {
            let percent = "25%";
            let topRightStyle = {display: "none"};
            let bottomRightStyle = {display: "inline-block"};
            let bottomLeftStyle = {display: "inline-block"};
            let topLeftStyle = {display: "inline-block"};
            let possibleStages = this.state.possibleStages;

            // there should only be four possible stages
            if (Array.isArray(possibleStages) && possibleStages.length === 4) {
                // determine how much of the circle can be seen based on the hiring stage
                switch (this.state.hiringStage) {
                    case possibleStages[1]:
                        percent = "50%";
                        bottomRightStyle = {display: "none"};
                        break;
                    case possibleStages[2]:
                        percent = "75%";
                        bottomRightStyle = {display: "none"};
                        bottomLeftStyle = {display: "none"};
                        break;
                    case possibleStages[3]:
                        percent = "100%";
                        bottomRightStyle = {display: "none"};
                        bottomLeftStyle = {display: "none"};
                        topLeftStyle = {display: "none"};
                        break;
                    default:
                        break;
                }
            }

            const menuItems = this.state.possibleStages.map(stage => {
                return (<MenuItem key={stage} value={stage} primaryText={stage.toUpperCase()} />)
            });

            middlePortion = (
                <div>
                    <div className="hiringStageCircle">
                        <div className="circleCover top right" style={topRightStyle} />
                        <div className="circleCover bottom right" style={bottomRightStyle} />
                        <div className="circleCover bottom left" style={bottomLeftStyle} />
                        <div className="circleCover top left" style={topLeftStyle} />

                        <div className="circleCover interior font16px">
                            <div>{percent}</div>
                        </div>
                    </div>
                    <br/>

                    <DropDownMenu value={this.state.hiringStage}
                                  onChange={this.handleHiringStageChange.bind(this)}
                                  labelStyle={style.menuLabelStyle}
                                  menuItemStyle={style.menuItemStyle}
                                  anchorOrigin={style.anchorOrigin}
                                  underlineStyle={style.menuUnderlineStyle}
                                  targetOrigin={style.targetOrigin}
                    >
                        {menuItems}
                    </DropDownMenu>
                </div>
            );
        }



        let resultsUrl = "/myCandidates";
        try {
            const profileUrl = this.props.candidate && this.props.candidate.profileUrl ? this.props.candidate.profileUrl : "";
            const positionId = this.props.positionId;
            resultsUrl = `/results/${profileUrl}/${positionId}`;
        } catch (e) {
            // console.log("Error getting results url: ", e);
        }

        const seeResults = finishedEval ?
                <div style={{...style.redLink, ...style.seeResults, cursor: "pointer"}} onClick={() => this.goTo(resultsUrl)}>
                    See Results
                </div>
            :
                <div>
                    <div style={style.seeResults}>
                        <div style={{
                            textDecoration: "underline",
                            color: "gray",
                            cursor: "not-allowed",
                            fontStyle: "italic"
                        }}>
                            See Results
                        </div>
                        <HoverTip
                            style={{minWidth: "260px"}}
                            text="Candidate has not yet finished the position evaluation."
                        />
                    </div>
                </div>


        return (
            <div className="candidatePreview center" >
                <div className="candidateName font18px center">
                    {this.props.candidate.name ? this.props.candidate.name.toUpperCase() : ""}
                </div>
                <br/>
                <div className="candidateScore font16px">
                    Candidate Score <span className="font16px" style={style.redLink}>{this.round(overallScore)}</span>
                </div>
                <br/>

                { middlePortion }


                {this.makePredictiveSection("Predicted", this.props.candidate.scores ? this.props.candidate.scores.predicted : undefined)}
                {/*this.makePredictiveSection("Psychometrics", this.props.candidate.archetype)*/}
                {this.makePredictiveSection("Skill", this.props.candidate.scores ? this.props.candidate.scores.skill : undefined)}

                <div style={style.darkenerStyle} />

                { seeResults }

                <div style={style.dismissButton}>
                    <span onClick={this.handleClick.bind(this)}
                          style={style.dismissText}
                    >
                        {this.state.dismissed ? "Dismissed" : "Dismiss"}
                    </span>
                </div>

                <div className="font12px" style={style.lastUpdated}>
                    Last Updated<br/>
                    {this.state.lastEdited}
                </div>
            </div>
        )
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CandidatePreview);
