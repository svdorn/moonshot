"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerForPathway, getUsers, closeNotification} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Divider, Chip} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
//import '../../../public/stylesheets/pathway.css';
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

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    componentDidMount() {
        const id = this.props.location.search.substr(1);

        axios.get("/api/getPathwayById", {
            params: {
                _id: id
            }
        }).then(res => {
            this.setState({pathway: res.data});
        }).catch(function (err) {
        })
    }

    handleClick() {
        if (this.props.currentUser) {
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
                everything: {
                    textAlign: "center",
                    padding: "40px 0px"
                },
                container: {
                    border: "2px solid #B869FF",
                    fontSize: "30px",
                    padding: "20px",
                    textAlign: "center",
                },
                leftSide: {
                    width: "55%",
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "5%"
                },
                rightSide: {
                    width: "35%",
                    display: "inline-block",
                    verticalAlign: "top",
                    justifyContent: "center",
                },
                speakerImage: {
                    borderRadius: "50%",
                    height: "50px",
                    width: "50px",
                    position: "absolute"
                },
                speakerInfo: {
                    marginLeft: "60px",
                    fontSize: "20px"
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
        }

        const pathway = this.state.pathway;
        const deadline = this.state.pathway.deadline;
        let formattedDeadline = "";
        if (deadline) {
            formattedDeadline = deadline.substring(5, 7) + "/" + deadline.substring(8, 10) + "/" + deadline.substring(0, 4);
        }

        let pathwaySteps = null;
        const steps = pathway.steps;
        if (steps) {

            pathwaySteps = steps.map(function(step) {
                let topSeparators = null;
                if (step.order <= 2) {
                    topSeparators = (
                        <div>
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
                        { topSeparators }
                        <img
                            src={"/icons/" + step.order + ".png"}
                            alt={step.order}
                        />
                        <div className="halfWidthStepText">

                            <div className="halfWidthStepNumber">
                                STEP {step.order}
                            </div>
                            <div className="halfWidthStepTitle">
                                {step.name}
                            </div>
                            <div className="smallText halfWidthStepDesc">
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
                    <div style={{minWidth:"250px"}}>
                        <div className="fullHeight purpleGradient">


                            <div className="infoBox whiteText mediumText" style={{zIndex: "20"}}>
                                {pathway.sponsor.pathwayHomepage}<br/>
                                <button className="outlineButton"
                                        style={{backgroundColor: "#9B6BFB", border: "2px solid white"}}
                                        onClick={this.handleClick.bind(this)}>
                                    {"Sign Up"}
                                </button>
                            </div>
                            <br/>
                            {this.props.loading ? <div className="center"><CircularProgress color="white"
                                                                                            style={{marginTop: "20px"}}/><br/>
                            </div> : ""}
                            <div className="whiteText smallText2 earlyShrink noWrap" style={{textAlign: 'center'}}>
                                Sponsored by
                                <img
                                    src={pathway.sponsor.logo}
                                    alt={pathway.sponsor.name}
                                    height={40}
                                    style={{paddingLeft: '10px'}}
                                />
                            </div>
                            <ul className="horizCenteredList whiteText smallText2 earlyShrink" id="pathwayLandingTopInfoList">
                                <li>
                                    <img src="/icons/ClockWhite.png" className="pathwayLandingIcons"/>
                                    <div className="under500only br"><br/></div>
                                    <div style={{display: 'inline-block'}}>
                                        <i>Time</i><br/>
                                        {pathway.estimatedCompletionTime}
                                    </div>
                                </li>
                                <li>
                                    <img src="/icons/CalendarWhite.png" className="pathwayLandingIcons"/>
                                    <div className="under500only br"><br/></div>
                                    <div style={{display: 'inline-block'}}>
                                        <i>Complete By</i><br/>
                                        {formattedDeadline}
                                    </div>
                                </li>
                                <li>
                                    <img src="/icons/DollarSignWhite.png" className="pathwayLandingIcons"/>
                                    <div className="under500only br"><br/></div>
                                    <div style={{display: 'inline-block'}}>
                                        <i>Cost</i><br/>
                                        {pathway.price}
                                    </div>
                                </li>
                            </ul>

                            <div className="scrollDownButton lowerOnSmallScreen" onClick={() => this.scrollDown()}>
                                <div>
                                    <div/><div/>
                                </div>
                                <div>
                                    <div/><div/>
                                </div>
                            </div>
                        </div>

                        <div>
                            {pathway.skills ?
                                <div>
                                    <div className="center" style={{marginTop: '20px'}}>
                                        < b style={{color: '#B869FF'}} className="mediumText">Skills</ b>
                                    </ div>
                                    <div className="center smallText2" style={{marginBottom:"20px"}}>
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
                            <div className="homepageSeparator"/>
                        </div>

                        <div style={style.quote.everything}>
                            <h1 style={{marginBottom:'30px'}}>Sponsored by <img
                                src={pathway.sponsor.logo}
                                alt={pathway.sponsor.name}
                                height={70}
                                style={{marginTop:'-15px'}}
                            /></h1>
                            <div style={style.quote.leftSide}>
                                <div>
                                    <img
                                        src="/icons/Information.png"
                                        style={style.iconsLeft}
                                    />
                                    <b style={{color: '#B869FF'}} className="mediumText">ABOUT</b>
                                </div>
                                <div className="smallText2">
                                    {pathway.sponsor.description}
                                </div>
                                {pathway.sponsor.hiring ?
                                    <div style={style.spaceTop}>
                                        <img
                                            src="/icons/Badge.png"
                                            style={style.iconsLeft}
                                        />
                                        <b style={{color: '#B869FF'}} className="mediumText">OPEN POSITIONS</b><br/>
                                        <div className="smallText2">- {pathway.sponsor.hiring}</div>
                                    </div>
                                    : null}
                                <div style={style.spaceTop}>
                                    <img
                                        src="/icons/www.png"
                                        style={style.iconsLeft}
                                    />
                                    <b style={{color: '#B869FF'}}
                                       className="mediumText">{pathway.sponsor.name.toUpperCase()} LINKS</b><br/>
                                    <a href={pathway.sponsor.homepage} target="_blank" style={style.infoLinks}
                                       className="smallText2">Website</a>
                                    {pathway.sponsor.blog ?
                                        <a href={pathway.sponsor.blog} target="_blank" style={style.infoLinks}
                                           className="smallText2">Blog</a> : null}
                                    {pathway.sponsor.demo ?
                                        <a href={pathway.sponsor.demo} target="_blank" style={style.infoLinks}
                                           className="smallText2">Demo</a> : null}
                                </div>
                            </div>
                            {pathway.sponsor.quote ?
                                <div style={style.quote.rightSide}>
                                    <div style={style.quote.container}>
                                        <div style={style.quote.content}>
                                            {"\""}{pathway.sponsor.quote.body}{"\""}<br/>
                                        </div>

                                        <div style={style.imageLeftTextRight}>
                                            <img
                                                src={pathway.sponsor.quote.speakerImage}
                                                style={style.quote.speakerImage}
                                                alt={""}
                                            />
                                            <div style={style.quote.speakerInfo}>
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
                            <div className="homepageSeparator"/>
                        </div>

                        <div>
                            {pathway.sponsor ?
                                <div style={{marginBottom: "70px"}}>
                                    <HomepageTriangles variation="3"/>
                                    <ul className="horizCenteredList homepageBenefitsList">
                                        <li style={{marginRight: "14%"}}>
                                            <div style={{position: "relative"}}>
                                                <img
                                                    src="/icons/NoMoney.png"
                                                    alt="Free"
                                                    className="infoBoxImage"
                                                />
                                                <div className="smallText2">
                                                    It{"'"}s free.<br/>
                                                    {pathway.sponsor.name} provides scholarships<br/>
                                                    to pay for your pathway.
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div style={{position: "relative"}}>
                                                <img
                                                    src="/icons/Portfolio.png"
                                                    alt="Portfolio"
                                                    className="infoBoxImage"
                                                />
                                                <div className="smallText2">
                                                    Learn {pathway.sponsor.learn}<br/>
                                                    and build<br/>
                                                    your {pathway.sponsor.type} portfolio.
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                    <ul className="horizCenteredList homepageBenefitsList">
                                        <li>
                                            <div style={{position: "relative"}}>
                                                <img
                                                    src="/icons/DataPurple.png"
                                                    alt="Data"
                                                    className="infoBoxImage"
                                                />
                                                <div className="smallText2">
                                                    Get evaluated by {pathway.sponsor.name}<br/>
                                                    and other {pathway.sponsor.type} employers<br/>
                                                    based on your performance.
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>


                                : null}
                        </div>

                        {pathway.steps ?
                            <div>
                                <div className="center" style={{margin: "100px 0 40px 0"}}>
                                    < b style={{color: '#B869FF'}} className="mediumText">Pathway Overview</ b>
                                </ div>

                                {pathwaySteps}
                            </div>
                            : null
                        }

                        {pathway.extraInfo ?

                            <div key="extraInfo" className="center smallText2" style={{marginBottom:"30px", clear:"both", paddingTop:"50px"}}>
                                <img
                                    src="/icons/ToolPurple.png"
                                    id="toolIconExtraInfo"
                                />
                                <div style={{display: "inline-block"}}>
                                    {contactUsExists ?
                                        <div key="hasContactUs">
                                            {beforeContact}
                                            <span   key="hasContactUsSpan"
                                                    className="clickable underline"
                                                    style={{marginTop:"10px"}}
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
                        <div className="center" style={{marginBottom: "20px", clear: "both"}}>
                            <button className="outlineButton"
                                    style={{
                                        backgroundColor: "transparent",
                                        border: "2px solid #B869FF",
                                        color: "#B869FF",
                                        marginBottom: '20px'
                                    }}
                                    onClick={this.handleClick.bind(this)}>
                                {"Get Started"}
                            </button>
                            {this.props.loading ?
                                <div><br/><CircularProgress color="#B869FF" style={{marginTop: "20px"}}/></div> : ""}
                        </div>
                    </div>
                    :
                    <CircularProgress/>
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
        getUsers,
        registerForPathway,
        closeNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Pathway);
