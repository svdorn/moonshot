"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {forBusiness} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Dialog, FlatButton} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
import HomepageTriangles from '../miscComponents/HomepageTriangles';

const styles = {
    hintStyle: {
        color: '#00d2ff',
    }, greenText: {
        color: style.colors.moonshotGreenText
    }, blueText: {
        color: style.colors.moonshotMidBlue
    }, purpleText: {
        color: style.colors.moonshotPurple
    }, bigFont: {
        fontSize: "32px"
    }, leftLi: {
        float: "left",
        textAlign: "left",
        position: "relative",
        marginLeft: "100px",
        clear: "both"
    }, rightLi: {
        float: "right",
        textAlign: "left",
        position: "relative",
        marginRight: "100px",
        clear: "both"
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
    bottomListItem: {
        width: '50%',
        margin: 'auto',
        display: 'inline-block',
        top: '0',
        verticalAlign: 'top',
    },
    marginTop: {
        marginTop: '10px',
    }
};

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        hintStyle={styles.hintStyle}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

const renderMultilineTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        multiLine={true}
        hintStyle={styles.hintStyle}
        hintText={label}
        {...input}
        {...custom}
    />
);

const validate = values => {
    const errors = {};
    const requiredFields = [
        'name',
        'email',
        'company',
        'title',
        'phone'
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

class ForBusiness extends Component {
    state = {
        open: false,
    };

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
            'company',
            'title',
            'phone'
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
            company: this.props.formData.forBusiness.values.company,
            title: this.props.formData.forBusiness.values.title,
            email: this.props.formData.forBusiness.values.email,
            message: this.props.formData.forBusiness.values.message,
            phone: this.props.formData.forBusiness.values.phone,
            positions: this.props.formData.forBusiness.values.positions,
        };

        this.props.forBusiness(user);
    }

    scrollToForm() {
        document.querySelector('.form-right').scrollIntoView({
            behavior: 'smooth'
        });
    }

    scrollDown() {
        const scrollPosTop = window.innerWidth > 500 ? 710 : 550;
        window.scroll({
            top: scrollPosTop,
            left: 0,
            behavior: 'smooth'
        });
    }

    //name, email, password, confirm password, signup button
    render() {

        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleClose}
            />,
        ];

        const roles = [
            "Data Scientist", "VR Developer", "UX Designer", "Digital Marketer",
            "Front-End Developer", "Software Engineer", "Product Manager",
            "Social Media Specialist", "Business Analyst", "Scrum Master",
            "Machine Learning Engineer", "Back-End Developer", "Business Development"
        ]

        let brKey = -1;
        const exampleRoles = roles.map(function (role) {
            brKey++;
            return (
                <div key={role + "div"}
                     style={{display: 'inline-block', marginTop: '15px'}}
                     className="gradientBorderPurpleToPinkChip"
                >
                    <div key={role} className="purpleText">
                        {role}
                    </div>
                </div>
            );
        });

        let blurredClass = '';
        if (this.state.open) {
            blurredClass = 'dialogForBizOverlay';
        }

        return (
            <div className="jsxWrapper">
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
                                <div className="blueTextImportant font36px font30pxUnder700 font26pxUnder500">
                                    Contact Us
                                </div>
                                <Field
                                    name="name"
                                    component={renderTextField}
                                    label="Full Name"
                                /> < br/>
                                <Field
                                    name="company"
                                    component={renderTextField}
                                    label="Company"
                                /><br/>
                                <Field
                                    name="title"
                                    component={renderTextField}
                                    label="Title"
                                /><br/>
                                < Field
                                    name="email"
                                    component={renderTextField}
                                    label="Email"
                                /><br/>
                                <Field
                                    name="phone"
                                    component={renderTextField}
                                    label="Phone Number"
                                /><br/>
                                <Field
                                    name="positions"
                                    component={renderMultilineTextField}
                                    label="Positions You're Hiring For"
                                /><br/>
                                <Field
                                    name="message"
                                    component={renderMultilineTextField}
                                    label="Message"
                                /><br/>
                                <RaisedButton
                                    label="Send"
                                    type="submit"
                                    primary={true}
                                    className="raisedButtonWhiteText"
                                    style={styles.marginTop}
                                />
                                <br/>
                                <p className="font10px" style={styles.marginTop}>
                                    We{"''"}ll get back to you with an email shortly.
                                </p>
                            </form>
                        }
                    </Dialog>
                    <div className="fullHeight purpleToBlue">
                        <HomepageTriangles style={{pointerEvents: "none"}} variation="1"/>

                        <div className="infoBox whiteText font40px font30pxUnder700 font24pxUnder500 font20pxUnder400 font18pxUnder350">
                            Data-driven hiring.<br/>
                            Your pipeline to specialized talent<br/>
                            curated to your needs.<br/>
                            <button className="outlineButton whiteText font30px font20pxUnder500 darkBlueButton"
                                    onClick={() => this.scrollDown()}>
                                {"Let's Begin"}
                            </button><br/>

                            <div className="scrollDownButton" onClick={() => this.scrollDown()}>
                                <div>
                                    <div/><div/>
                                </div>
                                <div>
                                    <div/><div/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{marginTop: '60px', overflow: 'auto'}}>
                        <div className="center font28px font24pxUnder800 font22pxUnder500" style={{marginBottom: "50px"}}>
                            Top College Students and
                                <div className="under600only br"><br/></div> Recent Graduates<br/>
                                Competing to Work for You.
                        </div>
                        <div style={styles.horizList}>
                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginLeft: "20%"}}
                                >
                                    <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                        <img
                                            alt="Key Icon"
                                            src="/icons/Key.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        <b>Specialized<div className="under500only br"><br/></div> Training</b><br/>
                                        We train our students in <div className="above600only"><br/></div>the skills you need.
                                    </div>
                                </div>
                            </div>

                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginLeft: "5%", marginRight: '5%'}}>
                                    <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                        <img
                                            src="/icons/Evaluate.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        <b>Evaluative<div className="under500only br"><br/></div> Metrics</b><br/>
                                        Quantitative skill assessments <div className="above600only"><br/></div>and comparative data.
                                    </div>
                                </div>
                            </div>
                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginRight: "20%"}}>
                                    <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                        <img
                                            src="/icons/Badge.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        <b>Real<div className="under500only br"><br/></div> Projects</b><br/>
                                        See their quality of work and <div className="above1000only br"><br/></div>application of skills<div className="above500only inline"> before you hire</div>.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="purpleToGreenSpacer"/>

                    <div style={{marginTop: '40px', minWidth: "215px", maxWidth: "1500px", margin: "auto"}}>
                        <div className="center font18px font16pxUnder800"
                             style={{marginBottom: '40px', width: '90%', marginLeft: "5%"}}>
                            <h1 className="purpleText font30px font26pxUnder800 font24pxUnder500">How It Works</h1>
                            No upfront cost or risk. <div className="under400only"><br/></div>Pay only if you hire.<br/>
                        </div>


                        <div className="homepageTrajectoryContainer">
                            <div className="forBusinessLineWithCirclesContainer">
                                <div className="forBusinessLineWithCircles">
                                    <div className="forBusinessLine"/>
                                    <div className="forBusinessCircle"/>
                                    <div className="forBusinessCircle"/>
                                    <div className="forBusinessCircle"/>
                                    <div className="forBusinessCircle"/>
                                </div>
                            </div>


                            <div className="homepageTrajectory forBusiness" id="whatSkillsAreYouHiringFor">
                                <div className="homepageTrajectoryTextLeft forBusiness">
                                    <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forBusiness">
                                        <h2 className="blueText font28px font24pxUnder800 font22pxUnder500">What Skills Are You <div className="above800only br"><br/></div>Hiring For?</h2>
                                        UI/UX, Data Science, Game Design, SEO, Javascript, C++, Adobe, SQL, Google Analytics, DevOps, Agile...
                                    </div>
                                </div>
                                <div className="homepageTrajectoryImagesRight forBusiness">
                                    <div className="homepageImgBackgroundRight blueGradient forBusiness"/>
                                    <img
                                        src="/images/HappySmallerBeardGuy.jpeg"
                                    />
                                </div>
                            </div>

                            <br/>

                            <div className="homepageTrajectory forBusiness">
                                <div className="homepageTrajectoryTextRight forBusiness">
                                    <div className="font18px font16pxUnder800 homepageTrajectoryTextRightDiv forBusiness">
                                        <h2 className="greenText font28px font24pxUnder800 font22pxUnder500">Course Pathways Curated <div className="above500only br"><br/></div>to the Skills You Need
                                        </h2>
                                        Interactive learning
                                        through videos, articles, skill
                                        assessments and real-world projects.
                                    </div>
                                </div>
                                <div className="homepageTrajectoryImagesLeft forBusiness">
                                    <div className="homepageImgBackgroundLeft greenGradient forBusiness"/>
                                    <img
                                        src="/images/WomanAtComputer.jpg"
                                    />
                                </div>
                            </div>

                            <br/>

                            <div className="homepageTrajectory forBusiness" id="sponsorStudentsForBusiness">
                                <div className="homepageTrajectoryTextLeft forBusiness">
                                    <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forBusiness">
                                        <h2 className="purpleText font28px font24pxUnder800 font22pxUnder500">Candidate Training</h2>
                                        College students and recent graduates
                                        complete the pathway to learn the skills
                                        you need. We find the talent.
                                    </div>
                                </div>

                                <div className="homepageTrajectoryImagesRight forBusiness">
                                    <div className="homepageImgBackgroundRight purpleToRed forBusiness"/>
                                    <img
                                        src="/images/WhiteboardWork.jpg"
                                    />
                                </div>
                            </div>

                            <div className="homepageTrajectory forBusiness">
                                <div className="homepageTrajectoryTextRight forBusiness">
                                    <div className="font18px font16pxUnder800 homepageTrajectoryTextRightDiv forBusiness">
                                        <h2 className="blueText font28px font24pxUnder800 font22pxUnder500">Evaluate for Hire</h2>
                                        Comprehensive data on each candidate
                                        from skill assessments, qualitative
                                        responses, quantitative scoring
                                        and real-world projects.
                                    </div>
                                </div>
                                <div className="homepageTrajectoryImagesLeft forBusiness">
                                    <div className="homepageImgBackgroundLeft blueGradient forBusiness"/>
                                    <img
                                        src="/images/TalkingBeardGuy.jpeg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="homepageSeparatorContainer marginTopOnDesktop">

                    </div>

                    <div className="center" style={{marginBottom: "50px"}}>
                        <h1 className="isolatedHeader purpleText font28px font24pxUnder800 font22pxUnder500">
                            What Positions Are You Hiring For?
                        </h1>
                        <div id="exampleSkillsContainer">
                            {exampleRoles}
                        </div>

                        <button className="purpleToPinkButtonExterior bigButton"
                                onClick={this.handleOpen}
                                style={{marginTop: "40px"}}
                        >
                            <div className="invertColorOnHover gradientBorderButtonInterior">
                                Hire With Us
                            </div>
                        </button>
                    </div>

                    <div className="homepageSeparatorContainer marginTopOnDesktop">
                        <div className="homepageSeparator purplePinkSeparator"/>
                    </div>

                    <div className="aResumeCantDoThis">
                        <div id="aResumeCantDoThisContent">
                            <div className="font28px font24pxUnder800 font22pxUnder500" id="aResumeCantDoThisTitle">A Resum&eacute; Can{"'"}t Do This.
                            </div>
                            <div>
                                <div style={styles.bottomListItem}>
                                    <img src="/icons/MagnifyingGlassPaperPurple.png" className="forBusinessIcon"
                                         style={{marginRight: '10px'}}/>
                                    <div className="font18px font16pxUnder800 aResumeCantDoThisText">See their quality of work under
                                        pressure.
                                    </div>
                                </div>
                                <div style={styles.bottomListItem}>
                                    <img src="/icons/BarGraph.png" className="forBusinessIcon"
                                         style={{marginLeft: '10px'}}/>
                                    <div className="font18px font16pxUnder800 aResumeCantDoThisText">
                                        Quantitatively score and break down their skills.
                                    </div>
                                </div>
                            </div>
                            <div style={{marginTop: '20px'}}>
                                <div style={styles.bottomListItem}>
                                    <img src="/icons/EvaluatePurple.png" className="forBusinessIcon"/>
                                    <div className="font18px font16pxUnder800 aResumeCantDoThisText">
                                        Compare candidates against their peers.
                                    </div>
                                </div>
                                <div style={styles.bottomListItem}>
                                    <img src="/icons/Filter.png" className="forBusinessIcon"/>
                                    <div className="font18px font16pxUnder800 aResumeCantDoThisText">
                                        Filter out the unqualified<div className="above800only br"><br/></div> and uncommitted.
                                    </div>
                                </div>
                            </div>

                            <button className="purpleToPinkButtonExterior bigButton"
                                    onClick={this.handleOpen}
                                    style={{marginTop: "40px"}}
                            >
                                <div className="invertColorOnHover gradientBorderButtonInterior">
                                    Learn More
                                </div>
                            </button>
                        </div>
                        <div className="homepageTrajectoryImagesRight" style={{marginTop:"68px"}}>
                            <div className="homepageImgBackgroundRight purpleToRed"/>
                            <img
                                src="/images/OpenLaptop.jpeg"
                            />
                        </div>
                    </div>

                    <div className="homepageSeparatorContainer" style={{margin: "60px 0 0"}}>
                        <div className="homepageSeparator blueLightBlueSeparator"/>
                    </div>

                    <div className="center font28px font24pxUnder800 font22pxUnder500"
                         style={{marginBottom: '40px', marginTop: "120px", minWidth: "250px"}}>
                        Your Pipeline to<div className="under400only br"><br/></div> Fully-Vetted Talent
                    </div>
                    <div className="forBusinessBoxesContainer">
                        <Paper zDepth={3} className="paperBox">
                            <div className="gradientBorderBlueBox">
                                <div className="forBusinessBox">
                                    <div className="font28px font24pxUnder800 font22pxUnder500">Full Access</div>
                                    <div className="font32px font28pxUnder800 font26pxUnder500 blueText">FREE</div>
                                    <div>COMPANY LICENSE</div>
                                    <div className="br"><br/></div>
                                    <div className="forBusinessBoxText font14px font12pxUnder900">
                                    Pathway curated to your company, accesss<br/>
                                    to existing pathways and talent pipeline.<br/>
                                    Candidate data, skills scoring and projects.
                                    </div>
                                </div>
                            </div>
                        </Paper>
                        <Paper zDepth={3} className="paperBox">
                            <div className="gradientBorderPurpleToRedBox">
                                <div className="forBusinessBox">
                                    <div className="font28px font24pxUnder800 font22pxUnder500">Successful Hire</div>
                                    <div className="font32px font28pxUnder800 font26pxUnder500 purpleText">3-5%</div>
                                    <div>GROSS ANNUAL SALARY</div>
                                    <div className="br"><br/></div>
                                    <div className="forBusinessBoxText font14px font12pxUnder900">
                                    3% to 5% for full and part-time hires.<br/>
                                    13% to 15% for interns or co-ops.<br/>
                                    Pay only after he or she accepts your offer.
                                    </div>
                                </div>
                            </div>
                        </Paper>
                    </div>

                    <div className="center" style={{marginBottom: '20px'}}>
                        <div className="font18px font16pxUnder800">
                            No upfront costs. No risk. Pay only on success.
                        </div>
                    </div>
                    <div className="center" style={{marginBottom: '40px'}}>
                        <button className="blueToPurpleButtonExterior bigButton"
                                onClick={this.handleOpen}
                        >
                            <div className="invertColorOnHover gradientBorderButtonInterior">
                                Contact Us
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        forBusiness,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        loadingEmailSend: state.users.loadingSomething,
    };
}

ForBusiness = reduxForm({
    form: 'forBusiness',
    validate,
})(ForBusiness);

export default connect(mapStateToProps, mapDispatchToProps)(ForBusiness);
