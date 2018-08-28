"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class Calandar extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        this.addCalendlyScript();
    }

    addCalendlyScript() {
        const script = document.createElement("script");
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true;
        document.body.appendChild(script);
    }

    render() {
        return (
            <div className="calandar-calendly">
                <div className="primary-white center">
                    <div style={{width:"80%", margin:"auto"}}>
                        Our CEO set aside time to meet with you personally so that you can hit the ground running.
                        If you would like to maximize your use of Moonshot Insights please reserve a time below that would work best for you.
                    </div>
                    <div className="calendly-inline-widget marginTop10px marginBottom20px" data-url="https://calendly.com/kyle-treige-moonshot/30min" style={{minWidth:"320px", height: "370px", zIndex:"100"}}></div>
                    <div className="previous-next-area font16px center paddingBottom40px">
                        <div
                            className="previous noselect clickable underline inlineBlock"
                            onClick={this.props.previous}
                        >
                            Previous
                        </div>
                        <div
                            className="button noselect round-4px background-primary-cyan inlineBlock"
                            onClick={() => this.props.next()}
                        >
                            Continue
                        </div>
                    </div>
                </div>
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


export default connect(mapStateToProps, mapDispatchToProps)(Calandar);
