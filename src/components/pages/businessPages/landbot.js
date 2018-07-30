"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {  } from '../../../actions/usersActions';


class Landbot extends Component {
    constructor(props) {
        super(props);

        this.state = {
            landbot: undefined
        };
    }


    // add the script to connect the landbot
    componentWillMount() {
        const self = this;
        // create a script
        const script = document.createElement("script");
        // the script is js
        script.type = "text/javascript";

        // TELL THE SCRIPT WHAT TO DO AFTER LOADING
        if (script.readyState) { // IE
            // whenever the state of the script changes ...
            script.onreadystatechange = function() {
                // ... check if it is in a completed state ...
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    // ... then make the sure the landbot AP won't get created twice ...
                    script.onreadystatechange = null;
                    // ... and create the landbot access point
                    self.createLandbotAP();
                }
            }
        } else  { // EVERY OTHER BROWSER
            // when loaded ...
            script.onload = function() {
                // ... create the access point
                self.createLandbotAP();
            }
        }

        // the source gives us the ability to create a new landbot access point
        script.src = "https://static.landbot.io/umicore/UmiAccessPoint.js";
        // make it so it has to load this script first
        script.async = false;
        // run the script
        document.body.appendChild(script);
    }


    // create the landbot access point so we can get info from the chatbot
    createLandbotAP() {
        // create the landbot AP
        const landbot = new LandbotAP("signup-bot");

        landbot.on("all-data", (data) => {
            console.log("recieving data: ", data);
            // TODO: wait a couple seconds, then redirect to sign up page
        });

        // save it in state
        this.setState({ landbot }, () => { console.log(landbot); });
    }


    render() {
        return (
            <div className="landbot-container">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src="https://landbot.io/u/H-65209-HM84ZVFHD0CU5T9Z/index.html"
                    name="signup-bot"
                ></iframe>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Landbot);
