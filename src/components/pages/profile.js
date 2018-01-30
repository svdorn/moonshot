"use strict"
import React, {Component} from 'react';
import {Tabs, Tab, CircularProgress, Chip} from 'material-ui';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification, setHeaderBlue} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import PathwayPreview from '../childComponents/pathwayPreview';
import axios from 'axios';

class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pathways: [],
            onOwnProfile: false,
            completedPathways: [],
            userPathwayPreviews: undefined,
            userCompletedPathwayPreviews: undefined,
            user: undefined
        }
    }

    componentDidMount() {
        const profileUrl = this.props.location.search.substr(1);
        const currentUser = this.props.currentUser;
        // looking at your own profile
        if ((profileUrl == "") || (currentUser && currentUser.profileUrl == profileUrl)) {
            this.setState({
                ...this.state,
                onOwnProfile: true,
                user: currentUser
            }, () => {
                this.makePathways();
            })
        }

        // looking at someone else's profile
        else {
            axios.post("/api/getUserByProfileUrl", {profileUrl}
            ).then(res => {
                const user = res.data;

                this.setState({
                    ...this.state,
                    onOwnProfile: false,
                    user
                }, () => {
                    this.makePathways();
                })
            })
        }

        // this.props.setHeaderBlue(true);


    }

    makePathways() {
        let userPathwayPreviews = undefined;

        const user = this.state.user;

        // check if there is a user first, then create the user's pathways
        if (user) {
            // populate featuredPathways with initial pathways
            if (user.pathways) {
                if (user.pathways.length == 0) {
                    this.setState({
                        pathways: [],
                        userPathwayPreviews: []
                    });
                }

                for (let i = 0; i < user.pathways.length; i++) {
                    let id = user.pathways[i].pathwayId;
                    axios.get("/api/pathwayByIdNoContent", {
                        params: {
                            _id: id
                        }
                    }).then(res => {
                        let pathway = res.data;
                        let key = 0;
                        let self = this;

                        const pathways = [...this.state.pathways, pathway];

                        // use the received pathways to make pathway previews
                        userPathwayPreviews = pathways.map(function (pathway) {
                            key++;
                            const deadline = new Date(pathway.deadline);
                            const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                            return (
                                <li key={key} style={{verticalAlign: "top"}}
                                    onClick={() => self.goTo('/pathwayContent?' + pathway._id)}>
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
                        });
                    }).catch(function (err) {
                    })
                }
            }
            if (user.completedPathways) {
                for (let i = 0; i < user.completedPathways.length; i++) {
                    let id = user.completedPathways[i].pathwayId;
                    axios.get("/api/pathwayByIdNoContent", {
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
                                    onClick={() => self.goTo('/pathway?' + pathway._id)}>
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
                    })
                }
            }
        }
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // sets header back to normal
        // this.props.setHeaderBlue(false);
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
            tabs: {},
            tab: {
                backgroundColor: "white",
                color: 'black',
            },
            img: {
                height: "100px",
                borderRadius: '50%',
                border: "3px solid #00d2ff",
            },
            locationImg: {
                display: 'inline-block',
                height: '15px',
                marginBottom: '5px',
                marginRight: '5px'
            },
        };

        let profileSkills = null;
        let skills = undefined;
        let mailtoEmail = undefined;
        let user = this.state.user;
        if (user) {
            skills = user.skills;
            mailtoEmail = "mailto:" + user.email;
        }
        if (skills) {
            profileSkills = skills.map(function (skill) {
                return (
                    <div key={skill + "div"}
                         style={{display: 'inline-block', marginTop: '15px'}}
                         className="lightBlueChip"
                    >
                        <div key={skill} className="blueText">
                            {skill}
                        </div>
                    </div>
                );
            });
        }

        let aboutMeLis = [];

        if (user) {
            const education = user.info.education;
            let links = user.info.links;
            const interests = user.info.interests;
            const goals = user.info.goals;
            const birthDate = user.info.birthDate;
            const languages = user.info.languages;
            let aboutMeItems = [];

            let index = -1;
            if (education && education.length > 0) {
                const schools = education.map(function (edu) {
                    // how to show the dates if the date is stored as a Date
                    //const dates = edu.startDate.substring(0,4) + "-" + edu.endDate.substring(0,4);
                    // how to show the dates if the dates are stored as Strings
                    const date = edu.endDate;
                    let majorsAndMinors = edu.majors ? edu.majors : "";
                    if (edu.minors && edu.minors.length > 0) {
                        let comma = "";
                        if (majorsAndMinors.length > 0) {
                            comma = ", "
                        }
                        majorsAndMinors = majorsAndMinors + comma + edu.minors
                    }
                    return (
                        <div>
                            <div className="profileSchoolName">{edu.school}</div>
                            <div className="profileSchoolDate">{date}</div>
                            <div className="above700only"><br/></div>
                            {majorsAndMinors.length > 0 ?
                                <div className="profileSchoolMajorsAndMinors"><i>{majorsAndMinors}</i></div>
                                : null
                            }
                        </div>
                    );
                });
                aboutMeItems.push({
                    icon: "BookBlue.png",
                    title: "Education",
                    content: schools
                });
            }
            if (links) {
                // index = -1;
                // for (const link in links) {
                //     if (links.hasOwnProperty(link)) {
                //         index++;
                //         linkOuts.push(
                //             <span>
                //                 <a href={link.url} target="_blank">{link.displayString}</a>
                //                 {index < links.length - 1 ?
                //                     <div className="linkSeparator" style={{backgroundColor:"black"}}/>
                //                     : null
                //                 }
                //             </span>
                //         );
                //     }
                // }
                index = -1;
                links = links.filter(link => (link && link.url && link.url != ""));
                const linkOuts = links.map(function (link) {
                    // so that index is at the current place
                    index++;
                    return (
                        <span>
                            <a href={link.url} target="_blank">{link.displayString}</a>
                            {index < links.length - 1 ?
                                <div className="linkSeparator" style={{backgroundColor: "black"}}/>
                                : null
                            }
                        </span>
                    );
                });
                if (links.length > 0) {
                    aboutMeItems.push({
                        icon: "Links.png",
                        title: "Links",
                        content: linkOuts
                    });
                }
            }
            if (interests && interests.length > 0) {
                index = -1;
                const interestsSpans = interests.map(function (interest) {
                    index++;
                    const comma = (index < interests.length - 1) ? ", " : "";
                    return (
                        <span>{interest + comma}</span>
                    );
                });
                aboutMeItems.push({
                    icon: "StarBlue.png",
                    title: "Interests",
                    content: <div>{interestsSpans}</div>
                });
            }
            if (goals && goals.length > 0) {
                index = -1;
                const goalsSpans = goals.map(function (goal) {
                    index++;
                    const comma = (index < goals.length - 1) ? ", " : "";
                    return (
                        <span>{goal + comma}</span>
                    );
                });
                aboutMeItems.push({
                    icon: "StarBlue.png",
                    title: "Goals",
                    content: <div>{goalsSpans}</div>
                });
            }
            if (birthDate) {
                // ADD THIS {(birthDate.getMonth() + 1) + "/" + birthDate.getDate() + "/" + birthDate.getYear()}
                const date = birthDate.substring(5, 7) + "/" + birthDate.substring(8, 10) + "/" + birthDate.substring(0, 4);
                aboutMeItems.push({
                    icon: "CalendarBlue.png",
                    title: "D.O.B.",
                    content: date
                });
            }
            if (languages && languages.length > 0) {
                index = -1;
                const languagesSpans = languages.map(function (language) {
                    index++;
                    const comma = (index < languages.length - 1) ? ", " : "";
                    return (
                        <span>{language + comma}</span>
                    );
                });
                aboutMeItems.push({
                    icon: "SingleSpeechBubbleBlue.png",
                    title: "Languages",
                    content: <div>{languagesSpans}</div>
                });
            }

            // every other li is a right one, starting with the first not being one
            let rightLi = false;
            aboutMeLis = aboutMeItems.map(function (item) {
                let additionalClass = "";
                if (rightLi) {
                    additionalClass = " aboutMeLiRight"
                }
                rightLi = !rightLi;

                return (
                    <li className={"aboutMeLi" + additionalClass} key={item.title}>
                        <img src={"/icons/" + item.icon}/>
                        <div>{item.title}</div>
                        {item.content}
                    </li>
                );
            });
        }

        return (
            <div className='jsxWrapper' ref='discover'>
                {user ?
                    <div>
                        <div className="greenToBlue headerDiv"/>

                        {this.state.userPathwayPreviews ?
                            <div>
                                <div className="profileInfoSkills">
                                    <div className="profileInfoSkillsLeft">
                                        <img
                                            src="/icons/Portfolio.png"
                                            alt="Profile picture"
                                            style={style.img}
                                        />
                                        <div>
                                            <div
                                                className="blueText font20px font14pxUnder700 font10pxUnder400">{user.name.toUpperCase()}
                                            </div>
                                            {user.info.title ?
                                                <div>
                                                    <b className="font14px font12pxUnder500">{user.info.title}</b> <br/>
                                                </div>
                                                : null}
                                            {user.info.location ?
                                                <div>
                                                    <img
                                                        src="/icons/Location.png"
                                                        alt="Portfolio"
                                                        style={style.locationImg}
                                                    />
                                                    <div className="font14px font12pxUnder500"
                                                         style={{display: 'inline-block'}}>
                                                        {user.info.location}
                                                    </div>
                                                </div>
                                                : null}
                                            <a className="font14px font12pxUnder500 blueText"
                                               href={mailtoEmail}>Contact</a>
                                        </div>
                                    </div>
                                    <div className="profileInfoSkillsRight">
                                        {user.skills ?
                                            <div>
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

                                {this.state.userPathwayPreviews.length > 0 ?
                                    <div className="center">
                                        <Tabs
                                            style={style.tabs}
                                            inkBarStyle={{background: 'black'}}
                                            tabItemContainerStyle={{width: '40%'}}
                                            className="myPathwaysTabs"
                                        >
                                            <Tab label="Ongoing" style={style.tab}
                                                 className="font20px font10pxUnder700">
                                                {this.state.userPathwayPreviews ?
                                                    <ul className="horizCenteredList pathwayPrevList"
                                                        style={style.pathwayPreviewUl}>
                                                        {this.state.userPathwayPreviews}
                                                    </ul>
                                                    : <h1 className="center font40px font24pxUnder500">None</h1>}
                                            </Tab>
                                            <Tab label="Completed" style={style.tab}
                                                 className="font20px font10pxUnder700">
                                                {this.state.userCompletedPathwayPreviews ?
                                                    <ul className="horizCenteredList pathwayPrevList"
                                                        style={style.pathwayPreviewUl}>
                                                        {this.state.userCompletedPathwayPreviews}
                                                    </ul>
                                                    : <h1 className="center font40px font24pxUnder500">None</h1>}
                                            </Tab>
                                        </Tabs>
                                    </div>
                                    :
                                    <div className="center">
                                        <ul className="horizCenteredList pathwayPrevList"
                                            style={style.pathwayPreviewUl}>
                                            <li onClick={() => this.goTo('/discover')}>
                                                <PathwayPreview type="addOne"/>
                                            </li>
                                        </ul>
                                    </div>
                                }


                                <div className="profileSeparator">
                                    <div className="profileSeparatorRect">
                                        <b>ABOUT ME</b>
                                    </div>
                                    <div className="profileSeparatorTri">
                                    </div>
                                    <div style={{clear: "both"}}/>
                                </div>

                                {user.info.description ?
                                    <div className="textWithMargin">{user.info.description}</div>
                                    : null}

                                <ul className="horizCenteredList" id="aboutMeAreas">
                                    {aboutMeLis}
                                </ul>

                            </div>
                            :
                            <div>
                                <div className="fullHeight"/>
                                <div className="fullHeight"/>
                            </div>}
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
        closeNotification,
        setHeaderBlue,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
