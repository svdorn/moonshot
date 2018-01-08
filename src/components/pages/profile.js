"use strict"
import React, {Component} from 'react';
import {AppBar, Paper, Tabs, Tab, CircularProgress, Chip} from 'material-ui';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import PathwayPreview from '../childComponents/pathwayPreview';
import axios from 'axios';

class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pathways: [],
            completedPathways: [],
            userPathwayPreviews: undefined,
            userCompletedPathwayPreviews: undefined
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
                    const userPathwayPreviews = pathways.map(function (pathway) {
                        key++;
                        const deadline = new Date(pathway.deadline);
                        const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                        return (
                            <li key={key} style={{verticalAlign: "top"}}
                                onClick={() => self.goTo('/pathwayContent/' + pathway._id)}>
                                <PathwayPreview
                                    name={pathway.name}
                                    image={pathway.previewImage}
                                    logo={pathway.sponsor.logo}
                                    sponsorName={pathway.sponsor.name}
                                    completionTime={pathway.estimatedCompletionTime}
                                    deadline={formattedDeadline}
                                    price={pathway.price}
                                    _id={pathway._id}
                                />
                            </li>
                        );
                    });

                    this.setState({
                        pathways,
                        userPathwayPreviews
                    }, function () {

                    });
                }).catch(function (err) {
                    console.log("error getting searched-for pathway");
                    console.log(err);
                })
            }
            for (let i = 0; i < this.props.currentUser.completedPathways.length; i++) {
                let id = this.props.currentUser.completedPathways[i].pathwayId;
                axios.get("/api/getPathwayById", {
                    params: {
                        _id: id
                    }
                }).then(res => {
                    let pathway = res.data;
                    let key = 0;
                    let self = this;

                    const completedPathways = [...this.state.completedPathways, pathway];

                    // use the received pathways to make pathway previews
                    const userCompletedPathwayPreviews = completedPathways.map(function (pathway) {
                        key++;
                        const deadline = new Date(pathway.deadline);
                        const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                        return (
                            <li key={key} style={{verticalAlign: "top"}}
                                onClick={() => self.goTo('/pathway/' + pathway._id)}>
                                <PathwayPreview
                                    name={pathway.name}
                                    image={pathway.previewImage}
                                    logo={pathway.sponsor.logo}
                                    sponsorName={pathway.sponsor.name}
                                    completionTime={pathway.estimatedCompletionTime}
                                    deadline={formattedDeadline}
                                    price={pathway.price}
                                    _id={pathway._id}
                                />
                            </li>
                        );
                    });

                    this.setState({
                        completedPathways,
                        userCompletedPathwayPreviews
                    }, function () {

                    });
                }).catch(function (err) {
                    console.log("error getting searched-for completed pathway");
                    console.log(err);
                })
            }
        }
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {

        const style = {
            pathwayPreviewUl: {
                width: "125%",
                transform: "scale(.8)",
                marginLeft: "-12.5%",
                marginTop: "20px",
                WebkitTransformOriginY: "0",
                MozTransformOriginY: "0",
                MsTransformOriginY: "0"
            },
            tabs: {
                marginTop: '5px',
            },
            tab: {
                backgroundColor: "white",
                color: '#B869FF',
            },
            img: {
                height: "70px",
            },
            pictureInfoSkills: {
                everything: {
                    padding: "20px 0px",
                    textAlign: 'center'
                },
                leftSide: {
                    width: "20%",
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: "5%"
                },
                rightSide: {
                    width: "70%",
                    display: "inline-block",
                    verticalAlign: "top",
                    justifyContent: "center",
                },
            }
        };

        let profileSkills = null;
        const skills = this.props.currentUser.skills;
        if (skills) {
            profileSkills = skills.map(function (skill) {
                return (
                    <div style={{display: 'inline-block', marginTop: '5px'}}>
                        <Chip key={skill}
                              backgroundColor='#white'
                              labelColor="#00d2ff"
                              labelStyle={{fontSize: '20px'}}
                              style={{marginLeft: '20px', border: "1px solid #00d2ff"}}>
                            {skill}
                        </Chip>
                    </div>
                );
            });
        }


        return (
            <div className='jsxWrapper' ref='discover'>
                {this.props.currentUser ?
                    <div>
                        <div className="greenToBlue headerDiv"/>
                        {this.state.userPathwayPreviews ?
                            <div>
                                <div style={style.pictureInfoSkills.everything}>
                                    <div style={style.pictureInfoSkills.leftSide}>
                                        <img
                                            src="/icons/Portfolio.png"
                                            alt="Portfolio"
                                            style={style.img}
                                        />
                                        <div>
                                            {this.props.currentUser.name}<br/>
                                            {this.props.currentUser.title}<br/>
                                            {this.props.currentUser.city}, {this.props.currentUser.state}<br/>
                                        </div>
                                    </div>
                                    <div style={style.pictureInfoSkills.rightSide}>
                                        {this.props.currentUser.skills ?
                                            <div className="center">
                                                {profileSkills}
                                            </div>
                                            : null}
                                    </div>
                                </div>
                                <div className="center">
                                    <Tabs
                                        style={style.tabs}
                                        inkBarStyle={{background: '#B869FF'}}
                                        tabItemContainerStyle={{width: '40%'}}
                                        className="myPathwaysTabs"
                                    >
                                        <Tab label="Ongoing" style={style.tab}>
                                            <ul className="horizCenteredList pathwayPrevList"
                                                style={style.pathwayPreviewUl}>
                                                {this.state.userPathwayPreviews}
                                            </ul>
                                        </Tab>
                                        <Tab label="Completed" style={style.tab}>
                                            {this.state.userCompletedPathwayPreviews ?
                                                <ul className="horizCenteredList pathwayPrevList"
                                                    style={style.pathwayPreviewUl}>
                                                    {this.state.userCompletedPathwayPreviews}
                                                </ul>
                                                : <h1 className="center mediumText">None</h1>}
                                        </Tab>
                                    </Tabs>
                                </div>
                            </div>
                            : <div className="center"><CircularProgress
                                style={{marginTop: "20px", marginBottom: "20px"}}/></div>}
                    </div>
                    : null}
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
