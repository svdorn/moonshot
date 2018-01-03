"use strict"
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {forBusiness, getUsers} from '../../actions/usersActions';
import {TextField, RaisedButton, Paper, CircularProgress, Divider } from 'material-ui';
import {Field, reduxForm} from 'redux-form';
import style from '../../../public/styles';
import axios from 'axios';
import HomepageTriangles from '../miscComponents/HomepageTriangles';

class Pathway extends Component {
    constructor(props){
        super(props);
        this.state = {
            pathway: {},
        }
    }

    componentDidMount() {
        console.log(this.props.params._id);
        console.log("HERE");
        const id = this.props.params._id;

        axios.get("/api/getPathwayById", {
            params: {
                _id: id
            }
        }).then(res => {
            console.log("resultant pathway:");
            console.log(res.data);
            // make sure component is mounted before changing state
            this.setState({pathway: res.data});
        }).catch(function(err) {
            console.log("error getting searched for pathw");
        })
    }


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
