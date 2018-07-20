import React, { Component } from "react";
import InfoBubble from "../miscComponents/infoBubble";

class InfluencerPsychBreakdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            areaSelected: "Belief"
        }
    }


    selectTitle(title) {
        this.setState({ areaSelected: title });
    }


    mouseEnter(title) {
        if (window.innerWidth > 900) {
            this.selectTitle(title);
        }
    }


    round(number, decimalPlaces) {
        // get the number version if it's a string
        let rounded = typeof number === "number" ? number : parseInt(number);
        // if it can't be converted from a string to int, return the original string
        if (isNaN(rounded)) { return number; }
        let tenExponent = 0;
        // if the user want extra decimal places, have to multiply before rounding
        if (typeof decimalPlaces === "number") { tenExponent = decimalPlaces; }
        rounded = rounded * Math.pow(10, tenExponent);
        rounded = Math.round(rounded);
        rounded = rounded / Math.pow(10, tenExponent)
        return rounded;
    }


    makeLRversion(score) {
        let rounded = this.round(score, 1);

        if (rounded === 0) {
            return "0";
        } else if (rounded > 0) {
            return `${rounded}R`;
        } else {
            return `${rounded * -1}L`
        }

        return score
    }


    render() {
        const psychScores = this.props.psychScores;

        if (!Array.isArray(psychScores)) { return null }

        const forCandidate = this.props.forCandidate;

        const pink = "#ff582d"
        const orange = "#fd0d8b";
        const standardColor = "#eb394f";
        const coloredText = { color: standardColor };
        const leftColor = orange;
        const rightColor = pink;
        const middle80indicatorStyle = { background: `linear-gradient(to right, ${leftColor}, ${rightColor})` };

        // the numbers that show above the actual data
        const numbers = [-5,-4,-3,-2,-1,0,1,2,3,4,5].map(number => {
            return <div className="number font12px" style={{color:"white"}} key={`number${number}`}>{Math.abs(number)}</div>
        })
        const topNumbers = (
            <div className="topNumbers">{numbers}</div>
        )

        // sort the psych scores by name so they're always in the same order
        psychScores.sort((score1, score2) => {
            if (score1.name < score2.name) { return -1; }
            if (score1.name > score2.name) { return 1; }
            return 0;
        });

        let selectedArea = {};

        // the actual data
        const personalityAreas = psychScores.map(area => {
            // if this happens to be the area that's selected, use these stats
            // for the description area
            if (this.state.areaSelected === area.name) {
                selectedArea = area;
            }

            // multiply by 10 to get a value between 0 and 100
            const middle80width = (area.stats.middle80.maximum - area.stats.middle80.minimum) * 10;
            const middle80leftPercentage = (area.stats.middle80.minimum + 5) * 10;
            const middle80style = {
                width: `${middle80width}%`,
                height: "8px",
                left: `${middle80leftPercentage}%`,
                position: "absolute",
                display: "inline-block"
            }

            // add 5 to get a score from 0 to 10
            // multiply by 10 to get a percentage 0 to 100
            const medianLeftPercentage = (area.stats.median + 5) * 10;
            const medianStyle = {
                position: "absolute",
                display: "inline-block",
                left: `${medianLeftPercentage}%`,
                transform: `translateX(-${medianLeftPercentage}%)`,
                height: "8px"
            }

            // add 5 to get a score from 0 to 10
            // multiply by 10 to get a percentage 0 to 100
            const youLeftPercentage = (area.score + 5) * 10;
            const youIndicatorStyle = {
                position: "absolute",
                left: `${youLeftPercentage}%`,
                // have to translate left because the points have widths
                transform: `translateX(-${youLeftPercentage}%)`,
                height: "8px",
                width: "8px"
            }
            return (
                <div
                    className="areaData center"
                    style={{cursor: "pointer"}}
                    onMouseEnter={() => this.mouseEnter(area.name)}
                    onClick={() => this.selectTitle(area.name)}
                    key={area.name}
                >
                    <div className="title font12px">
                        {area.name}
                    </div>
                    <div className="middle80indicator" style={{...middle80style, ...middle80indicatorStyle}} />
                    <div className="medianIndicator" style={medianStyle} />
                    <div className="youIndicator" style={youIndicatorStyle}/>
                </div>
            )
        });

        let areaSelectedDescription = "";
        if (this.state.areaSelected) {
            areaSelectedDescription = descriptions[this.state.areaSelected];
        }

        const description = !this.state.areaSelected ?
            <div className="center font12px" style={{color:"#d0d0d0"}}>{"Select an area to see its description"}</div>
            :
            <div className="font14px">
                <div className="name font22px center marginTop15px" style={coloredText}>{this.state.areaSelected}</div>
                <div className="descriptionParts" style={{color:"#d0d0d0"}}>
                    <div>{areaSelectedDescription.left}</div>
                    <div>{areaSelectedDescription.right}</div>
                </div>
                <div className="youMedianMiddle" style={{color:"white", marginBottom: "0px"}}>
                    <div>{forCandidate ? "Your" : "Their"} Score: {this.makeLRversion(selectedArea.score)}</div>
                    <div>Median: {this.makeLRversion(selectedArea.stats.median)}</div>
                    <div>Middle 80%: {this.makeLRversion(selectedArea.stats.middle80.minimum)}&nbsp;-&nbsp;{this.makeLRversion(selectedArea.stats.middle80.maximum)}</div>
                </div>
            </div>

        return (
            <div className="results psychSection blackBackground primary-white">
                <div className="title secondary-gray center font24px font20pxUnder700 font16pxUnder500 marginBottom20px">
                    Psychometric Analysis
                </div>
                <div className="statsAndDescription" style={coloredText}>
                    <div className="stats lightBlackBackground">
                        <div className="legend font12px">
                            <div className="middle80">
                                <div
                                    className="middle80indicator"
                                    style={{
                                        height: "8px",
                                        ...middle80indicatorStyle
                                    }}
                                />
                                <br/>
                                <div className="description">{"Middle 80%"}</div>
                                <InfoBubble
                                    iconColor={standardColor}
                                    iconCircleColor={standardColor}
                                    infoTextColor={"white"}
                                    bubbleColor={"#252525"}
                                    iconFontClasses={"font10px"}
                                    bubbleFontClasses={"font12px"}
                                    iconHeight={"12px"}
                                    bubbleText={"80% of people score within these ranges"}
                                    style={{marginLeft: "5px"}}
                                />
                            </div>
                            <div className="you">
                                <div className="youIndicator" style={{
                                    width: "8px", height: "8px"
                                }} />
                                <br/>
                                <div className="description">{forCandidate ? "You" : "Candidate"}</div>
                            </div>
                            <div className="median">
                                <div className="medianIndicator" />
                                <br/>
                                <div className="description medianTitle">{"Median Score"}</div>
                            </div>
                        </div>
                        <div className="data">
                            {topNumbers}
                            <div className="personalityAreas">
                                {personalityAreas}
                            </div>
                        </div>
                    </div>
                    <div className="description lightBlackBackground">
                        {description}
                    </div>
                </div>
            </div>
        );
    }
}

