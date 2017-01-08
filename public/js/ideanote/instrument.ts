/// <reference path="references.ts" />
class Instrument {
	private noteReceivers;
	private midiObject;

	constructor(midiObject) {
		this.noteReceivers = [];
	    this.midiObject = midiObject;
	    midiObject.addListener("noteon","all",(e) => {
			this.sendNote(e);
		})
		midiObject.addListener("noteoff","all",(e) =>{
			this.sendNote(e);
	    });
	}

	private sendNote(note) {
		for(var i in this.noteReceivers) {
			this.noteReceivers[i].receiveNote(note);	
		}
	}

	public connectToReceiver(noteReceiver) {
		this.noteReceivers.push(noteReceiver);
	}
}