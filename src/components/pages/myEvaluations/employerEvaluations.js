"use strict"
import React, {Component} from 'react';
import {
    TextField,
    DropDownMenu,
    MenuItem,
    Divider,
    Toolbar,
    ToolbarGroup,
    Dialog,
    FlatButton,
    CircularProgress,
    RaisedButton,
    Paper
} from 'material-ui';
import {connect} from 'react-redux';
import { browserHistory } from "react-router";
import { bindActionCreators } from 'redux';
import { addNotification, startLoading, stopLoading, openAddUserModal, hidePopups, openAddPositionModal } from '../../../actions/usersActions';
import { Field, reduxForm } from 'redux-form';
import MetaTags from 'react-meta-tags';
import axios from 'axios';
import MyEvaluationsPreview from '../../childComponents/myEvaluationsPreview';
import AddUserDialog from '../../childComponents/addUserDialog';
import AddPositionDialog from '../../childComponents/addPositionDialog';
import clipboard from "clipboard-polyfill";
import { goTo, makePossessive } from '../../../miscFunctions';

const required = value => (value ? undefined : 'This field is required.');

const renderTextField = ({input, label, meta: {touched, error}, ...custom}) => (
    <TextField
        hintText={label}
        hintStyle={{color: 'white'}}
        inputStyle={{color: '#72d6f5'}}
        underlineStyle={{color: '#72d6f5'}}
        errorText={touched && error}
        {...input}
        {...custom}
    />
);

