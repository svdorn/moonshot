"use strict"
import React, {Component} from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { closeNotification, dialogEmail } from '../../actions/usersActions';
import axios from 'axios';
import MetaTags from 'react-meta-tags';
import { Dialog, Paper, TextField, FlatButton, RaisedButton, CircularProgress } from 'material-ui';
import AddUserDialog from '../childComponents/addUserDialog';
import ContactUsDialog from '../childComponents/contactUsDialog';
import ProgressBarDialog from '../miscComponents/progressBarDialog';
import { isValidEmail, goTo } from "../../miscFunctions";
import HoverTip from '../miscComponents/hoverTip';


let rectangleKeyIndex = 0;


class BusinessHome extends Component {
    constructor(props) {
        super(props);

        this.state = {
            infoIndex: 0,
            position: '',
            pricing: "24 Months",
            price: 80,
            // initially don't show the rectangles in case the user's browser is old
            showRectangles: false,
            agreeingToTerms: false,
            error: ''
        }
    }


    componentWillMount() {
        const showRectangles = this.cssPropertySupported("gridRowStart")
        this.setState({...this.state, showRectangles});
    }


    cssPropertySupported(prop) {
        try { return document.body.style[prop] !== undefined; }
        catch (propertyError) { return false; }
    }


    selectProcess(infoIndex) {
        this.setState({ infoIndex });
    }

    handleOpen = () => {
        this.setState({open: true});
    };


    handleClose = () => {
        this.setState({open: false, dialogScreen: 1});
    };

    handleCheckMarkClick() {
        this.setState({
            agreeingToTerms: !this.state.agreeingToTerms,
            error: ''
        })
    };

    onChange(e) {
        this.setState({
            position: e.target.value
        }, () => {
            this.updatePosition()
        });
    }


    updatePosition() {
        const position =  this.state.position;
        this.setState({position});
    }

    // create the dropdown for a candidate's hiring stage
    makePricingDropdown(pricingStage) {
        const stageNames = ["24 Months", "18 Months", "12 Months", "6 Months"];

        // create the stage name menu items
        const stages = stageNames.map(stage => {
            return (
                <MenuItem
                    value={stage}
                    key={`pricingStage${stage}`}
                >
                    { stage }
                </MenuItem>
            )
        });

        return (
            <Select
                disableUnderline={true}
                classes={{
                    root: "selectRootBlue home-pricing-select underline",
                    icon: "selectIconWhiteImportant"
                }}
                value={pricingStage}
                onChange={this.handleChangePricingStage(pricingStage)}
                key={`pricingStage`}
            >
                { stages }
            </Select>
        );
    }

    // handle a click on a hiring stage
    handleChangePricingStage = pricing => event => {
        const pricingStage = event.target.value;
        let price = 80;
        switch (pricingStage) {
            case "24 Months":
                price = 80;
                break;
            case "18 Months":
                price = 105;
                break;
            case "12 Months":
                price = 150;
                break;
            case "6 Months":
                price = 300;
                break;
            default:
                break;
        }
        this.setState({pricing: pricingStage, price});
    }


    // create a bunch of empty skewed rectangles that should be modified with css
    skewedRectangles(numRects, options) {
        // will contain a bunch of un-styled skewed rectangles
        let rectangles = [];
        // add the requested number of rectangles
        for (let i = 0; i < numRects; i++) {
            rectangles.push(<div className="skewedRectangle" key={`rectangle${rectangleKeyIndex}`} />);
            rectangleKeyIndex++;
        }

        // if extra options were passed in
        if (typeof options === "object") {
            // if only the array of rectangles should be returned
            if (options.rectanglesOnly === true) { return rectangles; }
        }

        return (
            <div className="skewedContainer">
                <div className="skewedRectanglesContainer">
                    <div className="skewedRectangles">
                        { rectangles }
                    </div>
                </div>
            </div>
        );
    }


