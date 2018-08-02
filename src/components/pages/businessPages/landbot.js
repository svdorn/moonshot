"use strict"
import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addNotification } from '../../../actions/usersActions';
import { goTo } from "../../../miscFunctions";
import axios from "axios";


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
        const self = this;
        // create the landbot AP
        const landbot = new LandbotAP("signup-bot");
        // tell the landbot what to do when it gets all the data
        landbot.on("all-data", self.saveData);
        // save the landbot in state
        this.setState({ landbot });
    }


    // save the data from the chatbot, redirect to finish signup
    saveData(data) {
        const self = this;
        // millisecond current time value when starting to post the data
        const startPosting = (new Date()).getTime();

        // save the data
        axios.post("/api/business/chatbotData", data)
        .then(result => {
            // millisecond current time value when finishing posting the data
            const finishedPosting = (new Date()).getTime();
            // how long it took to post the data
            const timeDifference = finishedPosting - startPosting;
            // want to give the user 1.5 seconds to process the end of the chatbot
            // before navigating away
            const TOTAL_WAIT_TIME = 1500;
            // if it took less than 1.5 seconds to save the data
            if (timeDifference < 1500) {
                // how much longer to wait before redirecting
                const remainingWaitTime = TOTAL_WAIT_TIME - timeDifference;
                // wait the remaining time, then redirect
                setTimeout(advance, remainingWaitTime);
            }
            // if it took longer than 1.5 seconds to save the data, redirect immediately
            else { advance(); }
        })
        .catch(error => {
            console.log(error);
            // tell the user something weird happened
            self.props.addNotification("Something strange happened. You can still sign up, but we may need to contact you to get some extra setup info.", "error");
            // redirect to finish signing up
            advance();
        });

        // redirect to the business sign up page
        function advance() {
            goTo(`/businessSignup?name=${data.name}&company=${data.company}&email=${data.email}&positionTitle=${data.title}&positionType=${data.positionType}`);
        }
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
        addNotification
    }, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(Landbot);