class MyEvaluations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            positions: [],
            // true if the business has no positions associated with it
            noPositions: false,
            // logo of the company - doesn't apply for candidates
            logo: undefined,
        }
    }


    componentDidMount() {
        if (this.props.location.query && this.props.location.query.open) {
            this.setState({open: true});
        }
        let self = this;
        const { currentUser } = this.props;

        // get all the positions they're evaluating for
        axios.get("/api/business/positions", {
            params: {
                userId: currentUser._id,
                verificationToken: currentUser.verificationToken
            }
        })
        .then(res => {
            self.positionsFound(res.data.positions, res.data.logo);
        })
        .catch(err => {
            console.log("error getting positions: ", err);
            if (err.response && err.response.data) { console.log(err.response.data); }
        });
    }

    // call this after positions are found from back end
    positionsFound(positions, logo) {
        if (Array.isArray(positions) && positions.length > 0) {
            this.setState({ positions, logo });
        } else {
            this.setState({ noPositions: true });
        }
    }

    positionsUpdate(positions) {
        if (Array.isArray(positions) && positions.length > 0) {
            // add the position to the end of the list
            let position = positions[positions.length-1];
            let newPositions = this.state.positions;
            position.completions = 0;
            position.usersInProgress = 0;
            newPositions.push(position);
            this.setState({ positions: newPositions });
        } else {
            this.setState({ noPositions: true });
        }
    }


    copyLink() {
        let URL = "https://moonshotinsights.io/apply/" + this.props.currentUser.businessInfo.uniqueName;
        URL = encodeURI(URL);
        clipboard.writeText(URL);
        this.props.addNotification("Link copied to clipboard", "info");
    }

    hideMessage() {
        let popups = this.props.currentUser.popups;
        if (popups) {
            popups.evaluations = false;
        } else {
            popups = {};
            popups.evaluations = false;
        }

        const userId = this.props.currentUser._id;
        const verificationToken = this.props.currentUser.verificationToken;

        this.props.hidePopups(userId, verificationToken, popups);
    }

    popup() {
        if (this.props.currentUser && this.props.currentUser.popups && this.props.currentUser.popups.evaluations) {
            return (
                <div className="center marginBottom15px" key="popup box">
                    <div className="popup-box font16px font14pxUnder700 font12pxUnder500">
                        <div className="popup-frame" style={{paddingBottom:"20px"}}>
                            <div>
                                <img
                                    alt="Alt"
                                    src={"/icons/evaluationsBanner" + this.props.png}
                                />
                            </div>
                            <div style={{marginTop:"20px"}}>
                                <div className="primary-cyan font20px font18pxUnder700 font16pxUnder500">An Overview of Your Evaluations</div>
                                <div>
                                    See the activity for each evaluation, invite employees to be evaluated to customize predictions, invite candidates
                                    and add evaluations for any open position.
                                </div>
                            </div>
                        </div>
                        <div className="hide-message font14px font12pxUnder700" onClick={this.hideMessage.bind(this)}>Hide Message</div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }


    // open the modal to add a new position
    openAddPositionModal = () => {
        this.props.openAddPositionModal();
    }


    render() {
        const style = {
            anchorOrigin: {
                vertical: "top",
                horizontal: "left"
            },
            menuLabelStyle: {
                fontSize: "18px",
                color: "white"
            }
        }

        const actions = [
            <FlatButton
                label="Close"
                onClick={this.handleClose}
                className="primary-white-important"
            />,
        ];

        let evaluations = (
            <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                Loading evaluations...
            </div>
        );

        if (this.state.noPositions) {
            evaluations = (
                <div className="center" style={{color: "rgba(255,255,255,.8)"}}>
                    No evaluations.
                </div>
            )
        }

        // create the evaluation previews
        let key = 0;
        let self = this;

        const { currentUser } = this.props;
        const { businessName } = currentUser.businessInfo;

        if (currentUser && this.state.positions.length !== 0) {
            const userType = currentUser.userType;

            evaluations = this.state.positions.map(position => {
                key++;
                // make sure position is the right type
                if (position && typeof position === "object") {
                    let attributes = {};
                    attributes.variation = "edit";
                    attributes.name = position.name;
                    attributes.logo = self.state.logo;
                    attributes.length = position.length;
                    attributes.positionKey = position._id;
                    attributes.skills = position.skillNames;
                    attributes.company = businessName;
                    attributes.completions = position.completions;
                    attributes.timeAllotted = position.timeAllotted;
                    attributes.usersInProgress = position.usersInProgress;

                    return (
                        <li style={{marginTop: '35px', listStyleType:"none"}}
                            key={key}
                        >
                            <MyEvaluationsPreview {...attributes} />
                        </li>
                    );
                }
                // if position is not the right type, don't show a position preview
                else { return null; }
            });

        }

        if (this.state.positions.length !== 0) {
            var link = (
                <div className="secondary-gray font16px font14pxUnder900 font12pxUnder500" style={{width:"95%", margin:"20px auto 20px"}}>
                    { makePossessive(currentUser.businessInfo.businessName) } candidate invite page&nbsp;
                    <button className="button gradient-transition inlineBlock gradient-1-cyan gradient-2-purple-light round-4px font16px font14pxUnder900 font12pxUnder500 primary-white" onClick={this.copyLink.bind(this)} style={{padding: "2px 4Spx"}}>
                        {"Get Link"}
                    </button>
                </div>
            );
            let attributes = {};
            attributes.variation = "edit";
            attributes.name = "Web Developer";
            attributes.logo = this.state.logo;
            attributes.length = 25;
            attributes.skills = ["HTML", "Javascript"];
            attributes.company = businessName;
            attributes.completions = 0;
            attributes.timeAllotted = 30;
            attributes.usersInProgress = 0;
            attributes.buttonsNotClickable = true;
            key++;

            evaluations.push (
                <li style={{marginTop: '35px', listStyleType:"none"}}
                    key={key}
                >
                    <div style={{filter:"blur(5px)"}}>
                        <MyEvaluationsPreview
                            {...attributes}
                            style={{pointerEvents: "none"}}
                            className="noselect"
                        />
                    </div>
                    <div className="font24px font22pxUnder700 font18pxUnder500 center addEval" onClick={this.openAddPositionModal}>
                        <button className="button gradient-transition inlineBlock gradient-1-cyan gradient-2-purple-light round-4px primary-white"style={{padding: "2px 4Spx"}}>
                            {"Add Evaluation"}
                        </button>
                        <div className="font16px font14pxUnder700 font12pxUnder500 secondary-gray">
                            There{"'"}s no cost for adding evaluations
                        </div>
                    </div>
                </li>
            );
        }

        return(
            <div className="jsxWrapper blackBackground fillScreen" style={{paddingBottom: "20px"}} ref='myEvaluations'>
                {this.props.currentUser.userType == "accountAdmin" ? <AddUserDialog /> : null}
                <MetaTags>
                    <title>My Evaluations | Moonshot</title>
                    <meta name="description" content="View the evaluations your company is running."/>
                </MetaTags>

                <AddPositionDialog/>

                <div className="page-line-header"><div/><div>Evaluations</div></div>

                { this.popup() }

                <div className="center">
                    { link }
                </div>
                <div className="marginBottom60px">
                    { evaluations }
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        addNotification,
        startLoading,
        stopLoading,
        openAddUserModal,
        openAddPositionModal,
        hidePopups
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        formData: state.form,
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething,
        png: state.users.png
    };
}

MyEvaluations = reduxForm({
    form: 'addEval',
})(MyEvaluations);

export default connect(mapStateToProps, mapDispatchToProps)(MyEvaluations);
