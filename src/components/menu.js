"use strict"
import React, { Component } from 'react';
import { AppBar, FlatButton, ToolbarGroup, DropDownMenu, MenuItem, Divider, Toolbar, ToolbarTitle } from 'material-ui';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { signout } from "../actions/usersActions";
import { getHomepageImages } from "../actions/imageactions";
import { axios } from 'axios';

const styles = {
    title: {
        cursor: 'pointer',
    },
    underlineStyle: {
        display: 'none',
    },
    menuItemStyle: {
        textColor: '#00c3ff',
    },
    anchorOrigin: {
        vertical: 'center',
        horizontal: 'middle'
    }
};

class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {value: 1};
    }

    // constructor() {
    //     super();
    //     this.state = {
    //       value: 1,
    //       images:[{}],
    //       img:'/images/MoonshotLogo.png'
    //     }
    //   }
    //
    //   componentDidMount() {
    //     // GET IMAGES FROM API
    //     axios.get('/api/images')
    //       .then(response => {
    //         this.setState({images: response.data})
    //       })
    //       .catch(err => {
    //         this.setState({images:'error loading image files from the server', img:''})
    //       })
    //   }


    //componentDidMount() {
        //GET IMAGES FROM API
        // if (this.props.images.length == 0) {
        //     this.props.getHomepageImages();
        // } else {
        //   console.log("not getting images");
        //     console.log(this.props);
        // }
        // let moonshotLogo = {};
        // const imgs = this.props.images;
        // for (let imgIdx = 0; imgIdx < imgs.length; imgIdx++) {
        //     if (imgs[imgIdx].name == "MoonshotTempLogo.png") {
        //         moonshotLogo = imgs[imgIdx];
        //     }
        // }
    //}

    handleChange = (event, index, value) => {
        if (value === 1) {
            browserHistory.push('/profile');
        } else if (value === 2) {
            browserHistory.push('/settings');
        } else {
            this.props.signout();
            browserHistory.push('/');
        }
        this.setState({value})
    };

    goTo (route)  {
        browserHistory.push(route);
    }

    render() {
        if (this.props.isFetching) {
            return (
                <header>
                    <Toolbar>
                        <ToolbarGroup>
                            <img width={300} height={100} alt="300x100" src="/images/MoonshotTempLogo.png" />
                        </ToolbarGroup>
                    </Toolbar>
                </header>
            );
        }

        return (
            <header>
                {this.props.currentUser ?
                    <Toolbar>
                        <ToolbarGroup>
                            <img width={300} height={100} alt="300x100" src="/images/MoonshotTempLogo.png" />
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <FlatButton label="Home" onClick={() => this.goTo('/')} />
                            <FlatButton label="Sandbox"  onClick={() => this.goTo('/sandbox')} />
                            <DropDownMenu value={this.state.value}
                                          onChange={this.handleChange}
                                          underlineStyle={styles.underlineStyle}
                                          anchorOrigin={styles.anchorOrigin}
                            >
                                <MenuItem value={1} primaryText="Profile" />
                                <Divider />
                                <MenuItem value={2} primaryText="Settings" />
                                <MenuItem value={3} primaryText="Sign Out"/>
                            </DropDownMenu>
                        </ToolbarGroup>
                    </Toolbar>
                    :

                <Toolbar>
                    <ToolbarGroup>
                        <ToolbarTitle text="Moonshot Learning" />
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <FlatButton label="Home" onClick={() => this.goTo('/')} />
                        <FlatButton label="Login" onClick={() => this.goTo('/login')} />
                        <FlatButton label="Signup" onClick={() => this.goTo('/signup')} />
                    </ToolbarGroup>
                </Toolbar>}
            </header>

        )
    }
}
function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        signout,
        getHomepageImages
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        currentUser: state.users.currentUser,
        isFetching: state.users.isFetching,
        images: state.images.images
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
