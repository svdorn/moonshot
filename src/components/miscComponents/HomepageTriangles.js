import React, { Component } from 'react';

class HomepageTriangles extends Component {
    render() {
        let transformations = [];
        let whiteSpace = null;
        let zIndex = "10";

        if (this.props.variation == "1") {
            transformations = [
                {top: "30vh", right: "0%", rotate: -30, scale: .4, className: " whiteTriangle"},
                {top: "42vh", right: "9%", rotate: -60, scale: .6, className: " whiteTriangle"},
                {top: "50vh", right: "4%", rotate: -11, scale: .7, className: " whiteTriangle"},
                {top: "54vh", right: "23%", rotate: -134, scale: .3, className: " whiteTriangle"},
                {top: "60vh", right: "16%", rotate: -19, scale: .5, className: " whiteTriangle"},
                {top: "68vh", right: "3%", rotate: -72, scale: .4, className: " whiteTriangle"},
                {top: "71vh", right: "32%", rotate: -111, scale: .7, className: " whiteTriangle"},
                {top: "74vh", right: "19%", rotate: -98, scale: .6, className: " whiteTriangle"},
                {top: "77vh", right: "52%", rotate: -2, scale: .3, className: " whiteTriangle"},
                {top: "80vh", right: "27%", rotate: -58, scale: .4, className: " whiteTriangle"}
            ];
        } else if (this.props.variation == "2"){
            transformations = [
                {top: "10%", right: "0%", rotate: -30, scale: .4, className: " purpleTriangle"},
                {top: "14%", right: "14%", rotate: -60, scale: .8, className: " purpleTriangle"},
                {top: "20%", right: "4%", rotate: -11, scale: .7, className: " purpleTriangle"},
                {top: "24%", right: "23%", rotate: -134, scale: .3, className: " purpleTriangle"},
                {top: "30%", right: "16%", rotate: -19, scale: .5, className: " purpleTriangle"},
                {top: "55%", right: "3%", rotate: -72, scale: .2, className: " greenTriangle"},
                {top: "71%", right: "22%", rotate: -111, scale: .7, className: " greenTriangle"},
                {top: "77%", right: "14%", rotate: -98, scale: .6, className: " greenTriangle"},
                {top: "63%", right: "10%", rotate: -2, scale: .75, className: " greenTriangle"},
                {top: "80%", right: "32%", rotate: -58, scale: .4, className: " greenTriangle"},
                {top: "76%", right: "5%", rotate: -15, scale: .9, className: " greenTriangle"}
            ];
            whiteSpace = (
                <div style={{width:"100%", height:"100%"}}>
                    <div style={{
                        width: "50%",
                        height: "45%",
                        float: "right",
                        zIndex: "-5",
                        background: "linear-gradient(to bottom left, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 1.0))"
                    }}/>
                    <div style={{ float: "right", height: "15%", width: "40%", clear: "both" }} />
                    <div style={{
                        width: "50%",
                        height: "40%",
                        float: "right",
                        clear: "both",
                        zIndex: "-5",
                        background: "linear-gradient(to left, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 1.0))"
                    }}/>
                </div>
            )
            zIndex = "-10";
        } else if (this.props.variation == "3") {
            transformations = [
                {top: "10vh", right: "0%", rotate: -30, scale: .4, className: " darkPurpleTriangle"},
                {top: "14vh", right: "14%", rotate: -60, scale: .8, className: " darkPurpleTriangle"},
                {top: "20vh", right: "4%", rotate: -11, scale: .7, className: " darkPurpleTriangle"},
                {top: "24vh", right: "23%", rotate: -134, scale: .3, className: " darkPurpleTriangle"},
                {top: "30vh", right: "16%", rotate: -19, scale: .5, className: " darkPurpleTriangle"},

                {top: "7vh", left: "0%", rotate: -15, scale: .9, className: " darkPurpleTriangle"},
                {top: "20vh", left: "8%", rotate: -35, scale: .7, className: " darkPurpleTriangle"},
                {top: "32vh", left: "0%", rotate: -110, scale: 1.2, className: " darkPurpleTriangle"},

            ];
            whiteSpace = (
                <div style={{width:"100%", height:"100%"}}>
                    <div style={{
                        width: "100%",
                        height: "100%",
                        float: "left",
                        zIndex: "-5",
                        background: "linear-gradient(to right, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 1.0), rgba(255, 255, 255, 0.2))"
                    }}/>
                </div>
            )
            zIndex = "-10";
        } else if (this.props.variation == "4") {
            transformations = [
                {top: "30vh", right: "0%", rotate: -30, scale: .4, className: " whiteTriangle"},
                {top: "42vh", right: "9%", rotate: -60, scale: .6, className: " whiteTriangle"},
                {top: "50vh", right: "4%", rotate: -11, scale: .7, className: " whiteTriangle"},
                {top: "54vh", right: "23%", rotate: -134, scale: .3, className: " whiteTriangle"},
                {top: "60vh", right: "16%", rotate: -19, scale: .5, className: " whiteTriangle"},
                {top: "68vh", right: "3%", rotate: -72, scale: .4, className: " whiteTriangle"},
                {top: "70vh", right: "26%", rotate: -111, scale: .7, className: " whiteTriangle"},
                {top: "74vh", right: "19%", rotate: -98, scale: .6, className: " whiteTriangle"},
            ];
        }

        let counter = 0;
        const triangles = transformations.map(function(t) {
            counter++;
            return (
                <div className={"triangle" + t.className} key={"triangle" + counter} style={{
                    top: t.top,
                    right: t.right,
                    left: t.left,
                    zIndex: "-10",
                    transform: "rotate("+t.rotate+"deg) scale("+t.scale+", "+(t.scale*.6)+")"
                }}/>
            )
        })

        return (
            <div className={"jsxWrapper " + this.props.className} style={{position:"relative", width:"100%", zIndex:zIndex, pointerEvents:"none"}}>
                <div style={{position:"absolute", width:"100%", pointerEvents:"none"}}>
                    <div className="fillScreen" style={{position:"relative", pointerEvents:"none"}}>
                        <div className="above800fade">
                            {triangles}
                            {whiteSpace}
                        </div>
                    </div>
                </div>
            </div>
        )
    }


}

export default HomepageTriangles;
