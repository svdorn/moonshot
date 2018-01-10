"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {updateInterests, startOnboarding} from "../../actions/usersActions";
import {browserHistory} from 'react-router';
import {bindActionCreators} from 'redux';
import axios from 'axios';

class Onboarding extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currInterestArea: undefined
        }
    }

    componentDidMount() {
        this.props.startOnboarding();
        if (this.props.currentUser) {
            axios.get("/api/infoByUserId", {
                params: {
                    userId: this.props.currentUser._id,
                    infoType: "interests"
                }
            }).then(res => {
                const userInterests = res.data;

                const interestTypes = [
                    {
                        name: "designAndDevInterests",
                        interests: [
                            "Virtual Reality",
                            "Augmented Reality",
                            "3D Printing",
                            "UX Design",
                            "IOT",
                            "Wireframing",
                            "User Testing",
                            "A/B Testing",
                            "User Research",
                            "Electrical Engineering",
                            "Mechanical Engineering",
                            "Robotics",
                            "Mobile",
                            "Web",
                            "Lean Methodology",
                            "Responsive Design"
                        ]
                    },
                    {
                        name: "dataInterests",
                        interests: [
                            "SQL",
                            "MySQL",
                            "Database Analysis",
                            "Data Security",
                            "Machine Learning",
                            "Big Data",
                            "Data Science",
                            "Data Structures",
                            "Database Administration",
                            "Database Development"
                        ]
                    },
                    {
                        name: "softwareDevInterests",
                        interests: [
                            "Angular",
                            "React",
                            "Javascript",
                            "Java",
                            "Python",
                            "Node.js",
                            "Git",
                            "AWS",
                            "REST",
                            "C",
                            "C#",
                            "C++",
                            "HTML",
                            "CSS"
                        ]
                    },
                    {
                        name: "businessInterests",
                        interests: [
                            "Google Analytics",
                            "Project Management",
                            "Agile",
                            "Data Visualization",
                            "Data Analysis",
                            "Customer Service",
                            "Startups",
                            "Entrepreneurship",
                            "CRM",
                            "Management",
                            "Communication",
                            "Problem Solving",
                            "IT Fundamentals",
                            "Salesforce",
                            "Productivity"
                        ]
                    },
                    {
                        name: "creationAndMarketingInterests",
                        interests: [
                            "Virtual Marketing",
                            "Pay Per Click",
                            "Social Media",
                            "UX",
                            "UI Design",
                            "Web Design",
                            "Photoshop",
                            "Graphic Design",
                             "SEO",
                            "Content Marketing",
                        ]
                    }
                ];

                let interestObjects = {};

                // go over each type of interest (each of which is an object which contains a list of interests)
                interestTypes.forEach(function(interestsObj, listIndex) {
                    // for each type of interest, set the interests object to a list of interest objects
                    interestObjects[interestsObj.name] = interestsObj.interests.map(function(interest) {
                        // if the user already has that interest, mark it as selected
                        let alreadyHasInterest = userInterests.some(function(userInterest) {
                            return userInterest == interest;
                        })
                        return {
                            title: interest,
                            selected: alreadyHasInterest
                        };
                    });
                })

                this.setState({
                    ...this.state,
                    ...interestObjects
                })

            });
        }
    }

    handleIconClick(index) {
        let chosen = undefined;
        switch (index) {
            case 1:
                chosen = this.state.designAndDevInterests;
                break;
            case 2:
                chosen = this.state.dataInterests;
                break;
            case 3:
                chosen = this.state.softwareDevInterests;
                break;
            case 4:
                chosen = this.state.creationAndMarketingInterests;
                break;
            case 5:
                chosen = this.state.businessInterests;
                break;
            default:
                break;
        }
        this.setState({
            currInterestArea: chosen
        })
    }

    handleInterestClick(interest) {
        if (this.state.currInterestArea !== undefined) {
            for (let i = 0; i < this.state.currInterestArea.length; i++) {
                let int = this.state.currInterestArea[i];
                if (int === interest) {
                    if (interest.selected) {
                        interest.selected = false;
                    } else {
                        interest.selected = true;
                    }
                    let area = this.state.currInterestArea[i];
                    this.setState({area: interest});
                    break;
                }
            }
        }
    }

    handleButtonClick() {
        let interests = [];
        for (let i = 0; i < this.state.designAndDevInterests.length; i++) {
            if (this.state.designAndDevInterests[i].selected) {
                interests.push(this.state.designAndDevInterests[i].title);
            }
        }
        for (let i = 0; i < this.state.dataInterests.length; i++) {
            if (this.state.dataInterests[i].selected) {
                interests.push(this.state.dataInterests[i].title);
            }
        }
        for (let i = 0; i < this.state.softwareDevInterests.length; i++) {
            if (this.state.softwareDevInterests[i].selected) {
                interests.push(this.state.softwareDevInterests[i].title);
            }
        }
        for (let i = 0; i < this.state.businessInterests.length; i++) {
            if (this.state.businessInterests[i].selected) {
                interests.push(this.state.businessInterests[i].title);
            }
        }
        for (let i = 0; i < this.state.creationAndMarketingInterests.length; i++) {
            if (this.state.creationAndMarketingInterests[i].selected) {
                interests.push(this.state.creationAndMarketingInterests[i].title);
            }
        }
        console.log(interests);
        if (interests.length > 0) {
            this.props.updateInterests(this.props.currentUser, interests);
        } else {
            browserHistory.push('/onboarding2');
            window.scrollTo(0, 0);
        }
    }

    render() {
        const style = {
            title: {
                topTitle: {
                    margin: '20px 0 10px 0',
                },
                divider: {
                    position: 'relative',
                    marginBottom: '20px',
                },
                text: {
                    marginBottom: '30px',
                }
            },
            iconLi: {
                marginRight: '90px',
            }
        };

        let interests = undefined;
        if (this.state.currInterestArea !== undefined) {
            let key = 0;
            let self = this;
            interests = this.state.currInterestArea.map(function (interest) {
                key++;
                return (
                    <li style={{verticalAlign: "top"}} key={key} className="clickableNoUnderline"
                        onClick={() => self.handleInterestClick(interest)}>
                        {interest.selected ?
                            <div className="onboardingPage1Text2Background">
                                <div className="smallText onboardingPage1Text2">
                                    {interest.title}
                                </div>
                            </div>
                            :
                            <div className="gradientBorderBlue center" style={{marginRight: '20px', marginTop: '20px'}}>
                                <div className="onboardingPage1Text3 smallText">
                                    {interest.title}
                                </div>
                            </div>
                        }
                    </li>
                );
            });
        }

        return (
            <div style={{marginBottom: '50px'}}>
                <div className="onboardingPage1Text mediumText center" style={style.title.topTitle}>Select Your
                    Interests
                </div>
                <div style={style.title.divider}>
                    <div className="onboardingDividerLeft" style={{bottom: "0"}}/>
                    <div className="onboardingDividerRight" style={{bottom: "0"}}/>
                </div>
                <div className="smallText center" style={style.title.text}>What skills do you want to learn or
                    improve?
                </div>
                <div>
                    <ul className="horizCenteredList onboardingListContainer">
                        <li style={style.iconLi} className="clickableNoUnderline"
                            onClick={() => this.handleIconClick(1)}>
                            {this.state.currInterestArea === this.state.designAndDevInterests ?
                                <div className="gradientBorderBlue center">
                                    <div style={{padding: '5px'}}>
                                        <img src="/icons/Cube.png" className="onboardingIcons"/>
                                        <div className="onboardingIconsText center"><b>Product Design<br/>and
                                            Development</b>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div>
                                    <img src="/icons/Cube.png" className="onboardingIcons"/>
                                    <div className="onboardingIconsText center"><b>Product Design<br/>and
                                        Development</b>
                                    </div>
                                </div>
                            }
                        </li>
                        <li style={style.iconLi} className="clickableNoUnderline"
                            onClick={() => this.handleIconClick(2)}>
                            {this.state.currInterestArea === this.state.dataInterests ?
                                <div className="gradientBorderBlue center">
                                    <div style={{padding: '5px'}}>
                                        <img src="/icons/Data.png" className="onboardingIcons"/>
                                        <div className="onboardingIconsText center"><b>Data</b></div>
                                    </div>
                                </div>
                                :
                                <div>
                                    <img src="/icons/Data.png" className="onboardingIcons"/>
                                    <div className="onboardingIconsText center"><b>Data</b></div>
                                </div>
                            }
                        </li>
                        <li className="clickableNoUnderline" onClick={() => this.handleIconClick(3)}>
                            {this.state.currInterestArea === this.state.softwareDevInterests ?
                                <div className="gradientBorderBlue center">
                                    <div style={{padding: '5px'}}>
                                        <img src="/icons/Computer.png" className="onboardingIcons"/>
                                        <div className="onboardingIconsText center"><b>Software<br/> Development</b>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div>
                                    <img src="/icons/Computer.png" className="onboardingIcons"/>
                                    <div className="onboardingIconsText center"><b>Software<br/> Development</b></div>
                                </div>
                            }
                        </li>
                    </ul>
                    <ul className="horizCenteredList onboardingListContainer">
                        <li style={style.iconLi} className="clickableNoUnderline"
                            onClick={() => this.handleIconClick(4)}>
                            {this.state.currInterestArea === this.state.creationAndMarketingInterests ?
                                <div className="gradientBorderBlue center">
                                    <div style={{padding: '5px'}}>
                                        <img src="/icons/Creation.png" className="onboardingIcons"/>
                                        <div className="onboardingIconsText center"><b>Creation and<br/> Marketing</b>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div>
                                    <img src="/icons/Creation.png" className="onboardingIcons"/>
                                    <div className="onboardingIconsText center"><b>Creation and<br/> Marketing</b></div>
                                </div>
                            }
                        </li>
                        <li className="clickableNoUnderline" onClick={() => this.handleIconClick(5)}>
                            {this.state.currInterestArea === this.state.businessInterests ?
                                <div className="gradientBorderBlue center">
                                    <div style={{padding: '5px'}}>
                                        <img src="/icons/Business.png" className="onboardingIcons"/>
                                        <div className="onboardingIconsText center"><b>Business</b></div>
                                    </div>
                                </div>
                                :
                                <div>
                                    <img src="/icons/Business.png" className="onboardingIcons"/>
                                    <div className="onboardingIconsText center"><b>Business</b></div>
                                </div>
                            }
                        </li>
                    </ul>
                </div>
                <div className="center">
                    {interests ?
                        <ul className="horizCenteredList onboardingInterestsListContainer">
                            {interests}
                        </ul>
                        : null}
                </div>
                <div className="center">
                    <button className="onboardingPage1Button" onClick={this.handleButtonClick.bind(this)}>
                        <div className="smallText2 onboardingPage1Text2">
                            Next
                        </div>
                    </button>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        updateInterests,
        startOnboarding
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
