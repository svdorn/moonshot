"use strict"
import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import {Toolbar, ToolbarTitle, FlatButton, ToolbarGroup} from 'material-ui';

class Footer extends Component {


    // <Toolbar style={{textAlign:'center'}}>
    //     <ToolbarTitle
    //         text="Copyright 2017 Moonshot Learning Inc. All rights reserved."
    //         style={{
    //             textAlign:"center",
    //             fontSize:"12px"
    //         }}
    //     />
    // </Toolbar>
    //
    // <script src="//platform.linkedin.com/in.js" type="text/javascript">
    //     lang: en_US
    // </script>
    // <script type="IN/FollowCompany" data-id="18233111" data-counter="top"></script>

    goTo(route) {
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {
        return (
            <div className="jsxWrapper">
                <footer className="footer purpleToBlue" style={{minWidth: "800px"}}>
                    <ul className="horizCenteredList">
                        <li className="center">
                            <img
                                width={300}
                                height={100}
                                alt="300x100"
                                src="/images/MoonshotTempLogo.png"/>
                            <div className="whiteText tinyText">
                                &copy; 2018 Moonshot Learning Inc. All rights reserved.
                            </div>
                            <div style={{marginTop: "10px"}}>
                                <a href="https://www.facebook.com/MoonshotLearning/" target="_blank">
                                    <img
                                        width={20}
                                        height={20}
                                        src="/logos/Facebook.png"/>
                                </a>
                                <a href="https://www.facebook.com/MoonshotLearning/" target="_blank"
                                   style={{marginLeft: "10px"}}>
                                    <img
                                        width={20}
                                        height={20}
                                        src="/logos/Instagram.png"/>
                                </a>
                                <a href="https://www.linkedin.com/company/18233111/" target="_blank"
                                   style={{marginLeft: "10px"}}>
                                    <img
                                        width={20}
                                        height={20}
                                        src="/logos/LinkedIn.png"/>
                                </a>
                                <a href="https://www.youtube.com/channel/UCDna-8OVMOONwwqQk21f6ZQ" target="_blank"
                                   style={{marginLeft: "10px"}}>
                                    <img
                                        width={20}
                                        height={20}
                                        src="/logos/YouTube.png"/>
                                </a>
                            </div>
                        </li>
                    </ul>
                </footer>
            </div>
        );
    }
}

export default Footer;
