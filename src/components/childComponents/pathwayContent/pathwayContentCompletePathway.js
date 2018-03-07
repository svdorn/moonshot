import React, {Component} from 'react';
import {Paper, CircularProgress} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';
import {completePathway} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';

class PathwayContentCompletePathway extends Component {
    constructor(props) {
        super(props);

        let hasUser = false;
        let email = "";
        let phoneNumber = "";
        if (props.currentUser) {
            const user = props.currentUser;
            hasUser = true;
            if (user.emailToContact) {
                email = user.emailToContact;
            } else if (user.email) {
                email = user.email;
            }

            if (user.phoneNumber) {
                phoneNumber = user.phoneNumber;
            }
        }

        this.state = {
            hasUser, email, phoneNumber
        }
    }


    onEmailChange = (e) => {
        this.setState({
            ...this.state,
            email: e.target.value
        })
    }


    onPhoneChange = (e) => {
        this.setState({
            ...this.state,
            phoneNumber: e.target.value
        })
    }


    handleClick() {
        const pathway = this.props.pathway;
        const currentUser = this.props.currentUser;
        console.log(currentUser);
        console.log(pathway);
        const user = {
            userName: currentUser.name,
            pathwayName: pathway.name,
            pathwayId: pathway._id,
            _id: currentUser._id,
            verificationToken: currentUser.verificationToken,
            email: this.state.email,
            phoneNumber: this.state.phoneNumber,
            skills: pathway.skills,
            referralCode: currentUser.answers[pathway.referralQuestionId].value
        };

        this.props.completePathway(user);

    }

    render() {
        return (
            <div className={this.props.className} style={{...this.props.style}}>
                <div className="center" style={{marginBottom: "10px"}}>
                    <h4 className="marginTop20px blueText font30px">Be Ready</h4>

                    {"We will review your results and let you know in the next 48 hours if you meet this position's requirements."}
                    <br/>
                    {"Verify your contact info so we can reach out to you if you advance to the next round."}
                    <br/>
                    <input
                        placeholder="Email address"
                        value={this.state.email}
                        type="text"
                        onChange={this.onEmailChange}
                        className="lightBlueBoxInput"
                    />
                    <input
                        placeholder="Phone number"
                        value={this.state.phoneNumber}
                        type="text"
                        onChange={this.onPhoneChange}
                        className="lightBlueBoxInput"
                    />

                    <div style={{marginRight: "20px", marginLeft: "20px"}}>
                        {"Click this button to complete the pathway."}
                    </div>
                    <button className="outlineButton font24px font20pxUnder500 whiteBlueButton"
                            onClick={this.handleClick.bind(this)}>
                        <div className="blueText">
                            Complete Pathway
                        </div>
                    </button>
                    {this.props.loadingEmailSend ?
                        <div className="center"><CircularProgress style={{marginTop: "20px"}}/></div>
                        : null}
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        completePathway
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loadingEmailSend: state.users.loadingSomething
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PathwayContentCompletePathway);
