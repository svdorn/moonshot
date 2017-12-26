import React, { Component } from 'react';

class HomepageTriangles extends Component {
    render() {
        const transformations = [
            {top: "30%", right: "0%", rotate: -30, scale: .4},
            {top: "42%", right: "9%", rotate: -60, scale: .6},
            {top: "50%", right: "4%", rotate: -11, scale: .7},
            {top: "54%", right: "23%", rotate: -134, scale: .3},
            {top: "60%", right: "16%", rotate: -19, scale: .5},
            {top: "68%", right: "3%", rotate: -72, scale: .4},
            {top: "71%", right: "32%", rotate: -111, scale: .7},
            {top: "74%", right: "19%", rotate: -98, scale: .6},
            {top: "67%", right: "49%", rotate: -2, scale: .3},
            {top: "80%", right: "27%", rotate: -58, scale: .4},
        ];

        let counter = 0;
        const triangles = transformations.map(function(t) {
            counter++;
            return (
                <div className="triangle" key={"triangle" + counter} style={{
                    top: t.top,
                    right: t.right,
                    transform: "rotate("+t.rotate+"deg) scale("+t.scale+", "+(t.scale*.6)+")"
                }}/>
            )
        })

        return (
            <div className="jsxWrapper" style={{position:"absolute", width:"100%"}}>
                <div className="fullHeight" style={{position:"relative", minWidth:"800px"}}>
                    {triangles}
                </div>
            </div>
        )
    }


}

export default HomepageTriangles;
