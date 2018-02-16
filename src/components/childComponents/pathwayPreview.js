import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import {Paper} from 'material-ui';

class PathwayPreview extends Component {
    constructor(props) {
        super(props);
        this.state = {shadow: 2, shadowVariation1: 4}

    }

    onMouseOver = () => this.setState({shadow: 4});
    onMouseOut = () => this.setState({shadow: 2});
    onMouseOverVariation1 = () => this.setState({shadowVariation1: 8});
    onMouseOutVariation1 = () => this.setState({shadowVariation1: 4});


    render() {

        const iconStyle = {width: "32px", height: "32px"};
        const priceIconStyle = {width: "18px", height: "32px"};

        const titleDivStyle = {
            width: "100%",
            height: "71px",
            display: "grid",
            marginTop: "5px",
            overflow: "hidden"
        };

        const titleSpanStyle = {
            margin: "auto 2px",
            fontSize: "24px"
        };

        return (
            <div className="pathwayPreview" style={{position: "relative"}}>
                {this.props.comingSoon ?
                    <div className="comingSoonPathwayPreview">
                        <div/>
                        {/* remove this when coming soon banner added back in */}

                        {/*<div className="comingSoonBanner">
                            <div>
                                <div>
                                    Coming Soon
                                </div>
                            </div>
                        </div>*/}

                        <div className="reserveYourSpotOnHover">
                            <div className="font36px whiteText">
                                <b>Reserve Your Spot Now</b>
                                <div className="blueButton font24px" style={{marginTop: "26px"}}>
                                    Reserve
                                </div>
                            </div>
                        </div>
                    </div>
                    : null
                }
                {this.props.variation == "1" ?
                    <Paper className="clickableNoUnderline whiteBorder" style={{height: "352px", width: "248px", backgroundColor: 'transparent'}}
                           onMouseOver={this.onMouseOverVariation1}
                           onMouseOut={this.onMouseOutVariation1}
                           zDepth={this.state.shadowVariation1}>
                        <div style={{textAlign: "center", position: "relative"}}>
                            {this.props.type == "addOne" ?
                                <img style={{width: "80px", marginTop: "120px"}}
                                     src="/icons/PlusSign.png"
                                />
                                :
                                <div>
                                    <div className="pathwayImgContainer imgBorder">
                                        {this.props.image ?
                                            <img
                                                width={216}
                                                height={160}
                                                alt="VR Image"
                                                src={this.props.image}
                                            />
                                            : null
                                        }
                                    </div>
                                    <div style={titleDivStyle} className="whiteText">
                                        <span style={titleSpanStyle}>{this.props.name}</span>
                                    </div>
                                    <div style={{position: "absolute", width: "100%", bottom: "26.4px"}}>
                                        <ul className="horizCenteredList pathwayPrevIconList">
                                            <li>
                                                <div className="whiteText">
                                                    <img src="/icons/ClockWhite.png" style={iconStyle}/><br/>
                                                    <span className="font8px">Completion Time</span><br/>
                                                    {this.props.completionTime}
                                                </div>
                                            </li>
                                            <li>
                                                <div className="whiteText">
                                                    <img src="/icons/CalendarWhite.png" style={iconStyle}/><br/>
                                                    <span className="font8px">Deadline</span><br/>
                                                    TBA
                                                </div>
                                            </li>
                                            <li>
                                                <div className="whiteText">
                                                    <img src="/icons/DollarSignWhite.png" style={priceIconStyle}/><br/>
                                                    <span className="font8px">Price</span><br/>
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
                    :
                    <Paper className="clickableNoUnderline gradientBorder" style={{height: "352px", width: "248px"}}
                           onMouseOver={this.onMouseOver}
                           onMouseOut={this.onMouseOut}
                           zDepth={this.state.shadow}>
                        <div style={{textAlign: "center", position: "relative"}}>
                            {this.props.type == "addOne" ?
                                <img style={{width: "80px", marginTop: "120px"}}
                                     src="/icons/PlusSign.png"
                                />
                                :
                                <div>
                                    <div className="pathwayImgContainer imgBorder">
                                        {this.props.image ?
                                            <img
                                                width={216}
                                                height={160}
                                                alt="VR Image"
                                                src={this.props.image}
                                            />
                                            : null
                                        }
                                    </div>
                                    <div style={titleDivStyle}>
                                        <span style={titleSpanStyle}>{this.props.name}</span>
                                    </div>
                                    <div style={{position: "absolute", width: "100%", bottom: "26.4px"}}>
                                        <ul className="horizCenteredList pathwayPrevIconList">
                                            <li>
                                                <div>
                                                    <img src="/icons/ClockBlue.png" style={iconStyle}/><br/>
                                                    <span className="font8px">Completion Time</span><br/>
                                                    {this.props.completionTime}
                                                </div>
                                            </li>
                                            <li>
                                                <div>
                                                    <img src="/icons/CalandarBlueGradient.png" style={iconStyle}/><br/>
                                                    <span className="font8px">Deadline</span><br/>
                                                    TBA
                                                </div>
                                            </li>
                                            <li>
                                                <div>
                                                    <img src="/icons/DollarSignBlue.png" style={priceIconStyle}/><br/>
                                                    <span className="font8px">Price</span><br/>
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
                    </Paper>}
            </div>
        )
    }
}

export default PathwayPreview;
