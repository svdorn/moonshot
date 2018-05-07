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
import {browserHistory} from 'react-router';

class CandidatePreview extends Component {
    constructor(props) {
        //TODO ONLY SHOW THE CANDIDATE PREVIEW WHEN A PATHWAY HAS BEEN SELECTED
        super(props);

        let isDismissed = props.initialIsDismissed;
        if (isDismissed === undefined) {
            isDismissed = false;
        }

        const possibleStages = ["Not Contacted", "Contacted", "Interviewing", "Hired"];
        const validStage = possibleStages.includes(props.initialHiringStage);
        const hiringStage = validStage ? props.initialHiringStage : possibleStages[0];

        this.state = {
            hiringStage,
            dismissed: isDismissed,
            possibleStages
        }
    }

    // since some components will be rendered in the same place but be for
    // different people, need to update state when new props are received
    componentWillReceiveProps(nextProps) {
        // make sure the stage we're getting is valid
        const validStage = this.state.possibleStages.includes(nextProps.initialHiringStage);
        // default to "Not Contacted" if invalid property given
        const hiringStage = validStage ? nextProps.initialHiringStage : this.state.possibleStages[0];

        let isDismissed = nextProps.initialIsDismissed;
        // default to not dismissed if invalid property given
        if (typeof isDismissed !== "boolean") {
            isDismissed = false;
        }

        this.setState({
            ...this.state,
            hiringStage: nextProps.initialHiringStage,
            dismissed: isDismissed,
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
        this.setState({ ...this.state, dismissed: !this.state.dismissed });
    }


    // when hiring stage changed in menu
    handleHiringStageChange = (event, index, hiringStage) => {
        console.log("hiringStage: ", hiringStage)
        this.setState({...this.state, hiringStage})
        this.updateHiringStageInDB(hiringStage, this.state.dismissed);
    }


    updateHiringStageInDB(hiringStage, dismissed) {
        const stages = this.state.possibleStages;

        // ensure inputs are valid
        if (stages.includes(hiringStage) && typeof dismissed === "boolean") {
            const currentUser = this.props.currentUser;
            const hiringStageInfo = {
                userId: this.props.employerUserId,
                verificationToken: this.props.employerVerificationToken,
                companyId: this.props.companyId,
                candidateId: this.props.candidateId,
                hiringStage: hiringStage,
                isDismissed: dismissed,
                pathwayId: this.props.pathwayId
            }
            axios.post("/api/business/updateHiringStage", hiringStageInfo)
            // do nothing on success
            .then(result => {})
            .catch(err => {
                console.log("error updating hiring stage: ", err);
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
                sectionStyle = { left: "1%" };
                ratings = ["BAT FIT", "AVERAGE FIT", "GOOD FIT"];
                break;
            case "Psychometrics":
                sectionStyle = {
                    left: "50%",
                    transform: "translateX(-50%)"
                }
                // the score we get will be the archetype of the candidate
                prediction = score && typeof score === "string" ? score.toUpperCase() : "";
                let icon = "";
                let iconStyle = {width: "50%", marginTop: "30px", transform: "translateY(-50%)"}
                switch (prediction) {
                    case "INNOVATOR":
                        icon = "icons/archetypes/Innovator.png";
                        break;
                    case "LOVER":
                        icon = "icons/archetypes/Lover.png";
                        break;
                    case "RULER":
                        icon = "icons/archetypes/Ruler.png";
                        break;
                    default:
                        break;
                }
                image = (<img src={icon} style={iconStyle}/>);
                break;
            case "Skill":
                sectionStyle = { right: "1%" };
                ratings = ["NOVICE", "INTERMEDIATE", "EXPERT"];
                break;
            default:
                break;
        }

        if (sectionType === "Skill" || sectionType === "Predicted") {
            if (typeof score !== "number") { prediction = "N/A" }
            else {
                if (score < 85) { prediction = ratings[0]; }
                else if (score < 115) { prediction = ratings[1]; }
                else { prediction = ratings[2]; }

                let sliderValue = score;
                // very unlikely someone would get a value under 60 or above 140
                if (sliderValue < 60) { sliderValue = 60; }
                else if (sliderValue > 140 ) { sliderValue = 140; }

                image = (
                    <Slider disabled={true}
                            min={60}
                            max={140}
                            value={sliderValue}
                            style={sliderStyle}
                            className="candidatePreviewSlider"
                    />
                );
            }
        }

        return (
            <div className="candidatePreviewPredictiveSection font14px" style={sectionStyle}>
                {sectionType}<br/>
                <span style={{color: "#D1576F"}}>{prediction}</span><br/>
                {image}
            </div>
        )
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
            },
            menuUnderlineStyle: {
                display: "none"
            },
            menuItemStyle: {
                textAlign: "center"
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
                zIndex: "5"
            }
        };

        const location = this.props.location ? this.props.location : "No location given";
        const overallScore = this.props.overallScore ? this.props.overallScore : "N/A";

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
            return (<MenuItem value={stage} primaryText={stage.toUpperCase()} />)
        });

        return (
            <div className="candidatePreview center" >
            {/* onClick={this.goTo("/results?user=Stephen-Dorn-2-9f66bf7eeac18994")} */}
                <div className="candidateName font24px center">
                    {this.props.name.toUpperCase()}
                </div>
                <br/>
                <div className="candidateLocation">
                    {location}
                </div>
                <br/>
                <div className="candidateScore">
                    Candidate Score <span className="font20px" style={style.redLink}>{overallScore}</span>
                </div>
                <br/>
                <div className="hiringStageCircle">
                    <div className="circleCover top right" style={topRightStyle} />
                    <div className="circleCover bottom right" style={bottomRightStyle} />
                    <div className="circleCover bottom left" style={bottomLeftStyle} />
                    <div className="circleCover top left" style={topLeftStyle} />

                    <div className="circleCover interior font20px">
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

                {this.makePredictiveSection("Predicted", this.props.predicted)}
                {this.makePredictiveSection("Psychometrics", this.props.archetype)}
                {this.makePredictiveSection("Skill", this.props.skill)}

                <div style={style.darkenerStyle} />


                <div style={style.dismissButton}>
                    <span onClick={this.handleClick.bind(this)}
                          style={style.dismissText}
                    >
                        {this.state.dismissed ? "Dismissed" : "Dismiss"}
                    </span>
                </div>

                {/*<a href={"/results?user=" + this.props.profileUrl}>See Results</a>*/}
                <a style={{...style.redLink, ...style.seeResults}}
                   href="/results?user=Stephen-Dorn-2-9f66bf7eeac18994">
                    See Results
                </a>
            </div>
        )
    }
}


export default CandidatePreview;