// descriptions for different psych areas
const descriptions = {
    Dimension: {
        left: `Those who score further to the left on this scale (L) tend to be more reserved, but have hidden depths. They are relied upon to fill crucial support roles that leader-types cannot. While they may shy away from social situations, it’s because they thrive best on their own.`,
        right: `Those who score further to the right on this scale (R) are confident in their ability to overcome any obstacle. They thrive most in leadership positions and are often relied upon to lead the charge. The are adept at navigating social situations and tend to have a "everything happens for a reason" outlook on life.`,
    },
    Temperament: {
        left: `Those who score further to the left on this scale (L) are the type that would run into a burning building to save someone without hesitation. They thrive in high stress environments, remaining cool, calm and collected. They deal with obstacles on their own, rarely feeling the need to burden others with their problems.`,
        right: `Those who score further to the right on this scale (R) are very concerned with their overall well-being. They are always thinking about the little things, a trait that makes mistakes hard to slip by them. They work best with people at their side and have a deep emotional bond with those people.`,
    },
    Viewpoint: {
        left: `Those who score further to the left (L) are often seen as hard-hearted or callous. But they too understand others’ plights, even if they sometimes choose not to express it. They are able to make the hard decisions that others cannot bring themselves to make.`,
        right: `Those who score further to the right (R) show a lot of sympathy towards others. They always understand others’ plights and will do what they can to help them, but as a result, they struggle with saying or doing things that may hurt others, especially emotionally, even if it’s the right thing to do.`,
    },
    Methodology: {
        left: `Those who score further to the left (L) on this scale may tend to have messier spaces, but they know where everything is. They strive for efficiency and are masters of multitasking. They live life in the moment and have a knack for figuring out problems on the spot, problems that would oftentimes catch others off guard.`,
        right: `Those who score further to the right (R) on this scale live by order. They plan, organize and prepare. They are sticklers for details, making everything perfect, almost to a fault. They always think rationally before they act, believing there is always a right way to do things. They always take the extra mile and seek to improve through hard work.`,
    },
    Perception: {
        left: `Those who score further to the left (L) on this scale are the calculation type. They are analytical and logical, pushing to follow what is known rather than risk the unknown. They can apply what they’ve learned to a multitude of novel situations, preferring to adapt what they’ve learned rather than risk creating their own solution from scratch.`,
        right: `Those who score further to the right (R) on this scale have an insatiable curiosity, constantly wanting to learn and experience more. They are creative and out of the box thinkers to a T. They are open to strange and unconventional ideas and love making their own path to a solution.`,
    },
    Ethos: {
        left: `Those who score further to the left (L) on this scale hate being wronged. They won’t tolerate people crossing them or their friends. They are steadfast in their belief and values and will always defend them. While they might not be the most patient of people, it’s because they hold others, especially their friends, to the highest standard and expect a lot. They are able to judge and assess people quickly, seeing into hidden depths that others didn’t even know were there.`,
        right: `Those who score further to the right (R) on this scale forgive easily. They’ll forgive and forget anyone and anything, almost to a point where others disbelieve how forgiving they are. They are the type that believes there is good in everyone, often attributing mistakes to someone having a bad day, rather than blaming them. They are masters of compromise and the pinnacle of patience.`,
    },
    Belief: {
        left: `Those who score further to the left (L) love to play games. They will do what needs to be done to maintain an edge over others. They are adept at playing people, winning conversations without the other person even realizing they lost. They play chess while others play checkers; they’re the most cunning people.`,
        right: `Those who score further to the right (R) are often seen as brutally honest. They will say what needs to be said, even if others don’t want to hear it. They are real will with people and will always follow the rules. They dislike individuals who are fake and those who take advantage of others.`,
    }
}

export default InfluencerPsychBreakdown;
