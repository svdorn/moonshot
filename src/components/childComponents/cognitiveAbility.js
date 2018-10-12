"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class CognitiveAbility extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.calculateGraph = this.calculateGraph.bind(this);
    }

    calculateGraph() {
        const score = this.props.score;

        if (score <= 65) {
            return 60;
        } else if (score <= 75) {
            return 70;
        } else if (score <= 89) {
            return 80;
        } else if (score <= 95) {
            return 90;
        } else if (score <= 105) {
            return 100;
        } else if (score <= 110) {
            return 110;
        } else if (score <= 120) {
            return 120;
        } else if (score <= 130) {
            return 130;
        } else {
            return 140;
        }
    }

    render() {
        return (
            <div className="results">
                <div className="graphTitle primary-white center font24px font20pxUnder700 font16pxUnder500">{"Cognitive Ability"}</div>
                <div className="statsAndDescription">
                    <div className="stats lightBlackBackground">
                        <div className="secondary-gray font20px font18pxUnder700 font16pxUnder500">
                            Score: <div className="primary-cyan inlineBlock">{Math.round(this.props.score)}</div>
                        </div>
                        <div>
                            <img
                                alt="GCA Graph"
                                src={`/images/GCAGraph${this.calculateGraph()}` + this.props.png}
                                height={180}
                            />
                        </div>
                    </div>
                    <div className="description lightBlackBackground">
                        <div className="center marginTop10px font16px font14pxUnder900 font12pxUnder600" style={{color:"#d0d0d0", verticalAlign:"center"}}>
                            Cognitive ability is an umbrella term that encompasses an individual’s ability to learn, problem solve, and adapt to novel situations. The graph shows where the individual lies in comparison to the general population.
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        png: state.users.png
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CognitiveAbility);
