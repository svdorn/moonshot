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
        color: 'black',
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
        height: "150px",
        marginTop: "15px",
        marginBottom: "25px"
    },
    horizListIcon: {
        height: "50px",
        position: "absolute",
        top: "0",
        bottom: "0",
        right: "80%",
        margin: "auto"
    },
    horizListText: {
        width: "60%",
        fontSize: "20px",
        right: "0",
        left: "0",
        margin: "auto",
        textAlign: "center",
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)"
    },
    horizListFull: {
        width: "33%",
        float: "left",
        position: "relative",
        height: "150px"
    },
    horizListSpacer: {
        height: "100%",
        position: "relative"
    },
    bottomList: {
        height: '130px',
    },
    bottomListItem: {
        width: '50%',
        margin: 'auto',
        display: 'inline-block',
        top: '0',
        verticalAlign: 'top',
    },
    bottomListImg: {
        marginBottom: '10px',
        height: '50px'
    },
    bottomListText: {
        width: '90%',
    },
    resumeTitle: {
        paddingLeft: '120px'
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

        // Check if valid
        const vals = this.props.formData.forBusiness.values;

        // check if all fields have a value
        // let valsCounter = 0;
        // for (let i in vals) {
        //     valsCounter++;
        // }
        //
        // if (!vals || valsCounter !== 5) {
        //     return;
        // }

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) {
            return;
        }

        const user = {
            name: this.props.formData.forBusiness.values.name,
            company: this.props.formData.forBusiness.values.company,
            title: this.props.formData.forBusiness.values.title,
            email: this.props.formData.forBusiness.values.email,
            message: this.props.formData.forBusiness.values.message,
            phone: this.props.formData.forBusiness.values.phone,
        };

        console.log("SENDING EMAIL: ", user);

        this.props.forBusiness(user);

        console.log("email sent");
    }

    scrollToForm() {
        document.querySelector('.form-right').scrollIntoView({
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

        return (
            <div className="jsxWrapper">
                <Dialog
                    title="Contact Us"
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                    autoScrollBodyContent={true}
                >
                    {this.props.loadingEmailSend ? <div className="center"><CircularProgress style={{marginTop: "20px"}}/></div>
                        : < form onSubmit = {this.handleSubmit.bind(this)} className="center">
                        <Field
                        name="name"
                        component={renderTextField}
                        label="Full Name"
                        /> < br/>
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
                        name="company"
                        component={renderTextField}
                        label="Company"
                        /><br/>
                        <Field
                        name="title"
                        component={renderTextField}
                        label="Title"
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
                        />
                        <br/>
                        <p className="tinyText">
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
                                style={{backgroundColor: "transparent", border: "2px solid white", marginTop: '20px'}}
                                onClick={this.handleOpen}>
                            {"Let's begin"}
                        </button>
                    </div>
                </div>

                <div style={{marginTop: '60px'}}>
                    <div className="center mediumText">
                        <b>Top College Students and Recent Graduates<br/> Competing to Work for You.</b>
                    </div>
                    <div style={styles.horizList}>
                        <div style={styles.horizListFull}>
                            <div style={{...styles.horizListSpacer, marginLeft: "20%"}}
                            >
                                <img
                                    src="/icons/Key.png"
                                    style={styles.horizListIcon}
                                />
                                <div style={styles.horizListText}>
                                    <b>Established Pipeline</b><br/>
                                    Instant access to a pool
                                    of top tier talent.
                                </div>
                            </div>
                        </div>

                        <div style={styles.horizListFull}>
                            <div style={{...styles.horizListSpacer, marginLeft: "12%"}}>
                                <img
                                    src="/icons/Evaluate.png"
                                    style={styles.horizListIcon}
                                />
                                <div style={styles.horizListText}>
                                    <b>Evaluative Metrics</b><br/>
                                    Skill evaluation curated to
                                    your company's needs.
                                </div>
                            </div>
                        </div>
                        <div style={styles.horizListFull}>
                            <div style={{...styles.horizListSpacer, marginRight: "20%"}}>
                                <img
                                    src="/icons/Employee.png"
                                    style={styles.horizListIcon}
                                />
                                <div style={styles.horizListText}>
                                    <b>Hire Talent</b><br/>
                                    See their skills and work
                                    before you hire.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="purpleToGreenSpacer"/>

                <div style={{marginTop: '60px'}}>
                    <div className="center smallText3" style={{marginBottom: '40px'}}>
                        <h1 className="purpleText"><b>Our Scholarships to Hire Program</b></h1>
                        A scholarship for potential hires to learn the skills you need.<br/>
                        Scholarships made for your company.
                    </div>
                    <div className="homepageTrajectory">
                        <div className="forBusinessTrajectoryTextLeft">
                            <div className="smallText4">
                                <h2 className="blueText"><b>What Skills Are You Hiring For?</b></h2>
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

                    <div className="homepageTrajectory">
                        <div className="forBusinessTrajectoryTextRight">
                            <div className="smallText4">
                                <h2 className="greenText"><b>Course Pathways Curated<br/>to the Skills You Need.</b>
                                </h2>
                                Expert led, interactive learning
                                through videos, articles, skill
                                assessments and real-world projects.
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

                    <div className="homepageTrajectory">
                        <div className="forBusinessTrajectoryTextLeft">
                            <div className="smallText4">
                                <h2 className="purpleText"><b>Sponsor Students</b></h2>
                                Moonshot can source the talent,
                                you can sponsor your pool
                                of candidates, or we can do both.
                            </div>
                        </div>

                        <div className="homepageTrajectoryImagesRight">
                            <div className="homepageImgBackgroundRight purpleToRed"/>
                            <img
                                src="/images/WhiteboardWork.jpg"
                            />
                        </div>
                    </div>

                    <div className="homepageTrajectory">
                        <div className="forBusinessTrajectoryTextRight">
                            <div className="smallText4">
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

                <div className="purpleToGreenSpacer"/>

                <div className="homepageTrajectory" style={{marginBottom: '40px'}}>
                    <div className="smallText3" style={styles.resumeTitle}><b>A Resum&eacute; Can't Do This.</b></div>
                    <div className="forBusinessTrajectoryTextLeft">
                        <div style={styles.bottomList}>
                            <div style={styles.bottomListItem}>
                                <img src="/icons/Project.png" style={styles.bottomListImg}/>
                                <div className="smallText" style={styles.bottomListText}>See their quality of work under
                                    pressure with real-world
                                    projects relevant to your company.
                                </div>
                            </div>
                            <div style={styles.bottomListItem}>
                                <img src="/icons/BarGraph.png" style={styles.bottomListImg}/>
                                <div className="smallText" style={styles.bottomListText}>Look at quantitative breakdowns
                                    and precise scoring of their skills.
                                </div>
                            </div>
                        </div>
                        <div style={{...styles.bottomList, marginTop: '20px'}}>
                            <div style={styles.bottomListItem}>
                                <img src="/icons/EvaluatePurple.png" style={styles.bottomListImg}/>
                                <div className="smallText" style={styles.bottomListText}>
                                    Evaluate candidates with standardized criteria and assessments.
                                </div>
                            </div>
                            <div style={styles.bottomListItem}>
                                <img src="/icons/Filter.png" style={styles.bottomListImg}/>
                                <div className="smallText" style={styles.bottomListText}>
                                    Filter out the unqualified and uncommitted.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="homepageTrajectoryImagesRight">
                        <div className="homepageImgBackgroundRight purpleToRed"/>
                        <img
                            src="/images/OpenLaptop.jpeg"
                        />
                    </div>
                </div>

                <div className="purpleToGreenSpacer"/>

                <div className="forBusinessBoxesContainer">
                    <Paper zDepth={3} className="paperBox">
                        <div className="gradientBorderBlueBox">
                            <div>
                                <div className="mediumText" style={{paddingTop: '20px'}}>Program</div>
                                <div className="mediumText blueText">$1500 USD</div>
                                <div>PER PROGRAM</div>
                                <br/>
                                <p>Program curated to your<br/> company's needs. Skill evaluation<br/> of up to 15
                                    candidates.</p>
                            </div>
                        </div>
                    </Paper>
                    <Paper zDepth={3} className="paperBox">
                        <div className="gradientBorderPurpleToRedBox">
                            <div>
                                <div className="mediumText" style={{paddingTop: '20px'}}>Evaluation</div>
                                <div className="mediumText purpleText">$500 USD</div>
                                <div>PER HIRE</div>
                                <br/>
                                <p>When students are successful in your<br/>programs, you can hire them<br/> for a small
                                    fee.</p>
                            </div>
                        </div>
                    </Paper>
                </div>

                <div className="center" style={{marginBottom: '20px'}}>
                    <button className="outlineButton whiteBlueButton" onClick={this.handleOpen}>
                        Contact Us
                    </button>
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
