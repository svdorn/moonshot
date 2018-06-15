"use strict"
import React, { Component } from 'react';
import { agreeToTerms } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class AgreeToTerms extends Component {
    constructor(props) {
        super(props);

        // if userChecked is true, render the child component
        this.state = { agreeingToTerms: false };
    }


    handleCheckMarkClick() {
        this.setState({ agreeingToTerms: !this.state.agreeingToTerms });
    }


    createAgreementLinks() {
        // figure out which agreements are necessary
        let agreements = [
            {name: "Privacy Policy", link: "privacyPolicy"},
            {name: "Terms of Use", link: "termsOfUse"}
        ];
        if (this.props.currentUser.userType === "accountAdmin" && this.props.currentUser.firstBusinessUser === true) {
            agreements.push({name: "Service Level Agreement", link: "serviceLevelAgreement"});
        }

        let links = [];

        // go through each necessary agreement and add a link to it.
        for (let i = 0; i < agreements.length; i++) {
            const agreement = agreements[i];
            // add a comma if this is the second element onward, but only if there are more than two links
            const comma = i === 0 && agreements.length > 2 ? ", " : " ";
            // add 'and' right before the last element
            const and = i === agreements.length - 1 && i > 0 ? "and " : "";
            links.push(comma + and);
            links.push(<a className="blueTextHome" href={`/${agreement.link}`} target="_blank">{agreement.name}</a>);
        }

        return links;
    }


    render() {
        return (
            <div>
                <div className="headerSpace" />
                <div className="fillScreen center">
                    <div className="form lightBlackForm" style={{padding: "10px 20px 20px"}}>
                        <h1 className="whiteText marginTop20px">Terms and Conditions</h1>
                        <div className="checkbox smallCheckbox whiteCheckbox"
                             onClick={this.handleCheckMarkClick.bind(this)}
                        >
                            <img
                                alt=""
                                className={"checkMark" + this.state.agreeingToTerms}
                                src="/icons/CheckMarkRoundedWhite.png"
                            />
                        </div>
                        I have read and agree to the Moonshot Insights {this.createAgreementLinks()}.
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        agreeToTerms
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AgreeToTerms);
