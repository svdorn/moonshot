"use strict"
import React, {Component} from 'react';
import {Tabs, Tab, CircularProgress, Paper, Divider} from 'material-ui';
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
            user: undefined,
            editProfile: false,
        }
    }

    componentDidMount() {
        // if trying to look at someone else's profile, there will be a query
        let profileUrl = undefined;
        if (this.props.location.query) {
            profileUrl = this.props.location.query.user;
        }

        const currentUser = this.props.currentUser;
        // looking at your own profile
        if ((!profileUrl) || (currentUser && currentUser.profileUrl == profileUrl)) {
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
                            let formattedDeadline = "";
                            if (pathway.deadline) {
                                const deadline = new Date(pathway.deadline);
                                formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                            }

                            return (
                                <li key={key} style={{verticalAlign: "top"}}
                                    onClick={() => self.goTo('/pathwayContent?pathway=' + pathway.url)}>
                                    <PathwayPreview
                                        name={pathway.name}
                                        image={pathway.previewImage}
                                        imageAltTag={pathway.imageAltTag ? pathway.imageAltTag : pathway.name + " Preview Image"}
                                        logo={pathway.sponsor.logo}
                                        sponsorName={pathway.sponsor.name}
                                        completionTime={pathway.estimatedCompletionTime}
                                        deadline={formattedDeadline}
                                        price={pathway.price}
                                        _id={pathway._id}
                                        variation="4"
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
                            let formattedDeadline = "";
                            if (pathway.deadline) {
                                const deadline = new Date(pathway.deadline);
                                formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                            }

                            return (
                                <li key={key} style={{verticalAlign: "top"}}
                                    onClick={() => self.goTo('/pathway?pathway=' + pathway.url)}>
                                    <PathwayPreview
                                        name={pathway.name}
                                        image={pathway.previewImage}
                                        imageAltTag={pathway.imageAltTag ? pathway.imageAltTag : pathway.name + " Preview Image"}
                                        logo={pathway.sponsor.logoForLightBackground}
                                        sponsorName={pathway.sponsor.name}
                                        completionTime={pathway.estimatedCompletionTime}
                                        deadline={formattedDeadline}
                                        price={pathway.price}
                                        _id={pathway._id}
                                        variation="4"
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

    editProfile() {
        this.setState({editProfile: !this.state.editProfile})
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
            tab: {
                color: '#f24c49',
            },
            topTabs: {
                marginTop: '20px',

            },
            topTab: {
                color: 'white',
            },
            tabContent: {
                backgroundColor: 'white',
                paddingTop: '10px',
                paddingBottom: '30px',
            }
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
                         style={{marginTop: '15px'}}
                         className="whiteBorderChip"
                    >
                        <div key={skill} className="whiteText">
                            {skill}
                        </div>
                    </div>
                );
            });
        }

        let aboutMeLis = [];
        let info = true;

        if (user) {
            const education = user.info.education;
            let links = user.info.links;
            const interests = user.info.interests;
            const goals = user.info.goals;
            const birthDate = user.info.birthDate;
            //const languages = user.info.languages;
            let aboutMeItems = [];

            let index = -1;
            let goalsSpans = null;
            if (goals && goals.length > 0) {
                index = -1;
                goalsSpans = goals.map(function (goal) {
                    index++;
                    const comma = (index < goals.length - 1) ? ", " : "";
                    return (
                        <span>{goal + comma}</span>
                    );
                });
            }
            let date = null;
            if (birthDate) {
                // ADD THIS {(birthDate.getMonth() + 1) + "/" + birthDate.getDate() + "/" + birthDate.getYear()}
                date = birthDate.substring(5, 7) + "/" + birthDate.substring(8, 10) + "/" + birthDate.substring(0, 4);
            }
            info = (user.info.bio || user.info.willRelocateTo || goalsSpans !== null || date !== null);
            if (info) {
                let content =
                    <div>
                        {user.info.bio ?
                            <div style={{marginBottom: '5px'}}>
                                {user.info.bio}
                            </div>
                            : null}
                        {date !== null ?
                            <div>
                                <b className="orangeText">D.O.B: </b>
                                {date}
                            </div>
                            : null}
                        {user.info.willRelocateTo ?
                            <div>
                                <b className="orangeText">Willing to Relocate to: </b>
                                {user.info.willRelocateTo}
                            </div>
                            : null}
                        {goalsSpans !== null ?
                            <div>
                                <b className="orangeText">Goals: </b>
                                {goalsSpans}
                            </div>
                            : null}
                    </div>;
                aboutMeItems.push({
                    icon: "SpeechBubble2.png",
                    title: "Biography",
                    content: content
                });
            }

            if (education && education.length > 0) {
                index = -1;
                const schools = education.map(function (edu) {
                    const date = edu.endDate ? edu.endDate.substring(5, 7) + "/" + edu.endDate.substring(8, 10) + "/" + edu.endDate.substring(0, 4) : null;
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
                    icon: "Education2.png",
                    title: "Education",
                    content: schools
                });
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
                    icon: "Star2.png",
                    title: "Interests",
                    content: <div>{interestsSpans}</div>
                });
            }
            if (links) {
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
                        icon: "Links3.png",
                        title: "Links",
                        content: linkOuts
                    });
                }
            }
            // if (languages && languages.length > 0) {
            //     index = -1;
            //     const languagesSpans = languages.map(function (language) {
            //         index++;
            //         const comma = (index < languages.length - 1) ? ", " : "";
            //         return (
            //             <span>{language + comma}</span>
            //         );
            //     });
            //     aboutMeItems.push({
            //         icon: "SingleSpeechBubbleBlue.png",
            //         title: "Languages",
            //         content: <div>{languagesSpans}</div>
            //     });
            // }

            // every other li is a right one, starting with the first not being one
            aboutMeLis = aboutMeItems.map(function (item) {
                return (
                    <li style={{marginTop: '30px'}}>
                        <Paper className="profileAboutPaper aboutMeLi font20px font font16pxUnder700 font14pxUnder400"
                               zDepth={3}>
                            <div className="aboutMeLiIconContainer"><img src={"/icons/" + item.icon}/></div>

                            <div className="verticalDivider"/>

                            <div className="aboutMeLiInfo" style={{display: 'inline-block'}}>
                                <div>{item.title}</div>
                                {item.content}
                            </div>
                        </Paper>
                    </li>
                );
            });
        }

        return (
            <div className='jsxWrapper' ref='discover'>
                {user ?
                    <div>
                        <div>
                            {this.state.userPathwayPreviews ?
                                <div>
                                    <div className="orangeToYellowGradient" zDepth={3}>
                                        <div className="headerDiv"/>
                                        <div className="profileInfoSkills">
                                            <div className="center">
                                                {/*<div className="clickable blueText font20px font14pxUnder700"
                                                     style={{marginTop: '-20px', marginBottom: '10px'}}
                                                     onClick={this.editProfile.bind(this)}
                                                >
                                                    Edit Profile
                                                </div>*/}
                                                <div style={style.imgContainer}>
                                                    <img
                                                        src="/icons/ProfilePicture.png"
                                                        alt="Profile picture"
                                                        style={style.img}
                                                    />
                                                </div>
                                                <div>
                                                    <div
                                                        className="whiteText font20px font14pxUnder700">{user.name.toUpperCase()}
                                                    </div>
                                                    {user.info.title ?
                                                        <div className="whiteText font14px font12pxUnder500">
                                                            {user.info.title}
                                                        </div>
                                                        : null}
                                                    {user.info.location ?
                                                        <div>
                                                            <img
                                                                src="/icons/Location.png"
                                                                alt="Portfolio"
                                                                style={style.locationImg}
                                                            />
                                                            <div className="font14px font12pxUnder500 whiteText"
                                                                 style={{display: 'inline-block'}}>
                                                                {user.info.location}
                                                            </div>
                                                        </div>
                                                        : null}
                                                    <a className="font14px font12pxUnder500 whiteText underline"
                                                       href={mailtoEmail}>Contact</a>
                                                </div>
                                            </div>
                                            <div className="center">
                                                {user.skills ?
                                                    <div style={{width: '70%', maxWidth: '1000px', margin: 'auto'}}>
                                                        {profileSkills}
                                                    </div>
                                                    : null}
                                            </div>
                                            <Tabs
                                                style={style.topTabs}
                                                inkBarStyle={{background: 'white'}}
                                                tabItemContainerStyle={{width: '40%'}}
                                                className="myPathwaysTabs"
                                            >
                                                <Tab label="Pathways" style={style.topTab}>
                                                    <div className="center fullHeight" style={style.tabContent}>
                                                        <Tabs
                                                            style={style.tabs}
                                                            inkBarStyle={{background: '#f24c49'}}
                                                            tabItemContainerStyle={{width: '40%'}}
                                                            className="myPathwaysTabs"
                                                        >
                                                            <Tab label="Ongoing" style={style.tab}>
                                                                {this.state.userPathwayPreviews && this.state.userPathwayPreviews.length > 0 ?
                                                                    <ul className="horizCenteredList pathwayPrevList"
                                                                        style={style.pathwayPreviewUl}>
                                                                        {this.state.userPathwayPreviews}
                                                                    </ul>
                                                                    :
                                                                    <ul className="horizCenteredList pathwayPrevList"
                                                                        style={style.pathwayPreviewUl}>
                                                                        <li onClick={() => this.goTo('/discover')}>
                                                                            <PathwayPreview type="addOne"
                                                                                            variation="4"/>
                                                                        </li>
                                                                    </ul>
                                                                }
                                                            </Tab>
                                                            <Tab label="Completed" style={style.tab}
                                                                 className="font20px font10pxUnder700">
                                                                {this.state.userCompletedPathwayPreviews && this.state.userCompletedPathwayPreviews.length > 0 ?
                                                                    <ul className="horizCenteredList pathwayPrevList"
                                                                        style={style.pathwayPreviewUl}>
                                                                        {this.state.userCompletedPathwayPreviews}
                                                                    </ul>
                                                                    :
                                                                    <h1 className="center font40px font24pxUnder500">
                                                                        None</h1>
                                                                }
                                                            </Tab>
                                                        </Tabs>
                                                    </div>
                                                </Tab>
                                                <Tab label="About" style={style.topTab}>
                                                    {info ?
                                                        <div className="aboutMeSection" style={style.tabContent}>
                                                            <div
                                                                className="orangeText font16px font16pxUnder700 font12pxUnder400 underline clickable addToProfile"
                                                                onClick={() => this.goTo('/onboarding')}>
                                                                +Add Profile Section
                                                            </div>
                                                            <ul className="center" id="aboutMeAreas">
                                                                {aboutMeLis}
                                                            </ul>
                                                        </div>
                                                        :
                                                        <div className="fullHeight font24px font18pxUnder500"
                                                             style={style.tabContent}>
                                                            <div
                                                                className="orangeText font16px font16pxUnder700 font12pxUnder400 underline clickable addToProfile"
                                                                onClick={() => this.goTo('/onboarding')}>
                                                                +Add Profile Section
                                                            </div>
                                                            <div className="center">
                                                                <div className="profileProjects">
                                                                    No information to display
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </Tab>
                                                <Tab label="Projects" style={style.topTab}>
                                                    <div style={style.tabContent}
                                                         className="fullHeight font28px font font24pxUnder700 font20pxUnder500 center">
                                                        <div className="profileProjects">
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
