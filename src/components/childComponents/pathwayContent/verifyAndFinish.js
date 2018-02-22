import React, {Component} from 'react';
import {Paper} from 'material-ui';
import {connect} from 'react-redux';
import axios from 'axios';

class VerifyAndFinish extends Component {
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
        console.log(e.target.value);
    }


    render() {
        return (
            {this.state.hasUser ?
                <div>
                    {"Tell us which email address you'd like us to contact you at if"
                    + " you make it to the next round:"}
                    <br/>
                    <input
                        placeholder="Email address"
                        value={this.state.email}
                        type="text"
                        onChange={onEmailChange}
                    />
                    <br/>
                    <input
                        placeholder="Phone number"
                        value={this.state.phoneNumber}
                        type="text"
                        onChange={onPhoneChange}
                    />
                </div>
            :
                <div>
                    Error: No user found
                </div>
            }
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps)(VerifyAndFinish);
