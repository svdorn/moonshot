import React, { Component } from 'react';

class PredictiveGraph extends Component {
    constructor(props) {
        super(props);

        // need to keep track of width because this will change where the points are
        this.state = { width: window.innerWidth };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }


    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }


    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }


    updateWindowDimensions() {
        this.setState({ width: window.innerWidth });
    }

    render() {
        const props = this.props;
        const dataPoints = props.dataPoints;
        if (!dataPoints) {
            console.log("no data points given");
            return null;
        }

        // the height of everything including the x axis labels
        const fullHeight = typeof props.height === "number" && props.height > 100 ? props.height : 400;
        // the height of the actual graph where points can be plotted
        const interiorHeight = fullHeight - 30;

        const interiorWidth = this.state.width / 2;
        const interiorMarginLeft = this.state.width / 4;


        const graphStyle = { height: fullHeight };
        const graphInteriorStyle = {
            height: interiorHeight,
            width: interiorWidth,
            marginLeft: interiorMarginLeft
        };

        // yAxisHeight is the height of the graph - the text on the x axis
        const yAxisStyle = {

        }

        const xAxisStyle = {};

        const yPointMarker80 = { bottom: interiorHeight / 3 };
        const yPointMarker120 = { top: interiorHeight / 3 };

        let yAxisLabels = [];
        let xAxisLabels = [];
        let points = [];

        let numPoints = dataPoints.length;
        let pointCounter = 1;
        // there will be one more space than number of points
        const distanceBetweenPoints = interiorWidth / (numPoints + 1);

        const xAxisLabelsContainerStyle = {
            // left: interiorMarginLeft
        };

        // add each point and x axis label to their respective arrays
        dataPoints.forEach(point => {
            const label = point.x;
            const yValue = point.y;



            // get the rgb values of the point
            const r = 122;
            const g = 200;
            let b = 100 + yValue;
            if (b > 255) {
                b = 255;
            }

            const color = `rgb(${r},${g},${b})`;
            let colorStyle = { backgroundColor: color };

            // 160 is the top of the graph, 40 is the bottom
            // 160 corresponds to 100%, 100 corresponds to 50%, 40 corresponds to 0%
            const fromBottom = (yValue - 40) * 5 / 6;

            // the height of the line is determined by the confidence interval
            const confidenceInterval = point.confidenceInterval;
            const confidenceIntervalStyle = {
                height: `${confidenceInterval*5/6}%`,
                bottom: `${fromBottom}%`,
                width: "2px"
            };


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
                <div className="pointContainer" style={pointContainerStyle}>
                    <div className="confidenceIntervalLine" style={{...colorStyle, ...confidenceIntervalStyle}} />
                    <div className="confidenceIntervalTopBorder" style={colorStyle} />
                    <div className="pointBox" style={{...colorStyle, ...pointBoxStyle}}>{yValue}</div>
                    <div className="confidenceIntervalBottomBorder" style={colorStyle} />
                </div>
            );

            // add the label for the x axis
            xAxisLabels.push(
                <div className="xAxisLabel" style={labelStyle}>
                    {label}
                </div>
            );

            // on to the next point
            pointCounter++;
        });

        return (
            <div className="predictiveGraph" style={graphStyle}>
                <div className="predictiveGraphInterior" style={graphInteriorStyle}>
                    <div className="yPointMarker" style={yPointMarker120} />
                    <div className="yPointMarker" style={yPointMarker80} />
                    <div className="xAxis" style={xAxisStyle} />
                    <div className="yAxis" style={yAxisStyle} />
                    <div className="pointsList">
                        { points }
                    </div>
                </div>
                <div className="yAxisLabelsContainer">
                    { yAxisLabels }
                </div>
                <div className="xAxisLabelsContainer" style={xAxisLabelsContainerStyle}>
                    { xAxisLabels }
                </div>
            </div>
        )
    }


}

export default PredictiveGraph;
