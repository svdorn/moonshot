import React, { Component } from 'react';

class PathwayPreview extends Component {
    render() {
        const pathwayName = "Unity Development";
        const pathwayImage = "Unity_VR_Dev.jpg";
        const companyLogo = "HolosLogo.png";
        const companyName = "Holos";
        const completionTime = "18 Hours";
        const deadline = "12/28/2022";
        const price = "Free";

        const iconStyle = {width:"40px", height:"40px"};

        return (
            <div className="gradientBorder clickableNoUnderline" style={{height:"420px", width:"310px"}}>
                <div style={{textAlign:"center", position:"relative"}}>
                    <div className="gradientBorder pathwayImgContainer">
                        <img
                            className="semiOpaqueHoverable"
                            width={270}
                            height={200}
                            alt="VR Image"
                            src={"/images/" + pathwayImage}
                        />
                    </div>
                    <h2>{pathwayName}</h2>
                    <ul className="horizCenteredList pathwayPrevIconList">
                        <li>
                            <div>
                                <img src="/icons/Clock.png" style={iconStyle} /><br/>
                                <span className="tinyText">Completion Time</span><br/>
                                {completionTime}
                            </div>
                        </li>
                        <li>
                            <div>
                                <img src="/icons/Calendar.png" style={iconStyle} /><br/>
                                <span className="tinyText">Deadline</span><br/>
                                {deadline}
                            </div>
                        </li>
                        <li>
                            <div>
                                <img src="/icons/Price.png" style={iconStyle} /><br/>
                                <span className="tinyText">Price</span><br/>
                                {price}
                            </div>
                        </li>
                    </ul>
                    <div style={{position:"absolute", bottom:"5px", right:"20px"}}>
                        Sponsored by
                        <img
                            src={"/images/" + companyLogo}
                            alt={companyName}
                            height={25}
                        />
                    </div>
                </div>
            </div>
        )
    }


}

export default PathwayPreview;
