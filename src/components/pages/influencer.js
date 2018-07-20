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
import InfluencerPredictiveGraph from '../miscComponents/influencerPredictiveGraph';
import InfluencerPsychBreakdown from '../childComponents/influencerPsychBreakdown';
import HoverTip from "../miscComponents/hoverTip";

class Influencer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: {},
            influencers: [],
            hardSkillPoints: [],
            influencerHardSkillPoints: [],
            predictivePoints: [],
            influencerPredictivePoints: [],
            psychScores: [],
            influencerPsychScores: [],
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
            // const candidate = {
            //     name: currentUser.name,
            //     title: currentUser.title ? currentUser.title : "",
            //     email: currentUser.email
            // }
            console.log("Id: ",currentUser._id);
            console.log("pos ID ",position.positionId);
            console.log("bus id: ",position.businessId);
            console.log(position);
        axios.get("/api/user/influencerResults", {
            params : {
                userId: currentUser._id,
                businessId: position.businessId,
                positionId: position.positionId
            }
        })
        .then(res => {
            console.log("res: ",res);
            const user = res.data.returnUser;
            const influencers = res.data.returnInfluencers;

            const candidate = {
                name: user.name,
                email: user.email
            }
            const hardSkillPoints = user.skillScores.map(skill => {
                return {
                    x: skill.name,
                    y: this.round(skill.mostRecentScore),
                    confidenceInterval: 16
                }
            });
            // they all have a confidence interval of 16 for now
            const predictivePoints = [
                {
                    x: "Growth",
                    y: this.round(user.scores.growth),
                    confidenceInterval: 16
                },
                {
                    x: "Performance",
                    y: this.round(user.scores.performance),
                    confidenceInterval: 16
                },
                {
                    x: "Longevity",
                    y: this.round(user.scores.longevity),
                    confidenceInterval: 16
                }
            ];

            // Get influencers names
            let influencerPsychScores = [];
            let influencerSkillScores = [];
            let growth = 0;
            let performance = 0;
            let longevity = 0;
            for (let i = 0; i < influencers.length; i++) {
                const inf = influencers[i];
                console.log("influencer: ", inf);
                // get predictive points
                growth += inf.scores.growth;
                performance += inf.scores.performance;
                longevity += inf.scores.longevity;
                // get psych scores
                for (let i = 0; i < inf.psychScores.length; i++) {
                    const factor = inf.psychScores[i];
                    console.log("factor: ", factor);
                    // match factors we already have
                    const factorIndex = influencerPsychScores.findIndex(fac => {
                        return fac.name.toString() === factor.name.toString();
                    });
                    const foundFactor = typeof factorIndex === "number" && factorIndex >= 0;
                    if (foundFactor) {
                        // Add info to that skill
                        influencerPsychScores[factorIndex].score += factor.score;
                        influencerPsychScores[factorIndex].stats.median += factor.stats.median;
                        influencerPsychScores[factorIndex].stats.middle80.maximum = factor.stats.middle80.maximum;
                        influencerPsychScores[factorIndex].stats.middle80.minimum = factor.stats.middle80.minimum;
                        influencerPsychScores[factorIndex].timesSeen++;
                    } else {
                        // Add new skill
                        factor.timesSeen = 1;
                        influencerPsychScores.push(factor);
                    }
                }
                // get hard skill scores
                for (let i = 0; i < inf.skillScores.length; i++) {
                    const skill = inf.skillScores[i];
                    // match skills we already have
                    const skillIndex = influencerSkillScores.findIndex(sk => {
                        return sk.name.toString() === skill.name.toString();
                    });
                    const foundSkill = typeof skillIndex === "number" && skillIndex >= 0;
                    if (foundSkill) {
                        // Add info to that skill
                        console.log("skill score before: ", influencerSkillScores[skillIndex].mostRecentScore);
                        console.log("skill score adding: ", skill.mostRecentScore);
                        influencerSkillScores[skillIndex].mostRecentScore += skill.mostRecentScore;
                        console.log("skill score after: ", influencerSkillScores[skillIndex].mostRecentScore);
                        influencerSkillScores[skillIndex].timesSeen++;
                    } else {
                        // Add new skill
                        skill.timesSeen = 1;
                        influencerSkillScores.push(skill);
                    }
                }
            }

            // get averages for the hard skill scores
            for (let i = 0; i < influencerSkillScores.length; i++) {
                console.log("influencer skill score: ", influencerSkillScores);
                influencerSkillScores[i].mostRecentScore = influencerSkillScores[i].mostRecentScore/influencerSkillScores[i].timesSeen;
            }
            // Give the skill scores the correct formatting
            const influencerHardSkillPoints = influencerSkillScores.map(skill => {
                return {
                    x: skill.name,
                    y: this.round(skill.mostRecentScore),
                    confidenceInterval: 16
                }
            });

            // get averages of psych scores
            for (let i = 0; i < influencerPsychScores.length; i++) {
                let times = influencerPsychScores[i].timesSeen;
                influencerPsychScores[i].score = influencerPsychScores[i].score/times;
                influencerPsychScores[i].stats.median = influencerPsychScores[i].stats.median/times;
                influencerPsychScores[i].stats.middle80.maximum = influencerPsychScores[i].stats.middle80.maximum/times;
                influencerPsychScores[i].stats.middle80.minimum = influencerPsychScores[i].stats.middle80.minimum/times;
            }

            // get averages of scores
            growth = growth/influencers.length;
            performance = performance/influencers.length;
            longevity = longevity/influencers.length;

            const influencerPredictivePoints = [
                {
                    x: "Growth",
                    y: this.round(growth),
                    confidenceInterval: 8
                },
                {
                    x: "Performance",
                    y: this.round(performance),
                    confidenceInterval: 8
                },
                {
                    x: "Longevity",
                    y: this.round(longevity),
                    confidenceInterval: 8
                }
            ];

            let self = this;
            self.setState({
                ...self.state,
                loading: false,
                influencers,
                influencerPredictivePoints,
                influencerHardSkillPoints,
                influencerPsychScores,
                psychScores: user.psychScores,
                candidate,
                predicted: user.scores.predicted,
                skill: user.scores.skill,
                hardSkillPoints,
                predictivePoints,
                windowWidth: window.innerWidth
            });
        })
        .catch(error => {
            console.log("error: ", error);
        });
    }


    componentWillUnmount() {
        window.addEventListener('resize', this.updateWindowDimensions.bind(this));
    }


    updateWindowDimensions() {
        this.setState({ windowWidth: window.innerWidth });
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
                    <InfluencerPredictiveGraph
                        title={"Predicted Performance"}
                        dataPoints={this.state.predictivePoints}
                        height={graphHeight}
                    />
                </div>

                <div className="influencerPageSpacer" />

                 <InfluencerPsychBreakdown
                     psychScores={this.state.psychScores}
                     forCandidate={false}
                 />

                 <div className="influencerPageSpacer" />

                <div>
                    <InfluencerPredictiveGraph
                        title={"Skills Evaluation"}
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

        console.log("influencer hard skills: ", this.state.influencerHardSkillPoints);
        console.log("influencer predictive points: ", this.state.influencerPredictivePoints);
        console.log("influencer psych scores: ", this.state.influencerPsychScores);

        const loading = this.state.loading;
        const loadingArea = <div className="center fillScreen" style={{marginTop: "40px"}} key="loadingArea"><CircularProgress color="secondary-gray" /></div>
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
                                <div className="font32px font26pxUnder700 font24font16pxUnder500 secondary-red">
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