    introductionSection() {
        const positionUrl = this.state.position ? ("?position=" + this.state.position) : "";

        return (
            <section id="introduction">
                <a id="homeTop" name="homeTop" className="anchor" />
                <div className="businessHome frontPage">
                    {this.state.showRectangles ?
                        <div className="skewedRectanglesContainer">
                            <div className="skewedRectangles">
                                { this.skewedRectangles(11, { rectanglesOnly: true })}
                            </div>
                            <div className="skewedRectangles">
                                { this.skewedRectangles(7, { rectanglesOnly: true })}
                            </div>
                        </div>
                        : null
                    }
                    <div className="infoContainer font20px font16pxUnder900 font14pxUnder400">
                        <div className="content">
                            <h1 className="bigTitle font34px font30pxUnder900 font24pxUnder400" style={{color:"#72d6f5"}}>Know which candidates will be successful before you hire them.</h1>
                            <p className="infoText notFull font18px font16pxUnder900 font14Under400">Hire the best people for your team with hiring technology that constantly learns and improves as you scale.</p>
                            <div className="buttonArea font18px font14pxUnder900">
                                <input className="blackInput getStarted secondary-gray-important" type="text" placeholder="Enter a position" name="position"
                                value={this.state.position} onChange={this.onChange.bind(this)}/>
                                <div className="getStarted button medium round-8px gradient-transition gradient-1-purple-light gradient-2-cyan" onClick={() => goTo("/chatbot" + positionUrl)}>
                                    Try for Free
                                </div>
                            </div>
                            {/*<div className="infoText clickableNoUnderline font18px font16pxUnder1000 font14pxUnder800 font16pxUnder700 font14pxUnder600" onClick={this.handleOpen}>
                                <img src={"images/businessHome/PlayButton" + this.props.png} alt="Play Button" className="playButton"/>
                                <div>See how it works in 2 minutes</div>
                            </div>*/}
                        </div>
                        <figure className="productScreenshots">
                            <div id="myCandidatesScreenshot">
                                <img src={"images/businessHome/CandidatesScreenshotTop" + this.props.jpg} alt="My Candidates Page Screenshot"/>
                            </div>
                            <div id="resultsScreenshot">
                                <img src={"images/businessHome/ProfileScreenshot" + this.props.jpg} alt="Candidate Results Page Screenshot" />
                            </div>
                        </figure>
                    </div>
                </div>
            </section>
        );
    }


    // second section of the page, gives three screenshots as well as corresponding information
    screenshotsSection() {
        return (
            <section id="threeScreenshots">
                <div className="homepageTrajectory forBusiness">
                    <div className="homepageTrajectoryTextLeft forBusiness">
                        <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forHome primary-white">
                            <h2 className="primary-purple-light font30px font24pxUnder800 font22pxUnder500">Quickly identify which candidates <div className="above1000only br"><br/></div>will perform the best... or the worst</h2>
                            Analyze candidates to see if they exhibit the qualities of
                            proven high achievers or low performers in that position.
                        </div>
                    </div>
                    <div className="businessHomeTrajectoryImagesRight businessHomeTrajectoryImagesShadow forBusiness">
                        <img
                            alt="Analysis Text"
                            src={"/images/businessHome/CandidatesScreenshot" + this.props.jpg}
                        />
                    </div>
                </div>

                <br/>

                <div className="homepageTrajectory forBusiness">
                    <div className="homepageTrajectoryTextRight forBusiness">
                        <div className="font18px font16pxUnder800 homepageTrajectoryTextRightDiv forHome primary-white">
                            <h2 className="primary-cyan font30px font24pxUnder800 font22pxUnder500">Use data to eliminate biases <div className="above900only br"><br/></div>and guesswork
                            </h2>
                            Why read hundreds of resumes? Moonshot uses
                            machine learning to reveal the empirical evidence
                            instead of conjecture based on a resume.
                        </div>
                    </div>
                    <div className="businessHomeTrajectoryImagesLeft businessHomeTrajectoryImagesShadow forBusiness">
                        <img
                            alt="Predictive Insights"
                            src={"/images/businessHome/ProdScreenshot" + this.props.jpg}
                        />
                    </div>
                </div>
                <br />

                <div className="homepageTrajectory forBusiness">
                    <div className="homepageTrajectoryTextLeft forBusiness">
                        <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forHome primary-white">
                            <h2 className="font30px font24pxUnder800 font22pxUnder500" style={{color: "#ff748c"}}>Constantly improve with every <div className="above800only br"><br/></div>new candidate and hire</h2>
                            Your next hire should always be your best one yet. It&#39;s smart to learn from your successes and mistakes.
                        </div>
                    </div>

                    <div className="businessHomeTrajectoryImagesRight businessHomeTrajectoryImagesShadow forBusiness">
                        <img
                            alt="Analysis Text"
                            src={"/images/businessHome/ProductScreenshot" + this.props.jpg}
                        />
                    </div>
                </div>
            </section>
        );
    }


