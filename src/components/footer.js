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
                            <div className="whiteText smallText">
                                Copyright 2017 Moonshot Learning Inc. All rights reserved.
                            </div>
                        </li>
                        <li className="center">
                            <p className="whiteText smallText">
                                Moonshot Learning trains college students in<br/> market-demanded technology
                                skills.<br/>
                                Students learn for free and companies<br/> source and evaluate talent, for less.
                            </p>
                        </li>
                        <li className="center">
                            <div style={{margin: '10px'}}>
                                <a onClick={() => this.goTo('/')} className="smallText2 whiteText clickableNoUnderline" style={{marginRight:'15px'}}>Home</a>
                                <a onClick={() => this.goTo('/forBusiness')} className="smallText2 whiteText clickableNoUnderline">For Business</a>
                            </div>
                            <div>
                                <a onClick={() => this.goTo('/signup')} className="smallText2 whiteText clickableNoUnderline" style={{marginRight:'15px'}}>Student Sign Up</a>
                                <a onClick={() => this.goTo('/forBusiness')} className="smallText2 whiteText clickableNoUnderline">Contact Us</a>
                            </div>
                        </li>
                    </ul>
                </footer>
            </div>
        );
    }
}

export default Footer;
