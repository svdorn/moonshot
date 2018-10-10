"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { generalAction } from "../../actions/usersActions";
import {  } from "../../miscFunctions";
import { Dialog } from 'material-ui';
import CircularProgress from "@material-ui/core/CircularProgress";
import { primaryCyan } from "../../colors";

class ROIOnboardingDialog extends Component {
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
        this.props.generalAction("CLOSE_ROI_ONBOARDING_MODAL");
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
                    <div className="primary-cyan font24px font20pxUnder700 font18pxUnder500 marginTop20px">
                        ROI-Driven Onboarding
                    </div>
                    <div className="secondary-gray marginTop10px font16px font14pxUnder700 font12pxUnder500" style={{textAlign: "left"}}>
                        You can invite unlimited candidates to complete your evaluation and hire your first candidate for free if you complete all four onboarding steps (~8 minutes total)
                        anytime in the next 24 hours.
                    </div>
                    <div className="marginTop20px font18px font16pxUnder700">
                        {!this.props.loading ?
                            <button className="button noselect round-6px background-primary-cyan primary-white" onClick={this.handleClose} style={{padding: "3px 10px"}}>
                                <span>{"Let's Do This"}</span>
                            </button>
                            :
                            <div className="center marginTop20px">
                                <CircularProgress style={{ color: primaryCyan }} />
                            </div>
                        }
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
        modalOpen: state.users.roiOnboardingOpen,
        loading: state.users.loadingSomething
    };
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        generalAction
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ROIOnboardingDialog);
