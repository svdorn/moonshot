"use strict"
import React, {Component} from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { closeNotification } from "../../actions/usersActions";
import { bindActionCreators } from 'redux';
import {forBusiness} from '../../actions/usersActions';
import axios from 'axios';
import MetaTags from 'react-meta-tags';
import { Dialog, Paper, TextField, FlatButton, RaisedButton, CircularProgress } from 'material-ui';
import {Field, reduxForm} from 'redux-form';

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        hintStyle={{color: '#00d2ff'}}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

const validate = values => {
    const errors = {};
    const requiredFields = [
        'name',
        'email',
    ];
    requiredFields.forEach(field => {
        if (!values[field]) {
            errors[field] = 'This field is required'
        }
    });
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
    }
    return errors
};

class BusinessHome extends Component {
    constructor(props) {
        super(props);

        this.state = {
            infoIndex: 0,
            open: false,
        }
    }


    selectProcess(infoIndex) {
        this.setState({ infoIndex });
    }

    handleOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
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


    render() {
        const logoImages = [
            {src: "NWMLogoWhite.png", partner: "Northwestern Mutual"},
            {src: "DreamHomeLogoWhite.png", partner: "Dream Home"},
            {src: "SinglewireLogoWhite.png", partner: "Singlewire Software"},
            {src: "CurateLogoWhite.png", partner: "Curate Solutions"}
        ];
        const logos = logoImages.map(img => {
            return (<img alt={`${img.partner} Logo`} key={img.partner+"logo"} className="partnerLogo" src={`/logos/${img.src}`} />);
        });

        const style = {
            bottomListItem: {
                width: '35%',
                margin: 'auto',
                display: 'inline-block',
                top: '0',
                verticalAlign: 'top',
            },
        };

        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleClose}
            />,
        ];

        const processObjects = [
            {
                title: (<div>Evaluation<br/>Creation</div>),
                info: "Tell us what skills you need and three to five open-ended questions you want to add.",
                list: [
                    "Psychometric Analysis",
                    "Skill IQ Quizzes",
                    "Interview Questions"
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
                info: "Managers complete an assessment for each employee so Moonshot can create performance profiles to analyze candidates.",
                list: [
                    "Performance Profiles",
                    "Performance Management"
                ]
            },
            {
                title: (<div>Candidate<br/>Completion</div>),
                info: "All incoming candidates are evaluated to predict their performance.",
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
        const numProcesses = processObjects.length;
        for (let processIndex = 0; processIndex < numProcesses; processIndex++) {
            processButtons.push(
                <div className="processHeaderContainer clickable font18px" onClick={() => this.selectProcess(processIndex)}>
                    <div/><div/>
                    {processObjects[processIndex].title}
                </div>
            );
        };

        const processList = processObjects[this.state.infoIndex].list.map(infoListText => {
            return (
                <div className="processListItem">
                    { infoListText }
                </div>
            );
        });

        const processSection = (
            <section id="moonshotProcess" style={{height: "500px"}}>
                { processButtons }
                <div className="processOutline">
                    <div>
                        <div>
                            { processObjects[this.state.infoIndex].info }
                        </div>
                        <div className="centerLine"/>
                        <div>
                            { processList }
                        </div>
                    </div>
                </div>
            </section>
        );

        let blurredClass = '';
        if (this.state.open) {
            blurredClass = 'dialogForBizOverlay';
        }


        return (
            <div className={blurredClass}>
                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                    paperClassName="dialogForBiz"
                    contentClassName="center"
                    overlayClassName="dialogOverlay"
                >
                    {this.props.loadingEmailSend ?
                        <div className="center"><CircularProgress style={{marginTop: "20px"}}/></div>
                        : < form onSubmit={this.handleSubmit.bind(this)} className="center">
                            <div className="blueTextImportant font28px font24pxUnder700 font20pxUnder500">
                                Predict Candidate Success
                            </div>
                            <Field
                                name="name"
                                component={renderTextField}
                                label="Full Name*"
                            /> < br/>
                            < Field
                                name="email"
                                component={renderTextField}
                                label="Email*"
                            /><br/>
                            <Field
                                name="company"
                                component={renderTextField}
                                label="Company"
                            /><br/>
                            <Field
                                name="phone"
                                component={renderTextField}
                                label="Phone Number"
                            /><br/>
                            <RaisedButton
                                label="Send"
                                type="submit"
                                primary={true}
                                className="raisedButtonWhiteText"
                                style={{marginTop: '10px'}}
                            />
                            <br/>
                            <div className="infoText i flex font10px center" style={{margin: '10px auto', width: '250px'}}>
                                <div>Free for First Position</div>
                                <div>•</div>
                                <div>Unlimited Evaluations</div>
                            </div>
                        </form>
                    }
                </Dialog>
            <div className="blackBackground businessHome">
                <div className="businessHome frontPage">
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
                    <div className="infoContainer font20px font16pxUnder900 font14pxUnder400">
                        <div className="content">
                            <h1 className="bigTitle font46px font38pxUnder900 font28pxUnder400" style={{color:"#72d6f5"}}>Know who to hire.</h1>
                            <p className="infoText notFull">Predict candidate performance based on employees at your company and companies with similar positions.</p>
                            <div className="buttonArea font18px font14pxUnder900">
                                <input className="blackInput getStarted" type="text" placeholder="Email Address" />
                                <div className="mediumButton getStarted blueToPurple">
                                    Get Started
                                </div>
                            </div>
                            <div className="infoText i flex font12pxUnder400">
                                <div>Free for first position</div>
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

                <div className="partnerLogos">
                    <div>
                        {logos}
                    </div>
                </div>

                <section id="threeScreenshots">
                    <div className="homepageTrajectory forBusiness">
                        <div className="homepageTrajectoryTextLeft forBusiness">
                            <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forHome whiteText">
                                <h2 className="pinkTextHome font28px font24pxUnder800 font22pxUnder500">Quickly identify which candidates <div className="above1000only br"><br/></div>will be top performers</h2>
                                Analyze candidates to see if they exhibit the profile of
                                proven high performers in that position.
                            </div>
                            <button className="slightlyRoundedButton marginTop10px pinkToPurpleButtonGradient whiteText" onClick={this.handleOpen}>
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
                                <h2 className="blueTextHome font28px font24pxUnder800 font22pxUnder500">Use data to eliminate biases <div className="above900only br"><br/></div>and guesswork
                                </h2>
                                Why read hundreds of resumes? Moonshot uses
                                machine learning to reveal the empirical evidence
                                instead of conjecture based on a resume.
                            </div>
                            <button className="slightlyRoundedButton marginTop10px blueToPurpleButtonGradient whiteText" onClick={this.handleOpen}>
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
                                <h2 className="orangeTextHome font28px font24pxUnder800 font22pxUnder500">Improve your candidate <div className="above800only br"><br/></div>experience</h2>
                                83% of candidates rate their current experience as poor.
                                Engage your candidates better so they can understand
                                your company and how they fit.
                            </div>
                            <button className="slightlyRoundedButton marginTop10px orangeToRedButtonGradient whiteText" onClick={this.handleOpen}>
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
                    <div className="center">
                        <div className="font36px font32pxUnder700 font26pxUnder500 center darkDarkPurpleText"
                             style={{marginBottom: '50px'}}>
                            Predictive Analytics Improve Hiring Results
                        </div>
                        <div>
                            <div style={style.bottomListItem}>
                                <img src="/images/businessHome/Hourglass.png"
                                     alt="Hourglass Icon"
                                     className="forBusinessIcon"
                                     style={{marginRight: '10px'}}/>
                                <div className="horizListText font18px font16pxUnder800 font12pxUnder700 whiteText" style={{width:"90%", marginLeft:"5%"}}>
                                    Up to 80% decrease<div className="above1000only noHeight"><br/></div> in time to hire
                                </div>
                            </div>
                            <div style={style.bottomListItem}>
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
                            <div style={style.bottomListItem}>
                                <img src="/images/businessHome/Turnover.png"
                                     alt="Turnover Icon"
                                     className="forBusinessIcon"/>
                                <div className="horizListText font18px font16pxUnder800 font12pxUnder700 whiteText" style={{width:"90%", marginLeft:"5%"}}>
                                    Up to 70% decrease<div className="above1000only noHeight"><br/></div> in employee turnover
                                </div>
                            </div>
                            <div style={style.bottomListItem}>
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
                </section>




                { processSection }





                <section>
                    <div className="forBusinessBoxesContainer">
                        <div className="font36px font32pxUnder700 font26pxUnder500 center brightPinkText"
                             style={{marginBottom: '50px'}}>
                            The New Baseline Evaluation
                            <div className="infoText i flex font18px font16pxUnder700 font12pxUnder400 whiteText width400px width300pxUnder700 width250pxUnder400" style={{margin: 'auto'}}>
                                <div>Unlimited Candidates</div>
                                <div>•</div>
                                <div>Unlimited Hires</div>
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
                                <div className="brightPinkText marginTop40px marginTop20pxUnder400 font22px font18pxUnder400">
                                    STARTER
                                </div>
                                <div style={{height: '70px', lineHeight: '70px'}}>
                                    <i className="whiteText marginTop20px font16px font14pxUnder400">
                                        First Position Free
                                    </i>
                                </div>
                                <div className="pinkToOrangeSpacer marginTop20px marginBottom20px"/>
                                <div className="whiteText font16px font12pxUnder400" style={{width: '90%', margin: 'auto'}}>
                                    Start with one position. You can run unlimited candidate
                                    evaluations to see the results. No cost, no risk, no
                                    excuses not to kick this off the ground.
                                </div>
                                <button className="whiteText clickableNoUnderline marginTop20px font18px font14pxUnder400" style={{background: '#fd0d8b', border: 'none'}} onClick={this.handleOpen}>
                                    Take Off
                                </button>
                            </div>
                        </Paper>
                        <Paper className="businessHomeGradientBorder paperBoxBusinessHome"
                               zDepth={2}>
                            <div style={{textAlign: "center", position: "relative"}}>
                                <img
                                    src="/images/businessHome/EnterpriseRocket.png"
                                    alt="Enterprise Rocket Icon"
                                    className="businessHomeBoxIcons"
                                />
                                <div className="brightOrangeText marginTop40px marginTop20pxUnder400 font22px font18pxUnder400">
                                    PLUS
                                </div>
                                <div style={{height: '70px'}}>
                                    <i className="whiteText marginTop20px font16px font14pxUnder400">
                                        Each Additional Position<br/> Starting at $79
                                        <br/>
                                        <i className="font12px">per position/month</i>
                                    </i>
                                </div>
                                <div className="orangeToPinkSpacer marginTop20px marginBottom20px"/>
                                <div className="whiteText font16px font12pxUnder400" style={{width: '90%', margin: 'auto'}}>
                                    Easily scale the number of positions you are
                                    evaluating through Moonshot. Unlimited candidate
                                    evaluations for each position.
                                </div>
                                <button className="clickableNoUnderline whiteText marginTop20px font18px font14pxUnder400" style={{background: '#ff5d27', border: 'none'}} onClick={this.handleOpen}>
                                    Blast Off
                                </button>
                            </div>
                        </Paper>
                    </div>
                </section>

                <section>
                    <div className="center">
                        <img
                            src="/images/businessHome/CrystalBall.png"
                            alt="CrystalBall"
                            height={300}
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
        forBusiness
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingEmailSend: state.users.loadingSomething,
    };
}

BusinessHome = reduxForm({
    form: 'forBusiness',
    validate,
})(BusinessHome);

export default connect(mapStateToProps, mapDispatchToProps)(BusinessHome);
