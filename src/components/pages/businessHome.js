"use strict"
import React, {Component} from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { closeNotification } from "../../actions/usersActions";
import { bindActionCreators } from 'redux';
import {forBusiness, demoEmail, dialogEmail, dialogEmailScreen2,dialogEmailScreen3,dialogEmailScreen4} from '../../actions/usersActions';
import axios from 'axios';
import MetaTags from 'react-meta-tags';
import { Dialog, Paper, TextField, FlatButton, RaisedButton, CircularProgress } from 'material-ui';
import {Field, reduxForm} from 'redux-form';
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

    handleSubmit(e) {
        e.preventDefault();
        const vals = this.props.formData.forBusiness.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'name',
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
            name: this.props.formData.forBusiness.values.name,
            email: this.props.formData.forBusiness.values.email,
            company: this.props.formData.forBusiness.values.company,
            phone: this.props.formData.forBusiness.values.phone,
        };

        this.props.forBusiness(user);
    }


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


    handleSubmitDialogEmail(e) {
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

        this.props.dialogEmail(user);
        this.handleNextScreen();
    }


    handleSubmitDialogEmailScreen2(e) {
        e.preventDefault();
        const vals = this.props.formData.forBusiness.values;

        if (!this.state.agreeingToTerms) {
            this.setState({error: "Must agree to Terms and Conditions to continue."});
            return;
        } else {
            this.setState({error: ''});
        }

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'name',
            'company',
            'password',
            'confirmPassword'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        if (vals.password != vals.confirmPassword) {
            return;
        }

        const user = {
            name: this.props.formData.forBusiness.values.name,
            email: this.props.formData.forBusiness.values.email,
            company: this.props.formData.forBusiness.values.company,
            password: this.props.formData.forBusiness.values.password,
            termsAndConditions: this.state.agreeingToTerms
        };

        this.props.dialogEmailScreen2(user);
        this.handleNextScreen();
    }


    handleSubmitDialogEmailScreen3(e) {
        e.preventDefault();
        const vals = this.props.formData.forBusiness.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'positions'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        const user = {
            positions: this.props.formData.forBusiness.values.positions
        };

        this.props.dialogEmailScreen3(user);
        this.handleNextScreen();
    }


    handleSubmitDialogEmailScreen4(e) {
        e.preventDefault();
        const vals = this.props.formData.forBusiness.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'skill1',
            'skill2',
            'skill3'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        const user = {
            skill1: this.props.formData.forBusiness.values.skill1,
            skill2: this.props.formData.forBusiness.values.skill2,
            skill3: this.props.formData.forBusiness.values.skill3
        };

        this.props.dialogEmailScreen4(user);
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
        if (dialogScreen > 0 && dialogScreen < 6) {
            // do nothing if on any screen but the 5th
            let nextAction = () => {};
            // if opening to the fifth screen, run calendly script
            if (dialogScreen === 5) { nextAction = this.addCalendlyScript; }
            this.setState({dialogScreen}, nextAction)
        }
    }


    handlePreviousScreen = () => {
        const dialogScreen = this.state.dialogScreen - 1;
        if (dialogScreen > 0 && dialogScreen < 6) {
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
            {src: "NWMLogoWhite.png", partner: "Northwestern Mutual"},
            {src: "DreamHomeLogoWhite.png", partner: "Dream Home"},
            {src: "SinglewireLogoWhite.png", partner: "Singlewire Software"},
            {src: "CurateLogoWhite.png", partner: "Curate Solutions"}
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
                className="whiteTextImportant"
            />,
        ];

        const demoActions = [
            <FlatButton
                label="Close"
                onClick={this.handleDemoClose}
                className="whiteTextImportant"
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
                list: [
                    "Create Baseline",
                    "Better Understand Employers",
                    "Pyschometric Profiles",
                    "Skill IQs"
                ]
            },
            {
                title: (<div>Manager<br/>Feedback</div>),
                info: "Managers complete a ~2 minute assessment for each employee so Moonshot can create performance profiles to analyze candidates.",
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
                    <img src="/icons/CheckMarkRoundedWhite.png" />
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
                            </div>
                        </div>
                        <div/>
                        <div>
                            <div>
                                { processList }
                            </div>
                        </div>
                    </div>
                    { this.state.infoIndex > 0 ? <img src="/icons/Arrow3.png" className="leftArrow" onClick={() => this.selectProcess(this.state.infoIndex - 1)} /> : null }
                    { this.state.infoIndex < 3 ? <img src="/icons/Arrow2.png" className="rightArrow" onClick={() => this.selectProcess(this.state.infoIndex + 1)} /> : null }
                </div>
                <div className="center" style={{marginTop: "20px"}}>
                    <button className="slightlyRoundedButton mediumLargeButton font20px font16pxUnder600 purpleToBlueAnimate whiteText" onClick={this.handleDemoOpen}>
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
        if (this.state.demoScreen === 2 || this.state.dialogScreen === 5) {
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
                            className="blueTextHome font28px font24pxUnder700 font20pxUnder500 marginTop30px">
                            See Demo
                        </div>
                        <div className="whiteText font16px font14pxUnder500" style={{width: "85%", margin: "10px auto"}}>
                            A walkthrough of the employer and candidate experience in Moonshot Insights.
                        </div>
                        <Field
                            name="email"
                            component={renderTextField}
                            label="Work Email*"
                            className="marginTop10px"
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

        // Set the body of the dialog to be the current screen
        const screen = this.state.dialogScreen;
        let dialogBody = <div></div>;
        switch(screen) {
            case 1:
                dialogBody = (
                    <form onSubmit={this.handleSubmitDialogEmail.bind(this)} className="center">
                        <div className="blueTextHome font28px font24pxUnder700 font20pxUnder500 marginTop30px">
                            Get Started
                        </div>
                        <Field
                            name="email"
                            component={renderTextField}
                            label="Work Email*"
                            validate={[required, emailValidate]}
                            className="marginTop10px"
                        /><br/>
                        <RaisedButton
                            label="Continue"
                            type="submit"
                            className="raisedButtonBusinessHome marginTop20px"
                            />
                    </form>
                );
                break;
            case 2:
                dialogBody = (
                    <form onSubmit={this.handleSubmitDialogEmailScreen2.bind(this)} className="center">
                        <div
                            className="blueTextHome font28px font24pxUnder700 font20pxUnder500 marginTop10px">
                            Get Started
                        </div>
                        <div className="whiteText font14px font12pxUnder500" style={{width: "95%", margin: "7px auto"}}>
                            No credit card required. Customized position assessment.
                        </div>
                        {this.state.error != ''
                        ? <div className="redText font14px font12pxUnder500" style={{width:"90%", margin:"7px auto"}}>
                                {this.state.error}
                        </div>
                        : null}
                        <Field
                            name="name"
                            component={renderTextField}
                            label="Full Name*"
                            validate={[required]}
                        /><br/>
                        <Field
                            name="company"
                            component={renderTextField}
                            label="Company*"
                            validate={[required]}
                        /><br/>
                        <Field
                            name="password"
                            component={renderPasswordField}
                            label="Password*"
                            validate={[required]}
                        /><br/>
                        <Field
                            name="confirmPassword"
                            component={renderPasswordField}
                            label="Confirm Password*"
                            validate={[required, passwordsMatch]}
                        /><br/>
                        <div style={{margin: "10px auto 10px"}} className="whiteText font14px">
                            <div className="checkbox smallCheckbox whiteCheckbox"
                                 onClick={this.handleCheckMarkClick.bind(this)}>
                                <img
                                    alt=""
                                    className={"checkMark" + this.state.agreeingToTerms}
                                    src="/icons/CheckMarkRoundedWhite.png"
                                />
                            </div>
                            I have read and agree to the Moonshot Insights <a className="blueTextHome" href="/privacyPolicy" target="_blank">Privacy
                            Policy</a>, <a className="blueTextHome" href="/termsOfUse" target="_blank">Terms of Use</a>, and <a className="blueTextHome" href="/serviceLevelAgreement" target="_blank">Service Level Agreement</a>.
                        </div>
                        <RaisedButton
                            label="Continue"
                            type="submit"
                            className="raisedButtonBusinessHome marginTop10px"
                        />
                    </form>
                );
                break;
            case 3:
                dialogBody = (
                    <form onSubmit={this.handleSubmitDialogEmailScreen3.bind(this)} className="center">
                        <div className="blueTextHome font22px" style={{width:"90%", margin:"10px auto"}}>
                            Just a few quick things to set up your assessment.
                        </div>
                        <div className="whiteText font14px" style={{width: "90%", margin: "10px auto"}}>
                            <i>Every position has a psychometric analysis. <div className="above800only noHeight"><br/></div>We already created that for you.</i>
                        </div>
                        <div className="whiteText font14px" style={{width: "90%", margin: "10px auto 10px"}}>
                            What positions do you want to select for the assessment?
                        </div>
                        <Field
                            name="positions"
                            component={renderBlueTextField}
                            label="Positions* (e.g. Business Analyst)"
                            validate={[required]}
                        /><br/>
                        <RaisedButton
                            label="Continue"
                            type="submit"
                            className="raisedButtonBusinessHome"
                            style={{marginTop: '20px'}}
                        />
                    </form>
                );
                break;
            case 4:
            dialogBody = (
                <form onSubmit={this.handleSubmitDialogEmailScreen4.bind(this)} className="center">
                    <div className="blueTextHome font22px" style={{width:"90%", margin:"10px auto"}}>
                        What skills do you need to be successful in this position?
                    </div>
                    <div className="whiteText font14px" style={{width: "90%", margin: "10px auto 10px"}}>
                        <i>No research required, we will do that for you. We just want the first three skills that come to mind.</i>
                    </div>
                    <Field
                        name="skill1"
                        component={renderTextField}
                        label="Skill (e.g. SEO)"
                        validate={[required]}
                    /><br/>
                    <Field
                        name="skill2"
                        component={renderTextField}
                        label="Skill (e.g. Java)"
                        validate={[required]}
                    /><br/>
                    <Field
                        name="skill3"
                        component={renderTextField}
                        label="Skill (e.g. Enterprise Sales)"
                        validate={[required]}
                    /><br/>
                    <RaisedButton
                        label="Continue"
                        type="submit"
                        className="raisedButtonBusinessHome"
                        style={{marginTop: '20px'}}
                    />
                </form>
            );
                break;
            case 5:
                const calendly = <div className="calendly-inline-widget" data-url="https://calendly.com/kyle-treige-moonshot/30min" style={{minWidth:"320px",height:"580px", zIndex:"100"}}></div>
                dialogBody = (
                    <div>
                        <div className="blueTextHome font22px" style={{width:"90%", margin:"10px auto"}}>
                            Activate your Assessment
                        </div>
                        <div className="whiteTextImportant font12px font10pxUnder500" style={{width:"97%", margin:"10px auto"}}>
                            Our team is now hard at work creating your assessment. Before we can activate
                            your account, we need to take a few minutes to ensure we are on the same page
                            with the assessment and roll out the process. Once you have set and confirmed your meeting,
                            you can close this window. We&#39;ll be in touch shortly.
                        </div>
                        <div className="whiteTextImportant font14px font12pxUnder500" style={{width:"90%", margin:"10px auto"}}>
                            Find a time below.
                        </div>
                        {calendly}
                    </div>
                );
                break;
            default:
                break;
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
                <ProgressBarDialog stepNumber={this.state.dialogScreen}/>
                {dialogBody}
            </Dialog>
        );

        return (
            <div className={blurredClass}>
                <MetaTags>
                    <title>Moonshot</title>
                    <meta name="description" content="Moonshot helps you know who to hire. Predict candidate performance based on employees at your company and companies with similar positions." />
                </MetaTags>
                {demoDialog}
                {dialog}
                <div className="blackBackground businessHome">

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
                                    <div className="mediumButton getStarted blueToPurple" onClick={this.handleDemoOpen}>
                                        See Demo
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
                                    <img src="images/businessHome/ProductScreenshot1.jpg" alt="My Candidates Page Screenshot"/>
                                </div>
                                <div id="resultsScreenshot">
                                    <img src="images/businessHome/ProductScreenshot2.jpg" alt="Candidate Results Page Screenshot" />
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
                                <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forHome whiteText">
                                    <h2 className="pinkTextHome font30px font24pxUnder800 font22pxUnder500">Quickly identify which candidates <div className="above1000only br"><br/></div>will be top performers</h2>
                                    Analyze candidates to see if they exhibit the profile of
                                    proven high performers in that position.
                                </div>
                                <button className="slightlyRoundedButton marginTop10px pinkToPurpleButtonGradient whiteText font22px font16pxUnder600 clickableNoUnderline"
                                        onClick={this.handleOpen}>
                                    Hire Faster
                                </button>
                            </div>
                            <div className="businessHomeTrajectoryImageRightNoBorder forBusiness">
                                <img
                                    alt="My Candidates Management"
                                    src="/images/businessHome/ProductScreenshot3v6.png"
                                />
                                </div>
                        </div>

                        <br/>

                        <div className="homepageTrajectory forBusiness">
                            <div className="homepageTrajectoryTextRight forBusiness">
                                <div className="font18px font16pxUnder800 homepageTrajectoryTextRightDiv forHome whiteText">
                                    <h2 className="blueTextHome font30px font24pxUnder800 font22pxUnder500">Use data to eliminate biases <div className="above900only br"><br/></div>and guesswork
                                    </h2>
                                    Why read hundreds of resumes? Moonshot uses
                                    machine learning to reveal the empirical evidence
                                    instead of conjecture based on a resume.
                                </div>
                                <button className="slightlyRoundedButton marginTop10px blueToPurpleButtonGradient whiteText font22px font16pxUnder600 clickableNoUnderline"
                                        onClick={this.handleOpen}>
                                    Hire Smarter
                                </button>
                            </div>
                            <div className="businessHomeTrajectoryImagesLeft businessHomeTrajectoryImagesShadow forBusiness">
                                <img
                                    alt="Predictive Insights"
                                    src="/images/businessHome/PredictiveInsights.jpg"
                                />
                            </div>
                        </div>
                        <br />

                        <div className="homepageTrajectory forBusiness">
                            <div className="homepageTrajectoryTextLeft forBusiness">
                                <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forHome whiteText">
                                    <h2 className="orangeTextHome font30px font24pxUnder800 font22pxUnder500">Improve your candidate <div className="above800only br"><br/></div>experience</h2>
                                    83% of candidates rate their current experience as poor.
                                    Engage your candidates better so they can understand
                                    your company and how they fit.
                                </div>
                                <button className="slightlyRoundedButton marginTop10px orangeToRedButtonGradient whiteText font22px font16pxUnder600 clickableNoUnderline"
                                        onClick={this.handleOpen}>
                                    Hire Better
                                </button>
                            </div>

                            <div className="businessHomeTrajectoryImagesRight businessHomeTrajectoryImagesShadow forBusiness">
                                <img
                                    alt="Analysis Text"
                                    src="/images/businessHome/ProductScreenshot5.jpg"
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
                                <div className="font34px font30pxUnder850 font26pxUnder500 font24pxUnder450 font20pxUnder400 center darkDarkPurpleText statisticsHeader">
                                    Predictive Analytics Improve Hiring Results
                                </div>
                                <div>
                                    <div style={bottomListItem}>
                                        <img src="/images/businessHome/Hourglass.png"
                                             alt="Hourglass Icon"
                                             className="forBusinessIcon"
                                             style={{marginRight: '10px'}}/>
                                        <div className="horizListText font18px font16pxUnder800 font12pxUnder700 whiteText" style={{width:"90%", marginLeft:"5%"}}>
                                            Up to 80% decrease<div className="above1000only noHeight"><br/></div> in time to hire
                                        </div>
                                    </div>
                                    <div style={bottomListItem}>
                                        <img src="/images/businessHome/Diamond.png"
                                             alt="Diamond Icon"
                                             className="forBusinessIcon"
                                             style={{marginLeft: '10px'}}/>
                                        <div className="horizListText font18px font16pxUnder800 font12pxUnder700 whiteText" style={{width:"90%", marginLeft:"5%"}}>
                                            Up to 300% increase<div className="above1000only noHeight"><br/></div> in quality of hire
                                        </div>
                                    </div>
                                </div>
                                <div style={{marginTop: '40px'}}>
                                    <div style={bottomListItem}>
                                        <img src="/images/businessHome/Turnover.png"
                                             alt="Turnover Icon"
                                             className="forBusinessIcon"/>
                                        <div className="horizListText font18px font16pxUnder800 font12pxUnder700 whiteText" style={{width:"90%", marginLeft:"5%"}}>
                                            Up to 70% decrease<div className="above1000only noHeight"><br/></div> in employee turnover
                                        </div>
                                    </div>
                                    <div style={bottomListItem}>
                                        <img src="/images/businessHome/Lightbulb4.png"
                                             alt="Lightbulb Icon"
                                             className="forBusinessIcon"/>
                                        <div className="horizListText font18px font16pxUnder800 font12pxUnder700 whiteText" style={{width:"90%", marginLeft:"5%"}}>
                                            More than 85% of candidates<div className="above1000only noHeight"><br/></div> rate their experience as positive
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="center">
                                <button className="blueToDarkPurpleButtonGradient bigButton"
                                        style={{marginTop: "35px", color: '#72d6f5'}}
                                        onClick={this.handleOpen}
                                >
                                    <div className="invertColorOnHover gradientBorderButtonInteriorBlack">
                                        {"Learn More"}
                                    </div>
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
                            <div className="font36px font32pxUnder700 font26pxUnder500 center brightPinkText"
                                 style={{marginBottom: '50px'}}>
                                The New Baseline Evaluation
                                <div className="infoTextContainer">
                                    <div className="infoText i flex font18px font16pxUnder700 font12pxUnder400 whiteText width400px width300pxUnder700 width250pxUnder400" style={{margin: 'auto'}}>
                                        <div>Free for First Position</div>
                                        <div>•</div>
                                        <div>Unlimited Evaluations</div>
                                        <div>•</div>
                                        <div>Unlimited Hires</div>
                                    </div>
                                </div>
                            </div>
                            <Paper className="businessHomeGradientBorder paperBoxBusinessHome"
                                zDepth={2}>
                                <div style={{textAlign: "center", position: "relative"}}>
                                    <img
                                        src="/images/businessHome/PaperAirplane.png"
                                        alt="Paper Airplane Icon"
                                        className="businessHomeBoxIcons"
                                    />
                                    <div className="brightPinkText marginTop24px marginTop20pxUnder400 font22px font18pxUnder400">
                                        STARTER
                                    </div>
                                    <div style={{height: '80px', lineHeight: '20px'}}>
                                        <span className="whiteText font30px font24pxUnder400">
                                            <br/><span style={{display: "inline-block", marginTop:"3px"}}>FREE</span>
                                            <br/>
                                            <i className="font12px">for first position</i>
                                        </span>
                                    </div>
                                    <div className="pinkToOrangeSpacer marginTop20px marginBottom20px"/>
                                    <div className="whiteText font14px font12pxUnder400" style={{width: '90%', margin: 'auto'}}>
                                        {"Start with one position to see the results. No cost, no risk, no excuses not to kick this off."}
                                    </div>
                                    <button className="pricingButton whiteText clickableNoUnderline transitionButton orangeToRedSmallButtonGradientLeft font18px font14pxUnder400" style={{border: 'none'}} onClick={this.handleOpen}>
                                        Take Off
                                    </button>
                                </div>
                            </Paper>
                            <div className="under800only" style={{height:"0px"}}><br/></div>
                            <Paper className="businessHomeGradientBorder paperBoxBusinessHome"
                                   zDepth={2}>
                                <div style={{textAlign: "center", position: "relative"}}>
                                    <img
                                        src="/images/businessHome/EnterpriseRocket.png"
                                        alt="Enterprise Rocket Icon"
                                        className="businessHomeBoxIcons"
                                    />
                                    <div className="brightOrangeText marginTop24px marginTop20pxUnder400 font22px font18pxUnder400">
                                        PLUS
                                    </div>
                                    <div style={{height: '80px', lineHeight: '20px'}}>
                                        <span className="whiteText font30px font24pxUnder400">
                                            <i className="font12px" style={{display: "inline-block", marginBottom:"9px"}}>Starting at</i>
                                            <br/>$79
                                            <br/>
                                            <i className="font12px">per additional position/month</i>
                                        </span>
                                    </div>
                                    <div className="orangeToPinkSpacer marginTop20px marginBottom20px"/>
                                    <div className="whiteText font14px font12pxUnder400" style={{width: '90%', margin: 'auto'}}>
                                        {"Easily scale the number of positions you are evaluating through Moonshot."}
                                    </div>
                                    <button className="pricingButton clickableNoUnderline transitionButton orangeToRedSmallButtonGradientRight whiteText font18px font14pxUnder400" style={{border: 'none'}} onClick={this.handleOpen}>
                                        Blast Off
                                    </button>
                                </div>
                            </Paper>
                        </div>
                    </section>

                    <section id="crystalBall" className="marginBottom60px">
                        <div className="center">
                            <div className="blueTextHome font36px font32pxUnder700 font26pxUnder500 marginBottom30pxImportant" style={{maxWidth: '80%', margin:'auto'}}>
                                {"Your crystal ball to identify"}<div className="above800only noHeight"><br/></div>{" good and bad hires before it's too late."}
                            </div>
                            <img
                                src="/images/businessHome/CrystalBall.png"
                                alt="CrystalBall"
                                className="crystalBall"
                            />
                            <br/>
                            <button className="blueToDarkPurpleButtonGradientReverse bigButton"
                                    style={{marginTop: "25px", color: 'white'}}
                                    onClick={this.handleOpen}
                            >
                                <div className="invertColorOnHover gradientBorderButtonInteriorGradient">
                                    {"See the Future"}
                                </div>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        forBusiness,
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
    };
}

BusinessHome = reduxForm({
    form: 'forBusiness',
    enableReinitialize: true,
})(BusinessHome);

export default connect(mapStateToProps, mapDispatchToProps)(BusinessHome);
