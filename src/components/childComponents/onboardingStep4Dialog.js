"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { generalAction } from "../../actions/usersActions";
import {  } from "../../miscFunctions";
import { Dialog } from 'material-ui';
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../colors";

class OnboardingStep4Dialog extends Component {
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
        this.props.generalAction("CLOSE_ONBOARDING_4_MODAL");
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
                <div style={{width: "75%", margin: "auto"}}>
                    <div className="secondary-gray marginTop40px font20px font18pxUnder700 font16pxUnder500">
                        All else fails if this last step is not completed.
                    </div>
                    <div className="marginTop30px font24px font22pxUnder700 font16pxUnder500">
                        <button className="button noselect round-6px background-primary-cyan primary-white" onClick={this.handleClose} style={{padding: "3px 10px"}}>
                            <span>{"I'm Ready"}</span>
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
        modalOpen: state.users.onboardingStep4Open,
        loading: state.users.loadingSomething
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generalAction
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(OnboardingStep4Dialog);
