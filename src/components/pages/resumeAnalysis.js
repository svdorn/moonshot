"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {closeNotification, addNotification} from '../../actions/usersActions';
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
    },
    horizListQuotes: {
        marginTop: "40px",
        marginBottom: "25px"
    },
    imgContainer: {
        height: "78px",
        width: "78px",
        borderRadius: '50%',
        display: "inline-block",
        overflow: "hidden",
        marginTop: '-20px',
    },
    imgMark: {
        height: "88px",
    },
    imgJada: {
        height: "80px",
        marginRight: '4px'
    },
    imgCam: {
        height: "80px",
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
            doneUploading: false,
            // will be true when user has already uploaded resume and now has
            // to input their information
            uploadStepTwo: false,
            // if user tries to submit without uploading a resume, show an
            // error banner
            showNoResumeBanner: false,
            // if user tries to submit file of invalid type, show error banner
            showWrongFileTypeBanner: false
        }
    }


    // open and close the dialog
    handleOpen = () => {
        this.setState({open: true});
    };
    handleClose = () => {
        this.setState({open: false});
    };
    scrollDown() {
        const scrollPosTop = window.innerWidth > 500 ? 710 : 550;
        window.scroll({
            top: scrollPosTop,
            left: 0,
            behavior: 'smooth'
        });
    }

    showNoResumeBanner() {
        let self = this;

        // don't show it again if it's already showing the banner
        if (this.state.showNoResumeBanner) {
            return;
        }

        // show the alert
        self.setState({
            showNoResumeBanner: true,
        }, hideBannerAfterTimeUp);

        // function to turn banner off after three seconds
        function hideBannerAfterTimeUp() {
            const THREE_SECONDS = 3000;
            setTimeout(() => {
                self.setState({
                    showNoResumeBanner: false
                });
            }, THREE_SECONDS);
        }
    }


    showWrongFileTypeBanner() {
        let self = this;

        // don't show it again if it's already showing the banner
        if (this.state.showWrongFileTypeBanner) {
            return;
        }

        // show the alert
        self.setState({
            showWrongFileTypeBanner: true,
        }, hideBannerAfterTimeUp);

        // function to turn banner off after three seconds
        function hideBannerAfterTimeUp() {
            const THREE_SECONDS = 3000;
            setTimeout(() => {
                self.setState({
                    showWrongFileTypeBanner: false
                });
            }, THREE_SECONDS);
        }
    }


    goToStepTwo() {
        // check that a resume was actually uploaded
        if (!this || !this.refs || !this.refs.resumeFile || !this.refs.resumeFile.files || this.refs.resumeFile.files.length < 1) {
            this.showNoResumeBanner();
            return;
        }

        // check the file type, show error banner if wrong file type
        if (!this.isValidFileType(this.refs.resumeFile.files[0].name)) {
            this.showWrongFileTypeBanner();
            return;
        }


        // advance to the next step
        this.setState({ uploadStepTwo: true });
    }


    goToStepOne() {
        this.setState({uploadStepTwo: false});
    }


    // only allow certain file types to be uploaded
    isValidFileType(fileName) {
        // get the file extension from the end of the file name
        let extension = fileName.split('.').pop().toLowerCase();
        // file types we allow
        const allowedFileTypes = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
        // look through the list of allowed file types, if any matches, success
        const isValid = allowedFileTypes.some(fileType => {
           return fileType === extension;
        });

        return isValid;
    }


    handleSubmit(e) {
        e.preventDefault();
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
            console.log("Need a resume.");
            return;
        }

        // check that a resume has been uploaded
        if (!resumeFile) {
            // if not, show error message
            this.showNoResumeBanner();
            return;
        }

        // check the file type, show error banner if wrong file type
        if (!this.isValidFileType(resumeFile.name)) {
            this.showWrongFileTypeBanner();
            return;
        }

        let resumeData = new FormData();
        resumeData.append("name", name);
        resumeData.append("skills", skills);
        resumeData.append("desiredCareers", desiredCareers);
        resumeData.append("email", email);
        resumeData.append("resumeFile", resumeFile);

        this.setState({uploadingResume: true});
        //axios.post("/api/resumeScorer/uploadResume", {name, skills, desiredCareers, email, resumeFile})
        axios.post("/api/resumeScorer/uploadResume", resumeData)
        .then(result => {
            // go to screen saying upload was successful
            this.setState({uploadingResume: false, doneUploading: true});
            // scroll up to top
            window.scrollTo(0,0);
        })
        .catch(err => {
            this.setState({uploadingResume: false, open: false}, () => {
                this.props.addNotification("Error uploading, try again later.", "error");
            });
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
            let uploadPart1Class = "resumeAnalysisUploadStep";
            let uploadPart2Class = "resumeAnalysisUploadStep";
            // if we're on step 2, put the second step in the frame
            if (this.state.uploadStepTwo) {
                uploadPart2Class = uploadPart2Class + " inFrame";
            }
            // otherwise put the first step in the frame
            else {
                uploadPart1Class = uploadPart1Class + " inFrame";
            }
            const uploadDialog = (
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
                            <div className={uploadPart1Class}>
                                <div className="blueTextImportant font36px font30pxUnder700 font26pxUnder500">
                                    Upload Your Resume
                                </div>
                                <input
                                    name="resumeFile"
                                    type="file"
                                    ref="resumeFile"
                                    accept="image/jpg,image/png,application/pdf,application/msword"
                                    style={{margin:"20px 0"}}
                                />
                                <RaisedButton
                                    label="Continue"
                                    onClick={this.goToStepTwo.bind(this)}
                                    primary={true}
                                    className="raisedButtonWhiteText"
                                />
                            </div>
                            <div className={uploadPart2Class}>
                                <div className="blueTextImportant font36px font30pxUnder700 font26pxUnder500">
                                    How Should We Contact You?
                                </div>
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
                                <Field
                                    name="desiredCareers"
                                    component={renderTextField}
                                    label="Desired Careers"
                                /> < br/>
                                <Field
                                    name="skills"
                                    component={renderTextField}
                                    label="Top 3 Skills"
                                /><br/>
                                <RaisedButton
                                    label="Back"
                                    onClick={this.goToStepOne.bind(this)}
                                    primary={true}
                                    className="raisedButtonWhiteText"
                                    style={{margin: "10px"}}
                                />
                                <RaisedButton
                                    label="Submit"
                                    type="submit"
                                    primary={true}
                                    className="raisedButtonWhiteText"
                                    style={{margin: "10px"}}
                                />
                            </div>
                            {this.state.showNoResumeBanner ?
                                <div>
                                    Upload a resume first!
                                </div>
                                : null
                            }
                            {this.state.showWrongFileTypeBanner ?
                                <div>
                                    Only accepts .jpg, .jpeg, .png, .pdf, .doc, .docx
                                </div>
                                : null
                            }
                        </form>
                    }
                </Dialog>
            );

            page = (
                <div>
                    <div className={"fullHeight redToLightRedGradient" + blurredClass}>
                        { uploadDialog }

                        <HomepageTriangles style={{pointerEvents: "none"}} variation="4"/>
                        <div className="infoBox whiteText font40px font24pxUnder500"
                             style={{zIndex: "20", marginTop: '-10px'}}>
                            How does your resume score?
                            <div className="font24px font18pxUnder500">
                                Comparative analysis, skills breakdown and <div className="br above700only"><br/></div>data-driven suggestions.
                            </div>
                            <button
                                className="bigOutlineButton whiteText font30px font20pxUnder500 redToLightRedGradientButton"
                                onClick={this.handleOpen}
                            >
                                <div>
                                    &#8679;
                                </div>
                                Get a Free Resume Analysis
                            </button> <br/>
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
                    <div style={{marginTop: '60px', marginBottom: '40px', overflow: 'auto'}} className="center">
                        <div style={styles.horizListArrow}>
                            <div className="horizListFull">
                                <div className="horizListText">
                                    <img
                                        alt="Resume Icon"
                                        src="/icons/Resume.png"
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
                                        alt="Data Icon"
                                        src="/icons/Data2.png"
                                        style={styles.horizListIcon}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="center">
                        <div className="font26px font20pxUnder700" style={{maxWidth: "1000px", margin: "20px auto"}}>
                            From a static document to actionable insights and data.
                        </div>
                    </div>

                    <div className="redToLightRedSpacer" id="picturesToPathwaysHomepageSpacer"/>

                    <div style={{marginTop: '60px', marginBottom: '40px', overflow: 'auto'}}>
                        <div style={styles.horizList}>
                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginLeft: "20%"}}
                                >
                                    <div className="horizListText font20px font16pxUnder800 font12pxUnder700">
                                        <img
                                            alt="Puzzle Icon"
                                            src="/icons/Puzzle2.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        Position and Industry <div className="above600only"><br/></div>Recommendations
                                    </div>
                                </div>
                            </div>

                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginLeft: "5%", marginRight: '5%'}}>
                                    <div className="horizListText font20px font16pxUnder800 font12pxUnder700">
                                        <img
                                            alt="Lightbulb Icon"
                                            src="/icons/Lightbulb3.png"
                                            style={styles.horizListIcon}
                                        /><br/>
                                        Courses for Skills <div className="above600only"><br/></div>Training
                                    </div>
                                </div>
                            </div>
                            <div className="horizListFull">
                                <div className="horizListSpacer" style={{marginRight: "20%"}}>
                                    <div className="horizListText font20px font16pxUnder800 font12pxUnder700">
                                        <img
                                            alt="Trophy Icon"
                                            src="/icons/Trophy2.png"
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
                                Get a Free Resume Analysis
                            </div>
                        </button>
                    </div>
                    <div className="redToLightRedDownGradient center" style={{marginTop: '60px', overflow: 'auto', paddingBottom: '70px', paddingTop: '30px'}}>
                        <ul className="horizListQuotes">
                            <li className="horizListFull2">
                                <Paper className="paperBorder" style={{minHeight: "352px", width: "270px", margin:'auto'}} zDepth={3}>
                                    <Paper style={styles.imgContainer} zDepth={3}>
                                        <img
                                            src="/images/MarkSaari.png"
                                            alt="Profile picture"
                                            style={styles.imgMark}
                                        />
                                    </Paper>
                                        <div className="center">
                                            <b className="font20px font18pxUnder500">Mark Saari</b>
                                            <div style={{color: '#7d97ad'}} className="font16px font14pxUnder500">
                                                UW-MADISON
                                            </div>
                                            <br />
                                            <div className="font14px font12pxUnder500" style={{width: '200px', margin:'auto'}}>
                                                {'"'}Today, everyone has a competitive resume.
                                                Moonshot helped me to differentiate myself and pointed out areas where I could improve.{'"'}
                                            </div>
                                        </div>
                                </Paper>
                            </li>
                            <li className="horizListFull2 horizListMargin1">
                                <Paper className="paperBorder" style={{minHeight: "352px", width: "270px", margin:'auto'}} zDepth={3}>
                                    <Paper style={styles.imgContainer} zDepth={3}>
                                        <img
                                            src="/images/JadaFalzon.png"
                                            alt="Profile picture"
                                            style={styles.imgJada}
                                        />
                                    </Paper>
                                        <div className="center">
                                            <b className="font20px font16pxUnder500">Jada Falzon</b>
                                            <div style={{color: '#7d97ad'}} className="font16px font12pxUnder500">
                                                ALVERNO COLLEGE
                                            </div>
                                            <br />
                                            <div className="font14px font12pxUnder500" style={{width: '200px', margin:'auto'}}>
                                                {'"'}The resume analysis is a great asset to evaluate my resume before applying for a job.
                                                This helps make my resume a 'stand out' among others who didn’t use the analysis.{'"'}
                                            </div>
                                        </div>
                                </Paper>
                            </li>
                            <li className="horizListFull2 horizListMargin2">
                                <Paper className="paperBorder" style={{minHeight: "352px", width: "270px", margin:'auto'}} zDepth={3}>
                                    <Paper style={styles.imgContainer} zDepth={3}>
                                        <img
                                            src="/images/CamRowe.png"
                                            alt="Profile picture"
                                            style={styles.imgCam}
                                        />
                                    </Paper>
                                    <div className="center">
                                        <b className="font20px font18pxUnder500">Cameron Rowe</b>
                                        <div style={{color: '#7d97ad'}} className="font16px font14pxUnder500">
                                            UW-MADISON
                                        </div>
                                        <br />
                                        <div className="font14px font12pxUnder500" style={{width: '200px', margin:'auto'}}>
                                            {'"'}Resumes are difficult to quantify and compare against other people.
                                            It’s a game changer when you can translate it to actionable data.{'"'}
                                        </div>
                                    </div>
                                </Paper>
                            </li>
                        </ul>
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
                        Submitted
                        <div className="font24px font18pxUnder500">
                            {"You'll receive an email with your Resume Analysis within 48 hours."}
                        </div>
                    </div>
                </div>
            );
        }


        return (
            <div className="jsxWrapper noOverflowX">
                <MetaTags>
                    <title>Resume Analysis | Moonshot</title>
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
    return bindActionCreators({
        addNotification
    }, dispatch);
}

ResumeScorer = reduxForm({
    form: 'resumeUpload',
    validate,
})(ResumeScorer);

export default connect(mapStateToProps, mapDispatchToProps)(ResumeScorer);
