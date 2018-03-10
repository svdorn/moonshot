"use strict"
import React, {Component} from 'react';
import {Tabs, Tab, CircularProgress, Paper, Divider} from 'material-ui';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {closeNotification, setHeaderBlue} from "../../../actions/usersActions";
import {bindActionCreators} from 'redux';
import PathwayPreview from '../../childComponents/pathwayPreview';
import axios from 'axios';

class BusinessProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pathways: [],
            onOwnProfile: false,
            completedPathways: [],
            userPathwayPreviews: undefined,
            userCompletedPathwayPreviews: undefined,
            user: undefined,
            editProfile: false,
        }
    }

    componentDidMount() {
        // if trying to look at someone else's profile, there will be a query
        let profileUrl = undefined;
        if (this.props.location.query) {
            profileUrl = this.props.location.query.user;
        }

        const currentUser = this.props.currentUser;
        // looking at your own profile
        if ((!profileUrl) || (currentUser && currentUser.profileUrl == profileUrl)) {
            this.setState({
                ...this.state,
                onOwnProfile: true,
                user: currentUser
            }, () => {
                //TODO: make the list of other users here
                this.makeCandidates();
            })
        }

        // looking at someone else's profile
        else {
            axios.post("/api/getUserByProfileUrl", {profileUrl}
            ).then(res => {
                const user = res.data;

                this.setState({
                    ...this.state,
                    onOwnProfile: false,
                    user
                }, () => {
                    this.makeCandidates();
                })
            })
        }

        // this.props.setHeaderBlue(true);


    }

    makeCandidates() {
    }


    goTo(route) {
        // closes any notification
        this.props.closeNotification();
        // sets header back to normal
        // this.props.setHeaderBlue(false);
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
            imgContainer: {
                height: "100px",
                width: "100px",
                borderRadius: '50%',
                border: "3px solid white",
                display: "inline-block",
                overflow: "hidden"
            },
            img: {
                height: "85px",
                marginTop: "13px"
            },
            locationImg: {
                display: 'inline-block',
                height: '15px',
                marginBottom: '5px',
                marginRight: '5px'
            },
            tabs: {
                marginTop: '20px',
            },
            tab: {
                color: '#f24c49',
            },
            topTabs: {
                marginTop: '20px',

            },
            topTab: {
                color: 'white',
            },
            tabContent: {
                backgroundColor: 'white',
                paddingTop: '10px',
                paddingBottom: '30px',
            }
        };

        const user = this.props.currentUser;

        return (
            <div className='jsxWrapper' ref='discover'>
                {user ?

                    <div className="orangeToYellowGradient" zDepth={3}>
                        <div className="headerDiv"/>
                        <div className="profileInfoSkills">
                            <div className="center">
                                {/*<div className="clickable blueText font20px font14pxUnder700"
                                                     style={{marginTop: '-20px', marginBottom: '10px'}}
                                                     onClick={this.editProfile.bind(this)}
                                                >
                                                    Edit Profile
                                                </div>*/}
                                <div style={style.imgContainer}>
                                    <img
                                        src="/icons/ProfilePicture.png"
                                        alt="Profile picture"
                                        style={style.img}
                                    />
                                </div>
                                <div>
                                    <div
                                        className="whiteText font20px font14pxUnder700">{user.company.name.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <Tabs
                                style={style.topTabs}
                                inkBarStyle={{background: 'white'}}
                                tabItemContainerStyle={{width: '40%'}}
                                className="myPathwaysTabs"
                            >
                                <Tab label="Candidates" style={style.topTab}>
                                    <div className="center fullHeight" style={style.tabContent}>
                                        <div className="profileProjects">
                                            None
                                        </div>
                                    </div>
                                </Tab>
                                <Tab label="Pathways" style={style.topTab}>
                                    <div style={style.tabContent}
                                         className="fullHeight font28px font font24pxUnder700 font20pxUnder500 center">
                                        <div className="profileProjects">
                                            None
                                        </div>
                                    </div>
                                </Tab>
                                <Tab label="About" style={style.topTab}>
                                    <div style={style.tabContent}
                                         className="fullHeight font28px font font24pxUnder700 font20pxUnder500 center">
                                        <div className="profileProjects">
                                            None
                                        </div>
                                    </div>
                                </Tab>
                            </Tabs>
                        </div>
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
        closeNotification,
        setHeaderBlue,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessProfile);
