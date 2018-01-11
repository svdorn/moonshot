"use strict"
import React, { Component}  from 'react';
import { connect } from 'react-redux';
import { startOnboarding } from "../../actions/usersActions";
import { bindActionCreators } from 'redux';
import { Tabs, Tab } from 'material-ui/Tabs';
import Onboarding1 from './onboarding1';
import Onboarding2 from './onboarding2';
import Onboarding3 from './onboarding3';


class Onboarding extends Component {
    componentDidMount() {
        this.props.startOnboarding();
    }

    render() {
        return (
            <Tabs>
                <Tab label="Interests" >
                    <Onboarding1 />
                </Tab>
                <Tab label="Goals" >
                    <Onboarding2 />
                </Tab>
                <Tab label="Info">
                    <Onboarding3 />
                </Tab>
            </Tabs>
        );
    }
}

function mapStateToProps(state) {
    return {  };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        startOnboarding
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
