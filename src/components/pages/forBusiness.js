"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {forBusiness, getUsers} from '../../actions/usersActions';
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
            "Social Media Director", "Business Analyst", "Scrum Master",
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
                                <div className="blueTextImportant mediumTextDoubleShrink">
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
                                <p className="tinyText2" style={styles.marginTop}>
                                    We{"''"}ll get back to you with an email shortly.
                                </p>
                            </form>
                        }
                    </Dialog>
                    <div className="fullHeight purpleToBlue">
                        <HomepageTriangles style={{pointerEvents: "none"}} variation="1"/>

                        <div className="infoBox whiteText mediumText" style={{zIndex: "20"}}>
                            Better information, <br/>
                            better hiring decisions. <br/>
                            <button className="outlineButton"
                                    style={{backgroundColor: "transparent", border: "2px solid white"}}
                                    onClick={this.handleOpen}>
                                {"Let's Begin"}
                            </button>
                        </div>

                        <img
                            className="scrollDownButton"
                            src="/icons/Scroll.png"
                            onClick={() => this.scrollDown()}
                        />
                    </div>

                    <div style={{marginTop: '60px', overflow: 'auto'}}>
                        <div className="center mediumTextDoubleShrink" style={{marginBottom: "50px"}}>
                            <b>Top College Students and
                                <div className="under500only br"><br/></div> Recent Graduates<br/>
                                Competing to Work for You.</b>
                        </div>
                        <div style={styles.horizList}>
                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginLeft: "20%"}}
                                >
                                    <div className="horizListText">
                                        <img
                                            src="/icons/Key.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        <b>Established<div className="under500only br"><br/></div> Pipeline</b><br/>
                                        Instant access to a pool
                                        of top tier talent.
                                    </div>
                                </div>
                            </div>

                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginLeft: "5%", marginRight: '5%'}}>
                                    <div className="horizListText">
                                        <img
                                            src="/icons/Evaluate.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        <b>Evaluative<div className="under500only br"><br/></div> Metrics</b><br/>
                                        Skill evaluation curated to
                                        your company{"'"}s needs.
                                    </div>
                                </div>
                            </div>
                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginRight: "20%"}}>
                                    <div className="horizListText">
                                        <img
                                            src="/icons/Badge.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        <b>Hire<div className="under500only br"><br/></div> Talent</b><br/>
                                        See their skills and work
                                        before you hire.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="purpleToGreenSpacer"/>

                    <div style={{marginTop: '60px', minWidth: "215px"}}>
                        <div className="center smallText2"
                             style={{marginBottom: '40px', width: '90%', marginLeft: "5%"}}>
                            <h1 className="purpleText h1Shrink"><b>Our Scholarships to Hire Program</b></h1>
                            A scholarship for potential hires<div className="under500only br"><br/></div> to learn the skills you need.<br/>
                            Scholarships made for your company.
                        </div>

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
                                <div className="smallText4 homepageTrajectoryTextLeftDiv forBusiness">
                                    <h2 className="blueText"><b>What Skills Are You
                                        <div className="above800only br"><br/></div>
                                        Looking For?</b></h2>
                                    UX Design, Data Science, Full Stack
                                    Development, Marketing, Adobe...
                                </div>
                            </div>
                            <div className="homepageTrajectoryImagesRight">
                                <div className="homepageImgBackgroundRight blueGradient"/>
                                <img
                                    src="/images/HappySmallerBeardGuy.jpeg"
                                />
                            </div>
                        </div>

                        <br/>

                        <div className="homepageTrajectory forBusiness">
                            <div className="homepageTrajectoryTextRight forBusiness">
                                <div className="smallText4 homepageTrajectoryTextRightDiv forBusiness">
                                    <h2 className="greenText"><b>Course Pathways Curated
                                        <div className="above500only br"><br/></div>
                                        to the Skills You Need.</b>
                                    </h2>
                                    Expert led, interactive learning
                                    through videos, articles, skill
                                    assessments
                                    <div className="above800only br"><br/></div>
                                    and real-world projects.
                                </div>
                            </div>
                            <div className="homepageTrajectoryImagesLeft">
                                <div className="homepageImgBackgroundLeft greenGradient"/>
                                <img
                                    src="/images/WomanAtComputer.jpg"
                                />
                            </div>
                        </div>

                        <br/>

                        <div className="homepageTrajectory forBusiness" id="sponsorStudentsForBusiness">
                            <div className="homepageTrajectoryTextLeft forBusiness">
                                <div className="smallText4 homepageTrajectoryTextLeftDiv forBusiness">
                                    <h2 className="purpleText"><b>Sponsor Students</b></h2>
                                    Moonshot can find the talent,
                                    you can sponsor your pool
                                    of candidates,
                                    <div className="above800only br"><br/></div>
                                    or we can do both.
                                </div>
                            </div>

                            <div className="homepageTrajectoryImagesRight">
                                <div className="homepageImgBackgroundRight purpleToRed"/>
                                <img
                                    src="/images/WhiteboardWork.jpg"
                                />
                            </div>
                        </div>

                        <div className="homepageTrajectory forBusiness">
                            <div className="homepageTrajectoryTextRight forBusiness">
                                <div className="smallText4 homepageTrajectoryTextRightDiv forBusiness">
                                    <h2 className="blueText"><b>Evaluate for Hire</b></h2>
                                    Comprehensive data on each candidate
                                    from skill assessments, qualitative
                                    responses, quantitative scoring relative to
                                    their peers and real-world projects.
                                </div>
                            </div>
                            <div className="homepageTrajectoryImagesLeft">
                                <div className="homepageImgBackgroundLeft blueGradient"/>
                                <img
                                    src="/images/TalkingBeardGuy.jpeg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="homepageSeparatorContainer marginTopOnDesktop">

                    </div>

                    <div className="center" style={{marginBottom: "50px"}}>
                        <h1 className="isolatedHeader purpleText">
                            <b>What Positions Are You Hiring For?</b>
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
                        <div className="homepageSeparator"/>
                    </div>

                    <div className="aResumeCantDoThis">
                        <div className="smallText3" id="aResumeCantDoThisTitle"><b>A Resum&eacute; Can{"'"}t Do
                            This.</b>
                        </div>
                        <div id="aResumeCantDoThisContent">
                            <div>
                                <div style={styles.bottomListItem}>
                                    <img src="/icons/MagnifyingGlassPaperPurple.png" className="forBusinessIcon"
                                         style={{marginRight: '10px'}}/>
                                    <div className="smallText aResumeCantDoThisText">See their quality of work under
                                        pressure with real-world projects relevant
                                        <div className="above800only br"><br/></div>
                                        to your company.
                                    </div>
                                </div>
                                <div style={styles.bottomListItem}>
                                    <img src="/icons/BarGraph.png" className="forBusinessIcon"
                                         style={{marginLeft: '10px'}}/>
                                    <div className="smallText aResumeCantDoThisText">Look at quantitative breakdowns
                                        and precise scoring of their skills.
                                    </div>
                                </div>
                            </div>
                            <div style={{marginTop: '20px'}}>
                                <div style={styles.bottomListItem}>
                                    <img src="/icons/EvaluatePurple.png" className="forBusinessIcon"/>
                                    <div className="smallText aResumeCantDoThisText">
                                        Evaluate candidates with standardized criteria and assessments.
                                    </div>
                                </div>
                                <div style={styles.bottomListItem}>
                                    <img src="/icons/Filter.png" className="forBusinessIcon"/>
                                    <div className="smallText aResumeCantDoThisText">
                                        Filter out the unqualified
                                        <div className="above800only br"><br/></div>
                                        and uncommitted.
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
                        <div className="homepageTrajectoryImagesRight">
                            <div className="homepageImgBackgroundRight purpleToRed"/>
                            <img
                                src="/images/OpenLaptop.jpeg"
                            />
                        </div>
                    </div>

                    <div className="homepageSeparatorContainer" style={{margin: "60px 0 0"}}>
                        <div className="homepageSeparator"/>
                    </div>

                    <div className="center mediumTextDoubleShrink"
                         style={{marginBottom: '40px', marginTop: "120px", minWidth: "250px"}}>
                        <b>Your Pipeline to<div className="under400only br"><br/></div> Fully-Vetted Talent</b>
                    </div>
                    <div className="forBusinessBoxesContainer">
                        <Paper zDepth={3} className="paperBox">
                            <div className="gradientBorderBlueBox">
                                <div className="forBusinessBox">
                                    <div className="mediumText">Program</div>
                                    <div className="mediumText blueText">$200 USD</div>
                                    <div>PER CANDIDATE</div>
                                    <div className="br"><br/></div>
                                    Program curated to your<br/> company{"'"}s needs. Skill evaluation
                                    <div className="br"><br/></div>
                                    of up to 15
                                    candidates.
                                </div>
                            </div>
                        </Paper>
                        <Paper zDepth={3} className="paperBox">
                            <div className="gradientBorderPurpleToRedBox">
                                <div className="forBusinessBox">
                                    <div className="mediumText">Evaluation</div>
                                    <div className="mediumText purpleText">$500 USD</div>
                                    <div>PER HIRE</div>
                                    <div className="br"><br/></div>
                                    When students are successful in your<br/>programs, you can hire them
                                    <div className="br"><br/></div>
                                    for a small
                                    fee.
                                </div>
                            </div>
                        </Paper>
                    </div>

                    <div className="center" style={{marginBottom: '20px'}}>
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
        getUsers
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
