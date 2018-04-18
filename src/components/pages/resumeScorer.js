"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerForPathway, closeNotification, addPathway} from '../../actions/usersActions';
import {TextField, Dialog, RaisedButton, Paper, CircularProgress, Divider, Chip} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
//import './pathway.css';
import axios from 'axios';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import {browserHistory} from 'react-router';
import MetaTags from 'react-meta-tags';

const styles = {
    horizList: {
        position: "relative",
        marginTop: "15px",
        marginBottom: "25px"
    },
    horizListArrow: {
        position: "relative",
        maxWidth: "600px",
        margin: "15px auto 25px auto"
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


const validate = values => {
    const errors = {};
    const requiredFields = [
        'fullName',
        'email',
        'desiredCareers',
        'skills'
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


class ResumeScorer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            uploadingResume: false,
            doneUploading: false
        }
    }


    // open and close the dialog
    handleOpen = () => {
        this.setState({open: true});
    };
    handleClose = () => {
        this.setState({open: false});
    };


    handleSubmit(e) {
        e.preventDefault();
        console.log("YUH")
        const vals = this.props.formData.resumeUpload.values;

        // Form validation before submit
        let notValid = false;
        const requiredFields = [
            'fullName',
            'email',
            'skills',
            'desiredCareers'
        ];
        requiredFields.forEach(field => {
            if (!vals || !vals[field]) {
                this.props.touch(field);
                notValid = true;
            }
        });
        if (notValid) return;

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(vals.email)) return;

        const formValues = this.props.formData.resumeUpload.values;

        const name = formValues.fullName;
        const skills = formValues.skills;
        const desiredCareers = formValues.desiredCareers;
        const email = formValues.email;
        let resumeFile = undefined;
        try {
            resumeFile = this.refs.resumeFile.files[0];
        } catch (getFileError) {
            console.log("getFileError");
            console.log("Need a resume");
            return;
        }

        let resumeData = new FormData();
        resumeData.append("name", name);
        resumeData.append("skills", skills);
        resumeData.append("desiredCareers", desiredCareers);
        resumeData.append("email", email);
        resumeData.append("resumeFile", resumeFile);
        console.log("resumeData is: ", resumeData)

        this.setState({uploadingResume: true});
        //axios.post("/api/resumeScorer/uploadResume", {name, skills, desiredCareers, email, resumeFile})
        axios.post("/api/resumeScorer/uploadResume", resumeData)
        .then(result => {
            console.log("result: ", result);
            this.setState({uploadingResume: false, doneUploading: true});
        });
    }


    render() {
        let blurredClass = '';
        if (this.state.open) {
            blurredClass = ' dialogForBizOverlay';
        }

        let page = null;
        // everything that will be shown if the user has not yet uploaded their resume
        if (!this.state.doneUploading) {
            page = (
                <div>
                    <div className={"fullHeight redToLightRedGradient" + blurredClass}>
                        <Dialog
                            modal={false}
                            open={this.state.open}
                            onRequestClose={this.handleClose}
                            autoScrollBodyContent={true}
                            paperClassName="dialogForBiz"
                            contentClassName="center"
                            overlayClassName="dialogOverlay"
                        >
                            {this.state.uploadingResume ?
                                <div className="center"><CircularProgress style={{marginTop: "20px"}}/></div>
                                : <form onSubmit={this.handleSubmit.bind(this)} className="center">
                                    <div className="blueTextImportant font36px font30pxUnder700 font26pxUnder500">
                                        Finalize
                                    </div>
                                    <Field
                                        name="desiredCareers"
                                        component={renderTextField}
                                        label="Desired Careers"
                                    /> < br/>
                                    <Field
                                        name="skills"
                                        component={renderTextField}
                                        label="Skills"
                                    /><br/>
                                    <Field
                                        name="fullName"
                                        component={renderTextField}
                                        label="Full Name"
                                    /><br/>
                                    <Field
                                        name="email"
                                        component={renderTextField}
                                        label="Email"
                                    /><br/>
                                    <input
                                        name="resume"
                                        type="file"
                                        ref="resumeFile"
                                        accept="image/jpg,image/png,application/pdf,application/msword"
                                        style={{marginTop:"20px"}}
                                    />
                                    <RaisedButton
                                        label="Submit"
                                        type="submit"
                                        primary={true}
                                        className="raisedButtonWhiteText"
                                        style={styles.marginTop}
                                    />
                                </form>
                            }
                        </Dialog>
                        <HomepageTriangles style={{pointerEvents: "none"}} variation="4"/>
                        <div className="infoBox whiteText font40px font24pxUnder500"
                             style={{zIndex: "20", marginTop: '-10px'}}>
                            How does your resum&eacute; score?
                            <div className="font24px font18pxUnder500">
                                Free comparative analysis, skills breakdown and data-driven suggestions.
                            </div>
                            <button
                                className="outlineButton whiteText font30px font20pxUnder500 redToLightRedGradientButton"
                                onClick={this.handleOpen}
                            >
                                {"Upload Your Resume"}
                            </button>
                        </div>
                    </div>
                    <div style={{marginTop: '60px', marginBottom: '40px', overflow: 'auto'}} className="center">
                        <div style={styles.horizListArrow}>
                            <div className="horizListFull">
                                <div className="horizListText">
                                    <img
                                        alt="Puzzle Icon"
                                        src="/icons/Key.png"
                                        style={styles.horizListIcon}
                                    />
                                </div>
                            </div>
                            <div className="horizListFull">
                                <div className="horizListText">
                                    <img
                                        alt="Double Arrow Icon"
                                        src="/icons/DoubleArrow.png"
                                        className="doubleArrowIcon"
                                    />
                                </div>
                            </div>
                            <div className="horizListFull">
                                <div className="horizListText">
                                    <img
                                        alt="Puzzle Icon"
                                        src="/icons/Key.png"
                                        style={styles.horizListIcon}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="center">
                        <div className="font26px font20pxUnder700" style={{maxWidth: "1000px", margin: "20px auto"}}>
                            From a single document to actionable insights and data.
                        </div>
                    </div>

                    <div className="redToLightRedSpacer" id="picturesToPathwaysHomepageSpacer"/>

                    <div style={{marginTop: '60px', marginBottom: '40px', overflow: 'auto'}}>
                        <div style={styles.horizList}>
                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginLeft: "20%"}}
                                >
                                    <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                        <img
                                            alt="Puzzle Icon"
                                            src="/icons/Key.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        Position and Industry <div className="above600only"><br/></div>Recommendations
                                    </div>
                                </div>
                            </div>

                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginLeft: "5%", marginRight: '5%'}}>
                                    <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                        <img
                                            alt="Lightbulb Icon"
                                            src="/icons/Evaluate.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        Courses for Skills <div className="above600only"><br/></div>Training
                                    </div>
                                </div>
                            </div>
                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginRight: "20%"}}>
                                    <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                        <img
                                            alt="Trophy Icon"
                                            src="/icons/Badge.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        Comparative Analysis <div className="above600only br"><br/></div>and Scoring
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="center" style={{marginBottom: '40px'}}>
                        <button className="redToLightRedButtonExterior  font26px font20pxUnder500 bigButton"
                        >
                            <div onClick={this.handleOpen}
                                 className="invertColorOnHover gradientBorderButtonInterior">
                                Upload Your Resume
                            </div>
                        </button>
                    </div>
                </div>
            );
        }

        // if the user has uploaded their resume, show that they will get an
        // email soon with a resume grade
        else {
            page = (
                <div className={"fullHeight redToLightRedGradient"}>
                    <HomepageTriangles style={{pointerEvents: "none"}} variation="4"/>
                    <div className="infoBox whiteText font40px font24pxUnder500"
                         style={{zIndex: "20", marginTop: '-10px'}}>
                        Submitted!
                        <div className="font24px font18pxUnder500">
                            {"You'll get an email back from us within two days with feedback."}
                        </div>
                    </div>
                </div>
            );
        }


        return (
            <div className="jsxWrapper noOverflowX">
                <MetaTags>
                    <title>Resum&eacute; Scorer | Moonshot</title>
                    <meta name="description"
                          content="Get actionable data and skills reports by just uploading your Resume."/>
                </MetaTags>
                {page}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        formData: state.form,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

ResumeScorer = reduxForm({
    form: 'resumeUpload',
    validate,
})(ResumeScorer);

export default connect(mapStateToProps, mapDispatchToProps)(ResumeScorer);
