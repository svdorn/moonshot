"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import axios from 'axios';
import MetaTags from 'react-meta-tags';

class BusinessHome extends Component {
    render() {
        const logoImages = [
            {src: "NWMLogoWhite.png", partner: "Northwestern Mutual"},
            {src: "DreamHomeLogoWhite.png", partner: "Dream Home"},
            {src: "SinglewireLogoWhite.png", partner: "Singlewire Software"},
            {src: "CurateLogoWhite.png", partner: "Curate Solutions"}
        ];
        const logos = logoImages.map(img => {
            return (<img alt={`${img.partner} Logo`} key={img.partner+"logo"} className="partnerLogo" src={`/logos/${img.src}`} />);
        });

        return (
            <div className="blackBackground businessHome">
                <div className="businessHome frontPage">
                    <div className="skewedRectanglesContainer">
                        <div className="skewedRectangles">
                            <div className="skewedRectangle" />
                            <div className="skewedRectangle" />
                            <div className="skewedRectangle" />
                        </div>
                        <div className="skewedRectangles">
                            <div className="skewedRectangle" />
                            <div className="skewedRectangle" />
                            <div className="skewedRectangle" />
                            <div className="skewedRectangle" />
                            <div className="skewedRectangle" />
                        </div>
                    </div>
                    <div className="infoContainer font20px font16pxUnder900 font14pxUnder400">
                        <div className="content">
                            <h1 className="bigTitle font46px font38pxUnder900 font28pxUnder400" style={{color:"#72d6f5"}}>Know who to hire.</h1>
                            <p className="infoText notFull">Predict candidate performance based on employees at your company and companies with similar positions.</p>
                            <div className="buttonArea font18px font14pxUnder900">
                                <input className="blackInput getStarted" type="text" placeholder="Email Address" />
                                <div className="mediumButton getStarted blueToPurple">
                                    Get Started
                                </div>
                            </div>
                            <div className="infoText i flex font12pxUnder400">
                                <div>Free for first position</div>
                                <div>•</div>
                                <div>Unlimited evaluations</div>
                            </div>
                        </div>
                        <figure className="productScreenshots">
                            <div id="myCandidatesScreenshot">
                                <img src="images/businessHome/ProductScreenshot1.jpg" alt="My Candidates Page Screenshot"/>
                            </div>
                            <div id="resultsScreenshot">
                                <img src="images/businessHome/ProductScreenshot2.jpg" alt="Candidate Results Page Screenshot" />
                            </div>
                        </figure>
                    </div>
                </div>

                <div className="partnerLogos">
                    <div>
                        {logos}
                    </div>
                </div>

                <div style={{marginTop:"400px"}}>
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(BusinessHome);
