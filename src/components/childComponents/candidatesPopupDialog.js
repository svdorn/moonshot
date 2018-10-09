"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { generalAction } from "../../actions/usersActions";
import {  } from "../../miscFunctions";
import {
    TextField,
    DropDownMenu,
    MenuItem,
    Divider,
    Toolbar,
    Dialog,
    FlatButton,
    CircularProgress,
    RaisedButton,
    Paper
} from 'material-ui';

class CandidatesPopupDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false
        }

        this.handleClose = this.handleClose.bind(this);
    }

    componentDidUpdate() {
        // make sure the props defining whether the modal is open matches the state for that
        if (this.props.modalOpen != undefined && this.props.modalOpen != this.state.open) {
            this.setState({ open: this.props.modalOpen })
        }
    }

    handleClose = () => {
        this.props.generalAction("CLOSE_CANDIDATES_POPUP_MODAL");
    };

    render() {
        const dialog = (
            <Dialog
                modal={false}
                open={this.state.open}
                autoScrollBodyContent={true}
                paperClassName="dialogForBiz"
                contentClassName="center"
            >
                <div>
                    <div className="primary-cyan font18px font16pxUnder700">
                        View Mock Data
                    </div>
                    <div className="secondary-gray font14px font12pxUnder700" style={{textAlign: "left"}}>
                        We populated mock data for you to play around with. This will give you a sense of
                        what things look like once you have candidates.
                    </div>
                    <div>
                        <button className="button noselect round-6px background-primary-cyan primary-white" onClick={this.handleClose} style={{padding: "3px 10px"}}>
                            <span>Check It Out</span>
                        </button>
                    </div>
                </div>
            </Dialog>
        );

        return (
            <div>
                {dialog}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        modalOpen: state.users.candidatesPopupModalOpen,
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generalAction
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CandidatesPopupDialog);
