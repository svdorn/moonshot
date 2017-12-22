"use strict"
import React, { Component } from 'react';
import { Paper, RaisedButton } from 'material-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import PathwayPreview from '../childComponents/pathwayPreview'

class Home extends Component{

    goTo (route)  {
        browserHistory.push(route);
    }

    render(){
        return(
            <div className='jsxWrapper'>
                <div>
                    {this.props.emailSentMessage ?
                        <Paper className="messageHeader infoHeader">
                            {this.props.emailSentMessage}
                        </Paper>
                        :
                        null
                    }
                </div>


                <div className="fullHeight greenToBlue">
                    <div className="infoBox whiteText mediumText noWrap">
                        Skip the resum&eacute;.<br/>
                        Learn skills for the future<br/>
                        that employers want now,<br/>
                        <i>for free.</i><br/>
                        <button className="outlineButton blueWhiteButton">
                            Get Started
                        </button>
                    </div>
                </div>

                <div className="fullHeight">
                    <div className="infoBox greenText bigText nowrap">
                        <i>Companies are searching<br/>
                        for people to spearhead<br/>
                        the future of technology</i><br/>
                        <div className="dividerSmall" />
                        <button className="outlineButton whiteBlueButton">
                            Join the Movement
                        </button>
                        <p  className="clickable blueText smallText"
                            style={{marginTop:"10px"}}
                            onClick={() => this.goTo('/forBusiness')}>
                            <i>Are you an employer? Click here.</i>
                        </p>
                    </div>
                </div>

                <div className="halfHeight purpleToBlue">
                    <div className="infoBox whiteText mediumText" style={{paddingTop:"100px"}}>
                        We work with employers to create course pathways that
                        teach you the skills they want you to know.
                    </div>
                </div>

                <div className="fullHeight">
                    <ul className="pathwayList">
                        <li><PathwayPreview /></li>
                        <li><PathwayPreview /></li>
                        <li><PathwayPreview /></li>
                    </ul>
                </div>

            </div>
        );
    }
}

// function mapDispatchToProps(dispatch) {
//     return bindActionCreators({
//         postUser,
//         getUsers
//     }, dispatch);
// }

function mapStateToProps(state) {
    return {
        emailSentMessage: state.users.emailSentMessage
    };
}

export default connect(mapStateToProps)(Home);
