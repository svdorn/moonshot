"use strict"
import React, {Component} from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { closeNotification } from "../../actions/usersActions";
import { bindActionCreators } from 'redux';
import {demoEmail, dialogEmail, dialogEmailScreen2,dialogEmailScreen3,dialogEmailScreen4} from '../../actions/usersActions';
import axios from 'axios';
import MetaTags from 'react-meta-tags';
import { Dialog, Paper, TextField, FlatButton, RaisedButton, CircularProgress } from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import AddUserDialog from '../childComponents/addUserDialog';
import YouTube from 'react-youtube';
import ProgressBarDialog from '../miscComponents/progressBarDialog';

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        hintStyle={{color: 'white'}}
        inputStyle={{color: '#72d6f5'}}
        underlineStyle={{color: '#72d6f5'}}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

const renderBlueTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        hintStyle={{color: '#72d6f5'}}
        inputStyle={{color: '#72d6f5'}}
        underlineStyle={{color: '#72d6f5'}}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

const renderPasswordField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        errorText={touched && error}
        inputStyle={{color: '#72d6f5'}}
        hintStyle={{color: 'white'}}
        underlineStyle={{color: '#72d6f5'}}
        {...input}
        {...custom}
        type="password"
    />
);

const emailValidate = value => value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? 'Invalid email address' : undefined;

const required = value => (value ? undefined : 'This field is required.');

const passwordsMatch = (value, allValues) => (
  value !== allValues.password ? "Passwords don't match" : undefined);

class BusinessHome extends Component {
    constructor(props) {
        super(props);

        this.state = {
            infoIndex: 0,
            open: false,
            demoOpen: false,
            demoScreen: 1,
            dialogScreen: 1,
            email: '',
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


    addCalendlyScript() {
        const script = document.createElement("script");
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true;
        document.body.appendChild(script);
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

    handleEmailFormSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.forBusiness.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'email',
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) return;

        const user = {
            email: this.props.formData.forBusiness.values.email,
        };

        this.props.demoEmail(user);
        this.handleDemoScreenChange();
    }

    handleSubmitForm(e) {
        e.preventDefault();
        const vals = this.props.formData.forBusiness.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'name',
            'email',
            'company'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) return;

        const user = {
            name: this.props.formData.forBusiness.values.name,
            email: this.props.formData.forBusiness.values.email,
            company: this.props.formData.forBusiness.values.company,
        };

        this.props.dialogEmail(user);
        this.handleNextScreen();
    }

    onChange(e) {
        this.setState({
            email: e.target.value
        }, () => {
            this.updateEmail()
        });
    }


    updateEmail() {
        const email = {
            email: this.state.email,
        }
        this.props.initialize(email);
    }


    handleDemoOpen = () => {
        this.setState({demoOpen: true});
    }


    handleDemoClose = () => {
        this.setState({demoOpen: false, demoScreen: 1});
    }


    handleDemoScreenChange = () => {
        this.setState({demoScreen: 2});
    }


    handleNextScreen = () => {
        const dialogScreen = this.state.dialogScreen + 1;
        if (dialogScreen > 0 && dialogScreen < 3) {
            // do nothing if on any screen but the 5th
            let nextAction = () => {};
            // if opening to the fifth screen, run calendly script
            if (dialogScreen === 2) { nextAction = this.addCalendlyScript; }
            this.setState({dialogScreen}, nextAction)
        }
    }


    handlePreviousScreen = () => {
        const dialogScreen = this.state.dialogScreen - 1;
        if (dialogScreen > 0 && dialogScreen < 3) {
            this.setState({dialogScreen})
        }
    }


    render() {
        const opts = {
            height: '320',
            width: '525',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 1,
                iv_load_policy: 3
            }
        };

        const logoImages = [
            {src: "NWMLogoWhite" + this.props.png, partner: "Northwestern Mutual"},
            {src: "DreamHomeLogoWhite" + this.props.png, partner: "Dream Home"},
            {src: "SinglewireLogoWhite" + this.props.png, partner: "Singlewire Software"},
            {src: "CurateLogoWhite" + this.props.png, partner: "Curate Solutions"}
        ];
        const logos = logoImages.map(img => {
            return (<img alt={`${img.partner} Logo`} key={img.partner+"logo"} className="partnerLogo" src={`/logos/${img.src}`} />);
        });

