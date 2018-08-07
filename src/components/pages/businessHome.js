"use strict"
import React, {Component} from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { closeNotification, demoEmail, dialogEmail, dialogEmailScreen2, dialogEmailScreen3, dialogEmailScreen4 } from '../../actions/usersActions';
import axios from 'axios';
import MetaTags from 'react-meta-tags';
import { Dialog, Paper, TextField, FlatButton, RaisedButton, CircularProgress } from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import AddUserDialog from '../childComponents/addUserDialog';
import YouTube from 'react-youtube';
import ProgressBarDialog from '../miscComponents/progressBarDialog';
import { isValidEmail } from "../../miscFunctions";

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

const emailValidate = value => value && !isValidEmail(value) ? 'Invalid email address' : undefined;

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
            position: '',
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

        if (!isValidEmail(vals.email)) return;

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

        if (!isValidEmail(vals.email)) return;

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
            position: e.target.value
        }, () => {
            this.updatePosition()
        });
    }


    updatePosition() {
        const position = {
            position: this.state.position,
        }
        this.props.initialize(position);
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

        const listItem = {
                width: '33%',
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
                                <h1 className="bigTitle font34px font30pxUnder900 font24pxUnder400" style={{color:"#72d6f5"}}>Know which candidates will be successful before you hire them.</h1>
                                <p className="infoText notFull font18px font16pxUnder900 font14Under400">Hire the best people for your team with hiring technology that constantly learns and improves as you scale.</p>
                                <div className="buttonArea font18px font14pxUnder900">
                                    <input className="blackInput getStarted" type="text" placeholder="Enter a position" name="email"
                                    value={this.state.position} onChange={this.onChange.bind(this)}/>
                                    <div className="getStarted button medium round-10px gradient-transition gradient-1-purple-light gradient-2-cyan" onClick={this.handleOpen}>
                                        Try for Free
                                    </div>
                                </div>
                                <div className="infoText clickableNoUnderline font18px font16pxUnder1000 font14pxUnder800 font16pxUnder700 font14pxUnder600" onClick={this.handleOpen}>
                                    <img src={"images/businessHome/PlayButton" + this.props.png} alt="Play Button" className="playButton"/>
                                    <div>See how it works in 2 minutes</div>
                                </div>
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
                                    <h2 className="primary-orange font30px font24pxUnder800 font22pxUnder500">Constantly improve with every <div className="above800only br"><br/></div>new candidate and hire</h2>
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
                                <div className="font30px font26pxUnder850 font22pxUnder600 font20pxUnder400 center primary-cyan statisticsHeader">
                                    Predictive Analytics Improve Hiring Results
                                </div>
                                <div>
                                    <Paper className="gradientBorderPredictiveStats paperBoxPredictiveStats"
                                        zDepth={2}>
                                        <div style={{position: "relative", textAlign:"left", paddingLeft: "10px"}} className="paddingTop20px">
                                            <div className="primary-white font20px font18pxUnder900 font16pxUnder700">Improve Your Efficiency</div>
                                            <div className="secondary-gray font16px font14pxUnder900 font12pxUnder700 marginTop10px font16pxBetween600">Decrease your cost to hire. Spend less time sorting through resumes, and more time looking at the cadidates that matter.</div>
                                            <div className="primary-cyan font18px font16pxUnder900 font14pxUnder700 marginTop10px clickableNoUnderline">Try for free &#8594;</div>
                                        </div>
                                    </Paper>
                                    <Paper className="gradientBorderPredictiveStats paperBoxPredictiveStats"
                                        zDepth={2}>
                                        <div style={{position: "relative", textAlign:"left", paddingLeft: "10px"}} className="paddingTop20px">
                                            <div className="primary-white font20px font18pxUnder900 font16pxUnder700">Enhance Your Culture</div>
                                            <div className="secondary-gray font16px font14pxUnder900 font12pxUnder700 marginTop10px font">Find candidates that not only fit your company, but bring something new and diverse to the table.</div>
                                            <div className="primary-cyan font18px font16pxUnder900 font14pxUnder700 marginTop10px clickableNoUnderline">Try for free &#8594;</div>
                                        </div>
                                    </Paper>
                                    <Paper className="gradientBorderPredictiveStats paperBoxPredictiveStats"
                                        zDepth={2}>
                                        <div style={{position: "relative", textAlign:"left", paddingLeft: "10px"}} className="paddingTop20px">
                                            <div className="primary-white font20px font18pxUnder900 font16pxUnder700">Hire Better Talent</div>
                                            <div className="secondary-gray font16px font14pxUnder900 font12pxUnder700 marginTop10px">Hire candidates that won&#39;t just be top performers, but will continue to improve and grow alongside your company.</div>
                                            <div className="primary-cyan font18px font16pxUnder900 font14pxUnder700 marginTop10px clickableNoUnderline">Try for free &#8594;</div>
                                        </div>
                                    </Paper>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="moonshotProcess">
                        <div className="processOutline font18px font16pxUnder850 font12pxUnder700 font10pxUnder400">
                            <div>
                                <div>
                                    <div>
                                        We predict how successful your candidates will be before you hire them.
                                    </div>
                                    <div>
                                        <button className="button gradient-transition gradient-1-cyan gradient-2-purple-light round-4px font18px font12pxUnder700 primary-white" onClick={this.handleOpen} style={{padding: "6px 20px"}}>
                                            See How &#8680;
                                        </button>
                                    </div>
                                </div>
                                <div/>
                                <div>
                                    <div>
                                        Video
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="learnFromHires">
                        <div className="center">
                            <div>
                                <div className="home-pink font30px" style={listItem}>
                                    We learn from each hire so that we can make the next one even better.
                                </div>
                                <div style={listItem}>
                                    <img
                                        src={"/images/businessHome/CandidatesIcon" + this.props.png}
                                        alt="Candidates Icon"
                                        className="businessHomeBoxIcons"
                                    />
                                    <span className="">
                                        <div className="primary-white">
                                        </div>
                                        <div className="secondary-gray">
                                        </div>
                                    </span>
                                </div>
                                <div style={listItem}>
                                </div>
                            </div>
                            <div>
                                <div style={listItem}>
                                </div>
                                <div style={listItem}>
                                </div>
                                <div style={listItem}>
                                </div>
                            </div>
                        </div>
                    </section>

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
                            <div className="font36px font32pxUnder700 font26pxUnder500 center home-peach"
                                 style={{marginBottom: '50px'}}>
                                Title Goes Here
                                <div className="font18px font16pxUnder700 font10pxUnder400 primary-white">
                                    Unlimited evaluations of all your applicants across <div style={{display:"inline-block"}} className="primary-cyan">five functions</div>.
                                </div>
                            </div>
                            <Paper className="businessHomeGradientBorder1 paperBoxBusinessHome"
                                zDepth={2}>
                                <div style={{textAlign: "center", position: "relative"}}>
                                    <div className="home-peach paddingTop10px font20px font16pxUnder400">
                                        Test It Out
                                    </div>
                                    <img
                                        src={"/images/businessHome/PaperAirplane2" + this.props.png}
                                        alt="Paper Airplane Icon"
                                        className="businessHomeBoxIcons"
                                    />
                                    <div className="primary-white marginTop24px marginTop20pxUnder400 font22px font18pxUnder400">
                                        First Hire
                                    </div>
                                    <div className="home-peach font30px font24pxUnder400">
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
                                    <button className="button gradient-transition gradient-1-red gradient-2-orange pricingButton primary-white font18px font14pxUnder400" onClick={this.handleOpen}>
                                        Take Off
                                    </button>
                                </div>
                            </Paper>
                            <div className="under800only" style={{height:"0px"}}><br/></div>
                            <Paper className="businessHomeGradientBorder2 paperBoxBusinessHome"
                                   zDepth={2}>
                                <div style={{textAlign: "center", position: "relative"}}>
                                    <div className="home-blue paddingTop10px font20px font16pxUnder400">
                                        4 Month Guarantee
                                    </div>
                                    <img
                                        src={"/images/businessHome/EnterpriseRocket2" + this.props.png}
                                        alt="Enterprise Rocket Icon"
                                        className="businessHomeBoxIcons"
                                    />
                                    <div className="primary-white marginTop24px marginTop20pxUnder400 font22px font18pxUnder400">
                                        Each Additional Hire
                                    </div>
                                    <div className="primary-white">
                                        <span className="font30px font24pxUnder400 home-blue">$80</span>
                                        <span className="font16px font14pxUnder400">&nbsp;/ month</span>
                                        <div className="font16px font14pxUnder400">
                                            <span>for up to</span>
                                            <span className="home-blue">&nbsp;24 months</span>
                                        </div>
                                    </div>
                                    <ul className="primary-white font14px font12pxUnder400" style={{textAlign: "left", width: "95%", margin:"auto"}}>
                                        <li>
                                            Monthly payments stop if hire is no longer employed
                                        </li>
                                        <li>
                                            Full refund if hire is no longer employed within 4 months
                                        </li>
                                        <li>
                                            Pay off your balance at any time
                                        </li>
                                    </ul>
                                    <button className="button gradient-transition gradient-1-red gradient-2-orange pricingButton primary-white font18px font14pxUnder400" style={{border: 'none'}} onClick={this.handleOpen}>
                                        Blast Off
                                    </button>
                                </div>
                            </Paper>
                        </div>
                    </section>

                    <section id="ATSIntegrations" className="marginBottom60px">
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
