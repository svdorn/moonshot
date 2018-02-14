"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerForPathway, closeNotification} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Divider, Chip} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
import YouTube from 'react-youtube';
//import './pathway.css';
import axios from 'axios';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import {browserHistory} from 'react-router';

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
        const pathwayUrl = this.props.location.search.substr(1);

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
        // Check if it is a specialized pathway
        if (this.state.pathway.name === "NWM Sales") {
            if (this.props.currentUser) {

            } else {
                this.props.router.push('/signup?pathway=' + this.state.pathway.url);
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
            browserHistory.push('/login');
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
                marginBottom: "25px"
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
        };

        const opts = {
            height: '100%',
            width: '100%',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 0
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
                        <img
                            src={"/icons/" + step.order + ".png"}
                            alt={step.order}
                        />
                        <div className="halfWidthStepText">

                            <div className="halfWidthStepNumber font16pxUnder700 font14pxUnder500">
                                STEP {step.order}
                            </div>
                            <div className="halfWidthStepTitle font font22pxUnder700 font18pxUnder500">
                                {step.name}
                            </div>
                            <div className="font14px font12pxUnder700 font10pxUnder500 halfWidthStepDesc">
                                {step.description}
                                This is the description of the step. It will eventually describe the step.
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


        return (
            //<HomepageTriangles style={{pointerEvents: "none"}} variation="1"/>
            <div className="jsxWrapper noOverflowX">
                {pathway.sponsor !== undefined ?
                    <div style={{minWidth: "250px"}}>
                        <div className="fullHeight purpleToRedGradient">
                            <HomepageTriangles style={{pointerEvents: "none"}} variation="4"/>


                            <div className="infoBox whiteText font40px font24pxUnder500" style={{zIndex: "20"}}>
                                {pathway.sponsor.pathwayHomepage}<br/>
                                <button
                                    className="outlineButton whiteText font30px font20pxUnder500 purpleToRedGradientButton"
                                    onClick={this.handleClick.bind(this)}>
                                    {"Sign Up"}
                                </button>
                            </div>
                            <br/>
                            {this.props.loading ? <div className="center"><CircularProgress color="white"
                                                                                            style={{marginTop: "20px"}}/><br/>
                            </div> : ""}
                            <div className="whiteText font20px font14pxUnder700 font12pxUnder500 noWrap"
                                 style={{textAlign: 'center'}}>
                                Sponsored by
                                <img
                                    src={pathway.sponsor.logo}
                                    alt={pathway.sponsor.name}
                                    height={40}
                                    style={{paddingLeft: '10px'}}
                                />
                            </div>
                            <ul className="horizCenteredList whiteText font20px font14pxUnder700 font10pxUnder500"
                                id="pathwayLandingTopInfoList">
                                <li>
                                    <img src="/icons/ClockWhite.png" className="pathwayLandingIcons"/>
                                    <div className="under500only br"><br/></div>
                                    <div style={{display: 'inline-block'}}>
                                        <i>Time</i><br/>
                                        {pathway.estimatedCompletionTime}
                                    </div>
                                </li>
                                {deadline ?
                                    <li>
                                        <img src="/icons/CalendarWhite.png" className="pathwayLandingIcons"/>
                                        <div className="under500only br"><br/></div>
                                        <div style={{display: 'inline-block'}}>
                                            <i>Complete By</i><br/>
                                            {formattedDeadline}
                                        </div>
                                    </li>
                                    : null}
                                <li>
                                    <img src="/icons/DollarSignWhite.png" className="pathwayLandingIcons"
                                         style={{width: '33px'}}/>
                                    <div className="under500only br"><br/></div>
                                    <div style={{display: 'inline-block'}}>
                                        <i>Cost</i><br/>
                                        {pathway.price}
                                    </div>
                                </li>
                            </ul>

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

                        {pathway.sponsor.info ?
                            <div style={{marginTop: '40px', marginBottom: '70px', overflow: 'auto'}}>
                                <div style={style.horizList}>
                                    <div className="horizListFull">
                                        <div className="horizListSpacer" style={{marginLeft: "20%"}}
                                        >
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                <img
                                                    src="/icons/Key.png"
                                                    style={style.horizListIcon}
                                                /><br/>
                                                <b>{pathway.sponsor.info[0].title}</b><br/>
                                                {pathway.sponsor.info[0].description}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="horizListFull">
                                        <div className="horizListSpacer" style={{marginLeft: "5%", marginRight: '5%'}}>
                                            <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                <img
                                                    src="/icons/Evaluate.png"
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
                                                    src="/icons/Badge.png"
                                                    style={style.horizListIcon}
                                                /><br/>
                                                <b>{pathway.sponsor.info[2].title}</b><br/>
                                                {pathway.sponsor.info[2].description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            : null}

                        <div>
                            {pathway.skills ?
                                <div>
                                    <div className="center" style={{marginTop: '20px'}}>
                                        < b style={{color: '#B869FF'}} className="font40px font24pxUnder500">Skills</ b>
                                    </ div>
                                    <div className="center font20px font14pxUnder700 font10pxUnder400"
                                         style={{marginBottom: "20px"}}>
                                        Earn these skills upon pathway completion.
                                    </div>
                                    <div className="center skillChips">
                                        {pathwaySkills}
                                    </div>
                                </div>
                                : null}
                        </div>

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
                                Sponsored by <img
                                src={pathway.sponsor.logo2}
                                alt={pathway.sponsor.name}
                                className="pathwayLandingSponsoredBy"
                            /></h1>
                            <div className="pathwayLandingQuoteLeft">
                                <div>
                                    <img
                                        src="/icons/Information.png"
                                        className="pathwayLandingIconsLeft"
                                    />
                                    <b style={{color: '#da5f7b'}}
                                       className="font28px font24pxUnder700 font22pxUnder500">Company</b>
                                </div>
                                <div className="font20px font16pxUnder700 font14pxUnder400">
                                    {pathway.sponsor.description}
                                </div>
                                {pathway.sponsor.hiring ?
                                    <div style={style.spaceTop}>
                                        <img
                                            src="/icons/Badge.png"
                                            className="pathwayLandingIconsLeft"
                                        />
                                        <b style={{color: '#da5f7b'}}
                                           className="font28px font24pxUnder700 font22pxUnder500">Open
                                            Positions</b><br/>
                                        <div className="font20px font16pxUnder700 font14pxUnder400">
                                            - {pathway.sponsor.hiring}</div>
                                    </div>
                                    : null}
                                <div style={style.spaceTop}>
                                    <img
                                        src="/icons/www.png"
                                        className="pathwayLandingIconsLeft"
                                    />
                                    <b style={{color: '#da5f7b'}}
                                       className="font28px font24pxUnder700 font22pxUnder500">{pathway.sponsor.name} Links</b><br/>
                                    <a href={pathway.sponsor.homepage} target="_blank" style={style.infoLinks}
                                       className="font20px font16pxUnder700 font14pxUnder400">Website</a>
                                    {pathway.sponsor.blog ?
                                        <a href={pathway.sponsor.blog} target="_blank" style={style.infoLinks}
                                           className="font20px font16pxUnder700 font14pxUnder400">Blog</a> : null}
                                    {pathway.sponsor.demo ?
                                        <a href={pathway.sponsor.demo} target="_blank" style={style.infoLinks}
                                           className="font20px font16pxUnder700 font14pxUnder400">Demo</a> : null}
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
                                                alt={""}
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
                        </div>
                        <div className="homepageSeparatorContainer" style={{marginTop: "30px"}}>
                            <div className="homepageSeparator purpleRedSeparator"/>
                        </div>

                        {pathway.sponsor.info2 ?
                            <div style={{marginTop: '60px', marginBottom: '60px', overflow: 'auto'}}>
                                <div className="font36px font32pxUnder700 font26pxUnder500 center" style={{marginBottom: '30px'}}>
                                    Awards
                                </div>
                                <div style={style.horizList}>
                                    <div className="horizListFull">
                                        <div className="horizListSpacer" style={{marginLeft: "20%"}}
                                        >
                                            <div
                                                className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                                <img
                                                    src="/icons/Key.png"
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
                                                    src="/icons/Evaluate.png"
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
                                                    src="/icons/Badge.png"
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

                        {pathway.steps && pathway.sponsor.displaySteps === "true" ?
                            <div>
                                <div className="homepageSeparatorContainer" style={{marginTop: "30px"}}>
                                    <div className="homepageSeparator purpleRedSeparator"/>
                                </div>
                                <div className="center" style={{margin: "100px 0 40px 0"}}>
                                    < b style={{color: '#B869FF'}}
                                        className="font40px font32pxUnder700 font24pxUnder500">Pathway Overview</ b>
                                </ div>

                                {pathwaySteps}
                            </div>
                            : null
                        }

                        {pathway.sponsor.video ?
                            <div>
                                <div className="purpleToRedSpacer" id="picturesToPathwaysHomepageSpacer"/>
                                <div className="font36px font32pxUnder700 font26pxUnder500 center" style={{marginBottom:"40px"}}>
                                    {pathway.sponsor.video.title}
                                </div>
                                <div className="pathwayVideoContainer">
                                    <YouTube
                                        videoId={pathway.sponsor.video.link}
                                        opts={opts}
                                        onReady={this._onReady}
                                        onEnd={this._onEnd}
                                    />
                                </div>
                            </div>
                            : null}

                        {pathway.extraInfo ?

                            <div key="extraInfo" className="center font20px font14pxUnder700 font10pxUnder400"
                                 style={{marginBottom: "30px", clear: "both", paddingTop: "50px"}}>
                                <img
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
                        <div className="center" style={{marginBottom: "40px", clear: "both"}}>
                            <button className="purpleToRedButtonExterior bigButton"
                                    onClick={this.handleClick.bind(this)}
                                    style={{marginTop: "40px"}}
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
                        <div className="fullHeight"/>
                        <div className="fullHeight"/>
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
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Pathway);
