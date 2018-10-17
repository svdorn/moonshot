"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { closeNotification, dialogEmail } from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import { Dialog, Paper, TextField, FlatButton, RaisedButton, CircularProgress } from "material-ui";
import AddUserDialog from "../../childComponents/addUserDialog";
import ProgressBarDialog from "../../miscComponents/progressBarDialog";
import { isValidEmail, goTo } from "../../../miscFunctions";
import HoverTip from "../../miscComponents/hoverTip";
import PositionsDropDown from "./positionsDropDown";
import Typed from "typed.js";

import "./businessHome.css";

let rectangleKeyIndex = 0;

class BusinessHome extends Component {
    constructor(props) {
        super(props);

        this.state = {
            infoIndex: 0,
            position: "",
            pricing: "24 Months",
            price: 80,
            // initially don't show the rectangles in case the user's browser is old
            showRectangles: false,
            agreeingToTerms: false,
            error: ""
        };
    }

    componentWillMount() {
        const user = this.props.currentUser;
        if (user) {
            if (user.userType === "accountAdmin") {
                goTo("/dashboard");
            } else {
                goTo("/myEvaluations");
            }
        }
        const showRectangles = this.cssPropertySupported("gridRowStart");
        this.setState({ ...this.state, showRectangles });
    }

    componentDidMount() {
        const typedStrings = [
            "be successful before you hire them",
            "be your highest performers",
            "stay at your company",
            "enhance your culture",
            "continue to develop"
        ];

        const options = {
            strings: typedStrings,
            typeSpeed: 40,
            backSpeed: 25,
            loop: true,
            loopCount: Infinity,
            backDelay: 1500
        };

        // this.typedSpan refers to the <span> that has typed words
        this.typed = new Typed(this.typedSpan, options);
    }

    componentWillUnmount() {
        this.typed.destroy();
    }

    cssPropertySupported(prop) {
        try {
            return document.body.style[prop] !== undefined;
        } catch (propertyError) {
            return false;
        }
    }

