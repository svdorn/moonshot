import React, { Component } from 'react';

class HomepageTriangles extends Component {
    render() {
        const transformations = [
            {top: "300px", right: "100px", rotate: 0, scale: .8}
        ];

        const triangles = transformations.map(function(t) {
            return (
                <div className="triangle" style={{
                    bottom: t.bottom,
                    right: t.right,
                    transform: "rotate("+t.rotate+"deg) scale("+t.scale+" "+t.scale*.6+")"
                }}/>
            )
        })

        return (
            <div className="jsxWrapper" style={{position:"relative"}}>
                {triangles}
            </div>
        )
    }


}

export default HomepageTriangles;
