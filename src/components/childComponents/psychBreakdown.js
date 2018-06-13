import React, { Component } from "react";
import InfoBubble from "../miscComponents/infoBubble";

class PsychBreakdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            areaSelected: undefined
        }
    }


    selectTitle(title) {
        this.setState({ areaSelected: title });
    }


    makeLRversion(score) {
        if (score === 0) {
            return "0";
        } else if (score > 0) {
            return `${score}R`;
        } else {
            return `${score * -1}L`
        }
    }


    render() {
        const psychScores = this.props.psychScores;

        if (!Array.isArray(psychScores)) { return null }

        const forCandidate = this.props.forCandidate;

        const blue = "rgb(117, 220, 252)"
        const purple = "#ae7efc";
        const red = "#E83C53";
        const orange = "#FB553A";
        const standardColor = forCandidate ? red : blue;
        const coloredText = { color: standardColor };
        const leftColor = forCandidate ? red : purple;
        const rightColor = forCandidate ? orange : blue;
        const middle80indicatorStyle = { background: `linear-gradient(to right, ${leftColor}, ${rightColor})` };

        // the numbers that show above the actual data
        const numbers = [5,4,3,2,1,0,1,2,3,4,5].map(number => {
            return <div className="number" style={{color:"white"}}>{number}</div>
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
                <div className="areaData center">
                    <div className="title" onClick={() => this.selectTitle(area.name)}>
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
            <div className="center font14px font12pxUnder500" style={{color:"#d0d0d0"}}>{"Select an area to see its description"}</div>
            :
            <div className="font16px font12pxUnder500">
                <div className="name font26px center" style={coloredText}>{this.state.areaSelected}</div>
                <div className="descriptionParts" style={{color:"#d0d0d0"}}>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{areaSelectedDescription.left}</div>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{areaSelectedDescription.right}</div>
                </div>
                <div className="youMedianMiddle" style={{color:"white"}}>
                    <div>{forCandidate ? "Your" : "Their"} Score: {this.makeLRversion(selectedArea.score)}</div>
                    <div>Median: {this.makeLRversion(selectedArea.stats.median)}</div>
                    <div>Middle 80%: {this.makeLRversion(selectedArea.stats.middle80.minimum)} - {this.makeLRversion(selectedArea.stats.middle80.maximum)}</div>
                </div>
            </div>

        return (
            <div className="results psychSection blackBackground whiteText">
                <div className="whiteText center font24px font20pxUnder700 font16pxUnder500 marginBottom30px">
                    Psychometric Analysis
                </div>
                <div className="statsAndDescription" style={coloredText}>
                    <div className="stats lightBlackBackground">
                        <div className="legend font16px font14pxUnder1100 font12pxUnder500 font10pxUnder400">
                            <div className="middle80">
                                <div
                                    className="middle80indicator"
                                    style={{
                                        height: "8px",
                                        ...middle80indicatorStyle
                                    }}
                                />
                                <div className="description">{"Middle 80%"}</div>
                                <InfoBubble
                                    iconColor={standardColor}
                                    iconCircleColor={standardColor}
                                    infoTextColor={"white"}
                                    bubbleColor={"#252525"}
                                    iconFontClasses={"font10px"}
                                    bubbleFontClasses={"font14px"}
                                    iconHeight={"12px"}
                                    bubbleText={"80% of people score within these ranges"}
                                    style={{marginLeft: "5px"}}
                                />
                            </div>
                            <div className="you">
                                <div className="youIndicator" style={{
                                    width: "8px", height: "8px"
                                }} />
                                <div className="description">{forCandidate ? "You" : "Candidate"}</div>
                            </div>
                            <div className="median">
                                <div className="medianIndicator" style={{position: "absolute"}} />
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
        left: "af paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
        right: "af paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
    },
    Temperament: {
        left: "tmp paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
        right: "tmp paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
    },
    Viewpoint: {
        left: "Those Who score further to the left (L) love to play games. And their favorite one? People. They do what it takes to maintain an edge over others, flattering and conning their way through situations to come out on top.",
        right: "Individuals who score further to the right (R) on this scales believe in having relationships that are real. They dislike those who are fake, and in turn, dislike being fake themselves. If a friend asks them if they have something in their teeth, they are the type that would tell them without hesitation.",
    },
    Methodology: {
        left: "meth paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
        right: "meth paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
    },
    Perception: {
        left: "exp paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
        right: "exp paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
    },
    Ethos: {
        left: "ethos paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
        right: "ethos paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
    },
    Belief: {
        left: "bel paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
        right: "bel paosidj fapofi jas;lfk jsd;fl kajsfp ijrf ;aljf apsidjf pworifj qpweiofj apsodifj apoifjapoifaspodfj as;dlfkj as;dlfjk asoij spdofvj ;lasfj ;aosijf apdifj alfj as9f paorfj pa",
    }
}

export default PsychBreakdown;
