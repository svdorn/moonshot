"use strict"
import React, { Component } from 'react';
import { verifyEmail } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import MetaTags from 'react-meta-tags';

class VerifyEmail extends Component {

    onVerifyClick() {
        const token = this.props.location.query.token;
        const userType = this.props.location.query.userType;
        this.props.verifyEmail(userType, token);
    }

    render() {

        return(
            <div className="fillScreen blackBackground formContainer">
                <MetaTags>
                    <title>Verify Email | Moonshot</title>
                    <meta name="description" content="Verify your email to get started on your path to finding the perfect job." />
                </MetaTags>
                <HomepageTriangles className="blurred" style={{pointerEvents:"none"}} variation="5" />
                <div className="form lightBlackForm">
                    <h1 className="whiteText marginTop20px">Verify Email</h1>
                    <div className="marginTop20px marginBottom20px">
                            <button className="veryRoundedButton mediumLargeButton font22px font18pxUnder800 purpleToBlueAnimate whiteText" onClick={this.onVerifyClick.bind(this)} style={{padding: "6px 20px"}}>
                                Verify my Account
                            </button>
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        verifyEmail
    }, dispatch);
}

function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