    statisticsSection() {
        return (
            <section id="businessHomeStatistics">
                { this.state.showRectangles ? this.skewedRectangles(20) : null }
                <div>
                    <div className="center">
                        <div className="font30px font26pxUnder850 font22pxUnder600 font20pxUnder400 center primary-cyan statisticsHeader">
                            Candidate Predictions Improve Hiring Results
                        </div>
                        <div style={{position:"relative"}}>
                            <div className="flourishes3">
                                <embed src="/images/businessHome/Flourishes3.svg"/>
                            </div>
                            <Paper className="gradientBorderPredictiveStats paperBoxPredictiveStats"
                                zDepth={2}>
                                <div style={{position: "relative", textAlign:"left"}}>
                                    <div className="primary-white font20px font18pxUnder900 font14pxUnder700">Improve Your Efficiency</div>
                                    <div className="secondary-gray font16px font14pxUnder900 font12pxUnder700 marginTop10px font16pxBetween600">Decrease your cost and time per hire by spending 50%<div className="above600only br"><br/></div> less time screening candidates.</div>
                                    <div className="primary-cyan font18px font16pxUnder900 font14pxUnder700 marginTop10px clickableNoUnderline learn-more-text" onClick={() => goTo("/chatbot")}><span>Learn More</span> &#8594;</div>
                                </div>
                            </Paper>
                            <Paper className="gradientBorderPredictiveStats paperBoxPredictiveStats"
                                zDepth={2}>
                                <div style={{position: "relative", textAlign:"left"}}>
                                    <div className="primary-white font20px font18pxUnder900 font14pxUnder700">Scale Your Culture</div>
                                    <div className="secondary-gray font16px font14pxUnder900 font12pxUnder700 marginTop10px font">Hire candidates that not only fit your company culture, but also offer new and diverse perspectives.</div>
                                    <div className="primary-cyan font18px font16pxUnder900 font14pxUnder700 marginTop10px clickableNoUnderline learn-more-text" onClick={() => goTo("/chatbot")}><span>Learn More</span> &#8594;</div>
                                </div>
                            </Paper>
                            <Paper className="gradientBorderPredictiveStats paperBoxPredictiveStats"
                                zDepth={2}>
                                <div style={{position: "relative", textAlign:"left"}}>
                                    <div className="primary-white font20px font18pxUnder900 font14pxUnder700">Hire Top Performers</div>
                                    <div className="secondary-gray font16px font14pxUnder900 font12pxUnder700 marginTop10px">A repeatable, everlearning process that consistently identifies top performers and bad hires.</div>
                                    <div className="primary-cyan font18px font16pxUnder900 font14pxUnder700 marginTop10px clickableNoUnderline learn-more-text" onClick={() => goTo("/chatbot")}><span>Learn More</span> &#8594;</div>
                                </div>
                            </Paper>
                        </div>
                    </div>
                </div>
            </section>
        )
    }


