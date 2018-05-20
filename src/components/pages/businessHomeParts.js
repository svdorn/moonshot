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
        return (
            <div className="lightBlackBackground">
                <div className="headerDiv" />
                <section>
                    <div className="homepageTrajectory forBusiness" id="whatSkillsAreYouHiringFor">
                        <div className="homepageTrajectoryTextLeft forBusiness">
                            <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forBusiness whiteText">
                                <h2 className="pinkTextHome font28px font24pxUnder800 font22pxUnder500">What Skills Are You <div className="above800only br"><br/></div>Hiring For?</h2>
                                Analyze candidates to see if they exhibit the profile of
                                proven high performers in that position.
                            </div>
                        </div>
                        <div className="businessHomeTrajectoryImagesRight forBusiness">
                            <img
                                alt="My Candidates Management"
                                src="/images/businessHome/ProductScreenshot3.png"
                            />
                        </div>
                    </div>

                    <br/>

                    <div className="homepageTrajectory forBusiness">
                        <div className="homepageTrajectoryTextRight forBusiness">
                            <div className="font18px font16pxUnder800 homepageTrajectoryTextRightDiv forBusiness whiteText">
                                <h2 className="blueTextHome font28px font24pxUnder800 font22pxUnder500">Course Pathways Curated <div className="above500only br"><br/></div>to the Skills You Need
                                </h2>
                                Why read hundreds of resumes? Moonshot uses
                                machine learning to reveal the empirical evidence
                                instead of conjecture based on a resume.
                            </div>
                        </div>
                        <div className="businessHomeTrajectoryImagesLeft forBusiness">
                            <img
                                alt="Predictive Insights"
                                src="/images/businessHome/PredictiveInsights.jpg"
                            />
                        </div>
                    </div>
                    <br/>

                    <div className="homepageTrajectory forBusiness" id="sponsorStudentsForBusiness">
                        <div className="homepageTrajectoryTextLeft forBusiness">
                            <div className="font18px font16pxUnder800 homepageTrajectoryTextLeftDiv forBusiness whiteText">
                                <h2 className="orangeTextHome font28px font24pxUnder800 font22pxUnder500">Candidate Training</h2>
                                83% of candidates rate their current experience as poor.
                                Engage your candidates better so they can understand
                                your company and how they fit.
                            </div>
                        </div>

                        <div className="businessHomeTrajectoryImagesRight forBusiness">
                            <img
                                alt="Analysis Text"
                                src="/images/businessHome/ProductScreenshot5.jpg"
                            />
                        </div>
                    </div>
                </section>
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
