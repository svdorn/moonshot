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
            const overallScore = user.scores.overall;
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
                    confidenceInterval: 0,
                    unavailable: true
                }
            ];

            let self = this;
            self.setState({
                ...self.state,
                loading: false,
                psychScores: user.psychScores,
                candidate,
                overallScore,
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
