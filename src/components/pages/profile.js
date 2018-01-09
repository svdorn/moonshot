"use strict"
import React, {Component} from 'react';
import {AppBar, Paper, Tabs, Tab, CircularProgress, Chip} from 'material-ui';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import PathwayPreview from '../childComponents/pathwayPreview';
import axios from 'axios';

class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pathways: [],
            completedPathways: [],
            userPathwayPreviews: undefined,
            userCompletedPathwayPreviews: undefined
        }
    }

    componentDidMount() {
        // check if there is a logged-in user first, then create the user's pathways
        if (this.props.currentUser) {
            // populate featuredPathways with initial pathways
            if (this.props.currentUser.pathways) {
                for (let i = 0; i < this.props.currentUser.pathways.length; i++) {
                    let id = this.props.currentUser.pathways[i].pathwayId;
                    axios.get("/api/getPathwayById", {
                        params: {
                            _id: id
                        }
                    }).then(res => {
                        let pathway = res.data;
                        let key = 0;
                        let self = this;

                        const pathways = [...this.state.pathways, pathway];

                        // use the received pathways to make pathway previews
                        const userPathwayPreviews = pathways.map(function (pathway) {
                            key++;
                            const deadline = new Date(pathway.deadline);
                            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                            return (
                                <li key={key} style={{verticalAlign: "top"}}
                                    onClick={() => self.goTo('/pathwayContent/' + pathway._id)}>
                                    <PathwayPreview
                                        name={pathway.name}
                                        image={pathway.previewImage}
                                        logo={pathway.sponsor.logo}
                                        sponsorName={pathway.sponsor.name}
                                        completionTime={pathway.estimatedCompletionTime}
                                        deadline={formattedDeadline}
                                        price={pathway.price}
                                        _id={pathway._id}
                                    />
                                </li>
                            );
                        });

                        this.setState({
                            pathways,
                            userPathwayPreviews
                        }, function () {

                        });
                    }).catch(function (err) {
                        console.log("error getting searched-for pathway");
                        console.log(err);
                    })
                }
            }
            if (this.props.currentUser.completedPathways) {
                for (let i = 0; i < this.props.currentUser.completedPathways.length; i++) {
                    let id = this.props.currentUser.completedPathways[i].pathwayId;
                    axios.get("/api/getPathwayById", {
                        params: {
                            _id: id
                        }
                    }).then(res => {
                        let pathway = res.data;
                        let key = 0;
                        let self = this;

                        const completedPathways = [...this.state.completedPathways, pathway];

                        // use the received pathways to make pathway previews
                        const userCompletedPathwayPreviews = completedPathways.map(function (pathway) {
                            key++;
                            const deadline = new Date(pathway.deadline);
                            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                            return (
                                <li key={key} style={{verticalAlign: "top"}}
                                    onClick={() => self.goTo('/pathway/' + pathway._id)}>
                                    <PathwayPreview
                                        name={pathway.name}
                                        image={pathway.previewImage}
                                        logo={pathway.sponsor.logo}
                                        sponsorName={pathway.sponsor.name}
                                        completionTime={pathway.estimatedCompletionTime}
                                        deadline={formattedDeadline}
                                        price={pathway.price}
                                        _id={pathway._id}
                                    />
                                </li>
                            );
                        });

                        this.setState({
                            completedPathways,
                            userCompletedPathwayPreviews
                        }, function () {

                        });
                    }).catch(function (err) {
                        console.log("error getting searched-for completed pathway");
                        console.log(err);
                    })
                }
            }
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

    render() {

        const style = {
            pathwayPreviewUl: {
                marginTop: "20px",
            },
            tabs: {
            },
            tab: {
                backgroundColor: "white",
                color: 'black',
                fontSize: '18px'
            },
            img: {
                height: "120px",
                borderRadius: '50%',
                border: "3px solid #00d2ff",
            },
            locationImg: {
                display: 'inline-block',
                height: '15px',
                marginBottom: '5px',
                marginRight: '5px'
            },
            pictureInfoSkills: {
                everything: {
                    paddingTop:'40px',
                    textAlign: 'center'
                },
                leftSide: {
                    width: "20%",
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "5%",
                },
                rightSide: {
                    width: "60%",
                    display: "inline-block",
                    verticalAlign: "top",
                    justifyContent: "center",
                },
            }
        };

        let profileSkills = null;
        let skills = undefined;
        let mailtoEmail = undefined;
        let user = this.props.currentUser;
        if (user) {
            skills = user.skills;
            mailtoEmail = "mailto:" + user.email;
        }
        if (skills) {
            profileSkills = skills.map(function (skill) {
                return (
                    <div style={{display: 'inline-block', marginTop: '15px'}}>
                        <Chip key={skill}
                              backgroundColor='#white'
                              labelColor="#00d2ff"
                              labelStyle={{fontSize: '20px'}}
                              style={{marginLeft: '20px', border: "1px solid #00d2ff"}}>
                            {skill}
                        </Chip>
                    </div>
                );
            });
        }

        let aboutMeLis = [];

        if (user) {
            const education = user.info.education;
            const links = user.info.links;
            const interests = user.info.interests;
            const goals = user.info.goals;
            const birthDate = user.info.birthDate;
            const languages = user.info.languages;
            let aboutMeItems = [];

            let index = -1;

            if (education && education.length > 0) {
                const schools = education.map(function(edu) {
                    const dates = edu.startDate.substring(0,4) + "-" + edu.endDate.substring(0,4);
                    return (
                        <div>
                            <div style={{float:"left"}}>{edu.school}</div>
                            <div style={{float:"right"}}>{dates}</div><br/>
                            <div style={{clear:"both", marginLeft:"60px"}}><i>{edu.degree}</i></div>
                        </div>
                    );
                });
                aboutMeItems.push({
                    icon: "GraduationHat.png",
                    title: "Education",
                    content: schools
                });
            }
            if (links && links.length > 0) {
                index = -1;
                const linkOuts = links.map(function(link) {
                    // so that index is at the current place
                    index++;
                    return (
                        <span>
                            <a href={link.url} target="_blank">{link.displayString}</a>
                            {index < links.length - 1 ?
                                <div className="linkSeparator" style={{backgroundColor:"black"}}/>
                                : null
                            }
                        </span>
                    );
                });
                aboutMeItems.push({
                    icon: "Badge.png",
                    title: "Links",
                    content: linkOuts
                });
            }
            if (interests && interests.length > 0) {
                index = -1;
                const interestsSpans = interests.map(function(interest) {
                    index++;
                    const comma = (index < interests.length - 1) ? ", " : "";
                    return (
                        <span>{interest + comma}</span>
                    );
                });
                aboutMeItems.push({
                    icon: "Lightbulb.png",
                    title: "Interests",
                    content: <div>{interestsSpans}</div>
                });
            }
            if (goals && goals.length > 0) {
                index = -1;
                const goalsSpans = goals.map(function(goal) {
                    index++;
                    const comma = (index < goals.length - 1) ? ", " : "";
                    return (
                        <span>{goal + comma}</span>
                    );
                });
                aboutMeItems.push({
                    icon: "GraduationHat.png",
                    title: "Goals",
                    content: <div>{goalsSpans}</div>
                });
            }
            if (birthDate) {
                console.log(birthDate);
                // ADD THIS {(birthDate.getMonth() + 1) + "/" + birthDate.getDate() + "/" + birthDate.getYear()}
                const date = birthDate.substring(5, 7) + "/" + birthDate.substring(8, 10) + "/" + birthDate.substring(0, 2);
                aboutMeItems.push({
                    icon: "CalendarBlue.png",
                    title: "D.O.B.",
                    content: date
                });
            }
            if (languages && languages.length > 0) {
                index = -1;
                const languagesSpans = languages.map(function(language) {
                    index++;
                    const comma = (index < languages.length - 1) ? ", " : "";
                    return (
                        <span>{language + comma}</span>
                    );
                });
                aboutMeItems.push({
                    icon: "SpeechBubble.png",
                    title: "Languages",
                    content: <div>{languagesSpans}</div>
                });
            }

            aboutMeLis = aboutMeItems.map(function(item) {
                return (
                    <li className="aboutMeLi" key={item.title}>
                        <img src={"/icons/" + item.icon} />
                        <div>{item.title}</div>
                        {item.content}
                    </li>
                );
            });
        }

        return (
            <div className='jsxWrapper' ref='discover'>
                {this.props.currentUser ?
                    <div>
                        <div className="greenToBlue headerDiv"/>
                        {this.state.userPathwayPreviews ?
                            <div>
                                <div style={style.pictureInfoSkills.everything}>
                                    <div style={style.pictureInfoSkills.leftSide}>
                                        <img
                                            src="/icons/stephenProfile.jpg"
                                            alt="Profile picture"
                                            style={style.img}
                                        />
                                        <div>
                                            <div
                                                className="blueText smallText2">{this.props.currentUser.name.toUpperCase()}</div>
                                            <b className="smallText">{this.props.currentUser.info.title}</b><br/>
                                            <div>
                                                <img
                                                    src="/icons/Location.png"
                                                    alt="Portfolio"
                                                    style={style.locationImg}
                                                />
                                                <div className="smallText" style={{display: 'inline-block'}}>
                                                    {this.props.currentUser.info.city}, {this.props.currentUser.info.state}
                                                </div>
                                            </div>
                                            <a className="smallText blueText" href={mailtoEmail}>Contact</a>
                                        </div>
                                    </div>
                                    <div style={style.pictureInfoSkills.rightSide}>
                                        {this.props.currentUser.skills ?
                                            <div className="center">
                                                {profileSkills}
                                            </div>
                                            : null}
                                    </div>
                                </div>

                                <div className="profileSeparator">
                                    <div className="profileSeparatorRect">
                                        <b>PATHWAYS</b>
                                    </div>
                                    <div className="profileSeparatorTri">
                                    </div>
                                    <div style={{clear: "both"}}/>
                                </div>

                                <div className="center">
                                    <Tabs
                                        style={style.tabs}
                                        inkBarStyle={{background: 'black'}}
                                        tabItemContainerStyle={{width: '40%'}}
                                        className="myPathwaysTabs"
                                    >
                                        <Tab label="Ongoing" style={style.tab}>
                                            {this.state.userPathwayPreviews ?
                                                <ul className="horizCenteredList pathwayPrevList"
                                                    style={style.pathwayPreviewUl}>
                                                    {this.state.userPathwayPreviews}
                                                </ul>
                                                : <h1 className="center mediumText">None</h1>}
                                        </Tab>
                                        <Tab label="Completed" style={style.tab}>
                                            {this.state.userCompletedPathwayPreviews ?
                                                <ul className="horizCenteredList pathwayPrevList"
                                                    style={style.pathwayPreviewUl}>
                                                    {this.state.userCompletedPathwayPreviews}
                                                </ul>
                                                : <h1 className="center mediumText">None</h1>}
                                        </Tab>
                                    </Tabs>
                                </div>

                                <div className="profileSeparator">
                                    <div className="profileSeparatorRect">
                                        <b>PROJECTS</b>
                                    </div>
                                    <div className="profileSeparatorTri">
                                    </div>
                                    <div style={{clear: "both"}}/>
                                </div>


                                <div className="profileSeparator">
                                    <div className="profileSeparatorRect">
                                        <b>ABOUT ME</b>
                                    </div>
                                    <div className="profileSeparatorTri">
                                    </div>
                                    <div style={{clear: "both"}}/>
                                </div>

                                <div className="textWithMargin">{user.info.description}</div>

                                <ul className="horizCenteredList">
                                    { aboutMeLis }
                                </ul>

                            </div>
                            : <div className="center"><CircularProgress
                                style={{marginTop: "20px", marginBottom: "20px"}}/></div>}
                    </div>
                    : null}
            </div>

        );
        // {/*<div>*/}
        //         {/*<AppBar className="appBar"*/}
        //                 {/*showMenuIconButton={false}*/}
        //                 {/*title={this.props.currentUser.name}/>*/}
        // {/*</div>*/}
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
