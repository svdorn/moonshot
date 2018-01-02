import React, { Component } from 'react';
import axios from 'axios';

class PathwayPreview extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         name: "",
    //         image: "",
    //         logo: "",
    //         sponsorName: "",
    //         completionTime: "",
    //         deadline: "",
    //         price: ""
    //     }
    // }

    // componentDidMount = NEED TO GET THE

    render() {
        const pathwayName = "Unity Development";
        const pathwayImage = "Unity_VR_Dev.jpg";
        const companyLogo = "HolosLogo.png";
        const companyName = "Holos";
        const completionTime = "18 Hours";
        const deadline = "12/28/2022";
        const price = "Free";

        const iconStyle = {width:"40px", height:"40px"};

        // axios.get('/api/pathway', {
        //     params: {
        //         name: this.props.pathwayName
        //     }
        // }).then(function(result) {
        //
        // });


        return (
            <div className="gradientBorder clickableNoUnderline" style={{height:"420px", width:"310px"}}>
                <div style={{textAlign:"center", position:"relative"}}>
                    <div className="gradientBorder pathwayImgContainer">
                        <img
                            className="semiOpaqueHoverable"
                            width={270}
                            height={200}
                            alt="VR Image"
                            src={this.props.image}
                        />
                    </div>
                    <h2>{this.props.name}</h2>
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
                    <div style={{position:"absolute", bottom:"5px", right:"20px"}}>
                        Sponsored by
                        <img
                            src={this.props.logo}
                            alt={this.props.sponsorName}
                            height={25}
                        />
                    </div>
                </div>
            </div>
        )
    }


}

export default PathwayPreview;
