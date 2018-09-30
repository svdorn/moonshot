"use strict"
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class CognitiveAbility extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="results">
                <div className="graphTitle primary-white center font24px font20pxUnder700 font16pxUnder500">{"Cognitive Ability"}</div>
                <div className="statsAndDescription">
                    <div className="stats lightBlackBackground">
                        <div className="secondary-gray font20px font18pxUnder700 font16pxUnder500">
                            Score: <div className="primary-cyan inlineBlock">{this.props.score}</div>
                        </div>
                        <div className="marginTop20px">
                            <img
                                alt="Alt"
                                src={"/icons/Cube" + this.props.png}
                                height={50}
                            />
                        </div>
                    </div>
                    <div className="description lightBlackBackground">
                        <div className="center font16px marginTop10px font14pxUnder800 font12pxUnder600" style={{color:"#d0d0d0"}}>
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
