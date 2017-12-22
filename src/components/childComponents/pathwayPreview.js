import React, { Component } from 'react';

class PathwayPreview extends Component {
    render() {
        return (
            <div className="gradientBorder clickable" style={{height:"420px", width:"300px"}}>
                <div style={{textAlign:"center"}}>
                    <div className="gradientBorder pathwayImgContainer">
                        <div>
                            <img
                                width={260}
                                height={210}
                                alt="Unity Image"
                                src="/images/UnityPathway.png"
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