        const bottomListItem = {
                width: '35%',
                margin: 'auto',
                display: 'inline-block',
                top: '0',
                verticalAlign: 'top',
        };

        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose}
                className="primary-white-important"
            />,
        ];

        const demoActions = [
            <FlatButton
                label="Close"
                onClick={this.handleDemoClose}
                className="primary-white-important"
            />,
        ];

        const processObjects = [
            {
                title: (<div>Evaluation<br/>Creation</div>),
                info: "Evaluations consist of a psychometric analysis, position-based skill tests and qualitative questions typically asked in the first interview.",
                list: [
                    "Psychometric Analysis",
                    "Skill IQ Quizzes",
                    "Qualitative Questions"
                ]
            },
            {
                title: (<div>Employee<br/>Completion</div>),
                info: "Employees complete the evaluation to create a baseline for candidates.",
                belowInfo: "Not necessary to get started.",
                list: [
                    "Create Baseline",
                    "Better Understand Employers",
                    "psychometric Profiles",
                    "Skill IQs"
                ]
            },
            {
                title: (<div>Manager<br/>Feedback</div>),
                info: "Managers complete a ~2 minute assessment for each employee so Moonshot can create performance profiles to analyze candidates.",
                belowInfo: "Not necessary to get started.",
                list: [
                    "Performance Profiles",
                    "Performance Management"
                ]
            },
            {
                title: (<div>Candidate<br/>Completion</div>),
                info: "All incoming candidates complete the evaluation so Moonshot can predict their performance.",
                list: [
                    "Psychometric Profiles",
                    "Skill IQs",
                    "Qualitative Responses",
                    "Predicted Job Performance",
                    "Predicted Culture Fit",
                    "Predicted Longevity",
                    "Predicted Growth"
                ]
            }
        ]

        let processButtons = [];
        const colors = [
            {r:177,g:125,b:254},
            {r:167,g:143,b:254},
            {r:166,g:144,b:254},
            {r:147,g:174,b:254},
            {r:147,g:174,b:254},
            {r:131,g:201,b:254},
            {r:129,g:203,b:254},
            {r:121,g:218,b:254}
        ]
        const numProcesses = processObjects.length;
        for (let processIndex = 0; processIndex < numProcesses; processIndex++) {
            const selected = this.state.infoIndex === processIndex;
            const leftRgb = colors[processIndex*2];
            const rightRgb = colors[processIndex*2 + 1];
            const opacity = selected ? .8 : .1;
            let colorStyle = {
                background: `linear-gradient(to right, rgba(${leftRgb.r},${leftRgb.g},${leftRgb.b},${opacity}), rgba(${rightRgb.r},${rightRgb.g},${rightRgb.b},${opacity}))`
            }

            processButtons.push(
                <div key={"processButton" + processIndex}>
                    <div className="shadowBox" />
                    <div className="processHeaderContainer clickable font18px font14pxUnder700 font12pxUnder400"
                         onClick={() => this.selectProcess(processIndex)}
                    >
                        <div style={colorStyle} />
                        <div style={colorStyle} />
                        {processObjects[processIndex].title}
                    </div>
                </div>
            );

            if (processIndex === 1) {
                processButtons.push(<br key={`br${processIndex}`} className="under950only"/>)
            }
        };

        const processList = processObjects[this.state.infoIndex].list.map(infoListText => {
            return (
                <div className="processListItem" key={infoListText}>
                    <img src={"/icons/CheckMarkRoundedWhite" + this.props.png} />
                    <div>{ infoListText }</div>
                </div>
            );
        });

        const processSection = (
            <section id="moonshotProcess">
                <a id="ourProcess" name="ourProcess" className="anchor" />
                <h1 className="font34px font30pxUnder950 font26pxUnder500 font24pxUnder450 font20pxUnder400">{"Moonshot's Process to Predict Candidate Performance"}</h1>
                <div className="processButtonsContainer">
                    { processButtons }
                </div>
                <div className="processOutline font18px font16pxUnder850 font12pxUnder700 font10pxUnder400">
                    <div>
                        <div>
                            <div>
                                { processObjects[this.state.infoIndex].info }
                                { processObjects[this.state.infoIndex].belowInfo ?
                                <div className="font14px font12pxUnder850 font10pxUnder700 font8pxUnder400 marginTop10px">
                                    <i>{ processObjects[this.state.infoIndex].belowInfo }</i>
                                </div>
                                : null }
                            </div>
                        </div>
                        <div/>
                        <div>
                            <div>
                                { processList }
                            </div>
                        </div>
                    </div>
                    { this.state.infoIndex > 0 ? <img src={"/icons/Arrow3" + this.props.png} className="leftArrow" onClick={() => this.selectProcess(this.state.infoIndex - 1)} /> : null }
                    { this.state.infoIndex < 3 ? <img src={"/icons/Arrow2" + this.props.png} className="rightArrow" onClick={() => this.selectProcess(this.state.infoIndex + 1)} /> : null }
                </div>
                <div className="center" style={{marginTop: "20px"}}>
                    <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font20px font16pxUnder600 primary-white" onClick={this.handleDemoOpen}>
                        See Demo
                    </button>
                </div>
            </section>
        );

        let blurredClass = '';
        if (this.state.open || this.state.demoOpen) {
            blurredClass = 'dialogForBizOverlay';
        }


        let dialogDemoClass = "dialogForBiz";
        if (this.state.demoScreen === 2 || this.state.dialogScreen === 2) {
            dialogDemoClass = "dialogForVideo";
        }

        const demoDialog = (
            <Dialog
                actions={demoActions}
                modal={false}
                open={this.state.demoOpen}
                onRequestClose={this.handleDemoClose}
                autoScrollBodyContent={true}
                paperClassName={dialogDemoClass}
                contentClassName="center"
                overlayClassName="dialogOverlay"
            >
                {this.state.demoScreen === 1
                ?
                <form onSubmit={this.handleEmailFormSubmit.bind(this)} className="center">
                        <div
                            className="primary-cyan font28px font24pxUnder700 font20pxUnder500 marginTop30px">
                            See Demo
                        </div>
                        <div className="primary-white font16px font14pxUnder500" style={{width: "85%", margin: "10px auto"}}>
                            A walkthrough of the employer and candidate experience in Moonshot Insights.
                        </div>
                        <Field
                            name="email"
                            component={renderTextField}
                            label="Work Email"
                            className="marginTop10px"
                            validate={[required]}
                        /><br/>
                        <RaisedButton
                            label="Watch Demo"
                            type="submit"
                            className="raisedButtonBusinessHome marginTop30px"
                        />
                    </form>
                :
                    <YouTube
                        videoId="m4_M9onXmpY"
                        opts={opts}
                        onReady={this._onReady}
                        onEnd={this._onEnd}
                    />
            }
            </Dialog>
        );

        const screen = this.state.dialogScreen;
        let dialogBody = <div></div>;
        if (screen === 1) {
                    dialogBody = (
                        <form onSubmit={this.handleSubmitForm.bind(this)} className="center">
                            <div className="primary-cyan font28px font24pxUnder700 font20pxUnder500 marginTop40px">
                                Try Moonshot Insights for Free
                            </div>
                            <div className="primary-white font16px font14pxUnder700 font12pxUnder400 marginTop10px">
                                Book a demo to activate your first free evaluation.
                            </div>
                            <Field
                                name="name"
                                component={renderTextField}
                                label="Full Name"
                                validate={[required]}
                                className="marginTop10px"
                            /><br/>
                            <Field
                                name="email"
                                component={renderTextField}
                                label="Work Email"
                                validate={[required, emailValidate]}
                                className="marginTop10px"
                            /><br/>
                            <Field
                                name="company"
                                component={renderTextField}
                                label="Company"
                                validate={[required]}
                                className="marginTop10px"
                            /><br/>
                            <RaisedButton
                                label="Continue"
                                type="submit"
                                className="raisedButtonBusinessHome marginTop20px"
                                />
                        </form>
                    );
        } else if (screen === 2) {
                    const calendly = <div className="calendly-inline-widget" data-url="https://calendly.com/kyle-treige-moonshot/30min" style={{minWidth:"320px",height:"580px", zIndex:"100"}}></div>
                    dialogBody = (
                        <div>
                            <div className="primary-cyan font28px font24pxUnder700 font20pxUnder500" style={{width:"90%", margin:"10px auto"}}>
                                Activate your Evaluation
                            </div>
                            <div className="primary-white-important font14px font12pxUnder500" style={{width:"97%", margin:"10px auto 0"}}>
                                Schedule a demo with our team to select a position, define the evaluation
                                and walk through the employer interface.
                            </div>
                            <div className="primary-white-important font14px font12pxUnder500" style={{width:"97%", margin:"auto"}}>
                                If you can give us 30 minutes, we can create your first free predictive evaluation.
                            </div>
                            <div className="primary-white-important font14px font12pxUnder500" style={{width:"90%", margin:"10px auto 3px"}}>
                                Find a time below.
                            </div>
                            {calendly}
                        </div>
                    );
        }

        const dialog = (
            <Dialog
                actions={actions}
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose}
                autoScrollBodyContent={true}
                paperClassName={dialogDemoClass}
                contentClassName="center"
                overlayClassName="dialogOverlay"
            >
                {dialogBody}
            </Dialog>
        );

        return (
            <div className={blurredClass}>
                {(this.props.currentUser && this.props.currentUser.userType == "accountAdmin") ? <AddUserDialog /> : null}
                <MetaTags>
                    <title>Moonshot</title>
                    <meta name="description" content="Moonshot helps you know who to hire. Predict candidate performance based on employees at your company and companies with similar positions." />
                </MetaTags>
                {demoDialog}
                {dialog}
                <div className="blackBackground businessHome">
                    <a id="homeTop" name="homeTop" className="anchor" />
                    <div className="businessHome frontPage">
                        {this.state.showRectangles ?
                            <div className="skewedRectanglesContainer">
                                <div className="skewedRectangles">
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                </div>
                                <div className="skewedRectangles">
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                </div>
                            </div>
                            : null
                        }
                        <div className="infoContainer font20px font16pxUnder900 font14pxUnder400">
                            <div className="content">
                                <h1 className="bigTitle font46px font38pxUnder900 font28pxUnder400" style={{color:"#72d6f5"}}>Know who to hire.</h1>
                                <p className="infoText notFull">Predict candidate performance so that you can hire the best people for your team, faster.</p>
                                <div className="buttonArea font18px font14pxUnder900">
                                    <input className="blackInput getStarted" type="text" placeholder="Email Address" name="email"
                                    value={this.state.email} onChange={this.onChange.bind(this)}/>
                                    <div className="getStarted button medium round-10px gradient-transition gradient-1-purple-light gradient-2-cyan" onClick={this.handleOpen}>
                                        Try for Free
                                    </div>
                                </div>
                                <div className="infoText i flex font18px font16pxUnder1000 font14pxUnder800 font16pxUnder700 font14pxUnder600 font10pxUnder400">
                                    <div>Free for first active position</div>
                                    <div>•</div>
                                    <div>Unlimited evaluations</div>
                                </div>
                            </div>
                            <figure className="productScreenshots">
                                <div id="myCandidatesScreenshot">
                                    <img src={"images/businessHome/MyCandidatesScreenshot" + this.props.jpg} alt="My Candidates Page Screenshot"/>
                                </div>
                                <div id="resultsScreenshot">
                                    <img src={"images/businessHome/CandidateResultsScreenshot" + this.props.jpg} alt="Candidate Results Page Screenshot" />
                                </div>
                            </figure>
                        </div>
                    </div>

                    {/* <!-- The skewed rectangles that only come up on small screen --> */}
                    {this.state.showRectangles ?
                        <div className="logoContainer skewedContainer">
                            <div className="skewedRectanglesContainer">
                                <div className="skewedRectangles">
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                    <div className="skewedRectangle" />
                                </div>
                            </div>
                        </div>
                        : null
                    }

                    {/*<div className="partnerLogos"><div>{logos}</div></div>*/}

                    <section id="threeScreenshots">
                        <div className="homepageTrajectory forBusiness">
                            <div className="homepageTrajectoryTextLeft forBusiness">
                                <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forHome primary-white">
                                    <h2 className="secondary-red font30px font24pxUnder800 font22pxUnder500">Quickly identify which candidates <div className="above1000only br"><br/></div>will be top performers</h2>
                                    Analyze candidates to see if they exhibit the profile of
                                    proven high performers in that position.
                                </div>
                                <button className="button gradient-transition gradient-1-purple-dark gradient-2-red round-4px marginTop10px primary-white font22px font16pxUnder600"
                                        onClick={this.handleOpen}>
                                    Hire Faster
                                </button>
                            </div>
                            <div className="businessHomeTrajectoryImageRightNoBorder forBusiness">
                                <img
                                    alt="My Candidates Management"
                                    src={"/images/businessHome/MyCandidatesMagnifyScreenshot" + this.props.png}
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
                                <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px marginTop10px primary-white font22px font16pxUnder600"
                                        onClick={this.handleOpen}>
                                    Hire Smarter
                                </button>
                            </div>
                            <div className="businessHomeTrajectoryImagesLeft businessHomeTrajectoryImagesShadow forBusiness">
                                <img
                                    alt="Predictive Insights"
                                    src={"/images/businessHome/PredictiveInsights" + this.props.jpg}
                                />
                            </div>
                        </div>
                        <br />

                        <div className="homepageTrajectory forBusiness">
                            <div className="homepageTrajectoryTextLeft forBusiness">
                                <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forHome primary-white">
                                    <h2 className="primary-orange font30px font24pxUnder800 font22pxUnder500">Improve your candidate <div className="above800only br"><br/></div>experience</h2>
                                    83% of candidates rate their current experience as poor.
                                    Engage your candidates better so they can understand
                                    your company and how they fit.
                                </div>
                                <button className="button gradient-transition gradient-1-red gradient-2-orange round-4px marginTop10px primary-white font22px font16pxUnder600"
                                        onClick={this.handleOpen}>
                                    Hire Better
                                </button>
                            </div>

                            <div className="businessHomeTrajectoryImagesRight businessHomeTrajectoryImagesShadow forBusiness">
                                <img
                                    alt="Analysis Text"
                                    src={"/images/businessHome/PsychTestScreenshot" + this.props.jpg}
                                />
                            </div>
                        </div>
                    </section>

                    <section id="businessHomeStatistics">
                        {this.state.showRectangles ?
                            <div className="skewedContainer">
                                <div className="skewedRectanglesContainer">
                                    <div className="skewedRectangles">
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                    </div>
                                </div>
                            </div>
                            : null
                        }

                        <div>
                            <div className="center">
                                <div className="font34px font30pxUnder850 font26pxUnder500 font24pxUnder450 font20pxUnder400 center primary-purple-light statisticsHeader">
                                    Predictive Analytics Improve Hiring Results
                                </div>
                                <div>
                                    <div style={bottomListItem}>
                                        <img src={"/images/businessHome/Hourglass" + this.props.png}
                                             alt="Hourglass Icon"
                                             className="forBusinessIcon"
                                             style={{marginRight: '10px'}}/>
                                        <div className="horizListText font18px font16pxUnder800 font12pxUnder700 primary-white" style={{width:"90%", marginLeft:"5%"}}>
                                            Up to 80% decrease<div className="above1000only noHeight"><br/></div> in time to hire
                                        </div>
                                    </div>
                                    <div style={bottomListItem}>
                                        <img src={"/images/businessHome/Diamond" + this.props.png}
                                             alt="Diamond Icon"
                                             className="forBusinessIcon"
                                             style={{marginLeft: '10px'}}/>
                                        <div className="horizListText font18px font16pxUnder800 font12pxUnder700 primary-white" style={{width:"90%", marginLeft:"5%"}}>
                                            Up to 300% increase<div className="above1000only noHeight"><br/></div> in quality of hire
                                        </div>
                                    </div>
                                </div>
                                <div style={{marginTop: '40px'}}>
                                    <div style={bottomListItem}>
                                        <img src={"/images/businessHome/Turnover" + this.props.png}
                                             alt="Turnover Icon"
                                             className="forBusinessIcon"/>
                                        <div className="horizListText font18px font16pxUnder800 font12pxUnder700 primary-white" style={{width:"90%", marginLeft:"5%"}}>
                                            Up to 70% decrease<div className="above1000only noHeight"><br/></div> in employee turnover
                                        </div>
                                    </div>
                                    <div style={bottomListItem}>
                                        <img src={"/images/businessHome/Lightbulb" + this.props.png}
                                             alt="Lightbulb Icon"
                                             className="forBusinessIcon"/>
                                        <div className="horizListText font18px font16pxUnder800 font12pxUnder700 primary-white" style={{width:"90%", marginLeft:"5%"}}>
                                            More than 85% of candidates<div className="above1000only noHeight"><br/></div> rate their experience as positive
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="center" style={{marginTop: "35px"}}>
                                <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font20px font16pxUnder600 primary-white" onClick={this.handleOpen} style={{padding: "6px 20px"}}>
                                    Try for Free
                                </button>
                            </div>
                        </div>
                    </section>

                    { processSection }

                    <section id="pricingSection">
                        <a id="pricing" name="pricing" className="anchor" />
                        {this.state.showRectangles ?
                            <div className="skewedContainer">
                                <div className="skewedRectanglesContainer">
                                    <div className="skewedRectangles">
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                        <div className="skewedRectangle" />
                                    </div>
                                </div>
                            </div>
                            : null
                        }

                        <div className="forBusinessBoxesContainer">
                            <div className="font36px font32pxUnder700 font26pxUnder500 center primary-pink"
                                 style={{marginBottom: '50px'}}>
                                The New Baseline Evaluation
                                <div className="infoTextContainer">
                                    <div className="infoText i flex font18px font16pxUnder700 font10pxUnder400 primary-white" style={{margin: 'auto'}}>
                                        <div>Free for First Active Position</div>
                                        <div>•</div>
                                        <div>Unlimited Evaluations of your Applicants</div>
                                    </div>
                                </div>
                            </div>
                            <Paper className="businessHomeGradientBorder paperBoxBusinessHome"
                                zDepth={2}>
                                <div style={{textAlign: "center", position: "relative"}}>
                                    <img
                                        src={"/images/businessHome/PaperAirplane" + this.props.png}
                                        alt="Paper Airplane Icon"
                                        className="businessHomeBoxIcons"
                                    />
                                    <div className="primary-pink marginTop24px marginTop20pxUnder400 font22px font18pxUnder400">
                                        STARTER
                                    </div>
                                    <div style={{height: '80px', lineHeight: '20px'}}>
                                        <span className="primary-white font30px font24pxUnder400">
                                            <br/><span style={{display: "inline-block", marginTop:"3px"}}>FREE</span>
                                            <br/>
                                            <i className="font12px">for first active position</i>
                                        </span>
                                    </div>
                                    <div className="pinkToOrangeSpacer marginTop20px marginBottom20px"/>
                                    <div className="primary-white font14px font12pxUnder400" style={{width: '90%', margin: 'auto'}}>
                                        {"Start with one position to see the results. No cost, no risk, no excuses not to kick this off."}
                                    </div>
                                    <button className="button gradient-transition gradient-1-red gradient-2-orange pricingButton primary-white font18px font14pxUnder400" onClick={this.handleOpen}>
                                        Take Off
                                    </button>
                                </div>
                            </Paper>
                            <div className="under800only" style={{height:"0px"}}><br/></div>
                            <Paper className="businessHomeGradientBorder paperBoxBusinessHome"
                                   zDepth={2}>
                                <div style={{textAlign: "center", position: "relative"}}>
                                    <img
                                        src={"/images/businessHome/EnterpriseRocket" + this.props.png}
                                        alt="Enterprise Rocket Icon"
                                        className="businessHomeBoxIcons"
                                    />
                                    <div className="primary-pink marginTop24px marginTop20pxUnder400 font22px font18pxUnder400">
                                        PLUS
                                    </div>
                                    <div style={{height: '80px', lineHeight: '20px'}}>
                                        <span className="primary-white font30px font24pxUnder400">
                                            <i className="font12px" style={{display: "inline-block", marginBottom:"9px"}}>Starting at</i>
                                            <br/>$79
                                            <br/>
                                            <i className="font12px">per active position/month</i>
                                        </span>
                                    </div>
                                    <div className="orangeToPinkSpacer marginTop20px marginBottom20px"/>
                                    <div className="primary-white font14px font12pxUnder400" style={{width: '90%', margin: 'auto'}}>
                                        {"Easily scale the number of positions you are evaluating through Moonshot."}
                                    </div>
                                    <button className="button gradient-transition gradient-1-red gradient-2-orange pricingButton primary-white font18px font14pxUnder400" style={{border: 'none'}} onClick={this.handleOpen}>
                                        Blast Off
                                    </button>
                                </div>
                            </Paper>
                        </div>
                    </section>

                    <section id="crystalBall" className="marginBottom60px">
                        <div className="center">
                            <div className="primary-cyan font36px font32pxUnder700 font26pxUnder500 marginBottom30pxImportant" style={{maxWidth: '80%', margin:'auto'}}>
                                {"Your crystal ball to identify"}<div className="above800only noHeight"><br/></div>{" good and bad hires before it's too late."}
                            </div>
                            <img
                                src={"/images/businessHome/CrystalBall" + this.props.png}
                                alt="CrystalBall"
                                className="crystalBall"
                            />
                            <div className="center" style={{marginTop: "10px"}}>
                                <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font20px font16pxUnder600 primary-white" onClick={this.handleOpen} style={{padding: "6px 20px"}}>
                                    Try for Free
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        demoEmail,
        dialogEmail,
        dialogEmailScreen2,
        dialogEmailScreen3,
        dialogEmailScreen4
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingEmailSend: state.users.loadingSomething,
        notification: state.users.notification,
        currentUser: state.users.currentUser,
        png: state.users.png,
        jpg: state.users.jpg
    };
}

BusinessHome = reduxForm({
    form: 'forBusiness',
    enableReinitialize: true,
})(BusinessHome);

export default connect(mapStateToProps, mapDispatchToProps)(BusinessHome);
