"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from "axios";
import { CircularProgress } from "material-ui";
import Dialog from '@material-ui/core/Dialog';
import { openAddUserModal, addNotification } from '../../../actions/usersActions';
import { isValidFileType } from "../../../miscFunctions";
import { secondaryGray } from "../../../colors";
import DropZone from "react-dropzone";

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


    // // input containing the candidates csv changed
    // inputChange() {
    //     // try to get the file that was selected
    //     try { var file = this.refs.importCandidateInput.files[0]; }
    //     catch (getFileError) {
    //         console.log(getFileError);
    //         this.setState({ file: undefined });
    //         return;
    //     }
    //
    //     this.setState({ file })
    // }


    // when a file is dropped into the input area
    onDrop(acceptedFiles, rejectedFiles) {
        let file = acceptedFiles.length === 1 ? acceptedFiles[0] : undefined;
        this.setState({ file });
    }


    // the modal that lets you upload a csv of candidates to add
    createCSVModal() {
        return (
            <Dialog
                open={this.state.importModalOpen}
                className="jangus"
                onClose={this.handleCSVModalClose.bind(this)}
                fullWidth={true}
            >
                <div className="upload-candidate-csv-dialog center">
                    <DropZone
                        onDrop={(files) => this.onDrop(files)}
                        className="drop-zone"
                        activeClassName="dragging"
                        multiple={false}
                        accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    >
                        <img
                            src={"/icons/Upload" + this.props.png}
                            className="upload-icon"
                        />
                        <div className="primary-cyan font24px">{"Drag & Drop"}</div>
                        <div className="drag-here-text primary-white">
                            {"Drag a file here or "}
                            <span className="primary-cyan clickable">
                                {"browse"}
                            </span>
                            {" for a file to upload."}
                            {this.state.file ?
                                <div className="font14px" style={{marginTop:"10px"}}>
                                    {this.state.file.name}
                                </div>
                            :
                                null
                            }
                        </div>
                    </DropZone>
                    <div
                        className="medium button round-4px primary-white background-primary-cyan"
                        style={{marginTop:"10px"}}
                        onClick={this.handleCSVModalClose.bind(this)}
                    >
                        {"Continue"}
                    </div>
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
        const self = this;

        // get the given file from state (may be undefined)
        const file = this.state.file;
        // if the user is trying to upload a candidate file ...
        if (file) {
            // ... make sure the file type is valid
            if (!isValidFileType(file.name, ["csv", "xls", "xlsx"])) {
                // if it isn't, alert the user that they need a different file
                this.props.addNotification("Invalid file type! Must be .csv, .xls, or .xlsx", "error");
                return;
            }

            // mark file as currently uploading so that loading circle shows up
            this.setState({ uploadingFile: true });

            // create a reader to read the uploaded file
            const reader = new FileReader();

            // called once the file has been read
            reader.onload = () => {
                // the file after being read
                const readFile = reader.result;
                // args to the api call
                let args = new FormData();
                // add credentials
                args.append("userId", this.props.currentUser._id);
                args.append("verificationToken", this.props.verificationToken);
                // the file to upload
                args.append("candidateFileName", file.name);
                args.append("candidateFile", readFile);
                // upload the file and move on to the next step in the back-end
                axios.post("/api/business/uploadCandidateCSV", args)
                .then(response => {
                    // success, go on to the next step
                    moveOn();
                })
                // if there is an error uploading the csv ...
                .catch(error => {
                    console.log(error);
                    fileError();
                });
            };
            // on file read failures
            reader.onabort = () => fileError();
            reader.onerror = () => fileError();

            // read the file (onload will be called after it is read)
            reader.readAsDataURL(file);
        }
        // no file uploaded, move on to the next step
        else { moveOn() }

        // if there is any error while uploading the file
        function fileError() {
            // ... let the user know that there was an error
            self.props.addNotification("Error uploading file, add users manually or contact support.", "error");
            // go on to the next step
            moveOn();
        }

        // function that uses parent's 'next' function to advance to next step
        function moveOn() {
            // make sure file upload circle no longer is there
            self.setState({ uploadingFile: false });
            // go to the next step
            self.props.next();
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
                {/* this.createCSVModal() */}
                { this.createCSVModal() }
                <div>
                    <div className="font26px primary-cyan">{"Import Candidates"}</div>
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
                    <div className="font14px">
                        You can manually invite candidates at any time by going to Account&nbsp;&nbsp;>&nbsp;&nbsp;Add User&nbsp;&nbsp;>&nbsp;&nbsp;Candidate.
                    </div>
                    <div className="previous-next-area font18px center">
                        <div
                            className="previous noselect clickable underline inlineBlock"
                            onClick={this.props.previous}
                        >
                            Previous
                        </div>
                        <div
                            className="button noselect round-4px background-primary-cyan inlineBlock"
                            onClick={this.next.bind(this)}
                        >
                            Next
                        </div>
                        <br/>
                        { this.state.uploadingFile ? <CircularProgress color={secondaryGray} /> : null }
                    </div>
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
