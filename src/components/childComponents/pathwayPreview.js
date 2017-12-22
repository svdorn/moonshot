import React, { Component } from 'react';

class PathwayPreview extends Component {
    render() {
        return (
            <div className="gradientBorder clickable" style={{height:"420px", width:"300px"}}>
                <div style={{textAlign:"center"}}>
                    <div className="gradientBorder pathwayImgContainer">
                        <div>
                            <img
                                width={200}
                                height={150}
                                alt="200x150"
                                src="/images/UnityPathyway.png"
                                onClick={() => this.goTo('/')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }


}

export default PathwayPreview;