    selectProcess(infoIndex) {
        this.setState({ infoIndex });
    }

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false, dialogScreen: 1 });
    };

    handleCheckMarkClick() {
        this.setState({
            agreeingToTerms: !this.state.agreeingToTerms,
            error: ""
        });
    }

    onChange(e) {
        this.setState(
            {
                position: e.target.value
            },
            () => {
                this.updatePosition();
            }
        );
    }

    updatePosition() {
        const position = this.state.position;
        this.setState({ position });
    }

    // create the dropdown for a candidate's hiring stage
    makePricingDropdown(pricingStage) {
        const stageNames = ["24 Months", "18 Months", "12 Months", "6 Months"];

        // create the stage name menu items
        const stages = stageNames.map(stage => {
            return (
                <MenuItem value={stage} key={`pricingStage${stage}`}>
                    {stage}
                </MenuItem>
            );
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
                {stages}
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
        this.setState({ pricing: pricingStage, price });
    };

    // create a bunch of empty skewed rectangles that should be modified with css
    skewedRectangles(numRects, options) {
        // will contain a bunch of un-styled skewed rectangles
        let rectangles = [];
        // add the requested number of rectangles
        for (let i = 0; i < numRects; i++) {
            rectangles.push(
                <div styleName="skewed-rectangle" key={`rectangle${rectangleKeyIndex}`} />
            );
            rectangleKeyIndex++;
        }

        // if extra options were passed in
        if (typeof options === "object") {
            // if only the array of rectangles should be returned
            if (options.rectanglesOnly === true) {
                return rectangles;
            }
        }

        return (
            <div styleName="skewed-container">
                <div styleName="skewed-rectangles-container">
                    <div styleName="skewed-rectangles">{rectangles}</div>
                </div>
            </div>
        );
    }

    introductionSection() {
        const positionUrl = this.state.position ? "?position=" + this.state.position : "";

        return (
            <section id="introduction" styleName="introduction">
                <a id="home-top" name="home-top" className="anchor" />
                <div className="businessHome frontPage">
                    {this.state.showRectangles ? (
                        <div styleName="skewed-rectangles-container">
                            <div styleName="skewed-rectangles">
                                {this.skewedRectangles(11, { rectanglesOnly: true })}
                            </div>
                            <div styleName="skewed-rectangles">
                                {this.skewedRectangles(7, { rectanglesOnly: true })}
                            </div>
                        </div>
                    ) : null}
                    <div className="infoContainer font20px font16pxUnder900 font14pxUnder400">
                        <div className="content">
                            <h1
                                className="bigTitle font34px font30pxUnder900 font24pxUnder400"
                                style={{ color: "#72d6f5" }}
                            >
                                Know which candidates will<br />
                                <span
                                    style={{ whiteSpace: "pre" }}
                                    ref={typedSpan => {
                                        this.typedSpan = typedSpan;
                                    }}
                                />
                            </h1>
                            <div styleName="get-started-input-container">
                                <textarea
                                    styleName="get-started-input"
                                    type="text"
                                    placeholder="Enter a position"
                                    name="position"
                                    value={this.state.position}
                                    onChange={this.onChange.bind(this)}
                                />
                                <div />
                                <PositionsDropDown inputText={this.state.position} />
                            </div>
                            {/*<div className="infoText clickableNoUnderline font18px font16pxUnder1000 font14pxUnder800 font16pxUnder700 font14pxUnder600" onClick={this.handleOpen}>
                                <img src={"images/businessHome/PlayButton" + this.props.png} alt="Play Button" className="playButton"/>
                                <div>See how it works in 2 minutes</div>
                            </div>*/}
                        </div>
                        <figure styleName="product-screenshots">
                            <div styleName="my-candidates-screenshot">
                                <img
                                    src={
                                        "images/businessHome/CandidatesScreenshotTop" +
                                        this.props.jpg
                                    }
                                    alt="My Candidates Page Screenshot"
                                />
                            </div>
                            <div styleName="results-screenshot">
                                <img
                                    src={"images/businessHome/ProfileScreenshot" + this.props.jpg}
                                    alt="Candidate Results Page Screenshot"
                                />
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
            <section id="three-screenshots">
                <div styleName="screenshot-view">
                    <div styleName="screenshot-left-text">
                        <div
                            styleName="screenshot-left-text-container"
                            className="font18px font16pxUnder800 primary-white"
                        >
                            <h2 className="primary-purple-light font30px font24pxUnder800 font22pxUnder500">
                                Quickly identify which candidates{" "}
                                <div className="above1200only br">
                                    <br />
                                </div>will perform the best... or the worst
                            </h2>
                            Analyze candidates to see if they exhibit the qualities of proven high
                            achievers or low performers in that position.
                        </div>
                    </div>
                    <div styleName="screenshot-right">
                        <img
                            alt="Analysis Text"
                            src={"/images/businessHome/CandidatesScreenshot" + this.props.jpg}
                        />
                    </div>
                </div>

                <br />

                <div styleName="screenshot-view">
                    <div styleName="screenshot-right-text">
                        <div
                            styleName="screenshot-right-text-container"
                            className="font18px font16pxUnder800 primary-white"
                        >
                            <h2 className="primary-cyan font30px font24pxUnder800 font22pxUnder500">
                                Use data to eliminate biases{" "}
                                <div className="above900only br">
                                    <br />
                                </div>and guesswork
                            </h2>
                            Why read hundreds of resumes? Moonshot uses machine learning to reveal
                            the empirical evidence instead of conjecture based on a resume.
                        </div>
                    </div>
                    <div styleName="screenshot-left">
                        <img
                            alt="Predictive Insights"
                            src={"/images/businessHome/ProdScreenshot" + this.props.jpg}
                        />
                    </div>
                </div>

                <br />

                <div styleName="screenshot-view">
                    <div styleName="screenshot-left-text">
                        <div
                            styleName="screenshot-left-text-container"
                            className="font18px font16pxUnder800 primary-white"
                        >
                            <h2
                                className="font30px font24pxUnder800 font22pxUnder500"
                                style={{ color: "#ff748c" }}
                            >
                                Constantly improve with every{" "}
                                <div className="above1000only br">
                                    <br />
                                </div>new candidate and hire
                            </h2>
                            Your next hire should always be your best one yet. It&#39;s smart to
                            learn from your successes and mistakes.
                        </div>
                    </div>

                    <div styleName="screenshot-right">
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
            <section styleName="statistics-section" id="businessHomeStatistics">
                {this.state.showRectangles ? this.skewedRectangles(20) : null}
                <div>
                    <div className="center">
                        <div
                            className="font30px font26pxUnder850 font22pxUnder600 font20pxUnder400 center primary-cyan"
                            style={{ padding: "0 16px", marginBottom: "40px" }}
                        >
                            Candidate Predictions Improve Hiring Results
                        </div>
                        <div style={{ position: "relative" }}>
                            <div className="flourishes3">
                                <embed src="/images/businessHome/Flourishes3.svg" />
                            </div>
                            <Paper styleName="stats-box" zDepth={2}>
                                <div style={{ position: "relative", textAlign: "left" }}>
                                    <div className="primary-white font20px font18pxUnder900 font14pxUnder700">
                                        Improve Your Efficiency
                                    </div>
                                    <div className="secondary-gray font16px font14pxUnder900 font12pxUnder700 marginTop10px font16pxBetween600">
                                        Decrease your cost and time per hire by spending 50%<div className="above600only br">
                                            <br />
                                        </div>{" "}
                                        less time screening candidates.
                                    </div>
                                    <div
                                        className="primary-cyan font18px font16pxUnder900 font14pxUnder700 marginTop10px clickableNoUnderline learn-more-text"
                                        onClick={() => goTo("/chatbot")}
                                    >
                                        <span>Learn More</span> &#8594;
                                    </div>
                                </div>
                            </Paper>
                            <Paper styleName="stats-box" zDepth={2}>
                                <div style={{ position: "relative", textAlign: "left" }}>
                                    <div className="primary-white font20px font18pxUnder900 font14pxUnder700">
                                        Scale Your Culture
                                    </div>
                                    <div className="secondary-gray font16px font14pxUnder900 font12pxUnder700 marginTop10px font">
                                        Hire candidates that not only fit your company culture, but
                                        also offer new and diverse perspectives.
                                    </div>
                                    <div
                                        className="primary-cyan font18px font16pxUnder900 font14pxUnder700 marginTop10px clickableNoUnderline learn-more-text"
                                        onClick={() => goTo("/chatbot")}
                                    >
                                        <span>Learn More</span> &#8594;
                                    </div>
                                </div>
                            </Paper>
                            <Paper styleName="stats-box" zDepth={2}>
                                <div style={{ position: "relative", textAlign: "left" }}>
                                    <div className="primary-white font20px font18pxUnder900 font14pxUnder700">
                                        Hire Top Performers
                                    </div>
                                    <div className="secondary-gray font16px font14pxUnder900 font12pxUnder700 marginTop10px">
                                        A repeatable, everlearning process that consistently
                                        identifies top performers and bad hires.
                                    </div>
                                    <div
                                        className="primary-cyan font18px font16pxUnder900 font14pxUnder700 marginTop10px clickableNoUnderline learn-more-text"
                                        onClick={() => goTo("/chatbot")}
                                    >
                                        <span>Learn More</span> &#8594;
                                    </div>
                                </div>
                            </Paper>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    videoSection() {
        return (
            <section id="video-section">
                <div
                    styleName="video-container"
                    className="font22px font18pxUnder950 font16pxUnder400"
                >
                    <div>
                        <div styleName="video-screenshot">
                            <div />
                            <img src={"/images/businessHome/ListViewScreenshot" + this.props.png} />
                        </div>
                        <div styleName="skew-image-cover" />
                        <div styleName="video-companion">
                            <div>
                                <div styleName="video-text">
                                    We predict how successful your candidates will be before you
                                    hire them.
                                </div>
                                <div>
                                    <button
                                        styleName="video-button"
                                        className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font18px font16pxUnder950 font14pxUnder400 primary-white"
                                        onClick={() => goTo("/chatbot")}
                                    >
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
                text2: (
                    <div>
                        across <div className="home-pink inlineBlock">five position types</div>
                        <HoverTip
                            style={{ marginTop: "26px", marginLeft: "-70px" }}
                            text={
                                <div>
                                    Developer<br />Sales<br />Support<br />Marketing<br />Product
                                </div>
                            }
                        />
                    </div>
                ),
                icon: "5Icon",
                alt: "5 Icon",
                iconStyle: {}
            },
            {
                title: "Unlimited Employees",
                text1: "Evaluate employees to strengthen",
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
            }
        ];

        // create a box for each feature
        let featureBoxes = features.map(feature => {
            return (
                <div styleName="feature-box" key={feature.title}>
                    <div>
                        <img
                            src={`/images/businessHome/${feature.icon}${this.props.png}`}
                            style={feature.iconStyle}
                            alt={feature.alt}
                        />
                    </div>
                    <div>
                        <div className="bold font16pxUnder800 font14pxUnder700">
                            {feature.title}
                        </div>
                        <div className="secondary-gray font14pxUnder800 font12pxUnder700">
                            {feature.text1}
                            <br />
                            {feature.text2}
                        </div>
                    </div>
                </div>
            );
        });

        // add the box at the top left with the title for the whole area
        featureBoxes.unshift(
            <div
                key="featuresHeader"
                styleName="feature-box"
                className="primary-peach left-align font26px font22pxUnder800 font18pxUnder700"
                style={{ lineHeight: "1.3" }}
            >
                We learn from each hire<br /> so that we can make the next one even better.
            </div>
        );

        return (
            <section id="learnFromHires" styleName="learn-from-hires-section">
                {this.state.showRectangles ? this.skewedRectangles(6) : null}
                <div className="center">
                    <div className="primary-white inline-block" style={{ maxWidth: "1200px" }}>
                        {featureBoxes}
                    </div>
                </div>
            </section>
        );
    }

    render() {
        return (
            <div>
                {this.props.currentUser && this.props.currentUser.userType == "accountAdmin" ? (
                    <AddUserDialog />
                ) : null}
                <MetaTags>
                    <title>Moonshot</title>
                    <meta
                        name="description"
                        content="Moonshot helps you know who to hire. Predict candidate performance based on employees at your company and companies with similar positions."
                    />
                </MetaTags>
                <div className="blackBackground businessHome">
                    {this.introductionSection()}

                    {this.screenshotsSection()}

                    {this.statisticsSection()}

                    {this.videoSection()}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            closeNotification,
            dialogEmail
        },
        dispatch
    );
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BusinessHome);
