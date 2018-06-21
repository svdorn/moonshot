"use strict"
import React, { Component } from 'react';
import { agreeToTerms, addNotification } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CircularProgress } from "material-ui";

class AgreeToTerms extends Component {
    constructor(props) {
        super(props);

        // figure out which agreements are necessary
        let agreements = [
            {name: "Privacy Policy", link: "privacyPolicy"},
            {name: "Terms of Use", link: "termsOfUse"}
        ];
        if (this.props.currentUser.userType === "accountAdmin" && this.props.currentUser.firstBusinessUser === true) {
            agreements.push({name: "Service Level Agreement", link: "serviceLevelAgreement"});
        }

        // if userChecked is true, render the child component
        this.state = { agreedToTerms: false, agreements };
    }


    handleCheckMarkClick() {
        this.setState({ agreedToTerms: !this.state.agreedToTerms });
    }


    agreeToTerms() {
        if (this.state.agreedToTerms) {
            this.props.agreeToTerms(this.props.currentUser._id, this.props.currentUser.verificationToken, this.state.agreements);
        } else {
            this.props.addNotification("Must agree to terms and conditions to continue.", "error");
        }
    }


    createAgreementLinks() {
        const agreements = this.state.agreements;

        let links = [];

        // go through each necessary agreement and add a link to it.
        for (let i = 0; i < agreements.length; i++) {
            const agreement = agreements[i];
            // add a comma if this is the second element onward, but only if there are more than two links
            const comma = i === 0 && agreements.length > 2 ? ", " : " ";
            // add 'and' right before the last element
            const and = i === agreements.length - 1 && i > 0 ? "and " : "";
            links.push(comma + and);
            links.push(<a key={agreement.name} className="blueTextHome" href={`/${agreement.link}`} target="_blank">{agreement.name}</a>);
        }

        return links;
    }


    render() {
        return (
            <div>
                <div className="headerSpace" />
                <div className="fillScreen center">
                    <div className="form lightBlackForm" style={{padding: "10px 20px 20px"}}>
                        <h1 className="whiteText" style={{margin: "20px 0 40px"}}>Terms and Conditions</h1>
                        <div className="checkbox smallCheckbox whiteCheckbox"
                             onClick={this.handleCheckMarkClick.bind(this)}
                        >
                            <img
                                alt=""
                                className={"checkMark" + this.state.agreedToTerms}
                                src={"/icons/CheckMarkRoundedWhite" + this.props.png}
                            />
                        </div>
                        I have read and agree to the Moonshot Insights {this.createAgreementLinks()}.
                        <br/>
                        {this.props.loading ?
                            <CircularProgress style={{margin: "20px 0"}} color="#FB553A" />
                            : <div style={{margin: "20px 0"}} className="skillContinueButton" onClick={this.agreeToTerms.bind(this)}>Continue</div>
                        }

                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        agreeToTerms,
        addNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        loading: state.users.loadingSomething,
        png: state.users.png
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AgreeToTerms);
