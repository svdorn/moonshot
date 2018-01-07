"use strict"
import React, { Component } from 'react';
import { AppBar, Paper } from 'material-ui';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { closeNotification } from "../../actions/usersActions";
import { bindActionCreators } from 'redux';
import PathwayPreview from '../childComponents/pathwayPreview';
import axios from 'axios';

class Profile extends Component{
    constructor(props) {
        super(props);

        this.state = {
            pathways: [],
            userPathwayPreviews: undefined
        }
    }

    componentDidMount() {
        // check if there is a logged-in user first, then create the user's pathways
        if (this.props.currentUser) {
            // populate featuredPathways with initial pathways
            for (let i = 0; i < this.props.currentUser.pathways.length; i++) {
                let id = this.props.currentUser.pathways[i].pathwayId;
                axios.get("/api/getPathwayById", {
                    params: {
                        _id: id
                    }
                }).then(res => {
                    let pathway = res.data;
                    let key = 0;
                    let self = this;

                    const pathways = [...this.state.pathways, pathway];

                    // use the received pathways to make pathway previews
                    const userPathwayPreviews = pathways.map(function(pathway) {
                        key++;
                        const deadline = new Date(pathway.deadline);
                        const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                        return (
                            <li key={key}
                                onClick={() => self.goTo('/pathwayContent/' + pathway._id)}>
                                <PathwayPreview
                                    name = {pathway.name}
                                    image = {pathway.previewImage}
                                    logo = {pathway.sponsor.logo}
                                    sponsorName = {pathway.sponsor.name}
                                    completionTime = {pathway.estimatedCompletionTime}
                                    deadline = {formattedDeadline}
                                    price = {pathway.price}
                                    _id = {pathway._id}
                                />
                            </li>
                        );
                    });

                    this.setState({
                        pathways,
                        userPathwayPreviews
                    }, function() {

                    });
                }).catch(function (err) {
                    console.log("error getting searched-for pathway");
                    console.log(err);
                })
            }
        }
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

        const style = {
            treeImg: {
                height: "300px",
                position: "absolute",
                bottom: "-14px",
                right: "0px"
            },
            headerDiv: {
                position: "relative",
                height: "250px",
                width: "100%"
            },
            treeText: {
                color: "white",
                position: "absolute",
                top: "150px",
                left: "65px",
                fontSize: "20px"
            },
            pathwayPreviewUl: {
                width:"125%",
                transform: "scale(.8)",
                marginLeft:"-12.5%",
                WebkitTransformOriginY: "0",
                MozTransformOriginY: "0",
                MsTransformOriginY: "0"
            },
        };


        return(
            <div className='jsxWrapper' ref='discover'>
                { this.props.currentUser ?
                    <div>
                        <div className="greenToBlue" style={style.headerDiv}>
                            <div style={style.treeText}>
                                <h2 style={{fontSize:"40px"}}>
                                    {this.props.currentUser.name}<br/>
                                </h2>
                            </div>
                        </div>
                        { this.state.userPathwayPreviews ?
                            <div>
                                <ul className="horizCenteredList pathwayPrevList" style={style.pathwayPreviewUl}>
                                    {this.state.userPathwayPreviews}
                                </ul>
                            </div>
                        : null }
                    </div>
                : null }
            </div>

        );
        // {/*<div>*/}
        //         {/*<AppBar className="appBar"*/}
        //                 {/*showMenuIconButton={false}*/}
        //                 {/*title={this.props.currentUser.name}/>*/}
        // {/*</div>*/}
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeNotification
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
