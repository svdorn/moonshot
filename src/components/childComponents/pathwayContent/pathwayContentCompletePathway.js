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
        const user = {
            userName: this.props.currentUser.name,
            pathwayName: this.props.pathway.name,
            pathwayId: this.props.pathway._id,
            _id: this.props.currentUser._id,
            verificationToken: this.props.currentUser.verificationToken,
            email: this.state.email,
            phoneNumber: this.state.phoneNumber
        };

        this.props.completePathway(user);

    }

    render() {
        return (
            <div className={this.props.className} style={{...this.props.style}}>
                <div className="center" style={{marginBottom: "10px"}}>
                    <h4>Finish</h4>

                    {"Tell us where to contact you if you make it to the next round:"}
                    <br/>
                    <input
                        placeholder="Email address"
                        value={this.state.email}
                        type="text"
                        onChange={this.onEmailChange}
                    />
                    <br/>
                    <input
                        placeholder="Phone number"
                        value={this.state.phoneNumber}
                        type="text"
                        onChange={this.onPhoneChange}
                    />

                    <div style={{marginRight: "20px", marginLeft: "20px"}}>
                        {"Click this button to complete the pathway and we'll be in contact with you within 48 hours."}
                    </div>
                    <button className="outlineButton font30px font20pxUnder500 whiteBlueButton"
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
