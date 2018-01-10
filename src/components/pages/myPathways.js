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
            console.log("hey")
            if (this.props.currentUser.pathways) {
                if (this.props.currentUser.pathways.length == 0) {
                    const pathways = [];
                    const userPathwayPreviews = (
                        <li onClick={() => this.goTo('/discover')}>
                            <PathwayPreview type="addOne"/>
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
                            });
                        }).catch(function (err) {
                            console.log("error getting searched-for pathway");
                            console.log(err);
                        })
                    }
                }
            }
            if (this.props.currentUser.completedPathways) {
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
                backgroundColor: "white",
                color: 'black',
            },
        };


        return (
            <div className='jsxWrapper' ref='discover'>
                {this.props.currentUser ?
                    <div>
                        <div className="greenToBlue headerDiv"/>
                        {this.state.userPathwayPreviews ?
                            <div className="center">
                                <h1 className="center mediumText">My Pathways</h1>
                                <Tabs
                                    style={style.tabs}
                                    inkBarStyle={{background: 'black'}}
                                    tabItemContainerStyle={{width: '40%'}}
                                    className="myPathwaysTabs"
                                >
                                    <Tab label="Ongoing" style={style.tab}>
                                        {this.state.userPathwayPreviews ?
                                            <ul className="horizCenteredList pathwayPrevList"
                                                style={style.pathwayPreviewUl}>
                                                {this.state.userPathwayPreviews}
                                            </ul>
                                            : <h1 className="center mediumText">None</h1>}
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

export default connect(mapStateToProps, mapDispatchToProps)(MyPathways);
