import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import {Paper} from 'material-ui';

class PathwayPreview extends Component {
    constructor(props) {
        super(props);
        this.state = {shadow: 2, shadowVariation1: 3}

    }

    onMouseOver = () => this.setState({shadow: 4});
    onMouseOut = () => this.setState({shadow: 2});
    onMouseOverVariation1 = () => this.setState({shadowVariation1: 5});
    onMouseOutVariation1 = () => this.setState({shadowVariation1: 3});


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

        let borderClassName = "whiteBorder";
        let clockImg = "/icons/ClockBlue.png";
        let calendarImg = "/icons/CalandarBlueGradient.png";
        let dollarSignImg = "/icons/DollarSignBlue.png";
        if (this.props.variation === "2") {
            borderClassName = "discoverPageBorder";
        }
        let whiteBorderClassName = "gradientBorder";
        let textColor = "";
        if (this.props.variation === "3") {
            whiteBorderClassName = "gradientBorderPurpleBlue";
            textColor = "lightPurpleText";
            clockImg = "icons/DiscoverPageClock.png";
            calendarImg = "icons/DiscoverPageCalendar.png";
            dollarSignImg = "icons/DiscoverPageDollarSign.png";
        } else if (this.props.variation === "4") {
            whiteBorderClassName = "gradientBorderOrangeYellow";
            textColor = "orangeText";
            clockImg = "icons/ProfilePageClock.png";
            calendarImg = "icons/ProfilePageCalendar.png";
            dollarSignImg = "icons/ProfilePageDollarSign.png";
        }

        let blurClass = ""
        if (this.props.comingSoon) {
            blurClass = "blurOnHover"
        }
        return (
            <div className="pathwayPreview" style={{position: "relative"}}>
                {this.props.comingSoon ?
                    <div className="comingSoonPathwayPreview">
                        <div className="comingSoonBanner">
                            <div>
                                <div>
                                    Coming Soon
                                </div>
                            </div>
                        </div>

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
                {this.props.variation == "1" || this.props.variation == "2" ?
                    <Paper className={"clickableNoUnderline " + borderClassName}
                           style={{height: "352px", width: "248px", backgroundColor: 'transparent'}}
                           onMouseOver={this.onMouseOverVariation1}
                           onMouseOut={this.onMouseOutVariation1}
                           zDepth={this.state.shadowVariation1}>
                        <div style={{textAlign: "center", position: "relative"}} className={blurClass}>
                            {this.props.type == "addOne" ?
                                <img style={{width: "80px", marginTop: "120px"}}
                                     src="/icons/PlusSignWhite.png"
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
                                                    {this.props.deadline && !this.props.comingSoon ? this.props.deadline : null}
                                                    {!this.props.deadline && !this.props.comingSoon ? "None" : null}
                                                    {this.props.comingSoon ? "TBA" : null }
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
                                    {this.props.comingSoon ?
                                        null :
                                        <div style={{position:"absolute", bottom:"4px", right:"16px"}} className="whiteText">
                                            <div style={{display:"inline-block", marginRight:"4px"}}>Hiring Partner</div>
                                            <img
                                                src={this.props.logo}
                                                alt={this.props.sponsorName}
                                                height={20}
                                            />
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </Paper>
                    :
                    <Paper className={"clickableNoUnderline " + whiteBorderClassName}
                           style={{height: "352px", width: "248px"}}
                           onMouseOver={this.onMouseOver}
                           onMouseOut={this.onMouseOut}
                           zDepth={this.state.shadow}>
                        <div style={{textAlign: "center", position: "relative"}} className={blurClass}>
                            {this.props.type == "addOne" ?
                                <img style={{width: "80px", marginTop: "120px"}}
                                     src="/icons/PlusSignOrange.png"
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
                                        <span style={titleSpanStyle} className={textColor}>{this.props.name}</span>
                                    </div>
                                    <div style={{position: "absolute", width: "100%", bottom: "26.4px"}}>
                                        <ul className="horizCenteredList pathwayPrevIconList">
                                            <li>
                                                <div>
                                                    <img src={clockImg} style={iconStyle}/><br/>
                                                    <span className="font8px">Completion Time</span><br/>
                                                    {this.props.completionTime}
                                                </div>
                                            </li>
                                            <li>
                                                <div>
                                                    <img src={calendarImg}
                                                         style={iconStyle}/><br/>
                                                    <span className="font8px">Deadline</span><br/>
                                                    {this.props.deadline && !this.props.comingSoon ? this.props.deadline : null}
                                                    {!this.props.deadline && !this.props.comingSoon ? "None" : null}
                                                    {this.props.comingSoon ? "TBA" : null }
                                                </div>
                                            </li>
                                            <li>
                                                <div>
                                                    <img src={dollarSignImg}
                                                         style={priceIconStyle}/><br/>
                                                    <span className="font8px">Price</span><br/>
                                                    {this.props.price}
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    {this.props.comingSoon ?
                                        null :
                                        <div style={{position:"absolute", bottom:"4px", right:"16px"}}>
                                            <div style={{display:"inline-block", marginRight:"4px"}}>Hiring Partner</div>
                                            <img
                                                src={this.props.logo}
                                                alt={this.props.sponsorName}
                                                height={20}
                                            />
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </Paper>
                }
            </div>
        )
    }
}

export default PathwayPreview;
