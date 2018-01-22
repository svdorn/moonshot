import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Paper } from 'material-ui';

class PathwayPreview extends Component {
    constructor(props){
        super(props);
        this.state = { shadow: 2 }

    }

    goTo (route)  {
        // closes any notification
        this.props.closeNotification();
        // goes to the wanted page
        browserHistory.push(route);
        // goes to the top of the new page
        window.scrollTo(0, 0);
    }

    onMouseOver = () => this.setState({ shadow: 4 });
    onMouseOut = () => this.setState({ shadow: 2 });

    render() {

        const iconStyle = {width:"32px", height:"32px"};
        const priceIconStyle = {width:"18px", height:"32px"};

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
            <div style={{position:"relative"}}>
                {this.props.comingSoon ?
                    <div className="comingSoonBanner">
                        <div>
                            <div>
                                Coming Soon
                            </div>
                        </div>
                    </div>
                    : null
                }

                <Paper className="clickableNoUnderline gradientBorder" style={{height:"352px", width:"248px"}}
                       onMouseOver={this.onMouseOver}
                       onMouseOut={this.onMouseOut}
                       zDepth={this.state.shadow}>
                    <div style={{textAlign:"center", position:"relative"}}>
                        { this.props.type == "addOne" ?
                            <img style={{width:"80px", marginTop:"120px"}}
                                src="/icons/PlusSign.png"
                            />
                        :
                            <div>
                                <div className="pathwayImgContainer imgBorder">
                                    <img
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
                                                <img src="/icons/ClockBlue.png" style={iconStyle} /><br/>
                                                <span className="tinyText">Completion Time</span><br/>
                                                {this.props.completionTime}
                                            </div>
                                        </li>
                                        <li>
                                            <div>
                                                <img src="/icons/CalandarBlueGradient.png" style={iconStyle} /><br/>
                                                <span className="tinyText">Deadline</span><br/>
                                                {this.props.deadline}
                                            </div>
                                        </li>
                                        <li>
                                            <div>
                                                <img src="/icons/DollarSignBlue.png" style={priceIconStyle} /><br/>
                                                <span className="tinyText">Price</span><br/>
                                                {this.props.price}
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                {/*<div style={{position:"absolute", bottom:"4px", right:"16px"}}>*/}
                                    {/*Sponsored by*/}
                                    {/*<img*/}
                                        {/*src={this.props.logo}*/}
                                        {/*alt={this.props.sponsorName}*/}
                                        {/*height={20}*/}
                                    {/*/>*/}
                                {/*</div>*/}
                            </div>
                        }
                    </div>
                </Paper>
            </div>
        )
    }
}

export default PathwayPreview;
