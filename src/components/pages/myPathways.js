"use strict"
import React, {Component} from 'react';
import {Tabs, Tab, CircularProgress} from 'material-ui';
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
            completedPathways: [],
            userPathwayPreviews: undefined,
            userCompletedPathwayPreviews: undefined
        }
    }

    componentDidMount() {
        // check if there is a logged-in user first, then create the user's pathways
        if (this.props.currentUser) {
            // populate featuredPathways with initial pathways
            if (this.props.currentUser.pathways) {
                if (this.props.currentUser.pathways.length == 0) {
                    const pathways = [];
                    const userPathwayPreviews = (
                        <li onClick={() => this.goTo('/discover')}>
                            <PathwayPreview type="addOne" variation="1"/>
                        </li>
                    );

                    this.setState({
                        pathways,
                        userPathwayPreviews
                    });
                }

                else {
                    for (let i = 0; i < this.props.currentUser.pathways.length; i++) {
                        let id = this.props.currentUser.pathways[i].pathwayId;
                        axios.get("/api/pathwayByIdNoContent", {
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
                                let formattedDeadline = "";
                                if (pathway.deadline) {
                                    const deadline = new Date(pathway.deadline);
                                    formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                                }

                                return (
                                    <li key={key} style={{verticalAlign: "top"}}
                                        onClick={() => self.goTo('/pathwayContent?pathway=' + pathway.url)}>
                                        <PathwayPreview
                                            name={pathway.name}
                                            image={pathway.previewImage}
                                            imageAltTag={pathway.imageAltTag ? pathway.imageAltTag : pathway.name + " Preview Image"}
                                            logo={pathway.sponsor.logo}
                                            sponsorName={pathway.sponsor.name}
                                            completionTime={pathway.estimatedCompletionTime}
                                            deadline={formattedDeadline}
                                            price={pathway.price}
                                            _id={pathway._id}
                                            variation="1"
                                        />
                                    </li>
                                );
                            });

                            this.setState({
                                pathways,
                                userPathwayPreviews
                            });
                        }).catch(function (err) {
                        })
                    }
                }
            }
            if (this.props.currentUser.completedPathways) {
                for (let i = 0; i < this.props.currentUser.completedPathways.length; i++) {
                    let id = this.props.currentUser.completedPathways[i].pathwayId;
                    axios.get("/api/pathwayByIdNoContent", {
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
                            let formattedDeadline = "";
                            if (pathway.deadline) {
                                const deadline = new Date(pathway.deadline);
                                formattedDeadline = deadline.getMonth() + "/" + deadline.getDate() + "/" + deadline.getYear();
                            }

                            return (
                                <li key={key} style={{verticalAlign: "top"}}
                                    onClick={() => self.goTo('/pathway?pathway=' + pathway.url)}>
                                    <PathwayPreview
                                        name={pathway.name}
                                        image={pathway.previewImage}
                                        imageAltTag={pathway.imageAltTag ? pathway.imageAltTag : pathway.name + " Preview Image"}
                                        logo={pathway.sponsor.logo}
                                        sponsorName={pathway.sponsor.name}
                                        completionTime={pathway.estimatedCompletionTime}
                                        deadline={formattedDeadline}
                                        price={pathway.price}
                                        _id={pathway._id}
                                        variation="1"
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
                    })
                }
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
                marginTop: "20px",
            },
            tabs: {
                marginTop: '20px',
            },
            tab: {
                color: 'white',
            },
        };


        return (
            <div className='jsxWrapper' ref='discover'>
                {this.props.currentUser ?
                    <div className="fillScreen purpleToRedLightGradient" style={{paddingBottom:"60px"}}>
                        <div className="headerDiv"/>
                        {this.state.userPathwayPreviews ?
                            <div className="center fillScreenWithHeader">
                                <div className="center font40px font24pxUnder500 whiteText" style={{marginTop: "30px"}}>
                                    My Pathways</div>
                                <Tabs
                                    style={style.tabs}
                                    inkBarStyle={{background: 'white'}}
                                    tabItemContainerStyle={{width: '40%'}}
                                    className="myPathwaysTabs"
                                >
                                    <Tab label="Ongoing" style={style.tab}>
                                        {this.state.userPathwayPreviews ?
                                            <ul className="horizCenteredList pathwayPrevList"
                                                style={style.pathwayPreviewUl}>
                                                {this.state.userPathwayPreviews}
                                            </ul>
                                            : <div className="fullHeight">
                                                <h1 className="center font40px font24pxUnder500 whiteText">None.</h1>
                                            </div>}
                                    </Tab>
                                    <Tab label="Completed" style={style.tab}>
                                        {this.state.userCompletedPathwayPreviews ?
                                            <ul className="horizCenteredList pathwayPrevList"
                                                style={style.pathwayPreviewUl}>
                                                {this.state.userCompletedPathwayPreviews}
                                            </ul>
                                            : <div className="fullHeight">
                                                <h1 className="center font40px font24pxUnder500 whiteText">None</h1>
                                            </div>}
                                    </Tab>
                                </Tabs>
                            </div>
                            :
                            <div>
                                <div className="center">
                                    <CircularProgress color="white"
                                                      style={{marginTop: "200px"}}/>
                                </div>
                            </div>}
                    </div>
                    :
                    <div className="fillScreen"/>
                }
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
        closeNotification,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MyPathways);
