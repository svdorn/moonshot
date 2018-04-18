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

const styles = {
    horizList: {
        position: "relative",
        marginTop: "15px",
        marginBottom: "25px"
    },
    horizListIcon: {
        height: "50px",
        marginBottom: "10px"
        // position: "absolute",
        // top: "0",
        // bottom: "0",
        // right: "80%",
        // margin: "auto"
    },
};

class ResumeScorer extends Component {
    uploadResume() {
        let skills = undefined;
        let desiredCareers = undefined;
        let email = undefined;
        let resume = undefined;
        console.log("uploading resume");
        axios.post("/resumeScorer/uploadResume", {skills, desiredCareers, email, resume})
        .then(result => {
            console.log("result: ", result);
        });
    }

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
                            onClick={this.uploadResume}
                        >
                            {"Upload Your Resume"}
                        </button>
                    </div>
                </div>
                <div style={{marginTop: '60px', marginBottom: '40px', overflow: 'auto'}}>
                    <div style={styles.horizList}>
                        <div className="horizListFull">
                            <div className="horizListSpacer" style={{marginLeft: "20%"}}
                            >
                                <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                    <img
                                        alt="Puzzle Icon"
                                        src="/icons/Key.png"
                                        style={styles.horizListIcon}
                                    /><br/>
                                    Position and Industry <div className="above600only"><br/></div>Recommendations
                                </div>
                            </div>
                        </div>

                        <div className="horizListFull">
                            <div className="horizListSpacer" style={{marginLeft: "5%", marginRight: '5%'}}>
                                <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                    <img
                                        alt="Lightbulb Icon"
                                        src="/icons/Evaluate.png"
                                        style={styles.horizListIcon}
                                    /><br/>
                                    Courses for Skills <div className="above600only"><br/></div>Training
                                </div>
                            </div>
                        </div>
                        <div className="horizListFull">
                            <div className="horizListSpacer" style={{marginRight: "20%"}}>
                                <div className="horizListText font18px font16pxUnder800 font12pxUnder700">
                                    <img
                                        alt="Trophy Icon"
                                        src="/icons/Badge.png"
                                        style={styles.horizListIcon}
                                    /><br/>
                                    Comparative Analysis <div className="above600only br"><br/></div>and Scoring
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="center" style={{marginBottom: '40px'}}>
                    <button className="redToLightRedButtonExterior bigButton"
                    >
                        <div onClick={this.uploadResume}
                             className="invertColorOnHover gradientBorderButtonInterior">
                            Upload Your Resume
                        </div>
                    </button>
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
