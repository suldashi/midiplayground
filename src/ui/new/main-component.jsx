import React from "react";
import Draggable from "react-draggable";
import ControlPanelGroup from "./control-panel-group";
const autoBind = require("react-auto-bind");

export default class MainComponent extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    render() {
        return <div id="main-container">
            <div id="control-panel">
                <ControlPanelGroup name={"MIDI Controllers"} />
                <ControlPanelGroup name={"Sequencers"} />
                <ControlPanelGroup name={"Filters"} />
                <ControlPanelGroup name={"Tones"} />
            </div>
            <div id="work-area">
                <Draggable grid={[10, 10]} onStop={this.draggableOnStop}>
                    <div className="audio-element"></div>
                </Draggable>
            </div>
        </div>;
    }

    draggableOnStop(e) {
        let x = Math.floor(e.x);
        let y = Math.floor(e.y);
        let offsetX = Math.floor(e.offsetX);
        let offsetY = Math.floor(e.offsetY);
        let finalX = (x-offsetX)-((x-offsetX)%10);
        let finalY = (y-offsetY)-((y-offsetY)%10);
        console.log(`Position: ${finalX} ${finalY}`,e);
    }
}