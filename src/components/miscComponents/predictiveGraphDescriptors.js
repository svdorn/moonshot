"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class PredictiveGraphDescriptors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: "Performance",
            tabIndex: 0
        };
    }

    changeTab(tabIndex) {
        let tab;
        switch(tabIndex) {
            case 0:
                tab = "Performance";
                break;
            case 1:
                tab = "Growth";
                break;
            case 2:
                tab = "Longevity";
                break;
            case 3:
                tab = "Culture_Fit";
                break;
            default:
                tab = "Performance";
                break;
        }
        this.setState({ tab,tabIndex });
    }

    bottomCircles() {
        let circles = [];
        for (let tabIndex = 0; tabIndex < 4; tabIndex++) {
            const selected = this.state.tabIndex === tabIndex;
            circles.push(
                <div key={`circle${tabIndex}`} className={`tab-position-circle${selected ? " selected" : ""}`} onClick={() => this.changeTab(tabIndex)}/>
            );
        }
        return (
            <div key="bottomCircles" className="marginTop20px">{ circles }</div>
        )
    }

    render() {
        // get the current tab
        const tab = this.state.tab;

        return (
            <div className="center marginTop20px" style={{color:"#d0d0d0"}}>
                <div className="primary-cyan font20px font18pxUnder800 font16pxUnder600">
                    { tab.replace(/_/g," ") }
                </div>
                <div className="font16px font14pxUnder800 font12pxUnder600">
                    { descriptions[tab] }
                </div>
                { this.bottomCircles() }
            </div>
        );
    }

}

const descriptions = {
    Performance: `Performance is an individual’s ability to be a top performer shortly after starting the job. It is their likelihood to score well on performance reviews and meet or exceed performance metrics.`,
    Growth: `Growth is an individual’s growth potential in terms of job performance. It is their likelihood to improve over time.`,
    Longevity: `Longevity is an individual’s predicted tenure at your company relative to your current employees. `,
    Culture_Fit: `Culture fit is a measurement that shows how well an individual’s beliefs and behaviors align with your company’s core values, work environment, and social atmosphere. `
}

export default PredictiveGraphDescriptors;
