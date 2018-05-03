"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';
import {Tabs, Tab} from 'material-ui';
import {ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, LabelList} from 'recharts';
import axios from 'axios';
import MetaTags from 'react-meta-tags';

class Results extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: undefined,
            candidate: {},
            overallScore: undefined,
            hardSkills: [],
            predictiveInsights: [],
        };
    }


    componentDidMount() {
        const user = this.props.currentUser;
        let profileUrl = "";
        try {
            profileUrl = this.props.location.query.user;
        } catch (e) {
            this.goTo("/myCandidates");
        }

        if (user.userType !== 'employer') {
            this.goTo("/");
            return;
        }

        let self = this;
        let candidate = {}, overallScore = undefined, hardSkills = [], predictiveInsights = [];

        if (profileUrl === 'Stephen-Dorn-2-9f66bf7eeac18994') {
            candidate = {
                name: 'Stephen Dorn',
                title: 'Software Developer',
                email: 'stevedorn9@gmail.com',
            };
            overallScore = 116;
            hardSkills = [
                {
                    x: "Full Stack",
                    y: 134,
                },
                {
                    x: "Version Control",
                    y: 107,
                },
                {
                    x: "Machine Learning",
                    y: 118,
                },
                {
                    x: "Startup",
                    y: 68,
                }
            ];
            predictiveInsights = [
                {
                    x: "Growth",
                    y: 134,
                },
                {
                    x: "Performance",
                    y: 107,
                },
                {
                    x: "Culture Fit",
                    y: 118,
                },
                {
                    x: "Longevity",
                    y: 68,
                }
            ];
        }

        self.setState({
            ...self.state,
            user, candidate, overallScore, hardSkills, predictiveInsights
        });

    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        const style = {
            pathwayPreviewUl: {
                marginTop: "20px",
            },
            imgContainer: {
                height: "100px",
                width: "100px",
                borderRadius: '50%',
                border: "3px solid white",
                display: "inline-block",
                overflow: "hidden"
            },
            img: {
                height: "85px",
                marginTop: "13px"
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
                backgroundColor: '#2e2e2e',
                paddingTop: '10px',
                paddingBottom: '30px',
            }
        };

        const user = this.state.user;
        const candidate = this.state.candidate;
        const overallScore = this.state.overallScore;
        const hardSkills = this.state.hardSkills;
        const predictiveInsights = this.state.predictiveInsights;

        let mailtoEmail = undefined;
        if (candidate) {
            mailtoEmail = "mailto:" + candidate.email;
        }

        console.log(user);
        console.log(candidate);

        return (
            <div>
                <MetaTags>
                    <title>{candidate.name} | Moonshot</title>
                    <meta name="description" content="Results user view."/>
                </MetaTags>
                {user ?
                    <div>
                        {candidate ?
                            <div>
                                <div className="blackBackground">
                                    <div className="headerDiv"/>
                                    <div className="profileInfoSkills">
                                        <div className="center">
                                            <div style={style.imgContainer}>
                                                <img
                                                    src="/icons/ProfilePicture.png"
                                                    alt="Profile picture"
                                                    style={style.img}
                                                />
                                            </div>
                                            <div>
                                                <div
                                                    className="whiteText font20px font14pxUnder700">{candidate.name}
                                                </div>
                                                {candidate.title ?
                                                    <div className="whiteText font14px font12pxUnder500">
                                                        {candidate.title}
                                                    </div>
                                                    : null}
                                                <a className="font14px font12pxUnder500 whiteText underline"
                                                   href={mailtoEmail}>Contact</a>
                                            </div>
                                        </div>
                                        <Tabs
                                            style={style.topTabs}
                                            inkBarStyle={{background: 'white'}}
                                            tabItemContainerStyle={{width: '40%'}}
                                            className="myPathwaysTabs"
                                        >
                                            <Tab label="Skills" style={style.topTab}>
                                                <div className="center fullHeight" style={style.tabContent}>
                                                    <div
                                                        className="whiteText center font24px font20pxUnder700 font16pxUnder500"
                                                        style={{marginTop: '20px'}}>
                                                        Predictive Insights
                                                    </div>
                                                    <div>
                                                        <ResponsiveContainer width="60%" height={250} minWidth={500}
                                                                             className="recharts-wrapper">
                                                            <ScatterChart margin={{
                                                                top: 20,
                                                                right: 50,
                                                                left: 0,
                                                                bottom: 0
                                                            }}>
                                                                <XAxis dataKey="x" tickLine={false} stroke="white"/>
                                                                <YAxis dataKey="y" name="Score"
                                                                       domain={['dataMin', 'auto']} stroke="white"/>
                                                                <Scatter data={predictiveInsights} fill="#8884d8" shape="square">
                                                                    <LabelList dataKey="y" stroke="white" position="top" />
                                                                </Scatter>
                                                            </ScatterChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    
                                                    <div className="purpleToGreenSpacer" id="picturesToPathwaysHomepageSpacer"/>

                                                    <div
                                                        className="whiteText center font24px font20pxUnder700 font16pxUnder500">
                                                        Hard Skills
                                                    </div>
                                                    <div>
                                                        <ResponsiveContainer width="60%" height={250} minWidth={500}
                                                                             className="recharts-wrapper">
                                                            <ScatterChart margin={{
                                                                top: 20,
                                                                right: 50,
                                                                left: 0,
                                                                bottom: 0
                                                            }}>
                                                                <XAxis dataKey="x" tickLine={false} stroke="white"/>
                                                                <YAxis dataKey="y" name="Score"
                                                                       domain={['dataMin', 'auto']} stroke="white"/>
                                                                <Scatter data={hardSkills} fill="#8884d8" shape="square">
                                                                    <LabelList dataKey="y" stroke="white" position="top" />
                                                                </Scatter>
                                                            </ScatterChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </Tab>
                                            <Tab label="Responses" style={style.topTab}>
                                                <div className="center fullHeight" style={style.tabContent}>

                                                </div>
                                            </Tab>
                                            <Tab label="Projects" style={style.topTab}>
                                                <div style={style.tabContent}
                                                     className="fullHeight font28px font font24pxUnder700 font20pxUnder500 center">
                                                    <div className="profileProjects whiteText">
                                                        None
                                                    </div>
                                                </div>
                                            </Tab>
                                        </Tabs>
                                    </div>
                                </div>

                            </div>
                            :
                            <div>
                                <div className="orangeToYellowGradient halfHeight"/>
                                <div className="fullHeight"/>
                                <div className="fullHeight"/>
                            </div>}
                    </div>
                    : null}
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Results);
