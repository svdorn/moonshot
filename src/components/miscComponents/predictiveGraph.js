import React, { Component } from 'react';

class PredictiveGraph extends Component {
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
        const interiorHeight = fullHeight;

        const graphStyle = { height: fullHeight };
        const graphInteriorStyle = {height: fullHeight - 30};

        // yAxisHeight is the height of the graph - the text on the x axis
        const yAxisStyle = {

        }

        const xAxisStyle = {};

        const yPointMarker80 = { bottom: interiorHeight / 3 };
        const yPointMarker120 = { top: interiorHeight / 3 };

        let yAxisLabels = [];
        let xAxisLabels = [];
        let points = [];

        // add each point and x axis label to their respective arrays
        dataPoints.forEach(point => {
            const label = point.x;
            const yValue = point.y;

            // add the label for the x axis
            xAxisLabels.push(
                <div className="xAxisLabel">{label}</div>
            );

            // get the rgb values of the point
            const r = 122;
            const g = 200;
            let b = 100 + yValue;
            if (b > 255) {
                b = 255;
            }

            const color = `rgb(${r},${g},${b})`;
            let colorStyle = { backgroundColor: color };

            // the height of the line is determined by the confidence interval
            const confidenceInterval = point.confidenceInterval;
            const lineHeight = confidenceInterval * 2;
            const confidenceIntervalStyle = {
                height: `${lineHeight}px`,
                width: "2px"
            };

            points.push(
                <div className="pointContainer">
                    <div className="confidenceIntervalTopLine" style={{...colorStyle, ...confidenceIntervalStyle}} />
                    <div className="confidenceIntervalTopBorder" style={colorStyle} />
                    <div className="pointBox" style={colorStyle}>{yValue}</div>
                    <div className="confidenceIntervalBottomLine" style={{colorStyle, ...confidenceIntervalStyle}} />
                    <div className="confidenceIntervalBottomBorder" style={colorStyle} />
                </div>
            )

            return (
                <div>
                    <div>{label}</div>
                    <div>{yValue}</div>
                </div>
            );
        });

        return (
            <div className="predictiveGraph" style={graphStyle}>
                <div className="predictiveGraphInterior" style={graphInteriorStyle}>
                    <div className="yPointMarker" style={yPointMarker120} />
                    <div className="yPointMarker" style={yPointMarker80} />
                    <div className="xAxis" style={xAxisStyle} />
                    <div className="yAxis" style={yAxisStyle} />
                    { points }
                </div>
                <div className="yAxisLabelsContainer">
                    { yAxisLabels }
                </div>
                <div className="xAxisLabelsContainer">
                    { xAxisLabels }
                </div>
            </div>
        )
    }


}

export default PredictiveGraph;
