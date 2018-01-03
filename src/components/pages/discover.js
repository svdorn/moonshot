"use strict"
import React, { Component } from 'react';
import { Paper, RaisedButton } from 'material-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import PathwayPreview from '../childComponents/pathwayPreview';
import Category from '../childComponents/category'
import { closeNotification } from "../../actions/usersActions";

class Discover extends Component{
    constructor(props) {
        super(props);

        this.state = {
            explorePathways: [],
            featuredPathways: []
        }
    }

    componentDidMount() {
        axios.get("/api/search", {
            params: { numPathways: 3 }
        }).then(res => {
            // make sure component is mounted before changing state
            if (this.refs.home) {
                this.setState({ pathways: res.data });
            }
        }).catch(function(err) {
            console.log("error getting top pathways");
        })
    }

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render(){
        return(
            <div className='jsxWrapper'>
                <div className='fullHeight greenToBlue'>
                    <h1>Discover cool pathways</h1>
                    <div className="pathwayPrevListContainer">
                        <ul className="horizCenteredList pathwayPrevList">
                            <li><Category /></li>
                            <li><Category /></li>
                            <li><Category /></li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        notification: state.users.notification
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Discover);
