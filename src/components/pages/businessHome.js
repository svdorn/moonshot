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
                        </div>
                    </div>
                    <div className="infoContainer font20px">
                        <div className="content">
                            <h1 className="bigTitle font46px" style={{color:"#72d6f5"}}>Know who to hire.</h1>
                            <p className="infoText">Predict candidate performance based on employees at your company and companies with similar positions.</p>
                            <div className="buttonArea">
                                <input className="blackInput" type="text" placeholder="Email Address" />
                                <div className="mediumButton" style={{
                                    background: "linear-gradient(to right, #7ad6fe, #b172fe)",
                                    marginLeft: "20px"
                                }}>
                                    Get Started
                                </div>
                            </div>
                            <div className="infoText i flex">
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
