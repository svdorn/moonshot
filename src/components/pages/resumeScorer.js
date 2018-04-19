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
    horizListArrow: {
        position: "relative",
        maxWidth: "600px",
        margin: "15px auto 25px auto"
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
    horizListQuotes: {
        position: "relative",
        marginTop: "40px",
        marginBottom: "25px"
    },
    imgContainer: {
        height: "78px",
        width: "78px",
        borderRadius: '50%',
        display: "inline-block",
        overflow: "hidden",
        marginTop: '-20px',
    },
    imgMark: {
        height: "88px",
    },
    imgJada: {
        height: "80px",
        marginRight: '4px'
    },
    imgCam: {
        height: "80px",
    }
};

class ResumeScorer extends Component {

    render() {
        return (
            <div className="jsxWrapper noOverflowX">
                <MetaTags>
                    <title>Resum&eacute; Scorer | Moonshot</title>
                    <meta name="description"
                          content="Get actionable data and skills reports by just uploading your Resume."/>
                </MetaTags>
                <div className="fullHeight redToLightRedGradient">
                    <HomepageTriangles style={{pointerEvents: "none"}} variation="4"/>
                    <div className="infoBox whiteText font40px font24pxUnder500"
                         style={{zIndex: "20", marginTop: '-10px'}}>
                        How does your resum&eacute; score?
                        <div className="font24px font18pxUnder500">
                            Free comparative analysis, skills breakdown and <div className="above600only br"><br/></div>data-driven suggestions.
                        </div>
                        <button
                            className="outlineButton whiteText font30px font20pxUnder500 redToLightRedGradientButton"
                        >
                            {"Upload Your Resume"}
                        </button>
                    </div>
                </div>
                <div style={{marginTop: '60px', marginBottom: '40px', overflow: 'auto'}} className="center">
                    <div style={styles.horizListArrow}>
                        <div className="horizListFull">
                            <div className="horizListText">
                                <img
                                    alt="Puzzle Icon"
                                    src="/icons/Key.png"
                                    style={styles.horizListIcon}
                                />
                            </div>
                        </div>
                        <div className="horizListFull">
                            <div className="horizListText">
                                <img
                                    alt="Double Arrow Icon"
                                    src="/icons/DoubleArrow.png"
                                    className="doubleArrowIcon"
                                />
                            </div>
                        </div>
                        <div className="horizListFull">
                            <div className="horizListText">
                                <img
                                    alt="Puzzle Icon"
                                    src="/icons/Key.png"
                                    style={styles.horizListIcon}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="center">
                    <div className="font26px font20pxUnder700" style={{maxWidth: "1000px", margin: "20px auto"}}>
                        From a single document to actionable insights and data.
                    </div>
                </div>

                <div className="redToLightRedSpacer" id="picturesToPathwaysHomepageSpacer"/>

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
                    <button className="redToLightRedButtonExterior  font26px font20pxUnder500 bigButton"
                    >
                        <div className="invertColorOnHover gradientBorderButtonInterior">
                            Upload Your Resume
                        </div>
                    </button>
                </div>
                <div className="redToLightRedDownGradient center" style={{marginTop: '60px', overflow: 'auto', paddingBottom: '70px', paddingTop: '30px'}}>
                    <ul className="horizListQuotes">
                        <li className="horizListFull2">
                            <Paper className="paperBorder" style={{minHeight: "352px", width: "270px", margin:'auto'}} zDepth={3}>
                                <Paper style={styles.imgContainer} zDepth={3}>
                                    <img
                                        src="/images/MarkSaari.png"
                                        alt="Profile picture"
                                        style={styles.imgMark}
                                    />
                                </Paper>
                                    <div className="center">
                                        <b className="font20px font16pxUnder500">Mark Saari</b>
                                        <div style={{color: '#7d97ad'}} className="font16px font12pxUnder500">
                                            UW-MADISON
                                        </div>
                                        <br />
                                        <div className="font14px font12pxUnder500" style={{width: '200px', margin:'auto'}}>
                                            "Today, everyone has a competitive resume.
                                            Moonshot helped me to differentiate myself and pointed out areas where I could improve."
                                        </div>
                                    </div>
                            </Paper>
                        </li>
                        <li className="horizListFull2">
                            <Paper className="paperBorder" style={{minHeight: "352px", width: "270px", margin:'auto'}} zDepth={3}>
                                <Paper style={styles.imgContainer} zDepth={3}>
                                    <img
                                        src="/images/JadaFalzon.png"
                                        alt="Profile picture"
                                        style={styles.imgJada}
                                    />
                                </Paper>
                                    <div className="center">
                                        <b className="font20px font16pxUnder500">Jada Falzon</b>
                                        <div style={{color: '#7d97ad'}} className="font16px font12pxUnder500">
                                            ALVERNO COLLEGE
                                        </div>
                                        <br />
                                        <div className="font14px font12pxUnder500" style={{width: '200px', margin:'auto'}}>
                                            "The resume analysis is a great asset to evaluate my resume before applying for a job.
                                            This helps make my resume a “stand out” among others who didn’t use the analysis."
                                        </div>
                                    </div>
                            </Paper>
                        </li>
                        <li className="horizListFull2">
                            <Paper className="paperBorder" style={{minHeight: "352px", width: "270px", margin:'auto'}} zDepth={3}>
                                <Paper style={styles.imgContainer} zDepth={3}>
                                    <img
                                        src="/images/CamRowe.png"
                                        alt="Profile picture"
                                        style={styles.imgCam}
                                    />
                                </Paper>
                                <div className="center">
                                    <b className="font20px font16pxUnder500">Cameron Rowe</b>
                                    <div style={{color: '#7d97ad'}} className="font16px font12pxUnder500">
                                        UW-MADISON
                                    </div>
                                    <br />
                                    <div className="font14px font12pxUnder500" style={{width: '200px', margin:'auto'}}>
                                        "Resumes are difficult to quantify and compare against other people.
                                        It’s a game changer when you can translate it to actionable data."
                                    </div>
                                </div>
                            </Paper>
                        </li>
                    </ul>
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
    return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ResumeScorer);

