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
        const logoImages = ["NWMLogoWhite.png", "DreamHomeLogoWhite.png", "SinglewireLogoWhite.png", "CurateLogoWhite.png"];
        const logos = logoImages.map(src => {
            return (<img key={"logo" + src} className="partnerLogo" src={`/logos/${src}`} />);
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
                                <img src="images/businessHome/ProductScreenshot1.jpg" />
                            </div>
                            <div id="resultsScreenshot">
                                <img src="images/businessHome/ProductScreenshot2.jpg" />
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





                {/*<div>
                    <div id="stripes" />
                    <section id="intro">
                        <div className="container-header">
                            <h1>Hey</h1>
                        </div>
                    </section>
                    <figure className="floatingCards">
                        <div className="leftFloatingCard leftFloatingCardDeepShadow"/>
                        <div className="rightFloatingCard">
                            <img src="/images/ProductScreenshot1.jpg" />
                        </div>
                        <div className="leftFloatingCard leftFloatingCardNearShadow">
                            <img src="/images/ProductScreenshot2.jpg" />
                        </div>
                    </figure>
                </div>*/}
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
