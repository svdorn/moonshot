"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {forBusiness, getUsers} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Divider } from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
import HomepageTriangles from '../miscComponents/HomepageTriangles';

class Pathway extends Component {
    render() {
        return (
            <div className="jsxWrapper">
                <div className="fullHeight purpleToBlue">
                    <HomepageTriangles style={{pointerEvents:"none"}} variation="1" />

                    <div className="infoBox whiteText mediumText noWrap" style={{zIndex:"20"}}>
                        Hire innovation.<br/>
                        Source and evaluate<br/>
                        <i>more</i> talent, for <i>less</i><br/>
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getUsers,
    }, dispatch);
}

function mapStateToProps(state) {
    return {

    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Pathway);
