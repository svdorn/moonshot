"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import {Tabs, Tab, Slider, CircularProgress,Divider} from 'material-ui';
import {ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, LabelList} from 'recharts';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
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
            influencer: "Select an influencer",
            hardSkillPoints: [],
            influencerHardSkillPoints: [],
            avgInfluencerHardSkillPoints: [],
            predictivePoints: [],
            influencerPredictivePoints: [],
            avgInfluencerPredictivePoints: [],
            psychScores: [],
            influencerPsychScores: [],
            avgInfluencerPsychScores: [],
            loading: true,
            areaSelected: undefined,
            windowWidth: window.innerWidth,
            name: "you"
        };
    }


    componentDidMount() {
        // set resize listener
        window.addEventListener('resize', this.updateWindowDimensions.bind(this));

        let userId = "";
        let businessId = "";
        let positionId = "";
        try {
            userId = this.props.location.query.user;
            businessId = this.props.location.query.businessId;
            positionId = this.props.location.query.positionId;
        } catch (e) {
            this.goTo("/");
        }

        if (businessId !== "5b29597efb6fc033f887fda0" || positionId !== "5b2952445635d4c1b9ed7b04") {
            this.goTo("/");
        }

        axios.get("/api/user/influencerResults", {
            params : {
                userId, businessId, positionId
            }
        })
        .then(res => {
            const user = res.data.returnUser;
            const influencers = res.data.returnInfluencers;

            let name;
            if (this.props.currentUser && (this.props.currentUser._id === userId)) {
                name = "you";
            } else {
                name = user.name;
            }

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
                // get predictive points
                growth += inf.scores.growth;
                performance += inf.scores.performance;
                longevity += inf.scores.longevity;
                // get psych scores
                for (let i = 0; i < inf.psychScores.length; i++) {
                    const factor = inf.psychScores[i];
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
                        influencerSkillScores[skillIndex].mostRecentScore += skill.mostRecentScore;
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
                }
            ];

            let self = this;
            self.setState({
                ...self.state,
                loading: false,
                influencers,
                avgInfluencerPredictivePoints: influencerPredictivePoints,
                avgInfluencerHardSkillPoints: influencerHardSkillPoints,
                avgInfluencerPsychScores: influencerPsychScores,
                influencerPredictivePoints,
                influencerHardSkillPoints,
                influencerPsychScores,
                psychScores: user.psychScores,
                candidate,
                predicted: user.scores.predicted,
                skill: user.scores.skill,
                hardSkillPoints,
                predictivePoints,
                windowWidth: window.innerWidth,
                name,
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

    handleInfluencer(event, type) {
        const influencer = event.target.value;
        let self = this;

        if (influencer === "Select an influencer") {
            // set influencer stuff to avgInfluencer
            self.setState({
                influencerHardSkillPoints: self.state.avgInfluencerHardSkillPoints,
                influencerPsychScores: self.state.avgInfluencerPsychScores,
                influencerPredictivePoints: self.state.avgInfluencerPredictivePoints,
                influencer
            });
        } else {
            const influencers = this.state.influencers;
            const infIndex = influencers.findIndex(inf => {
                return influencer.toString() === inf.name.toString();
            });
            const foundInfluencer = typeof infIndex === "number" && infIndex >= 0;
            if (foundInfluencer) {
                let inf = influencers[infIndex];
                const influencerPsychScores = inf.psychScores;
                const influencerHardSkillPoints = inf.skillScores.map(skill => {
                    return {
                        x: skill.name,
                        y: this.round(skill.mostRecentScore),
                        confidenceInterval: 16
                    }
                });
                const influencerPredictivePoints = [
                    {
                        x: "Growth",
                        y: this.round(inf.scores.growth),
                        confidenceInterval: 8
                    },
                    {
                        x: "Performance",
                        y: this.round(inf.scores.performance),
                        confidenceInterval: 8
                    },
                    {
                        x: "Longevity",
                        y: this.round(inf.scores.longevity),
                        confidenceInterval: 8
                    }
                ];
                self.setState({
                    influencerHardSkillPoints,
                    influencerPsychScores,
                    influencerPredictivePoints,
                    influencer,
                })
            } else {
                self.setState({
                    influencerHardSkillPoints: self.state.avgInfluencerHardSkillPoints,
                    influencerPsychScores: self.state.avgInfluencerPsychScores,
                    influencerPredictivePoints: self.state.avgInfluencerPredictivePointsm,
                    influencer: "Select an influencer",
                });
            }
        }
    }

    dropdown(type) {
        // the hint that shows up when search bar is in focus
        const searchHintStyle = { color: "rgba(255, 255, 255, .3)" }
        const searchInputStyle = { color: "rgba(255, 255, 255, .8)" }
        const searchFloatingLabelFocusStyle = { color: "rgb(117, 220, 252)" }
        const searchFloatingLabelStyle = searchHintStyle;
        const searchUnderlineFocusStyle = searchFloatingLabelFocusStyle;


        let menuItems = this.state.influencers.map(menuItem => {
            return (
                <MenuItem
                    value={menuItem.name}
                    key={`moveTo${menuItem.name}`}
                >
                    { menuItem.name }
                </MenuItem>
            );
        });
        menuItems.unshift( <Divider key="divider"/> );
        menuItems.unshift( <MenuItem key="selectInfluencer" value={"Select an influencer"}>{"Select an influencer"}</MenuItem> );

        const colorClass = " secondary-gray";
        const cursorClass = " pointer";

        let selectAttributes = {
            disableUnderline: true,
            classes: {
                root: "myCandidatesSelect" + colorClass,
                icon: "selectIconGrayImportant"
            },
            value: this.state.influencer,
            onChange: (event) => this.handleInfluencer(event, type)
        };

        return (
            <div className="" key="top options">
                <div className="inlineBlock">
                    <Select className="influencerSelection" {...selectAttributes}>{menuItems}</Select>
                </div>
            </div>
        );
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
                    <div className="secondary-gray center font24px font20pxUnder700 font16pxUnder500 marginBottom10px">
                        Predicted Performance
                    </div>
                    {this.dropdown("Predictive Points")}
                    <InfluencerPredictiveGraph
                        dataPoints={this.state.predictivePoints}
                        influencerDataPoints={this.state.influencerPredictivePoints}
                        height={graphHeight}
                    />
                </div>

                <div className="influencerPageSpacer" />

                <div>
                    <div className="secondary-gray center font24px font20pxUnder700 font16pxUnder500 marginBottom10px">
                        Psychometric Analysis
                    </div>
                    {this.dropdown("Psych Breakdown")}
                    <InfluencerPsychBreakdown
                         psychScores={this.state.psychScores}
                         influencerPsychScores={this.state.influencerPsychScores}
                         forCandidate={false}
                         name={this.state.name}
                     />
                 </div>

                 <div className="influencerPageSpacer" />

                <div>
                    <div className="secondary-gray center font24px font20pxUnder700 font16pxUnder500 marginBottom10px">
                        Skills Evaluation
                    </div>
                    {this.dropdown("Skills Evaluation")}
                    <InfluencerPredictiveGraph
                        dataPoints={this.state.hardSkillPoints}
                        influencerDataPoints={this.state.influencerHardSkillPoints}
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
                                    {this.state.name === "you" ?
                                        <div>See how {this.state.name} compare to top Content Marketing Influencers.</div>
                                    :
                                        <div>See how {this.state.name} compares to top Content Marketing Influencers.</div>
                                    }
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
