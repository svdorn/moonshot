"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dialog } from "material-ui";
import AddUserDialog from '../childComponents/addUserDialog';
import { openAddUserModal } from '../../actions/usersActions';

class ImportCandidates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            importModalOpen: false
        }
    }


    // open the modal that lets the user import a csv
    openImportCSV() {
        importModalOpen: true
    }


    // close the modal that lets the user import a csv
    handleCSVModalClose() {
        this.setState({ importModalOpen: false });
    }


    render() {
        // the modal that allows users to import csvs with candidate info
        const importCSVModal = (
            <Dialog
                modal={false}
                open={this.state.importModalOpen}
                onRequestClose={this.handleCSVModalClose.bind(this)}
                autoScrollBodyContent={true}
                paperClassName="dialogForBiz"
                contentClassName="center"
            >
                <div className="drag-drop-container">
                    <div>{"Drag and Drop"}</div>
                    <div>{"Drag a file here or "}{"browse"}{" for a file to upload."}</div>
                </div>
            </Dialog>
        );


        return (
            <div className="import-candidates primary-white center">
                <AddUserDialog tab="Candidate"/>
                <div>{"Import Candidates"}</div>
                <div className="font18px">
                    {"Once your candidates have been uploaded, they will be invited to complete the application. Make sure their contact emails are included."}
                </div>
                <div className="font18px invite-options">
                    <div
                        onClick={this.openImportCSV.bind(this)}
                        className="button medium background-primary-cyan round-4px inlineBlock"
                    >
                        {"Upload CSV"}
                    </div>
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
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        openAddUserModal
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(ImportCandidates)
