import React, { Component } from 'react';

class PathwayPreview extends Component {
    render() {
        const categoryName = "Game Development";
        const categoryImage = "Unity_VR_Dev.jpg";


        return (
            <div className="gradientBorder clickableNoUnderline" style={{height:"320px", width:"310px"}}>
                <div style={{textAlign:"center", position:"relative"}}>
                    <div className="gradientBorder pathwayImgContainer">
                        <img
                            className="semiOpaqueHoverable"
                            width={270}
                            height={200}
                            alt="VR Image"
                            src={"/images/" + categoryImage}
                        />
                    </div>
                    <h2>{categoryName}</h2>
                </div>
            </div>
        )
    }


}

export default PathwayPreview;
