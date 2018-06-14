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
                color: `rgb(${r},${g},${b})`,
                height: `${labelHeight}%`,
                bottom: `${fromBottom}%`
            }

            labelCounter++;

            return (
                <div className="leftYAxisLabel" style={labelStyle}>
                    <div>{label}</div>
                </div>
            )
        })


        // add each point and x axis label to their respective arrays
        dataPoints.forEach(point => {
            const label = point.x;
            const yValue = point.y;

            // 160 is the top of the graph, 40 is the bottom
            // 160 corresponds to 100%, 100 corresponds to 50%, 40 corresponds to 0%
            const fromBottom = (yValue - 40) * 5 / 6;

            // get the rgb values of the point
            // start at purple and go up to green
            let percentToGreen = fromBottom / 100;
            const r = 174 - (57 * percentToGreen);
            const g = 126 + (94 * percentToGreen);
            const b = 252;

            const color = `rgb(${r},${g},${b})`;
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
                <div className="pointContainer" style={pointContainerStyle}>
                    <div className="confidenceIntervalLine" style={{...colorStyle, ...confidenceIntervalStyle}} />
                    <div className="confidenceIntervalBorder" style={{...colorStyle, ...topBorderStyle}} />
                    <div className="pointBox" style={{...colorStyle, ...pointBoxStyle}}>{yValue}</div>
                    <div className="confidenceIntervalBorder" style={{...colorStyle, ...bottomBorderStyle}} />
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

        let title = null;
        if (this.props.title) {
            title = (
                <div className="predictiveGraphTitle whiteText center font24px font20pxUnder700 font16pxUnder500">
                    Predicted Performance
                </div>
            )
        }

        return (
            <div className="marginBottom50px">
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
