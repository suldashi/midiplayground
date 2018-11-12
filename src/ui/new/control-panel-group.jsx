import React from "react";
const autoBind = require("react-auto-bind");

export default class ControlPanelGroup extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
        this.state = {
            name:props.name?props.name:"Control Panel Group",
            active:props.active?props.active:false
        };
    }

    render() {
        return <div className={`control-panel-group ${this.state.active?"active":""}`}>
            <a className="control-panel-group-toggle" onClick={this.toggleCPGroup} href="#">{this.state.name}</a>
            {this.state.active?
            <div className="control-panel-group-elements">No MIDI Controllers connected</div>:null}
        </div>;
    }

    toggleCPGroup(ev) {
        ev.preventDefault();
        this.setState((prevState) => {
            return {
                active:!prevState.active
            }
        })
    }
}