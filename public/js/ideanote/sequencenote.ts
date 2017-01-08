/// <reference path="references.ts" />
class SequenceNote {
	public playbackTime:number;
	public note;
	constructor(playbackTime = null, note = null) {
	    if(playbackTime !== null) {
	    	this.playbackTime = playbackTime;
	    }
	    if(note !== null) {
	    	this.note = note;
	    }
	}
}