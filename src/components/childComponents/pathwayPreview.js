import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import axios from 'axios';

class PathwayPreview extends Component {
    constructor(props){
        super(props);
    }

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    render() {

        const iconStyle = {width:"32px", height:"32px"};

        const titleDivStyle = {
            width: "100%",
            height: "71.2px",
            display: "grid",
            marginTop: "5.6px",
            overflow: "hidden"
        };

        const titleSpanStyle = {
            margin: "auto",
            fontSize: "24px"
        };


        return (
            <div className="gradientBorder clickableNoUnderline" style={{height:"352px", width:"248px"}}>
                <div style={{textAlign:"center", position:"relative"}}>
                    <div className="gradientBorder pathwayImgContainer">
                        <img
                            className="semiOpaqueHoverable"
                            width={216}
                            height={160}
                            alt="VR Image"
                            src={this.props.image}
                        />
                    </div>
                    <div style={titleDivStyle}>
                        <span style={titleSpanStyle}>{this.props.name}</span>
                    </div>
                    <div style={{position: "absolute", width: "100%", bottom: "26.4px"}}>
                        <ul className="horizCenteredList pathwayPrevIconList">
                            <li>
                                <div>
                                    <img src="/icons/Clock.png" style={iconStyle} /><br/>
                                    <span className="tinyText">Completion Time</span><br/>
                                    {this.props.completionTime}
                                </div>
                            </li>
                            <li>
                                <div>
                                    <img src="/icons/Calendar.png" style={iconStyle} /><br/>
                                    <span className="tinyText">Deadline</span><br/>
                                    {this.props.deadline}
                                </div>
                            </li>
                            <li>
                                <div>
                                    <img src="/icons/Price.png" style={iconStyle} /><br/>
                                    <span className="tinyText">Price</span><br/>
                                    {this.props.price}
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div style={{position:"absolute", bottom:"4px", right:"16px"}}>
                        Sponsored by
                        <img
                            src={this.props.logo}
                            alt={this.props.sponsorName}
                            height={20}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default PathwayPreview;
