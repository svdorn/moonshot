"use strict";
import React, { Component } from "react";
import { connect } from "react-redux";
import { browserHistory } from "react-router";
import { bindActionCreators } from "redux";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {
    closeNotification,
    dialogEmail,
    openIntroductionModal
} from "../../../actions/usersActions";
import axios from "axios";
import MetaTags from "react-meta-tags";
import { Dialog, Paper, TextField, FlatButton, RaisedButton, CircularProgress } from "material-ui";
import AddUserDialog from "../../childComponents/addUserDialog";
import {
    isValidEmail,
    goTo,
    elementPartiallyInViewport,
    elementInViewport
} from "../../../miscFunctions";
import HoverTip from "../../miscComponents/hoverTip";
import CornersButton from "../../miscComponents/cornersButton";
import PositionsDropDown from "./positionsDropDown";
import InflatableBox from "./inflatableBox";
import Typed from "typed.js";
import Vivus from "vivus";
import colors from "../../../colors";

import "./businessHome.css";

let rectangleKeyIndex = 0;

const boxTexts = [
    {
        title: "Quickly Identify Top Talent",
        body: "Analyze candidates to see if they exhibit the qualities of proven high achievers."
    },
    {
        title: "Save Time and Effort",
        body:
            "Maximize your efficiency by spending less time screening and interviewing candidates."
    },
    {
        title: "Constantly Learn and Improve",
        body:
            "Every hiring decision is more informed than your last as machine learning is applied to your candidate and employee data."
    },
    {
        title: "Eliminate Biases",
        body: "Remove unconscious biases to empirically identify better and more diverse hires."
    },
    {
        title: "Scale Your Culture",
        body:
            "Hire candidates that not only fit your company culture, but also offer new and diverse perspectives."
    },
    {
        title: "Keep Turnover Low",
        body: "Hire candidates who are most likely to stay and grow with your company."
    }
];

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
            error: "",
            // the background position of the what-how section (left or right)
            whatHowPosition: "left",
            backgroundPosition: "left"
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

        this.vivusSvg = new Vivus("home-flourish-svg");

        this.handleScroll = this.handleScroll.bind(this);
        document.addEventListener("scroll", this.handleScroll);
    }

    handleScroll() {
        if (this.props.location.pathname !== "/") {
            return;
        }

        let flourishElement = document.getElementById("home-flourish-svg");
        if (elementPartiallyInViewport(flourishElement)) {
            document.removeEventListener("scroll", this.handleScroll);
            this.vivusSvg.play();
            flourishElement.className = "";
        } else if (this.state.drewSvg) {
            document.removeEventListener("scroll", this.handleScroll);
        }

        // get the 'who do you need to hire' textarea
        const getStartedInput = document.getElementById("get-started-input");
        // focus on it (in certain circumstances)
        if (
            window.innerWidth > 800 && // don't do this on mobile
            window.scrollY > 0 && // only if partially scrolled already
            // document.activeElement.nodeName === "BODY" && // if not focused on anything else
            elementInViewport(getStartedInput) // if the input is on the screen
        ) {
            getStartedInput.focus();
        }
    }

    componentWillUnmount() {
        this.typed.destroy();
        document.removeEventListener("scroll", this.handleScroll);
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

    handleOpenVideo = () => {
        goTo("/explore?tutorialVideo=true");
    };

    handleOpenExplore = () => {
        goTo("/explore");
        this.props.openIntroductionModal();
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

    onMouseInputEnter = e => {
        e.target.focus();
    };

    // move the position of the what and how section background
    whatHowMoveBackground = () => {
        const self = this;
        // if it was on the left, put it on the right, and vice versa
        const newPosition = self.state.whatHowPosition === "right" ? "left" : "right";
        self.setState({ backgroundPosition: newPosition }, () => {
            console.log(self.state);
            setTimeout(() => {
                self.setState({ whatHowPosition: newPosition });
            }, 350);
        });
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
                <div styleName="front-page" className="businessHome">
                    <div styleName="top-space" />
                    <div styleName="top-content-container">
                        <div styleName="content">
                            <h1 className="font38px font30pxUnder900 font26pxUnder600 font22pxUnder500 font18pxUnder400">
                                <span style={{ color: "#d7d7d7" }}>Know which candidates will</span>
                                <br />
                                <span
                                    style={{ whiteSpace: "pre" }}
                                    ref={typedSpan => {
                                        this.typedSpan = typedSpan;
                                    }}
                                />
                            </h1>
                            <div styleName="get-started-input-container">
                                <textarea
                                    id="get-started-input"
                                    styleName="get-started-input"
                                    className="font26px font22pxUnder900 font20pxUnder600 font18pxUnder500 font16pxUnder400"
                                    type="text"
                                    name="position"
                                    placeholder="Who do you need to hire?"
                                    value={this.state.position}
                                    onChange={this.onChange.bind(this)}
                                    onMouseEnter={this.onMouseInputEnter}
                                />
                                <div />
                                <PositionsDropDown inputText={this.state.position} />
                            </div>
                            <div
                                styleName="see-how-it-works"
                                className="pointer font18px font16pxUnder1000 font14pxUnder800 font12pxUnder600"
                                onClick={this.handleOpenVideo}
                            >
                                <img
                                    src={"images/businessHome/PlayButton" + this.props.png}
                                    alt="Play Button"
                                    styleName="play-button"
                                />
                                <div>See how it works</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // second section of the page, shows a preview of the candidate list view + report
    previewSection() {
        return (
            <section id="product-preview" styleName="product-preview-section">
                <div className="center" styleName="image-preview">
                    <div styleName="image-container">
                        <img
                            src={`/images/businessHome/MyCandidatesScreenshot${this.props.png}`}
                            styleName="my-candidates-screenshot"
                        />
                        <div styleName="candidate-name">Justin Ye</div>
                        <img
                            src={`/images/businessHome/CandidateResultsScreenshot${this.props.png}`}
                            styleName="results-screenshot"
                        />
                    </div>
                </div>
                <div className="primary-white center">
                    <CornersButton
                        content="Experience The Product For Yourself"
                        onClick={this.handleOpenExplore}
                        color1={colors.primaryCyan}
                        color2={colors.primaryWhite}
                        className="font16px font14pxUnder900 font12pxUnder400"
                        style={{ margin: "40px 25px 15px" }}
                    />
                    <div
                        styleName="no-credit-card"
                        className="font16px font14pxUnder900 font12pxUnder400"
                    >
                        See everything immediately. <br className="under550only" />
                        No credit card required.
                    </div>
                </div>
            </section>
        );
    }

    whatAndHowSection() {
        const { whatHowPosition, backgroundPosition } = this.state;
        const parts = [
            {
                title: "What We Do",
                position: "left",
                body:
                    "We predict candidates' job performance, growth potential, culture fit, and longevity at your company."
            },
            {
                title: "How We Do It",
                position: "right",
                body:
                    "Candidates take a ~20-minute assessment comprised of a revolutionary personality test and an abstract problem-solving quiz."
            }
        ];

        const partsJsx = parts.map(part => {
            const focused = whatHowPosition === part.position;
            // only show the two buttons if this part is highlighted
            const buttons = (
                <div styleName={`stacked-buttons ${focused ? "show" : "hide"}`}>
                    <CornersButton
                        content="Try Now For Free"
                        onClick={this.handleOpenExplore}
                        color1={colors.primaryCyan}
                        color2={colors.primaryWhite}
                        className="font16px font14pxUnder900 font12pxUnder400"
                    />
                    <div styleName="cta-or">or</div>
                    <div styleName="see-how" onClick={this.handleOpenVideo}>
                        <img
                            src={"images/businessHome/PlayButton" + this.props.png}
                            alt="Play Button"
                            styleName="what-how-play-button"
                        />
                        <div className="primary-white" styleName="see-cta">
                            See How It Works
                        </div>
                    </div>
                </div>
            );
            return (
                <div styleName="what-how-part" key={`what-how-part ${part.position}`}>
                    <div>
                        <div
                            className={focused ? "primary-cyan" : "secondary-gray"}
                            styleName="title"
                        >
                            {part.title}
                        </div>
                        {focused ? null : <div styleName="what-how title-separator" />}
                        <div styleName={`body ${focused ? "focused" : ""}`}>{part.body}</div>
                        {buttons}
                    </div>
                </div>
            );
        });

        return (
            <section styleName="what-and-how-section">
                <div styleName="what-how-background">
                    <div styleName={`moveable-background ${backgroundPosition}`}>
                        <div />
                        <div
                            styleName={`circle-arrow-icon ${
                                backgroundPosition === "right" ? "left" : "right"
                            }`}
                            className="circleArrowIcon"
                            onClick={this.whatHowMoveBackground}
                        />
                    </div>
                    {partsJsx}
                </div>
            </section>
        );
    }

    boxesSection() {
        const boxes = boxTexts.map(boxText => {
            return (
                <InflatableBox
                    title={boxText.title}
                    body={boxText.body}
                    key={boxText.title}
                    onClick={this.handleOpenExplore}
                />
            );
        });

        return (
            <section styleName="statistics-section">
                {/* this.state.showRectangles */ false ? this.skewedRectangles(20) : null}
                <div>
                    <div className="center">
                        <div
                            className="font30px font26pxUnder850 font22pxUnder600 font20pxUnder400 center primary-white"
                            style={{ padding: "0 16px", marginBottom: "15px" }}
                        >
                            Candidate Predictions <br className="under500only" />Designed For You
                        </div>
                        <div styleName="title-separator" />
                        <div style={{ position: "relative" }}>
                            <div styleName="flourish">
                                <object
                                    id="home-flourish-svg"
                                    className="opacity-hidden"
                                    type="image/svg+xml"
                                    data="/images/businessHome/Flourish.svg"
                                />
                            </div>

                            <div styleName="inflatable-boxes">{boxes}</div>
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
                <div styleName="businessHome">
                    {this.introductionSection()}

                    <div styleName="rectangles-area">
                        {this.state.showRectangles ? this.skewedRectangles(17) : null}

                        {this.previewSection()}

                        {this.whatAndHowSection()}
                    </div>

                    {this.boxesSection()}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            closeNotification,
            dialogEmail,
            openIntroductionModal
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
