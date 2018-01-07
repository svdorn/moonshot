"use strict"
import React, {Component} from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification} from "../../actions/usersActions";
import {bindActionCreators} from 'redux';
import PathwayPreview from '../childComponents/pathwayPreview';
import axios from 'axios';

class MyPathways extends Component {
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
                    const userPathwayPreviews = pathways.map(function (pathway) {
                        key++;
                        const deadline = new Date(pathway.deadline);
                        const formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                        return (
                            <li key={key}
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
            headerDiv: {
                position: "relative",
                height: "115px",
                width: "100%"
            },
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
                marginTop: '20px',
            },
            tab: {
                backgroundColor: "#B869FF",
                color: 'white',
                textDecorationColor:'white',
            }
        };


        return (
            <div className='jsxWrapper' ref='discover'>
                {this.props.currentUser ?
                    <div>
                        <div className="greenToBlue" style={style.headerDiv}/>
                        {this.state.userPathwayPreviews ?
                            <div className="center">
                                <h1 className="center mediumText" style={{color: "#B869FF"}}>My Pathways</h1>
                                <Tabs style={style.tabs} inkBarStyle={{background: 'white'}} tabItemContainerStyle={{width: '40%'}}>
                                    <Tab label="Ongoing" style={style.tab}>
                                        <ul className="horizCenteredList pathwayPrevList"
                                            style={style.pathwayPreviewUl}>
                                            {this.state.userPathwayPreviews}
                                        </ul>
                                    </Tab>
                                    <Tab label="Completed" style={style.tab}>
                                        <h1 className="center mediumText">None</h1>
                                    </Tab>
                                </Tabs>
                            </div>
                            : null}
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

export default connect(mapStateToProps, mapDispatchToProps)(MyPathways);
