"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerForPathway, closeNotification, addPathway} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Divider, Chip} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
import YouTube from 'react-youtube';
//import './pathway.css';
import axios from 'axios';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import {browserHistory} from 'react-router';
import MetaTags from 'react-meta-tags';

class Pathway extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pathway: {},
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

    componentDidMount() {
        let pathwayUrl = "";
        // try to get the pathwayUrl from the location query
        try {
            pathwayUrl = this.props.location.query.pathway;
            if (!pathwayUrl) {
                throw "pathway url isn't in query form";
            }
        } catch (e) {
            // temporary fix, try to get the pathwayUrl from the location url without a query
            try {
                let urlSearch = this.props.location.search;
                let nextQueryIndex = urlSearch.indexOf("&");
                if (nextQueryIndex > 1) {
                    pathwayUrl = urlSearch.substr(1, nextQueryIndex - 1);
                } else {
                    pathwayUrl = urlSearch.substr(1);
                }
            } catch (e2) {
                return;
            }
        }

        // set the pathway url to the one in the url's query
        // let pathwayUrl = this.props.location.query.pathway;

        axios.get("/api/pathwayByPathwayUrlNoContent", {
            params: {
                pathwayUrl
            }
        }).then(res => {
            this.setState({pathway: res.data});
        }).catch(function (err) {
        })
    }

    handleClick() {
        // TODO: CHANGE THIS SO THAT ANY PATHWAY CAN BE SIGNED UP FOR
        // Check if it is a pathway that is currently available
        if (this.state.pathway.url === "Northwestern-Mutual-Sales" || this.state.pathway.url === "Singlewire-QA-Analyst") {
            if (this.props.currentUser) {
                const user = {
                    _id: this.props.currentUser._id,
                    pathwayId: this.state.pathway._id,
                    verificationToken: this.props.currentUser.verificationToken,
                    pathwayUrl: this.state.pathway.url,
                    pathwayName: this.state.pathway.name
                };
                this.props.addPathway(user);
            } else {
                browserHistory.push({
                    pathname: "/signup",
                    query: {
                        pathway: this.state.pathway._id,
                        redirect: "/pathwayContent?pathway=" + this.state.pathway.url
                    }
                });
                window.scrollTo(0, 0);
            }
        }

        else if (this.props.currentUser) {
            const user = {
                pathway: this.state.pathway.name,
                name: this.props.currentUser.name,
                email: this.props.currentUser.email,
            };
            this.props.registerForPathway(user);
        } else {
            // Not logged in
            browserHistory.push({
                pathname: "/signup",
                query: {
                    pathway: this.state.pathway._id,
                    redirect: "/pathwayContent?pathway=" + this.state.pathway.url
                }
            });
        }
    }

    scrollDown() {
        const scrollPosTop = window.innerWidth > 500 ? 710 : 550;
        window.scroll({
            top: scrollPosTop,
            left: 0,
            behavior: 'smooth'
        });
    }

    render() {

        const style = {

            quote: {
                container: {
                    border: "2px solid #da5f7b",
                    fontSize: "30px",
                    padding: "20px",
                    textAlign: "center",
                },
                speakerImage: {
                    borderRadius: "50%",
                    height: "50px",
                    width: "50px",
                    position: "absolute"
                },
                speakerInfo: {
                    marginLeft: "60px",
                },
                content: {
                    marginBottom: "20px"
                }

            },
            imageLeftTextRight: {
                position: "relative",
                textAlign: "left"
            },
            iconsLeft: {
                height: "45px",
                marginRight: '10px',
                position: 'relative',
                top: '-15px',
            },
            infoLinks: {
                marginLeft: '10px',
                color: 'black',
                textDecoration: 'underline'
            },
            spaceTop: {
                marginTop: '20px',
            },
            title: {
                width: "50%",
            },
            textIcons: {
                height: "100px",
                float: "left",
                margin: "12px 20px 0px 0px"
            },
            text: {
                float: "left",
            },
            textComponent: {
                marginTop: '20px',
            },
            textComponentLi: {
                width: "50%",
                verticalAlign: "top",
                display: 'inline-block',
            },
            textComponentUl: {
                fontSize: "20px",
                textAlign: 'center',
            },
            horizList: {
                position: "relative",
                marginTop: "15px",
                marginBottom: "25px",
                overflow: "auto"
            },
            horizListIcon: {
                height: "50px",
                marginBottom: "10px"
                // position: "absolute",
                // top: "0",
                // bottom: "0",
                // right: "80%",
                // margin: "auto"
            },
            quoteReplacementImg: {
                width: '450px',
            },
            bottomListItem: {
                width: '40%',
                margin: 'auto',
                display: 'inline-block',
                top: '0',
                verticalAlign: 'top',
            },
        };

        const opts = {
            height: '100%',
            width: '100%',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 0,
                rel: 0
            }
        };

        const pathway = this.state.pathway;
        const deadline = this.state.pathway.deadline;
        let formattedDeadline = "";
        if (deadline) {
            formattedDeadline = deadline.substring(5, 7) + "/" + deadline.substring(8, 10) + "/" + deadline.substring(0, 4);
        }

        let pathwaySteps = null;
        const steps = pathway.steps;
        if (steps) {

            pathwaySteps = steps.map(function (step) {
                let topSeparators = null;
                if (step.order < 2) {
                    topSeparators = (
                        <div>
                            <div className="stepSeparatorLeft" style={{top: "0"}}/>
                            <div className="stepSeparatorRight" style={{top: "0"}}/>
                        </div>
                    )
                } else if (step.order === 2) {
                    topSeparators = (
                        <div className="stepSeparatorNoDisplay">
                            <div className="stepSeparatorLeft" style={{top: "0"}}/>
                            <div className="stepSeparatorRight" style={{top: "0"}}/>
                        </div>
                    )
                }

                let side = "Left";
                if (step.order % 2 == 0) {
                    side = "Right";
                }

                return (

                    <div className={"halfWidthStep" + side} key={step.order}>
                        {topSeparators}
                        <div className="stepNumber font60px font48pxUnder700 font40pxUnder500"
                             style={{display: 'inline-block'}}>
                            {step.order}
                        </div>
                        <div className="halfWidthStepText">

                            <div className="halfWidthStepNumber font16pxUnder700 font14pxUnder500">
                                STEP {step.order}
                            </div>
                            <div className="halfWidthStepTitle font font22pxUnder700 font18pxUnder500">
                                {step.name}
                            </div>
                            <div className="font14px font12pxUnder700 font10pxUnder500 halfWidthStepDesc">
                                {step.description ?
                                    step.description
                                    :
                                    "This is the description of the step. It will eventually describe the step."
                                }
                            </div>
                        </div>
                        <div className="stepSeparatorLeft"/>
                        <div className="stepSeparatorRight"/>
                    </div>
                );
            });
        }

        let pathwaySkills = null;
        const skills = pathway.skills;
        if (skills) {
            pathwaySkills = skills.map(function (skill) {
                return (
                    <div key={skill + "Surrounder"} style={{display: 'inline-block'}}>
                        <div key={skill}
                             className="skillChip pathwayLandingSkillChip"
                        >
                            {skill}
                        </div>
                    </div>
                );
            });
        }

        let extraInfo = pathway.extraInfo;
        let contactUsExists = false;
        let beforeContact = "";
        let contactUsPart = "";
        let afterContact = "";
        if (extraInfo) {
            const contactIndex = extraInfo.toLowerCase().indexOf("contact us");
            if (contactIndex > -1) {
                contactUsExists = true;
                beforeContact = extraInfo.substring(0, contactIndex);
                contactUsPart = extraInfo.substring(contactIndex, contactIndex + 10);
                if (extraInfo.length > contactIndex + 10) {
                    afterContact = extraInfo.substring(contactIndex + 10);
                }
            }
        }

        // the title is either a string set specifically for the title or the name of the pathway
        let pathwayTitle = pathway.tabTitle ? pathway.tabTitle : pathway.name;
        // the meta description is either a given meta description or the description shown on the page
        let pathwayMetaDescription = "Go through this pathway to be evaluated for a position.";
        if (pathway.metaDescription) {
            pathwayMetaDescription = pathway.metaDescription;
        } else if (pathway.sponsor && pathway.sponsor.name) {
             pathwayMetaDescription = "Go through this pathway to be evaluated for a position at " + pathway.sponsor.name + "."
        }

        return (
            //<HomepageTriangles style={{pointerEvents: "none"}} variation="1"/>
            <div className="jsxWrapper noOverflowX">
                <MetaTags>
                    <title>{pathwayTitle} - Moonshot</title>
                    <meta name="description" content={pathwayMetaDescription} />
                </MetaTags>
                {pathway.sponsor !== undefined ?
                    <div style={{minWidth: "250px"}}>
                        <div className="fullHeight purpleToRedGradient">
                            <HomepageTriangles style={{pointerEvents: "none"}} variation="4"/>


                            <div className="infoBox whiteText font40px font24pxUnder500"
                                 style={{zIndex: "20", marginTop: '-10px'}}>
                                {pathway.sponsor.pathwayHomepage}<br/>
                                <button
                                    className="outlineButton whiteText font30px font20pxUnder500 purpleToRedGradientButton"
                                    onClick={() => this.scrollDown()}>
                                    {"Get Started"}
                                </button>
                            </div>
                            <br/>
                            {this.props.loading ? <div className="center"><CircularProgress color="white"
                                                                                            style={{marginTop: "20px"}}/><br/>
                            </div> : ""}
                            <div className="whiteText font20px font14pxUnder700 font12pxUnder500 noWrap"
                                 style={{textAlign: 'center', marginTop: '10px'}}>
                                Sponsored by
                                <img
                                    src={pathway.sponsor.logo}
                                    alt={pathway.sponsor.name + " Logo"}
                                    height={40}
                                    style={{paddingLeft: '10px'}}
                                />
                            </div>
                            <ul className="horizCenteredList whiteText font20px font14pxUnder700 font10pxUnder500"
                                id="pathwayLandingTopInfoList">
                                <li>
                                    <img alt="Clock Icon" src="/icons/ClockWhite.png" className="pathwayLandingIcons"/>
                                    <br/>
                                    <div>
                                        {pathway.estimatedCompletionTime}
                                    </div>
                                </li>
                                {deadline ?
                                    <li>
                                        <img alt="Calendar Icon" src="/icons/CalendarWhite.png" className="pathwayLandingIcons"/>
                                        <br/>
                                        <div>
                                            {formattedDeadline}
                                        </div>
                                    </li>
                                    : null}
                                <li>
                                    <img alt="Dollar Sign Icon" src="/icons/DollarSignWhite.png" className="pathwayLandingIcons"
                                         style={{width: '33px'}}/>
                                    <br/>
                                    <div>
                                        {pathway.price}
                                    </div>
                                </li>
                            </ul>

                            <div className="center">
                                <div className="scrollDownButton lowerOnSmallScreen" onClick={() => this.scrollDown()}>
                                    <div>
                                        <div/>
                                        <div/>
                                    </div>
                                    <div>
                                        <div/>
                                        <div/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {Array.isArray(pathway.sponsor.info) && pathway.sponsor.info.length > 2 ?
                            <div style={{marginTop: '50px', marginBottom: '80px', overflow: 'auto'}}>
                                <div style={style.horizList}>
                                    <div className="horizListFull">
                                        <div className="horizListSpacer" style={{marginLeft: "20%"}}
                                        >
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                <img
                                                    alt={pathway.sponsor.info[0].iconAltTag ? pathway.sponsor.info[0].iconAltTag : "Icon"}
                                                    src={pathway.sponsor.info[0].icon}
                                                    style={style.horizListIcon}
                                                /><br/>
                                                <b>{pathway.sponsor.info[0].title}</b><br/>
                                                {pathway.sponsor.info[0].description}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="horizListFull">
                                        <div className="horizListSpacer"
                                             style={{marginLeft: "10%", marginRight: '10%'}}>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                <img
                                                    alt={pathway.sponsor.info[1].iconAltTag ? pathway.sponsor.info[1].iconAltTag : "Icon"}
                                                    src={pathway.sponsor.info[1].icon}
                                                    style={style.horizListIcon}
                                                /><br/>
                                                <b>{pathway.sponsor.info[1].title}</b><br/>
                                                {pathway.sponsor.info[1].description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="horizListFull">
                                        <div className="horizListSpacer" style={{marginRight: "20%"}}>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                <img
                                                    alt={pathway.sponsor.info[2].iconAltTag ? pathway.sponsor.info[2].iconAltTag : "Icon"}
                                                    src={pathway.sponsor.info[2].icon}
                                                    style={style.horizListIcon}
                                                /><br/>
                                                <b>{pathway.sponsor.info[2].title}</b><br/>
                                                {pathway.sponsor.info[2].description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="center">
                                    <button className="purpleToRedButtonExterior bigButton"
                                            onClick={this.handleClick.bind(this)}
                                            style={{marginTop: "15px", color: '#da5f7b'}}
                                    >
                                        <div className="invertColorOnHover gradientBorderButtonInterior">
                                            {"Sign Up"}
                                        </div>
                                    </button>
                                </div>
                            </div>
                            : null}

                        {/*<div>*/}
                        {/*{pathway.skills ?*/}
                        {/*<div>*/}
                        {/*<div className="center" style={{marginTop: '20px'}}>*/}
                        {/*< b style={{color: '#B869FF'}} className="font40px font24pxUnder500">Skills</ b>*/}
                        {/*</ div>*/}
                        {/*<div className="center font20px font14pxUnder700 font10pxUnder400"*/}
                        {/*style={{marginBottom: "20px"}}>*/}
                        {/*Earn these skills upon pathway completion.*/}
                        {/*</div>*/}
                        {/*<div className="center skillChips">*/}
                        {/*{pathwaySkills}*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*: null}*/}
                        {/*</div>*/}

                        {pathway.description || pathway.industry ?
                            <div id="pathwayDescriptionAndSalary">
                                {pathway.description ?
                                    <div className={pathway.industry ?
                                        "pathwayDescriptionAndSalaryHalf"
                                        :
                                        "pathwayDescriptionAndSalaryFull"
                                    }>
                                        <div className={pathway.industry ? "pathwayDescriptionAndSalarySpacer" : ""}
                                             id={pathway.industry ? "pathwayShortDescription" : ""}
                                        >
                                            <img
                                                alt="Graduation Hat Icon"
                                                src="/icons/GraduationHatPurple.png"
                                                className="pathwayDescriptionAndSalaryIcon"
                                                id="pathwayHatIcon"
                                            />
                                            <div className="pathwayDescriptionAndSalaryText">
                                                {pathway.description}
                                            </div>
                                        </div>
                                    </div>
                                    : null}

                                {pathway.industry ?
                                    <div className={pathway.description ?
                                        "pathwayDescriptionAndSalaryHalf"
                                        :
                                        "pathwayDescriptionAndSalaryFull"
                                    }>
                                        <div className={pathway.industry ? "pathwayDescriptionAndSalarySpacer" : ""}
                                             id={pathway.industry ? "pathwaySalaryInfo" : ""}
                                        >
                                            <img
                                                alt="Dollar Sign Icon"
                                                src="/icons/DollarSignPurple.jpg"
                                                className="pathwayDescriptionAndSalaryIcon"
                                                id="pathwayMoneyIcon"
                                            />
                                            <div className="pathwayDescriptionAndSalaryText">
                                                Industry average salary for {pathway.industry.title}<br/>
                                                <i>{pathway.industry.averageSalary}</i>
                                            </div>
                                        </div>
                                    </div>
                                    : null}
                            </div>
                            : null}

                        <div className="homepageSeparatorContainer">
                            <div className="homepageSeparator purpleRedSeparator"/>
                        </div>

                        <div className="pathwayLandingQuote">
                            <h1 style={{marginBottom: '30px'}} className="font36px font32pxUnder700 font26pxUnder500">
                                Our hiring partner
                                <img
                                    src={pathway.sponsor.logoForLightBackground}
                                    alt={pathway.sponsor.name + "Logo"}
                                    className="pathwayLandingSponsoredBy"
                                />
                            </h1>
                            <div className="pathwayLandingQuoteLeft">
                                <div>
                                    <img
                                        alt="Info Icon"
                                        src="/icons/About.png"
                                        className="pathwayLandingIconsLeft"
                                    />
                                    <div style={{color: '#da5f7b', display: 'inline-block'}}
                                         className="font28px font24pxUnder700 font22pxUnder500">Company
                                    </div>
                                </div>
                                <div className="font20px font16pxUnder700 font14pxUnder400">
                                    {pathway.sponsor.description}
                                </div>
                                {pathway.sponsor.hiring ?
                                    <div style={style.spaceTop}>
                                        <img
                                            alt="Badge Icon"
                                            src="/icons/OpenPositions.png"
                                            className="pathwayLandingIconsLeft"
                                        />
                                        <div style={{color: '#da5f7b', display: 'inline-block'}}
                                             className="font28px font24pxUnder700 font22pxUnder500">Open
                                            Positions
                                        </div>
                                        <br/>
                                        <div className="font20px font16pxUnder700 font14pxUnder400">
                                            - {pathway.sponsor.hiring}</div>
                                    </div>
                                    : null}
                                <div style={style.spaceTop}>
                                    <img
                                        alt="Link Icon"
                                        src="/icons/Links2.png"
                                        className="pathwayLandingIconsLeft"
                                    />
                                    <div style={{color: '#da5f7b', display: 'inline-block'}}
                                         className="font28px font24pxUnder700 font22pxUnder500">
                                        {pathway.sponsor.name} Links
                                    </div>
                                    <br/>
                                    <a href={pathway.sponsor.homepage} target="_blank" style={style.infoLinks}
                                       className="font20px font16pxUnder700 font14pxUnder400">Website</a>
                                    {pathway.sponsor.blog ?
                                        <a href={pathway.sponsor.blog} target="_blank" style={style.infoLinks}
                                           className="font20px font16pxUnder700 font14pxUnder400">Blog</a> : null}
                                    {pathway.sponsor.demo ?
                                        <a href={pathway.sponsor.demo} target="_blank" style={style.infoLinks}
                                           className="font20px font16pxUnder700 font14pxUnder400">Demo</a> : null}
                                    {pathway.sponsor.careerPage ?
                                        <a href={pathway.sponsor.careerPage} target="_blank" style={style.infoLinks}
                                           className="font20px font16pxUnder700 font14pxUnder400">Career
                                            Page</a> : null}
                                </div>
                            </div>
                            {pathway.sponsor.quote ?
                                <div className="pathwayLandingQuoteRight">
                                    <div style={style.quote.container}>
                                        <div style={style.quote.content}
                                             className="font22px font18pxUnder700 font16pxUnder400">
                                            {"\""}{pathway.sponsor.quote.body}{"\""}<br/>
                                        </div>

                                        <div style={style.imageLeftTextRight}>
                                            <img
                                                src={pathway.sponsor.quote.speakerImage}
                                                style={style.quote.speakerImage}
                                                id="speakerImage"
                                                alt={pathway.sponsor.quote.speakerName ? pathway.sponsor.quote.speakerName + " Photo" : "Speaker Photo" }
                                            />
                                            <div style={style.quote.speakerInfo}
                                                 className="font20px font16pxUnder700 font14pxUnder400">
                                                {pathway.sponsor.quote.speakerName}<br/>
                                                {pathway.sponsor.quote.speakerTitle}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                : null
                            }
                            {pathway.sponsor.quoteReplacement ?
                                <div className="pathwayLandingQuoteAltRight">
                                    <img
                                        alt={pathway.sponsor.quoteReplacementAltTag ? pathway.sponsor.quoteReplacementAltTag : ""}
                                        src={pathway.sponsor.quoteReplacement}
                                        className="pathwayLandingQuoteReplacementImg"
                                    />
                                </div>
                                : null}
                        </div>
                        <div className="homepageSeparatorContainer" style={{marginTop: "30px"}}>
                            <div className="homepageSeparator purpleRedSeparator"/>
                        </div>

                        {Array.isArray(pathway.sponsor.info2) && pathway.sponsor.info2.length > 2 ?
                            <div style={{marginTop: '80px', marginBottom: '60px', overflow: 'auto'}}>
                                <div className="font36px font32pxUnder700 font26pxUnder500 center"
                                     style={{marginBottom: '30px'}}>
                                    Awards
                                </div>
                                <div style={style.horizList}>
                                    <div className="horizListFull">
                                        <div className="horizListSpacer" style={{marginLeft: "20%"}}
                                        >
                                            <div
                                                className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                <img
                                                    src={pathway.sponsor.info2[0].icon}
                                                    alt={pathway.sponsor.info2[0].iconAltTag ? pathway.sponsor.info2[0].iconAltTag : "Icon"}
                                                    style={style.horizListIcon}
                                                /><br/>
                                                <b>{pathway.sponsor.info2[0].title}</b><br/>
                                                {pathway.sponsor.info2[0].description}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="horizListFull">
                                        <div className="horizListSpacer"
                                             style={{marginLeft: "20%", marginRight: '20%'}}>
                                            <div
                                                className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                <img
                                                    src={pathway.sponsor.info2[1].icon}
                                                    alt={pathway.sponsor.info2[1].iconAltTag ? pathway.sponsor.info2[1].iconAltTag : "Icon"}
                                                    style={style.horizListIcon}
                                                /><br/>
                                                <b>{pathway.sponsor.info2[1].title}</b><br/>
                                                {pathway.sponsor.info2[1].description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="horizListFull">
                                        <div className="horizListSpacer" style={{marginRight: "20%"}}>
                                            <div
                                                className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                <img
                                                    src={pathway.sponsor.info2[2].icon}
                                                    alt={pathway.sponsor.info2[2].iconAltTag ? pathway.sponsor.info2[2].iconAltTag : "Icon"}
                                                    style={style.horizListIcon}
                                                /><br/>
                                                <b>{pathway.sponsor.info2[2].title}</b><br/>
                                                {pathway.sponsor.info2[2].description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            : null}

                        {pathway.sponsor.positionDescription && pathway.sponsor.positionDescription.displayBefore && Array.isArray(pathway.sponsor.positionDescription.frames) && pathway.sponsor.positionDescription.frames.length > 3 ?
                            <div style={{marginTop: '80px'}}>
                                {pathway.sponsor.positionDescription.spacer ?
                                    <div className="purpleToRedSpacer" id="picturesToPathwaysHomepageSpacer"/>
                                    : <div style={{marginTop: '80px'}}/>}
                                <div className="center">
                                    <div className="font36px font32pxUnder700 font26pxUnder500 center"
                                         style={{marginBottom: '30px'}}>
                                        {pathway.sponsor.positionDescription.title}
                                    </div>
                                    <div>
                                        <div style={style.bottomListItem}>
                                            <img src={pathway.sponsor.positionDescription.frames[0].icon}
                                                 alt={pathway.sponsor.positionDescription.frames[0].iconAltTag ? pathway.sponsor.positionDescription.frames[0].iconAltTag : "Icon"}
                                                 className="forBusinessIcon"
                                                 style={{marginRight: '10px'}}/>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                {pathway.sponsor.positionDescription.frames[0].description}
                                            </div>
                                        </div>
                                        <div style={style.bottomListItem}>
                                            <img src={pathway.sponsor.positionDescription.frames[1].icon}
                                                 alt={pathway.sponsor.positionDescription.frames[1].iconAltTag ? pathway.sponsor.positionDescription.frames[1].iconAltTag : "Icon"}
                                                 className="forBusinessIcon"
                                                 style={{marginLeft: '10px'}}/>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                {pathway.sponsor.positionDescription.frames[1].description}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{marginTop: '40px'}}>
                                        <div style={style.bottomListItem}>
                                            <img src={pathway.sponsor.positionDescription.frames[2].icon}
                                                 alt={pathway.sponsor.positionDescription.frames[2].iconAltTag ? pathway.sponsor.positionDescription.frames[2].iconAltTag : "Icon"}
                                                 className="forBusinessIcon"/>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                {pathway.sponsor.positionDescription.frames[2].description}
                                            </div>
                                        </div>
                                        <div style={style.bottomListItem}>
                                            <img src={pathway.sponsor.positionDescription.frames[3].icon}
                                                 alt={pathway.sponsor.positionDescription.frames[3].iconAltTag ? pathway.sponsor.positionDescription.frames[3].iconAltTag : "Icon"}
                                                 className="forBusinessIcon"/>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                {pathway.sponsor.positionDescription.frames[3].description}
                                            </div>
                                        </div>
                                    </div>

                                    <button className="purpleToRedButtonExterior bigButton"
                                            onClick={this.handleClick.bind(this)}
                                            style={{marginTop: "35px", color: '#da5f7b'}}
                                    >
                                        <div className="invertColorOnHover gradientBorderButtonInterior">
                                            {pathway.sponsor.positionDescription.buttonText}
                                        </div>
                                    </button>
                                </div>
                            </div>
                            : null}

                        {pathway.sponsor.video ?
                            <div>
                                {pathway.sponsor.video.spacer ?
                                    <div className="purpleToRedSpacer" id="picturesToPathwaysHomepageSpacer"/>
                                    : <div style={{marginTop: '80px'}}/>}
                                {pathway.sponsor.video.header ?
                                    <div>
                                        <div className="font36px font32pxUnder700 font26pxUnder500 center"
                                             style={{marginBottom: "10px", marginTop: '60px'}}>
                                            {pathway.sponsor.video.title}
                                        </div>
                                        <div className="font22px font18pxUnder700 font16pxUnder500 center"
                                             style={{marginBottom: "40px"}}>
                                            {pathway.sponsor.video.header}
                                        </div>
                                    </div>
                                    :
                                    <div className="font36px font32pxUnder700 font26pxUnder500 center"
                                         style={{marginBottom: "40px", marginTop: '30px'}}>
                                        {pathway.sponsor.video.title}
                                    </div>
                                }
                                <div className="pathwayVideoContainer">
                                    <YouTube
                                        videoId={pathway.sponsor.video.link}
                                        opts={opts}
                                        onReady={this._onReady}
                                        onEnd={this._onEnd}
                                    />
                                </div>
                                <div className="center">
                                    <button className="purpleToRedButtonExterior bigButton"
                                            onClick={this.handleClick.bind(this)}
                                            style={{marginTop: "35px", color: '#da5f7b'}}
                                    >
                                        <div className="invertColorOnHover gradientBorderButtonInterior">
                                            {"Sign Up"}
                                        </div>
                                    </button>
                                </div>
                            </div>
                            : null}

                        {pathway.sponsor.positionDescription && pathway.sponsor.positionDescription.displayAfter && Array.isArray(pathway.sponsor.positionDescription.frames) && pathway.sponsor.positionDescription.frames.length > 3 ?
                            <div style={{marginTop: '60px', marginBottom: "20px"}}>
                                {pathway.sponsor.positionDescription.spacer ?
                                    <div className="purpleToRedSpacer" id="picturesToPathwaysHomepageSpacer"/>
                                    : <div style={{marginTop: '80px'}}/>}
                                <div className="center">
                                    <div className="font36px font32pxUnder700 font26pxUnder500 center"
                                         style={{marginBottom: '30px'}}>
                                        {pathway.sponsor.positionDescription.title}
                                    </div>
                                    <div>
                                        <div style={style.bottomListItem}>
                                            <img src={pathway.sponsor.positionDescription.frames[0].icon}
                                                 alt={pathway.sponsor.positionDescription.frames[0].iconAltTag ? pathway.sponsor.positionDescription.frames[0].iconAltTag : ""}
                                                 className="forBusinessIcon"
                                                 style={{marginRight: '10px'}}/>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700" style={{width:"90%", marginLeft:"5%"}}>
                                                {pathway.sponsor.positionDescription.frames[0].description}
                                            </div>
                                        </div>
                                        <div style={style.bottomListItem}>
                                            <img src={pathway.sponsor.positionDescription.frames[1].icon}
                                                 alt={pathway.sponsor.positionDescription.frames[1].iconAltTag ? pathway.sponsor.positionDescription.frames[1].iconAltTag : ""}
                                                 className="forBusinessIcon"
                                                 style={{marginLeft: '10px'}}/>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700" style={{width:"90%", marginLeft:"5%"}}>
                                                {pathway.sponsor.positionDescription.frames[1].description}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{marginTop: '40px'}}>
                                        <div style={style.bottomListItem}>
                                            <img src={pathway.sponsor.positionDescription.frames[2].icon}
                                                 alt={pathway.sponsor.positionDescription.frames[2].iconAltTag ? pathway.sponsor.positionDescription.frames[2].iconAltTag : ""}
                                                 className="forBusinessIcon"/>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700" style={{width:"90%", marginLeft:"5%"}}>
                                                {pathway.sponsor.positionDescription.frames[2].description}
                                            </div>
                                        </div>
                                        <div style={style.bottomListItem}>
                                            <img src={pathway.sponsor.positionDescription.frames[3].icon}
                                                 alt={pathway.sponsor.positionDescription.frames[3].iconAltTag ? pathway.sponsor.positionDescription.frames[3].iconAltTag : ""}
                                                 className="forBusinessIcon"/>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700" style={{width:"90%", marginLeft:"5%"}}>
                                                {pathway.sponsor.positionDescription.frames[3].description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            : null}

                        {Array.isArray(pathway.sponsor.benefits) && pathway.sponsor.benefits.length > 5 ?
                            <div>
                                <div className="purpleToRedSpacer" id="picturesToPathwaysHomepageSpacer"/>
                                <div className="font36px font32pxUnder700 font26pxUnder500 center"
                                     style={{marginBottom: "10px", marginTop: '30px'}}>
                                    Benefits
                                </div>
                                <div style={{marginTop: '30px', marginBottom: '30px', overflow: 'auto'}}>
                                    <div style={style.horizList}>
                                        <div className="horizListFull">
                                            <div className="horizListSpacer" style={{marginLeft: "20%"}}
                                            >
                                                <div
                                                    className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                    <img
                                                        alt={pathway.sponsor.benefits[0].iconAltTag ? pathway.sponsor.benefits[0].iconAltTag : "Benefit Icon"}
                                                        src={pathway.sponsor.benefits[0].icon}
                                                        style={style.horizListIcon}
                                                    /><br/>
                                                    {pathway.sponsor.benefits[0].description}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="horizListFull">
                                            <div className="horizListSpacer"
                                                 style={{marginLeft: "10%", marginRight: '10%'}}>
                                                <div
                                                    className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                    <img
                                                        src={pathway.sponsor.benefits[1].icon}
                                                        alt={pathway.sponsor.benefits[1].iconAltTag ? pathway.sponsor.benefits[1].iconAltTag : "Benefit Icon"}
                                                        style={style.horizListIcon}
                                                    /><br/>
                                                    {pathway.sponsor.benefits[1].description}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="horizListFull">
                                            <div className="horizListSpacer" style={{marginRight: "20%"}}>
                                                <div
                                                    className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                    <img
                                                        src={pathway.sponsor.benefits[2].icon}
                                                        alt={pathway.sponsor.benefits[2].iconAltTag ? pathway.sponsor.benefits[2].iconAltTag : "Benefit Icon"}
                                                        style={style.horizListIcon}
                                                    /><br/>
                                                    {pathway.sponsor.benefits[2].description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{marginTop: '40px', marginBottom: '80px', overflow: 'auto'}}>
                                    <div style={style.horizList}>
                                        <div className="horizListFull">
                                            <div className="horizListSpacer" style={{marginLeft: "20%"}}
                                            >
                                                <div
                                                    className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                    <img
                                                        src={pathway.sponsor.benefits[3].icon}
                                                        alt={pathway.sponsor.benefits[3].iconAltTag ? pathway.sponsor.benefits[3].iconAltTag : "Benefit Icon"}
                                                        style={style.horizListIcon}
                                                    /><br/>
                                                    {pathway.sponsor.benefits[3].description}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="horizListFull">
                                            <div className="horizListSpacer"
                                                 style={{marginLeft: "10%", marginRight: '10%'}}>
                                                <div
                                                    className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                    <img
                                                        src={pathway.sponsor.benefits[4].icon}
                                                        alt={pathway.sponsor.benefits[4].iconAltTag ? pathway.sponsor.benefits[4].iconAltTag : "Benefit Icon"}
                                                        style={style.horizListIcon}
                                                    /><br/>
                                                    {pathway.sponsor.benefits[4].description}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="horizListFull">
                                            <div className="horizListSpacer" style={{marginRight: "20%"}}>
                                                <div
                                                    className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                    <img
                                                        src={pathway.sponsor.benefits[5].icon}
                                                        alt={pathway.sponsor.benefits[5].iconAltTag ? pathway.sponsor.benefits[5].iconAltTag : "Benefit Icon"}
                                                        style={style.horizListIcon}
                                                    /><br/>
                                                    {pathway.sponsor.benefits[5].description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            : null}

                        {pathway.steps && pathway.sponsor.displaySteps === "true" ?
                            <div>
                                <div className="purpleToRedSpacer" id="picturesToPathwaysHomepageSpacer"/>
                                <div className="center font36px font32pxUnder700 font26pxUnder500"
                                     style={{marginBottom: "5px"}}>
                                    Pathway Overview
                                </ div>

                                {pathway.skills ?
                                    <div style={{marginBottom: "40px"}}>
                                        <div className="center font20px font14pxUnder700 font10pxUnder400"
                                             style={{marginBottom: "15px"}}>
                                            Earn these skills upon pathway completion.
                                        </div>
                                        <div className="center skillChips">
                                            {pathwaySkills}
                                        </div>
                                    </div>
                                    : <div style={{marginBottom: '40px'}}/>}

                                {pathwaySteps}
                            </div>
                            : null
                        }

                        {pathway.extraInfo ?

                            <div key="extraInfo" className="center font20px font14pxUnder700 font10pxUnder400"
                                 style={{marginBottom: "30px", clear: "both", paddingTop: "50px"}}>
                                <img
                                    alt="Tool Icon"
                                    src="/icons/ToolPurple.png"
                                    id="toolIconExtraInfo"
                                />
                                <div style={{display: "inline-block"}}>
                                    {contactUsExists ?
                                        <div key="hasContactUs">
                                            {beforeContact}
                                            <span key="hasContactUsSpan"
                                                  className="clickable underline"
                                                  style={{marginTop: "10px"}}
                                                  onClick={() => this.goTo('/contactUs')}>
                                                {contactUsPart}
                                            </span>
                                            {afterContact}
                                        </div>
                                        :
                                        {extraInfo}
                                    }
                                </div>
                            </div>
                            : null
                        }
                        <div className="center" style={{marginBottom: "50px", clear: "both"}}>
                            <button className="purpleToRedButtonExterior bigButton"
                                    onClick={this.handleClick.bind(this)}
                                    style={{marginTop: "35px", color: '#da5f7b'}}
                            >
                                <div className="invertColorOnHover gradientBorderButtonInterior">
                                    {pathway.sponsor.buttonText}
                                </div>
                            </button>
                            <div className="font16px font14pxUnder700 font12pxUnder500" style={{marginTop: '10px'}}>
                                {pathway.sponsor.infoUnderButton}
                            </div>
                            {this.props.loading ?
                                <div><br/><CircularProgress color="#B869FF" style={{marginTop: "20px"}}/></div> : ""}
                        </div>
                    </div>
                    :
                    <div>
                        <div className="fillScreen"/>
                    </div>
                }

            </div>
        )
            ;
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching,
        loading: state.users.loadingSomething,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        registerForPathway,
        closeNotification,
        addPathway,
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Pathway);
