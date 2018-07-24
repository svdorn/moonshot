"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import { Dialog, CircularProgress } from "material-ui";
import AddUserDialog from '../childComponents/addUserDialog';
import { openAddUserModal, addNotification } from '../../actions/usersActions';
import { isValidFileType } from "../../miscFunctions";

class ImportCandidates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // modal to import candidate csv
            importModalOpen: false,
            // the csv containing candidate information
            file: undefined,
            // whether file is currently uploading
            uploadingFile: false
        }
    }


    // open the modal that lets the user import a csv
    openImportCSV() {
        this.setState({ importModalOpen: true });
    }


    // close the modal that lets the user import a csv
    handleCSVModalClose() {
        this.setState({ importModalOpen: false });
    }


    // input containing the candidates csv changed
    inputChange() {
        // try to get the file that was selected
        try { var file = this.refs.importCandidateInput.files[0]; }
        catch (getFileError) {
            console.log(getFileError);
            this.setState({ file: undefined });
            return;
        }

        this.setState({ file })
    }


    // the modal that lets you upload a csv of candidates to add
    createCSVModal() {
        return (
            <Dialog
                modal={false}
                open={this.state.importModalOpen}
                onRequestClose={this.handleCSVModalClose.bind(this)}
                autoScrollBodyContent={true}
                paperClassName="upload-candidate-csv-dialog-paper"
                contentClassName="center"
                className="upload-candidate-csv-dialog"
            >
                <input
                    id="import-candidate-input"
                    name="importCandidateInput"
                    type="file"
                    ref="importCandidateInput"
                    accept=".csv,application/pdf"
                    onChange={this.inputChange.bind(this)}
                    style={{opacity:"0", position:"absolute"}}
                />

                <div className="drag-drop-container primary-white">
                    <img
                        src={"/icons/Upload" + this.props.png}
                        className="upload-icon"
                    />
                    <div className="primary-cyan font24px">{"Drag and Drop"}</div>
                    <div className="drag-file-here">
                        {"Drag a file here or "}
                        <label
                            htmlFor="import-candidate-input"
                            className="primary-cyan clickable"
                        >
                            {"browse"}
                        </label>
                        {" for a file to upload."}
                    </div>
                    {this.state.file ? this.state.file.name : ""}
                </div>
            </Dialog>
        )
    }


    // deletes the candidate csv from state
    removeFile() {
        this.setState({ file: undefined });
    }


    // move on to the next step
    next() {
        // get the given file from state (may be undefined)
        const file = this.state.file;
        // if the user is trying to upload a candidate file ...
        if (file) {
            // ... make sure the file type is valid
            // if (!isValidFileType(file.name, ["csv"])) {
            //     // if it isn't, alert the user that they need a different file
            //     this.props.addNotification("Invalid file type! Must be .csv", "error");
            //     return;
            // }

            // mark file as currently uploading so that loading circle shows up
            this.setState({ uploadingFile: true });

            // upload the file and move on to the next step in the back-end
            let args = new FormData();
            args.append("userId", this.props.currentUser._id);
            args.append("verificationToken", this.props.verificationToken);
            args.append("file", file);
            axios.post("/api/business/uploadCandidateCSV", args)
            .then(response => {
                // success, go on to the next step
                moveOn();
            })
            // if there is an error uploading the csv ...
            .catch(error => {
                // ... let the user know that there was an error
                this.props.addNotification("Error uploading file, add users manually or contact support.", "error");
                // go on to the next step
                moveOn();
            })
        }
        // no file uploaded, move on to the next step
        else { moveOn() }

        // function that uses parent's 'next' function to advance to next step
        function moveOn() {
            // make sure file upload circle no longer is there
            this.setState({ uploadingFile: false });

            //this.props.next();
            console.log("moving to next step!");
        }
    }


    render() {
        const fileUploadArea = this.state.file ?
            (
                <div className="inlineBlock">
                    <div className="file-name inlineBlock">{this.state.file.name}</div>
                    <span
                        onClick={this.removeFile.bind(this)}
                        className="clickable secondary-red"
                        style={{marginLeft:"10px", verticalAlign:"top"}}
                    >x</span>
                </div>
            )
            :
            (
                <div
                    onClick={this.openImportCSV.bind(this)}
                    className="button medium background-primary-cyan round-4px inlineBlock"
                >
                    {"Upload CSV"}
                </div>
            );

        return (
            <div className="import-candidates primary-white center">
                { this.createCSVModal() }
                <AddUserDialog tab="Candidate"/>
                <div>{"Import Candidates"}</div>
                <div className="font18px">
                    {"Once your candidates have been uploaded, they will be invited to complete the application. Make sure their contact emails are included."}
                </div>
                <div className="font18px invite-options">
                    { fileUploadArea }
                    <span>{"or"}</span>
                    <div
                        onClick={this.props.openAddUserModal}
                        className="inlineBlock clickable underline"
                    >
                        {"Manually Invite"}
                    </div>
                </div>
                <div>
                    You can manually invite candidates at any time by going to Account&nbsp;&nbsp;>&nbsp;&nbsp;Add User&nbsp;&nbsp;>&nbsp;&nbsp;Candidate.
                </div>
                <div className="previous-next-area font18px center">
                    <div
                        className="previous noselect clickable underline inlineBlock"
                    >
                        Previous
                    </div>
                    <div
                        className="button noselect round-4px background-primary-cyan inlineBlock"
                        onClick={this.next.bind(this)}
                    >
                        Next
                    </div>
                    { this.state.uploadingFile ? <CircularProgress color="#FB553A" /> : null }
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        png: state.users.png
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        openAddUserModal,
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(ImportCandidates);








































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
        axios.post("/api/misc/resumeScorer/uploadResume", resumeData)
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
