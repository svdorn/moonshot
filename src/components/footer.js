"use strict"
import React, { Component } from 'react';
import {Toolbar, ToolbarTitle, FlatButton, ToolbarGroup } from 'material-ui';

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


    // <iframe
    //     src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2FMoonshotLearning%2F&width=450&layout=standard&action=like&size=small&show_faces=true&share=true&height=80&appId=93815497157"
    //     width="450"
    //     height="80"
    //     style={{border:"none", overflow:"hidden"}}
    //     scrolling="no"
    //     frameBorder="0"
    //     allowTransparency="true">
    // </iframe>
    //
    // <script src="//platform.linkedin.com/in.js" type="text/javascript">
    //     lang: en_US
    // </script>
    // <script type="IN/FollowCompany" data-id="18233111" data-counter="top"></script>



    render() {
        return (
            <div className="jsxWrapper">
                <footer className="footer text-center" style={{minWidth:"800px"}}>
                    Copyright 2017 Moonshot Learning Inc. All rights reserved.
                </footer>
            </div>
        );
    }
}

export default Footer;
