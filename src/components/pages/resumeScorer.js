"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {registerForPathway, closeNotification, addPathway} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Divider, Chip} from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
//import './pathway.css';
import axios from 'axios';
import HomepageTriangles from '../miscComponents/HomepageTriangles';
import {browserHistory} from 'react-router';
import MetaTags from 'react-meta-tags';

class ResumeScorer extends Component {
    render() {
        return (
            <div className="jsxWrapper noOverflowX">
                <MetaTags>
                    <title>Resum&eacute; Scorer | Moonshot</title>
                    <meta name="description" content="Get actionable data and skills reports by just uploading your Resume." />
                </MetaTags>
                <div className="fullHeight redToLightRedGradient">
                    <HomepageTriangles style={{pointerEvents: "none"}} variation="4"/>
                    <div className="infoBox whiteText font40px font24pxUnder500"
                         style={{zIndex: "20", marginTop: '-10px'}}>
                        How does your resum&eacute; score?
                        <div className="font24px font18pxUnder500">
                            Free comparative analysis, skills breakdown and data-driven suggestions.
                        </div>
                        <button
                            className="outlineButton whiteText font30px font20pxUnder500 redToLightRedGradientButton"
                        >
                            {"Upload Your Resume"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ResumeScorer);