    videoSection() {
        return (
            <section id="moonshotProcess">
                <div className="processOutline font22px font18pxUnder950 font16pxUnder400">
                    <div>
                        <div className="screenshot">
                            <div className="dark-opacity"></div>
                            <img src={"/images/businessHome/ListViewScreenshot" + this.props.png} />
                        </div>
                        <div className="skew-image-cover"></div>
                        <div className="left-area">
                            <div className="text-part">
                                <div className="text">
                                    We predict how successful your candidates will be before you hire them.
                                </div>
                                <div className="button-part">
                                    <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font18px font16pxUnder950 font14pxUnder400 primary-white" onClick={() => goTo("/chatbot")} style={{padding: "4.5px 15px"}}>
                                        Try for Free
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }


    learnFromHiresSection() {
        const features = [
            {
                title: "Unlimited Applicants",
                text1: "Evaluate and receive insights",
                text2: "for any number of applicants",
                icon: "CandidatesIcon",
                alt: "Candidates Icon",
                iconStyle: {}
            },
            {
                title: "Any Position",
                text1: "Evaluations for any position",
                text2: <div>across <div className="home-pink inlineBlock">five position types</div><HoverTip
                    style={{marginTop: "26px", marginLeft: "-70px"}}
                    text={<div>Development<br/>Sales<br/>Support<br/>Marketing<br/>Product</div>}
                /></div>,
                icon: "5Icon",
                alt: "5 Icon",
                iconStyle: {}
            },
            {
                title: "Unlimited Employees",
                text1: "Evaluate employees to strenthen",
                text2: "your company's predictive baseline",
                icon: "EmployeeIcon",
                alt: "Employee Icon",
                iconStyle: { height: "85px" }
            },
            {
                title: "Quarterly Reviews",
                text1: "Hires are reviewed to update",
                text2: "and improve your predictive model",
                icon: "FlameIcon",
                alt: "Flame Icon",
                iconStyle: { height: "84px", marginTop: "-2px" }
            },
            {
                title: "Analytics and Reporting",
                text1: "Get in-depth breakdowns on",
                text2: "all of your candidates and hires",
                icon: "GraphIcon",
                alt: "Graph Icon",
                iconStyle: {}
            },
        ]

        // create a box for each feature
        let featureBoxes = features.map(feature => {
            return (
                <div className="feature-box" key={feature.title}>
                    <div>
                        <img
                            src={`/images/businessHome/${feature.icon}${this.props.png}`}
                            style={feature.iconStyle}
                            alt={feature.alt}
                        />
                    </div>
                    <div>
                        <div className="bold font16pxUnder800 font14pxUnder700">{ feature.title }</div>
                        <div className="secondary-gray font14pxUnder800 font12pxUnder700">{ feature.text1 }<br/>{ feature.text2 }</div>
                    </div>
                </div>
            )
        });

        // add the box at the top left with the title for the whole area
        featureBoxes.unshift(
            <div
                key="featuresHeader"
                className="primary-peach feature-box left-align font26px font22pxUnder800 font18pxUnder700"
                style={{lineHeight: "1.3"}}
            >
                We learn from each hire<br/> so that we can make the next one even better.
            </div>
        )

        return (
            <section id="learnFromHires">
                { this.state.showRectangles ? this.skewedRectangles(6) : null }
                <div className="center">
                    <div className="primary-white inline-block" style={{maxWidth: "1200px"}}>
                        { featureBoxes }
                    </div>
                </div>
            </section>
        );
    }


    pricingSection() {
        const positionUrl = this.state.position ? ("?position=" + this.state.position) : "";

        return (
            <section id="pricingSection">
                <a id="pricing" name="pricing" className="anchor" />
                { this.state.showRectangles ? this.skewedRectangles(6) : null }
                <div className="forBusinessBoxesContainer">
                    <div className="font36px font32pxUnder700 font26pxUnder500 center home-peach"
                         style={{marginBottom: '50px'}}>
                        Pay Only When You Hire
                        <div className="font18px font16pxUnder700 font12pxUnder400 primary-white">
                            Our incentives are aligned. You only pay when you hire<div className="above700only br"><br/></div> a top performer who stays at your company.
                        </div>
                    </div>
                    <div className="businessHomeGradientBorder1 paperBoxBusinessHome">
                        <div style={{textAlign: "center", position: "relative"}}>
                            <img
                                src={"/images/businessHome/Flourish1" + this.props.png}
                                alt="Flourish Icon"
                                className="flourish-icon"
                            />
                            <div className="pricing-container">
                                <div className="home-peach paddingTop10px font20px font16pxUnder400" style={{fontWeight: "bold"}}>
                                    Test It Out
                                </div>
                                <img
                                    src={"/images/businessHome/PaperAirplane2" + this.props.png}
                                    alt="Paper Airplane Icon"
                                    className="businessHomeBoxIcons"
                                />
                                <div className="hire-number primary-white font22px font18pxUnder400">
                                    First Hire
                                </div>
                                <div className="home-peach price-free font30px font24pxUnder400">
                                    FREE
                                </div>
                                <ul className="primary-white font14px font12pxUnder400">
                                    <li>
                                        Select a position to evaluate
                                    </li>
                                    <li>
                                        Invite applicants to the evaluation
                                    </li>
                                    <li>
                                        Review the results
                                    </li>
                                    <li>
                                        Hire the best candidate
                                    </li>
                                </ul>
                                <div className="button large round-4px gradient-transition gradient-1-home-pricing-peach gradient-2-home-pricing-pink primary-white font18px" onClick={() => goTo("/chatbot")}>
                                    Try for Free
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="under800only" style={{height:"0px"}}><br/></div>
                    <div className="businessHomeGradientBorder2 paperBoxBusinessHome">
                        <div style={{textAlign: "center", position: "relative"}}>
                            <img
                                src={"/images/businessHome/Flourish2" + this.props.png}
                                className="flourish-icon"
                                alt="Flourish Icon"
                            />
                            <div className="pricing-container">
                                <div className="home-blue paddingTop10px font20px font16pxUnder400" style={{fontWeight: "bold"}}>
                                    Scale It Up
                                </div>
                                <img
                                    src={"/images/businessHome/EnterpriseRocket2" + this.props.png}
                                    alt="Enterprise Rocket Icon"
                                    className="businessHomeBoxIcons"
                                />
                                <div className="primary-white hire-number font22px font18pxUnder400">
                                    Each Additional Hire
                                </div>
                                <div className="primary-white">
                                    <span className="font30px font24pxUnder400 home-blue" style={{fontWeight:"bold"}}>${this.state.price}</span>
                                    <span className="font16px font14pxUnder400">&nbsp;/ month</span>
                                    <div className="font16px font14pxUnder400" style={{marginTop:"-10px"}}>
                                        <span>for up to&nbsp;</span>
                                        {this.makePricingDropdown(this.state.pricing)}
                                    </div>
                                </div>
                                <ul className="primary-white font14px font12pxUnder400" style={{textAlign: "left", width: "95%", margin:"auto"}}>
                                    <li>
                                        Monthly payments stop if a<br/>hire is no longer employed
                                    </li>
                                    <li>
                                        Pay off your balance at any time
                                    </li>
                                </ul>
                                <div className="button large round-4px gradient-transition gradient-1-home-pricing-green gradient-2-home-pricing-blue primary-white font18px" onClick={() => goTo("/chatbot")}>
                                    Try for Free
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="marginTop10px">
                        <div className="primary-white font18px font16pxUnder700 font12pxUnder450">
                            Unlimited evaluations of all your applicants across <div className="home-peach inlineBlock">five position types</div><HoverTip
                                style={{marginTop: "26px", marginLeft: "-70px"}}
                                text={<div>Development<br/>Sales<br/>Support<br/>Marketing<br/>Product</div>}
                            />.
                        </div>
                        <div className="pricingInput font18px font16pxUnder800 font14pxUnder500 marginTop40px">
                            <div className="enterPosition">
                                <input className="blackInput getStarted secondary-gray-important" type="text" placeholder="Enter a position you're hiring for..." name="position"
                                value={this.state.position} onChange={this.onChange.bind(this)}/>
                                <div className="getStarted button medium round-8px gradient-transition gradient-1-home-peach gradient-2-home-pink primary-white marginLeft10px" onClick={() => goTo("/chatbot" + positionUrl)}>
                                    Try for Free
                                </div>
                            </div>
                        </div>
                        <div className="font16px font14pxUnder800 font12pxUnder500 marginTop10px secondary-gray">
                            <i>No credit card required.</i>
                        </div>
                    </div>
                </div>
            </section>
        );
    }


    integrationsSection() {
        return (
            <section id="ATSIntegrations" className="marginBottom60px">
                { this.state.showRectangles ? this.skewedRectangles(6) : null }
                <div className="center primary-white">
                    <div className="marginBottom40px font30px font24pxUnder700 font20pxUnder500">
                        Integrates with your ATS and favorite apps.
                    </div>
                    <img src={"images/businessHome/BambooHr" + this.props.png} alt="BambooHr" className="bamboo-hr" />
                    <img src={"images/businessHome/Trello" + this.props.png} alt="Trello" className="trello" />
                    <img src={"images/businessHome/Workable" + this.props.png} alt="Workable" className="workable" />
                    <img src={"images/businessHome/Slack" + this.props.png} alt="Slack" className="slack" />
                    <img src={"images/businessHome/Recruitee" + this.props.png} alt="Recruitee" className="recruitee" />
                    <div className="marginTop40px font20px font16pxUnder700 font12pxUnder500">
                        and many more...
                    </div>
                </div>
            </section>
        );
    }


    render() {
        return (
            <div>
                {(this.props.currentUser && this.props.currentUser.userType == "accountAdmin") ? <AddUserDialog /> : null}
                <ContactUsDialog />
                <MetaTags>
                    <title>Moonshot</title>
                    <meta name="description" content="Moonshot helps you know who to hire. Predict candidate performance based on employees at your company and companies with similar positions." />
                </MetaTags>
                <div className="blackBackground businessHome">
                    { this.introductionSection() }

                    { this.screenshotsSection() }

                    { this.statisticsSection() }

                    { this.videoSection() }

                    { this.learnFromHiresSection() }

                    { this.pricingSection() }

                    { this.integrationsSection() }
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification,
        dialogEmail,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        loadingEmailSend: state.users.loadingSomething,
        notification: state.users.notification,
        currentUser: state.users.currentUser,
        png: state.users.png,
        jpg: state.users.jpg
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessHome);
