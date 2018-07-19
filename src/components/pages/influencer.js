"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import {Tabs, Tab, Slider, CircularProgress} from 'material-ui';
import {ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, LabelList} from 'recharts';
import axios from 'axios';
import MetaTags from 'react-meta-tags';
import PredictiveGraph from '../miscComponents/predictiveGraph';
import PsychBreakdown from '../childComponents/psychBreakdown';
import HoverTip from "../miscComponents/hoverTip";

class Influencer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: {},
            overallScore: undefined,
            hardSkillPoints: [],
            predictivePoints: [],
            psychScores: [],
            loading: true,
            areaSelected: undefined,
            windowWidth: window.innerWidth
        };
    }


    componentDidMount() {
        // set resize listener
        window.addEventListener('resize', this.updateWindowDimensions.bind(this));

        // get the position, set shit
        let position = this.props.currentUser.positions[0];

            const currentUser = this.props.currentUser;
            const candidate = {
                name: currentUser.name,
                title: currentUser.title ? currentUser.title : "",
                email: currentUser.email
            }
            console.log(position);
            // get skill test scores for relevant skills
            const skillScores = Array.isArray(currentUser.skillTests) ? currentUser.skillTests.filter(skill => {
                return position.skillTestIds.some(posSkillId => {
                    console.log("posSkillId", posSkillId);
                    console.log("skill.skillId: ",skill.skillId)
                    return posSkillId.toString() === skill.skillId.toString();
                });
            }) : [];
            const hardSkillPoints = skillScores.map(skill => {
                return {
                    x: skill.name,
                    y: this.round(skill.mostRecentScore),
                    confidenceInterval: 16
                }
            });
            // have to convert the factor names to what they will be displayed as
            const psychNameConversions = {
                "Extraversion": "Dimension",
                "Emotionality": "Temperament",
                "Honesty-Humility": "Viewpoint",
                "Conscientiousness": "Methodology",
                "Openness to Experience": "Perception",
                "Agreeableness": "Ethos",
                "Altruism": "Belief"
            };
            console.log(currentUser);
            const psychScores = currentUser.psychometricTest.factors.map(area => {
                // get the stats from the influencers and map here
                const stats= {
                    // the median score for this factor
                    median : 50,
                    // the scores that the middle 80% of people get
                    middle80: {
                        // what the person farthest negative in the 80% got
                        miminum: 20,
                        // what the person farthest positive in the 80% got
                        maximum:80
                    },
                };

                return {
                    name: psychNameConversions[area.name],
                    score: area.score,
                    stats
                }
            });
            // const hardSkillPoints = scores.skill.map(skill => {
            //     return {
            //         x: skill.name,
            //         y: this.round(skill.mostRecentScore),
            //         confidenceInterval: 16
            //     }
            // });
            const overallScore = position.scores.overall;
            // they all have a confidence interval of 16 for now
            const predictivePoints = [
                {
                    x: "Growth",
                    y: this.round(position.scores.growth),
                    confidenceInterval: 16
                },
                {
                    x: "Performance",
                    y: this.round(position.scores.performance),
                    confidenceInterval: 16
                },
                {
                    x: "Longevity",
                    y: this.round(position.scores.longevity),
                    confidenceInterval: 0,
                    unavailable: true
                },
                {
                    x: "Culture",
                    y: this.round(position.scores.culture),
                    confidenceInterval: 0,
                    unavailable: true
                }
            ];

            let self = this;
            self.setState({
                ...self.state,
                loading: false,
                psychScores: psychScores,
                candidate,
                overallScore,
                predicted: position.scores.predicted,
                skill: position.scores.skill,
                hardSkillPoints,
                predictivePoints,
                windowWidth: window.innerWidth
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
            <div className="analysis center aboutMeSection" style={style.tabContent} key={"analysisSection"}>
                <div>
                    <PredictiveGraph
                        title={"Predicted Performance"}
                        dataPoints={this.state.predictivePoints}
                        height={graphHeight}
                    />
                </div>

                <div className="influencerPageSpacer" />

                 <PsychBreakdown
                     psychScores={this.state.psychScores}
                     forCandidate={false}
                 />

                 <div className="influencerPageSpacer" />

                <div
                    className="primary-white center font24px font20pxUnder700 font16pxUnder500">
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

    render() {
        const user = this.props.currentUser;
        const candidate = this.state.candidate;
        const hardSkills = this.state.hardSkills;
        const predictiveInsights = this.state.predictiveInsights;

        let mailtoEmail = undefined;
        if (candidate) {
            mailtoEmail = "mailto:" + candidate.email;
        }

        const loading = this.state.loading;
        const loadingArea = <div className="center fillScreen" style={{paddingTop: "40px"}} key="loadingArea"><CircularProgress color="secondary-gray" /></div>
        const analysisSection = loading ? loadingArea : this.makeAnalysisSection();

        return (
            <div key="results">
                <MetaTags>
                    <title>Influencer Results | Moonshot</title>
                    <meta name="description" content="See how your results compare to influencers in the field."/>
                </MetaTags>
                <div>
                    {candidate ?
                        <div className="marginTop20px">
                            <div className="blackBackground paddingBottom40px center">
                                <div className="font28px font26pxUnder700 font24font16pxUnder500 secondary-red">
                                    Ease Standard
                                </div>
                                <div className="secondary-gray font18px font16pxUnder700 font14pxUnder500 marginBottom40px marginTop10px">
                                    See how you compare to top Content Marketing Influencers.
                                </div>
                                {analysisSection}
                            </div>

                        </div>
                        :
                        <div>
                            <div className="blackBackground halfHeight"/>
                            <div className="fullHeight"/>
                            <div className="fullHeight"/>
                        </div>
                    }
                </div>
            </div>
        );
    }
}


const style = {
    imgContainer: {
        height: "75px",
        width: "75px",
        // borderRadius: '50%',
        // border: "3px solid white",
        display: "inline-block",
        //overflow: "hidden"
        marginBottom: "20px"
    },
    img: {
        height: "85px",
        marginTop: "13px"
    },
    SteveImg: {
        height: "100%"
    },
    locationImg: {
        display: 'inline-block',
        height: '15px',
        marginBottom: '5px',
        marginRight: '5px'
    },
    tabs: {
        marginTop: '20px',
    },
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
    horizListIcon: {
        height: "50px",
        marginTop: "-5px"
    },
    candidateScore: {
        minHeight: '200px',
        padding: "20px",
        overflow: "auto"
    },
    characteristics: {
        paddingTop: "40px"
    },
    characteristicsTitle: {
        color: "#96ADFC"
    },
    characteristicsListRow: {
        display: "flex",
        justifyContent: "center"
    },
    descriptionBox: {
        paddingTop: "40px"
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

export default connect(mapStateToProps, mapDispatchToProps)(Influencer);
