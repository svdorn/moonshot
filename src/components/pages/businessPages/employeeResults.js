"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';
import {Tabs, Tab, Slider, CircularProgress} from 'material-ui';
import {ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, LabelList} from 'recharts';
import axios from 'axios';
import MetaTags from 'react-meta-tags';
import PredictiveGraph from '../../miscComponents/predictiveGraph';
import AddUserDialog from '../../childComponents/addUserDialog';
import PsychBreakdown from '../../childComponents/psychBreakdown';
import HoverTip from "../../miscComponents/hoverTip";

class EmployeeResults extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidate: {},
            overallScore: undefined,
            hardSkillPoints: [],
            predictivePoints: [],
            freeResponses: [],
            psychScores: [],
            archetype: "",
            loading: true,
            areaSelected: undefined,
            windowWidth: window.innerWidth
        };
    }


    componentDidMount() {
        // set resize listener
        window.addEventListener('resize', this.updateWindowDimensions.bind(this));

        let profileUrl = "";
        let businessId = "";
        let positionId = "";
        try {
            profileUrl = this.props.params.profileUrl;
            businessId = this.props.currentUser.businessInfo.company.companyId;
            positionId = this.props.params.positionId;
        } catch (e) {
            this.goTo("/myCandidates");
        }

        // backend call to get results info
        axios.get("/api/business/evaluationResults", {
            params : {
                userId: this.props.currentUser._id,
                verificationToken: this.props.currentUser.verificationToken,
                profileUrl, businessId, positionId
            }
        })
        .then(res => {
            const candidate = {
                name: res.data.name,
                title: res.data.title ? res.data.title : "",
                email: res.data.email
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
                archetype: res.data.archetype,
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
            // console.log("error: ", error);
            // if (error.response && error.response.data) {
            //     console.log(error.response.data);
            // }
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
                     archetype={this.state.archetype}
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
                <div className="employerDiv freeResponse">
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
        const loadingArea = <div className="center fillScreen" style={{paddingTop: "40px"}}><CircularProgress color="grayText" /></div>
        const analysisSection = loading ? loadingArea : this.makeAnalysisSection();
        const responsesSection = loading ? loadingArea : this.makeResponsesSection();

        return (
            <div>
                {this.props.currentUser.userType == "accountAdmin" ? <AddUserDialog /> : null}
                <MetaTags>
                    <title>{candidate.name} | Moonshot</title>
                    <meta name="description" content="Results user view."/>
                </MetaTags>
                <div>
                    {candidate ?
                        <div>
                            <div className="blackBackground paddingBottom40px">
                                <div className="profileInfoSkills">
                                    {/*<img style={style.leftTriangles} src="/images/LeftTriangles.png" />
                                    <img style={style.rightTriangles} src="/images/RightTriangles.png" />*/}
                                    <div className="center">
                                        <div style={style.imgContainer}>
                                            <img
                                                alt="Atom Icon"
                                                src="/icons/Atom2.png"
                                                style={{
                                                    height: "100%",
                                                    transform: "translateX(-50%)",
                                                    left: "50%",
                                                    position: "relative"
                                                }}
                                            />
                                        </div>
                                        <div>
                                            {candidate.name ? <div><div
                                                className="grayText font26px font14pxUnder700">{candidate.name}
                                            </div>
                                            <a className="font18px font12pxUnder500 grayText grayTextOnHover underline"
                                               href={mailtoEmail}>Contact</a></div>
                                           : null}
                                        </div>
                                    </div>
                                    <Tabs
                                        style={style.topTabs}
                                        inkBarStyle={{background: 'white'}}
                                        tabItemContainerStyle={{width: '40%'}}
                                        className="myPathwaysTabs"
                                    >
                                        <Tab label="Analysis" style={style.topTab}>
                                            <div className="tabsShadow" style={{position:"absolute"}}>
                                                <div/>
                                            </div>
                                            {analysisSection}
                                        </Tab>
                                        <Tab label="Responses" style={style.topTab}>
                                            <div className="tabsShadow">
                                                <div/>
                                            </div>
                                            {responsesSection}
                                        </Tab>
                                    </Tabs>
                                </div>
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
    leftTriangles: {
        position: "absolute",
        left: "100px",
        height: "300px",
        top: "100px"
    },
    rightTriangles: {
        position: "absolute",
        right: "100px",
        height: "300px",
        top: "100px"
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
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeResults);





























// "use strict"
// import React, {Component} from 'react';
// import {connect} from 'react-redux';
// import {browserHistory} from 'react-router';
// import {closeNotification} from "../../../actions/usersActions";
// import {bindActionCreators} from 'redux';
// import {Tabs, Tab, Slider} from 'material-ui';
// import {ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, LabelList} from 'recharts';
// import axios from 'axios';
// import MetaTags from 'react-meta-tags';
// import AddUserDialog from '../../childComponents/addUserDialog';
// import PredictiveGraph from '../../miscComponents/predictiveGraph';
//
// class EmployeeResults extends Component {
//     constructor(props) {
//         super(props);
//
//         this.state = {
//             user: undefined,
//             candidate: {},
//             overallScore: undefined,
//             hardSkills: [],
//             predictiveInsights: [],
//             freeResponses: []
//         };
//     }
//
//
//     componentDidMount() {
//         const user = this.props.currentUser;
//         let profileUrl = "";
//         try {
//             profileUrl = this.props.location.query.user;
//         } catch (e) {
//             this.goTo("/myEmployees");
//         }
//
//         if (user.userType !== 'employer') {
//             this.goTo("/");
//             return;
//         }
//
//         let self = this;
//         let candidate = {}, overallScore = undefined, hardSkills = [], predictiveInsights = [];
//
//         if (profileUrl === 'Jada-Falzon-1-56a7e8ae') {
//             candidate = {
//                 name: 'Jada Falzon',
//                 title: 'Financial Represenatative',
//                 email: 'jada.falzon@gmail.com',
//             };
//             overallScore = 116;
//             hardSkills = [
//                 {
//                     x: "Full Stack",
//                     y: 134,
//                 },
//                 {
//                     x: "Version Control",
//                     y: 107,
//                 },
//                 {
//                     x: "Machine Learning",
//                     y: 118,
//                 },
//                 {
//                     x: "Startup",
//                     y: 68,
//                 }
//             ];
//             predictiveInsights = [
//                 {
//                     x: "Growth",
//                     y: 134,
//                 },
//                 {
//                     x: "Performance",
//                     y: 107,
//                 },
//                 {
//                     x: "Culture Fit",
//                     y: 118,
//                 },
//                 {
//                     x: "Longevity",
//                     y: 68,
//                 }
//             ];
//         }
//
//         const freeResponses = [
//             {
//                 question: "How have you been successful in your position?",
//                 answer: "My vision for Dream Home is that it becomes a company that builds homes that are made through renewable energy technology and can be sustainable without the grid. Dream Home would own a home building company, an electric  machinery equipment company, and an alternative energy company to power the equipment. Though this will not be the only route people can take, we would ensure that the technology investments actually make it cheaper and more sustainable at the same time, what's not to love? These homes would be built to be more reliable and less expensive than conventional homes. I see this spreading literally everywhere. By letting people build homes for free even if they do not buy it, we are building a brand and reputation."
//             },
//             {
//                 question: "How have you grown in your position?",
//                 answer: "Spotify started out with the idea of bridging the gap between owning music and downloading it illegally on the internet. After Napster collapsed, they were frustrated at how hard it was to acquire music digitally.  They decided to create a simple two-tier model for streaming music legally, a free radio-like package, and a paid unlimited streaming package. By offering users a free version, they could test their product without even buying it. You could finally choose the music you wanted to listen to, even somewhat for free. Their logic is that even though 37.5 million users use it for free, they are still using it and that's a potential for a new customer.  On the flip side, they have negotiated with just about every music label and has the largest music collection, as more continue to join Spotify since their base is the largest of any music streaming service. They have kept a loyal fan base from the start, and they continue to do so with the music labels and customers."
//             },
//             {
//                 question: "How do you see yourself within the company?",
//                 answer: "The ideal customer is someone that has already owns a home. The reason I say this is because someone who's owned an older home understands the costs that are involved with upkeeping an old home. This is also a customer that is currently selling a home but has not bought one yet, someone who is dissatisfied with their current home, or someone who wants to downsize their home and save money. The customer will be anywhere from age 25 to 100, but more specifically the focus should be on people that are maybe 30-60 and have owned a home for a few years at least. The new home builder will be a younger company that exists in a region where home growth is large. They will have to have an entrepreneurial spirit and work with us to grow one another. The ideal situation is that the home builder integrates vertically with Dream Home."
//             }
//         ];
//
//         self.setState({
//             ...self.state,
//             user, candidate, overallScore, hardSkills, predictiveInsights, freeResponses
//         });
//
//     }
//
//
//     goTo(route) {
//         // closes any notification
//         this.props.closeNotification();
//         // goes to the wanted page
//         browserHistory.push(route);
//         // goes to the top of the new page
//         window.scrollTo(0, 0);
//     }
//
//
//     makeAnalysisSection() {
//         const predictiveDataPoints = [
//             {x: "Growth", y: 114, confidenceInterval: 10},
//             {x: "Performance", y: 97, confidenceInterval: 12},
//             {x: "Culture Fit", y: 102, confidenceInterval: 9},
//             {x: "Longevity", y: 83, confidenceInterval: 12}
//         ];
//         const hardSkillsDataPoints = [
//             {x: "Full Stack", y: 89, confidenceInterval: 13},
//             {x: "Version Control", y: 112, confidenceInterval: 11},
//             {x: "Artificial Intelligence", y: 91, confidenceInterval: 10},
//             {x: "Startup", y: 128, confidenceInterval: 16}
//         ];
//
//         return (
//             <div className="center aboutMeSection" style={style.tabContent}>
//                 {this.state.currentUser.userType == "accountAdmin" ? <AddUserDialog /> : null}
//                 <div className="lightBlackBackground" style={style.candidateScore}>
//                     <div className="paddingTop20px">
//                         <div
//                             className="font24px font20pxUnder700 font16pxUnder500 grayText">
//                             Employee Score <b style={style.lightBlue}><u>{this.state.overallScore}</u></b>
//                         </div>
//                         <div style={style.horizList}>
//                             <div className="horizListFull">
//                                 <div className="horizListSpacer"
//                                      style={{marginLeft: "20%"}}
//                                 >
//                                     <div
//                                         className="horizListText grayText font18px font16pxUnder800 font12pxUnder700">
//                                         Performance<br/>
//                                         <p style={style.lightBlue}>AVERAGE</p>
//                                     </div>
//                                     <Slider disabled={true}
//                                             value={0.5}
//                                             style={{maxWidth: '250px'}}
//                                             className="resultsSlider"
//                                     />
//                                 </div>
//                             </div>
//
//                             <div className="horizListFull">
//                                 <div className="horizListSpacer"
//                                      style={{marginLeft: "5%", marginRight: '5%'}}>
//                                     <div
//                                         className="horizListText grayText font18px font16pxUnder800 font12pxUnder700">
//                                         Psychometric<div className="under500only br"><br/></div> Archetype<br/>
//                                         <p style={style.lightBlue}>LOVER</p>
//                                         <img
//                                             alt="Heart Icon"
//                                             src="/icons/archetypes/Lover.png"
//                                             style={style.horizListIcon}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="horizListFull">
//                                 <div className="horizListSpacer"
//                                      style={{marginRight: "20%"}}>
//                                     <div
//                                         className="horizListText grayText font18px font16pxUnder800 font12pxUnder700">
//                                         Skill Level<br/>
//                                         <p style={style.lightBlue}>EXPERT</p>
//                                     </div>
//                                     <Slider disabled={true}
//                                             value={0.9}
//                                             style={{maxWidth: '250px'}}
//                                             className="resultsSlider"
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div
//                     className="whiteText center font24px font20pxUnder700 font16pxUnder500"
//                     style={{marginTop: '40px'}}>
//                     Performance
//                 </div>
//                 <div>
//                     <PredictiveGraph
//                         dataPoints={predictiveDataPoints}
//                         height={400}
//                     />
//                 </div>
//
//                 <div className="purpleToGreenSpacer"
//                      id="picturesToPathwaysHomepageSpacer"/>
//
//                 <div>
//                     <div
//                         className="whiteText center font24px font20pxUnder700 font16pxUnder500">
//                         Psychometric Breakdown
//                     </div>
//                     <div style={{marginTop: '40px'}}>
//                         <img
//                             alt="Heart Icon"
//                             src="/icons/archetypes/Lover.png"
//                             style={{height: '70px'}}
//                         /><br/>
//                         <b className="whiteText font24px font20pxUnder700 font16pxUnder500 paddingTop10px">
//                             Lover
//                         </b>
//                     </div>
//                     <div style={{...style.horizList, overflow:"auto"}}>
//                         <div className="horizListFull">
//                             <div className="horizListSpacer"
//                                  style={{marginLeft: "20%"}}
//                             >
//                                 <div
//                                     className="horizListText grayText font24px font20pxUnder700 font16pxUnder500">
//                                     <b style={style.lightBlue}>Social<div className="under500only br"><br/></div> Type</b><br/>
//                                     Authoritative
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="horizListFull">
//                             <div className="horizListSpacer"
//                                  style={{marginLeft: "5%", marginRight: '5%'}}>
//                                 <div
//                                     className="horizListText grayText font24px font20pxUnder700 font16pxUnder500">
//                                     <b style={style.lightBlue}>Work<div className="under500only br"><br/></div> Type</b><br/>
//                                     Creative
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="horizListFull">
//                             <div className="horizListSpacer"
//                                  style={{marginRight: "20%"}}>
//                                 <div
//                                     className="horizListText grayText font24px font20pxUnder700 font16pxUnder500">
//                                     <b style={style.lightBlue}>Key<div className="under500only br"><br/></div> Trait</b><br/>
//                                     Drive
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//
//                 <div style={style.characteristics} className="grayText font24px characteristicsList">
//                     <b className="font24px font20pxUnder700 font16pxUnder500 paddingTop10px" style={style.characteristicsTitle}>
//                         Characteristics
//                     </b>
//                     <div style={style.characteristicsListRow}>
//                         <div>Creative</div>
//                         <div>Success-Oriented</div>
//                         <div>Idea-Generator</div>
//                         <div>Multi-Tasker</div>
//                     </div>
//                     <div style={style.characteristicsListRow}>
//                         <div>Dislike for Routines</div>
//                         <div>Assertive</div>
//                         <div>Outspoken</div>
//                     </div>
//                     <div style={style.characteristicsListRow}>
//                         <div>Individualistic</div>
//                         <div>Perfectionist</div>
//                     </div>
//                 </div>
//
//                 <div style={style.descriptionBox} className="grayText font24px">
//                     <b className="font24px font20pxUnder700 font16pxUnder500 paddingTop10px" style={style.characteristicsTitle}>
//                         Description
//                     </b>
//                     <div style={style.description}>
//                         {"An out-of-the box thinker - flexible, energetic, and always"}<br/>
//                         {"engaged with their many interests and projects. Always curious, they're"}<br/>
//                         {"highly motivated by challenge and novelty."}<br/>
//                     </div>
//                 </div>
//
//                 <div className="purpleToGreenSpacer"
//                      id="picturesToPathwaysHomepageSpacer"/>
//
//                 <div
//                     className="whiteText center font24px font20pxUnder700 font16pxUnder500">
//                     Skills Evaluation
//                 </div>
//                 <div>
//                     <PredictiveGraph
//                         dataPoints={hardSkillsDataPoints}
//                         height={400}
//                     />
//                 </div>
//             </div>
//         );
//     }
//
//
//     makeResponsesSection() {
//         let freeResponses = [];
//         if (typeof this.state === "object" && Array.isArray(this.state.freeResponses)) {
//             freeResponses = this.state.freeResponses;
//         }
//
//         let responses = freeResponses.map(freeResponse => {
//             return (
//                 <div className="employerDiv freeResponse">
//                     <span className="lightBlueText">{freeResponse.question}</span>
//                     <div className="answer">{freeResponse.answer}</div>
//                 </div>
//             )
//         });
//
//         return (
//             <div className="fillScreen candidateResponses">
//                 {responses}
//             </div>
//         )
//     }
//
//
//     render() {
//         const user = this.state.user;
//         const candidate = this.state.candidate;
//         const hardSkills = this.state.hardSkills;
//         const predictiveInsights = this.state.predictiveInsights;
//         const profileUrl = "Jada-Falzon-1-56a7e8ae";
//
//         let mailtoEmail = undefined;
//         if (candidate) {
//             mailtoEmail = "mailto:" + candidate.email;
//         }
//
//         const analysisSection = this.makeAnalysisSection();
//         const responsesSection = this.makeResponsesSection();
//
//         return (
//             <div>
//                 <MetaTags>
//                     <title>{candidate.name} | Moonshot</title>
//                     <meta name="description" content="Results user view."/>
//                 </MetaTags>
//                 {user ?
//                     <div>
//                         {candidate ?
//                             <div>
//                                 <div className="blackBackground paddingBottom40px">
//                                     <div className="headerDiv"/>
//                                     <div className="profileInfoSkills">
//                                         <img style={style.leftTriangles} src="/images/LeftTriangles.png" />
//                                         <img style={style.rightTriangles} src="/images/RightTriangles.png" />
//                                         <div className="center">
//                                             <div style={style.imgContainer}>
//                                                 <img
//                                                     src="/images/JadaFalzon.png"
//                                                     alt="Profile picture"
//                                                     style={/*style.img*/style.SteveImg}
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <div
//                                                     className="grayText font26px font14pxUnder700">{candidate.name}
//                                                 </div>
//                                                 {candidate.title ?
//                                                     <div className="grayText font18px font12pxUnder500">
//                                                         {candidate.title}
//                                                     </div>
//                                                     : null
//                                                 }
//                                                 {profileUrl ?
//                                                     <a className="font18px font12pxUnder500 grayText grayTextOnHover underline"
//                                                         onClick={() => this.goTo(`/profile?user=${profileUrl}`)}>Profile</a>
//                                                     : null
//                                                 }
//                                                 <br/>
//                                                 <a className="font18px font12pxUnder500 grayText grayTextOnHover underline"
//                                                    href={mailtoEmail}>Contact</a>
//                                             </div>
//                                         </div>
//                                         <Tabs
//                                             style={style.topTabs}
//                                             inkBarStyle={{background: 'white'}}
//                                             tabItemContainerStyle={{width: '40%'}}
//                                             className="myPathwaysTabs"
//                                         >
//                                             <Tab label="Analysis" style={style.topTab}>
//                                                 <div className="tabsShadow" style={{position:"absolute"}}>
//                                                     <div/>
//                                                 </div>
//                                                 {analysisSection}
//                                             </Tab>
//                                             <Tab label="Responses" style={style.topTab}>
//                                                 <div className="tabsShadow">
//                                                     <div/>
//                                                 </div>
//                                                 {responsesSection}
//                                             </Tab>
//                                         </Tabs>
//                                     </div>
//                                 </div>
//
//                             </div>
//                             :
//                             <div>
//                                 <div className="orangeToYellowGradient halfHeight"/>
//                                 <div className="fullHeight"/>
//                                 <div className="fullHeight"/>
//                             </div>}
//                     </div>
//                     : null}
//             </div>
//         );
//     }
// }
//
//
// const style = {
//     imgContainer: {
//         height: "150px",
//         width: "150px",
//         borderRadius: '50%',
//         border: "3px solid white",
//         display: "inline-block",
//         overflow: "hidden"
//     },
//     img: {
//         height: "85px",
//         marginTop: "13px"
//     },
//     SteveImg: {
//         height: "100%"
//     },
//     locationImg: {
//         display: 'inline-block',
//         height: '15px',
//         marginBottom: '5px',
//         marginRight: '5px'
//     },
//     tabs: {
//         marginTop: '20px',
//     },
//     topTabs: {
//         marginTop: '20px',
//     },
//     topTab: {
//         color: 'white',
//     },
//     tabContent: {
//         paddingBottom: '30px',
//     },
//     lightBlue: {
//         color: '#75dcfc'
//     },
//     horizList: {
//         marginTop: '40px',
//     },
//     horizListIcon: {
//         height: "50px",
//         marginTop: "-5px"
//     },
//     leftTriangles: {
//         position: "absolute",
//         left: "100px",
//         height: "300px",
//         top: "100px"
//     },
//     rightTriangles: {
//         position: "absolute",
//         right: "100px",
//         height: "300px",
//         top: "100px"
//     },
//     candidateScore: {
//         minHeight: '200px',
//         padding: "20px",
//         overflow: "auto"
//     },
//     characteristics: {
//         paddingTop: "40px"
//     },
//     characteristicsTitle: {
//         color: "#96ADFC"
//     },
//     characteristicsListRow: {
//         display: "flex",
//         justifyContent: "center"
//     },
//     descriptionBox: {
//         paddingTop: "40px"
//     }
// };
//
//
// function mapDispatchToProps(dispatch) {
//     return bindActionCreators({
//         closeNotification,
//     }, dispatch);
// }
//
// function mapStateToProps(state) {
//     return {
//         currentUser: state.users.currentUser
//     };
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(EmployeeResults);
