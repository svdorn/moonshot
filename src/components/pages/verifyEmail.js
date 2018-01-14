"use strict"
import React, { Component } from 'react';
import { verifyEmail } from '../../actions/usersActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Paper, RaisedButton } from 'material-ui';
import HomepageTriangles from '../miscComponents/HomepageTriangles';

class VerifyEmail extends Component {

    onVerifyClick() {
        const token = this.props.location.search.substr(1);
        this.props.verifyEmail(token);
    }

    render() {
        console.log("props: ", this.props);

        return(
            <div className="fullHeight greenToBlue center">
                <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />
                <div className="form lightWhiteForm">
                    <h1>Verify Email</h1>
                    <button
                        className="semiOpaqueWhiteBlueButton smallText2"
                        onClick={this.onVerifyClick.bind(this)}
                    >
                        Verify my account
                    </button>
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
