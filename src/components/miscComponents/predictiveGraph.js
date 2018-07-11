import React, { Component } from "react";
import HoverTip from "./hoverTip";

class PredictiveGraph extends Component {
    constructor(props) {
        super(props);

        // if width prop is given, be that width; otherwise adjust to the page width
        let width = window.innerWidth;
        if (this.props.width) {
            width = this.props.width;
            if (typeof width !== "number") {
                width = parseInt(width, 10);
            }
        }
        // get the interior width, if given
        let interiorWidth = undefined;
        if (this.props.interiorWidth) {
            interiorWidth = this.props.interiorWidth;
            if (typeof interiorWidth !== "number") {
                interiorWidth = parseInt(interiorWidth, 10);
            }
        }

        // need to keep track of width because this will change where the points are
        this.state = { width, interiorWidth };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }


    // figures out which transition-end event should be used for the user's browser
    whichTransitionEvent() {
        let t;
        let el = document.createElement('fakeelement');
        const transitions = {
          'transition':'transitionend',
          'OTransition':'oTransitionEnd',
          'MozTransition':'transitionend',
          'WebkitTransition':'webkitTransitionEnd'
        }

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }


    componentDidMount() {
        // if the graph is contained in another div, use that div's width
        if (this.props.containerName) {
            // get the container element
            let container = document.getElementById(this.props.containerName);
            // get its current width
            const width = container.offsetWidth;
            // set current width in state
            this.setState({ width });
            // get the event that fires on transition end
            const transitionEnd = this.whichTransitionEvent();
            // listen for a transition on it; this will make it so the graph can
            // update immediately on container resize intead of 1px later
            container.addEventListener(transitionEnd, this.updateWindowDimensions)
        }
        // otherwise, update the width according to the window's width
        else {
            this.updateWindowDimensions();
        }
        window.addEventListener('resize', this.updateWindowDimensions);
    }


    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }


    // when a parent div transitions, resize to fit its new size
    parentTransitioned() {
        this.updateWindowDimensions();
    }


    updateWindowDimensions() {
        // if there is a container, find its width
        if (this.props.containerName) {
                        // TODO: this is v hacky, but I don't know how to make it work otherwise
                        // this makes it wait a fraction of a second after resize so that the
                        // container div can update, then it checks the container div
            this.setState({ width: document.getElementById(this.props.containerName).offsetWidth });
        }
        // if there is not container, width is the width of the window
        else if (!this.props.width && window.innerWidth > 300) {
            this.setState({ width: window.innerWidth });
        }
    }

    render() {
        const props = this.props;
        const dataPoints = props.dataPoints;
        if (!dataPoints) {
            return null;
        }

        // the height of everything including the x axis labels
        const fullHeight = typeof props.height === "number" && props.height > 100 ? props.height : 400;
        // the height of the actual graph where points can be plotted
        const interiorHeight = fullHeight - 30;

        const interiorWidth = this.state.interiorWidth ? this.state.interiorWidth : this.state.width / 2;
        const interiorMarginLeft = (this.state.width - interiorWidth) / 2;


        const graphStyle = { height: fullHeight };
        const graphInteriorStyle = {
            height: interiorHeight,
            width: interiorWidth,
            marginLeft: interiorMarginLeft
        };

        // yAxisHeight is the height of the graph - the text on the x axis
        const yAxisStyle = {}

        const xAxisStyle = {};

        const yPointMarker80 = { bottom: interiorHeight / 3 };
        const yPointMarker120 = { top: interiorHeight / 3 };
        const yAxisLabel80Style = {
            bottom: interiorHeight / 3,
            transform: "translate(100%, 50%)"
        };
        const yAxisLabel120Style = {
            top: interiorHeight / 3,
            transform: "translate(100%, -50%)"
        };

        let xAxisLabels = [];
        let points = [];

        let numPoints = dataPoints.length;
        let pointCounter = 1;
        // there will be one more space than number of points
        const distanceBetweenPoints = interiorWidth / (numPoints + 1);

        const xAxisLabelsContainerStyle = {
            // left: interiorMarginLeft
        };

        const yAxisLabels = ["Poor", "Below Average", "Average", "Above Average", "Excellent"];
        const numLabels = yAxisLabels.length;
        let labelCounter = 0;
        const yAxisLabelDivs = yAxisLabels.map(label => {
            const labelHeight = 100.0 / numLabels;
            const fromBottom = labelCounter * labelHeight;
            // get the rgb values of the point
            // start at purple and go up to green
            const percentToGreen = fromBottom / 100;
            const r = 174 - (57 * percentToGreen);
            const g = 126 + (94 * percentToGreen);
            const b = 252;

            const labelStyle = {
                color: `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`,
                height: `${labelHeight}%`,
                bottom: `${fromBottom}%`
            }

            labelCounter++;

            return (
                <div className="leftYAxisLabel" style={labelStyle} key={`yAxis${label}`}>
                    <div>{label}</div>
                </div>
            )
        })

        // figure out how rotated the x axis labels should be
        const labelTransform = {};
        if (interiorWidth < 500) {
            let rotateAngle,
                yTranslation,
                xTranslation;

            if (interiorWidth > 250) {
                rotateAngle = 20;
                yTranslation = 5;
                xTranslation = 50;
            } else {
                rotateAngle = 30;
                yTranslation = 5;
                xTranslation = 50;
            }
            labelTransform.transform = `translate(${xTranslation}%, ${yTranslation}px) rotate(${rotateAngle}deg)`
        }


        // add each point and x axis label to their respective arrays
        dataPoints.forEach(point => {
            let label = point.x;
            let yValue = point.y;

            if (point.unavailable) { yValue = 100; }

            // 160 is the top of the graph, 40 is the bottom
            // 160 corresponds to 100%, 100 corresponds to 50%, 40 corresponds to 0%
            let fromBottomScore = yValue;
            if (yValue > 150) { fromBottomScore = 150; }
            if (yValue < 50 ) { fromBottomScore = 50; }
            const fromBottom = (fromBottomScore - 40) * 5 / 6;

            // get the rgb values of the point
            // start at purple and go up to green
            let percentToGreen = fromBottom / 100;
            let r = 174 - (57 * percentToGreen);
            let g = 126 + (94 * percentToGreen);
            let b = 252;

            if (point.unavailable) {
                r = 100; g = 100; b = 100;
            }

            const color = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
            let colorStyle = { backgroundColor: color };


            // the height of the line is determined by the confidence interval
            const confidenceInterval = point.confidenceInterval;
            const confidenceIntervalHeight = confidenceInterval*5/6;
            const confidenceIntervalStyle = {
                height: `${confidenceIntervalHeight}%`,
                bottom: `${fromBottom}%`,
                width: "2px"
            };

            const topBorderStyle = {
                bottom: `${fromBottom + (confidenceIntervalHeight / 2)}%`
            }
            const bottomBorderStyle = {
                bottom: `${fromBottom - (confidenceIntervalHeight / 2)}%`
            }

            const pointBoxStyle = {
                bottom: `${fromBottom}%`
            }

            const distanceFromYAxis = distanceBetweenPoints * pointCounter;

            // in total the points will take up the width of the graph, but to
            // ensure there is no overflow, take off just a bit
            const pointContainerWidth = (100.0 / numPoints) - .1;

            const pointContainerStyle = {
                width: `${pointContainerWidth}%`
            }

            // labels will be at the same position as the points
            const labelStyle = {
                width: `${pointContainerWidth}%`
            }

            points.push(
                <div className="pointContainer" style={pointContainerStyle} key={`points${label}`}>
                    <div className="confidenceIntervalLine" style={{...colorStyle, ...confidenceIntervalStyle}} />
                    <div className="confidenceIntervalBorder" style={{...colorStyle, ...topBorderStyle}} />
                    <div className="pointBox" style={{...colorStyle, ...pointBoxStyle}}>
                        <div style={{position: "relative"}}>{point.unavailable ? "N/A" : yValue}</div>
                        {point.unavailable ?
                            <HoverTip
                                style={{minWidth: `${interiorWidth/2}px`}}
                                text="Unavailable - not enough employee data to predict this value."
                            />
                            :
                            null
                        }
                    </div>
                    <div className="confidenceIntervalBorder" style={{...colorStyle, ...bottomBorderStyle}} />
                </div>
            );

            // add the label for the x axis
            xAxisLabels.push(
                <div className="xAxisLabel" style={labelStyle} key={`xAxis${label}`}>
                    <div style={labelTransform}>
                        {label}
                    </div>
                </div>
            );

            // on to the next point
            pointCounter++;
        });

        let title = null;
        if (this.props.title) {
            title = (
                <div className="predictiveGraphTitle whiteText center font24px font20pxUnder700 font16pxUnder500">
                    Predicted Performance
                </div>
            )
        }

        return (
            <div className="marginBottom50px font16px font14pxUnder500 font12pxUnder400 transitionAll">
                {title}
                <div className="predictiveGraph" style={graphStyle}>
                    <div className="predictiveGraphInterior" style={graphInteriorStyle}>
                        <div className="yPointMarker" style={yPointMarker120} />
                        <div className="yPointMarker" style={yPointMarker80} />
                        <div className="xAxis" style={xAxisStyle} />
                        <div className="yAxis" style={yAxisStyle} />
                        <div className="leftYAxisLabelContainer">
                            { yAxisLabelDivs }
                        </div>
                        <div className="rightYAxisLabel" style={yAxisLabel120Style}>120</div>
                        <div className="rightYAxisLabel" style={yAxisLabel80Style}>80</div>
                        <div className="pointsList">
                            { points }
                        </div>
                        <div className="xAxisLabelsContainer" style={xAxisLabelsContainerStyle}>
                            { xAxisLabels }
                        </div>
                    </div>
                </div>
            </div>
        )
    }


}

export default PredictiveGraph;
