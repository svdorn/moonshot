"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import axios from 'axios';
import MetaTags from 'react-meta-tags';

class BusinessHomeParts extends Component {
    render() {
        const style = {
            bottomListItem: {
                width: '35%',
                margin: 'auto',
                display: 'inline-block',
                top: '0',
                verticalAlign: 'top',
            },
        }
        return (
            <div className="lightBlackBackground">
                <div className="headerDiv" />
                <section>
                    <div className="homepageTrajectory forBusiness">
                        <div className="homepageTrajectoryTextLeft forBusiness">
                            <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forHome whiteText">
                                <h2 className="pinkTextHome font28px font24pxUnder800 font22pxUnder500">Quickly identify which candidates <div className="above1000only br"><br/></div>will be top performers</h2>
                                Analyze candidates to see if they exhibit the profile of
                                proven high performers in that position.
                            </div>
                            <button className="slightlyRoundedButton marginTop10px pinkToPurpleButtonGradient whiteText">
                                Hire Faster
                            </button>
                        </div>
                        <div className="businessHomeTrajectoryImageRightNoBorder forBusiness">
                            <img
                                alt="My Candidates Management"
                                src="/images/businessHome/ProductScreenshot3v6.png"
                            />
                            </div>
                    </div>

                    <br/>

                    <div className="homepageTrajectory forBusiness">
                        <div className="homepageTrajectoryTextRight forBusiness">
                            <div className="font18px font16pxUnder800 homepageTrajectoryTextRightDiv forHome whiteText">
                                <h2 className="blueTextHome font28px font24pxUnder800 font22pxUnder500">Use data to eliminate biases <div className="above900only br"><br/></div>and guesswork
                                </h2>
                                Why read hundreds of resumes? Moonshot uses
                                machine learning to reveal the empirical evidence
                                instead of conjecture based on a resume.
                            </div>
                            <button className="slightlyRoundedButton marginTop10px blueToPurpleButtonGradient whiteText">
                                Hire Smarter
                            </button>
                        </div>
                        <div className="businessHomeTrajectoryImagesLeft businessHomeTrajectoryImagesShadow forBusiness">
                            <img
                                alt="Predictive Insights"
                                src="/images/businessHome/PredictiveInsights.jpg"
                            />
                        </div>
                    </div>
                    <br />

                    <div className="homepageTrajectory forBusiness">
                        <div className="homepageTrajectoryTextLeft forBusiness">
                            <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forHome whiteText">
                                <h2 className="orangeTextHome font28px font24pxUnder800 font22pxUnder500">Improve your candidate <div className="above800only br"><br/></div>experience</h2>
                                83% of candidates rate their current experience as poor.
                                Engage your candidates better so they can understand
                                your company and how they fit.
                            </div>
                            <button className="slightlyRoundedButton marginTop10px orangeToRedButtonGradient whiteText">
                                Hire Better
                            </button>
                        </div>

                        <div className="businessHomeTrajectoryImagesRight businessHomeTrajectoryImagesShadow forBusiness">
                            <img
                                alt="Analysis Text"
                                src="/images/businessHome/ProductScreenshot5.jpg"
                            />
                        </div>
                    </div>
                </section>
                <div className="marginTop40px marginBottom40px"/>
                <section>
                    <div className="center">
                        <div className="font36px font32pxUnder700 font26pxUnder500 center darkDarkPurpleText"
                             style={{marginBottom: '50px'}}>
                            Predictive Analytics Improve Hiring Results
                        </div>
                        <div>
                            <div style={style.bottomListItem}>
                                <img src="/images/businessHome/Hourglass.png"
                                     alt="Hourglass Icon"
                                     className="forBusinessIcon"
                                     style={{marginRight: '10px'}}/>
                                <div className="horizListText font18px font16pxUnder800 font12pxUnder700 whiteText" style={{width:"90%", marginLeft:"5%"}}>
                                    Up to 80% decrease<div className="above1000only noHeight"><br/></div> in time to hire
                                </div>
                            </div>
                            <div style={style.bottomListItem}>
                                <img src="/images/businessHome/Diamond.png"
                                     alt="Diamond Icon"
                                     className="forBusinessIcon"
                                     style={{marginLeft: '10px'}}/>
                                <div className="horizListText font18px font16pxUnder800 font12pxUnder700 whiteText" style={{width:"90%", marginLeft:"5%"}}>
                                    Up to 300% increase<div className="above1000only noHeight"><br/></div> in quality of hire
                                </div>
                            </div>
                        </div>
                        <div style={{marginTop: '40px'}}>
                            <div style={style.bottomListItem}>
                                <img src="/images/businessHome/Turnover.png"
                                     alt="Turnover Icon"
                                     className="forBusinessIcon"/>
                                <div className="horizListText font18px font16pxUnder800 font12pxUnder700 whiteText" style={{width:"90%", marginLeft:"5%"}}>
                                    Up to 70% decrease<div className="above1000only noHeight"><br/></div> in employee turnover
                                </div>
                            </div>
                            <div style={style.bottomListItem}>
                                <img src="/images/businessHome/Lightbulb4.png"
                                     alt="Lightbulb Icon"
                                     className="forBusinessIcon"/>
                                <div className="horizListText font18px font16pxUnder800 font12pxUnder700 whiteText" style={{width:"90%", marginLeft:"5%"}}>
                                    More than 85% of candidates<div className="above1000only noHeight"><br/></div> rate their experience as positive
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="center">
                        <button className="blueToDarkPurpleButtonGradient bigButton"
                                style={{marginTop: "35px", color: '#72d6f5'}}
                        >
                            <div className="invertColorOnHover gradientBorderButtonInteriorBlack">
                                {"Learn More"}
                            </div>
                        </button>
                    </div>
                </section>
                <div className="marginTop40px marginBottom40px"/>
                <section>
                    <div className="center">
                        <img
                            src="/images/businessHome/CrystalBall.png"
                            alt="CrystalBall"
                            height={300}
                        />
                        <br/>
                        <button className="blueToDarkPurpleButtonGradientReverse bigButton"
                                style={{marginTop: "25px", color: 'white'}}
                        >
                            <div className="invertColorOnHover gradientBorderButtonInteriorGradient">
                                {"See the Future"}
                            </div>
                        </button>
                    </div>
                </section>
                <div className="marginTop40px marginBottom40px"/>
                <div>Here</div>
            </div>
        );
    }

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessHomeParts);
