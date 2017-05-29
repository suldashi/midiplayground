/// <reference path="references.ts" />
class Sequencer {
	private scheduler;
	private audioContext;
	private sink:SoundSink;
	private inputInstrument:Instrument;
	private noteSequence:Array<SequenceNote>;
	private sequenceLength:number;

	private channelNumber:number;

	// Recording
	private isRecording:boolean = false;
	private recordingBuffer:Array<SequenceNote>;
	private recordStartTime;

	constructor(audioContext, channel) {
		this.audioContext = audioContext;
	    this.scheduler = new WebAudioScheduler(audioContext);
	    this.noteSequence = new Array<SequenceNote>();
	    this.channelNumber = channel;

	    this.noteSequence.push(new SequenceNote(0,{
	    	type:"noteon",
	    	note:{
	    		number:60
    		}}));
	    this.noteSequence.push(new SequenceNote(0.1,{
	    	type:"noteoff",
	    	note:{
	    		number:60
    		}}));
	    this.noteSequence.push(new SequenceNote(0.2,{
	    	type:"noteon",
	    	note:{
	    		number:60
    		}}));
	    this.noteSequence.push(new SequenceNote(0.3,{
	    	type:"noteoff",
	    	note:{
	    		number:60
    		}}));
	    this.noteSequence.push(new SequenceNote(0.4,{
	    	type:"noteon",
	    	note:{
	    		number:60
    		}}));
	    this.noteSequence.push(new SequenceNote(0.5,{
	    	type:"noteoff",
	    	note:{
	    		number:60
    		}}));
	    this.noteSequence.push(new SequenceNote(0.6,{
	    	type:"noteon",
	    	note:{
	    		number:60
    		}}));
	    this.noteSequence.push(new SequenceNote(0.7,{
	    	type:"noteoff",
	    	note:{
	    		number:60
    		}}));
	    this.noteSequence.push(new SequenceNote(0.8,{
	    	type:"noteon",
	    	note:{
	    		number:60
    		}}));
	    this.noteSequence.push(new SequenceNote(0.9,{
	    	type:"noteoff",
	    	note:{
	    		number:60
    		}}));
	    this.sequenceLength = 1;
	    this.recordingBuffer = [];
	}

	public startRecording() {
		this.isRecording = true;
	}

	public stopRecording() {
		this.isRecording = false;
		this.noteSequence = this.recordingBuffer;

		if (this.noteSequence.length > 0) {
			var firstNoteTime = this.noteSequence[0].playbackTime;
			for (var i in this.noteSequence) {
				this.noteSequence[i].playbackTime -= firstNoteTime;
				this.noteSequence[i].playbackTime = this.noteSequence[i].playbackTime / 1000;
			}

			this.recordingBuffer = [];
			this.sequenceLength = this.audioContext.currentTime - (firstNoteTime / 1000);
		}
	}

	public startPlaying() {
		var sequence = this.noteSequence;
		if(typeof this.sink !== "undefined") {
			this.scheduler.start((e) => {

				//var offset = 0;	
				//for (var j = 0; j<50;j++) {
					for(var i in sequence) {
						if(sequence[i].playbackTime==0) {
							this.sink.receiveNote(sequence[i].note);
						}
						else {
							this.scheduler.insert(e.playbackTime + sequence[i].playbackTime,(e) => {
								this.sink.receiveNote(e.args.note);
							},{note:sequence[i].note});
						}
						
					} 

				//	offset += this.sequenceLength;
				//}
					
				this.scheduler.insert(e.playbackTime + this.sequenceLength,(e) => {
					this.startPlaying();
				})
			});
		}
	}

	public stopPlaying() {
		this.scheduler.stop(true);
		this.scheduler.removeAll();
		this.sink.reset();
	}

	public connectToSink(audioSink:SoundSink) {
		this.sink = audioSink;
	}

	public receiveNote(noteData) {
		if (this.isRecording) {
			var tmp = new SequenceNote(noteData.timestamp, noteData);
			this.recordingBuffer.push(tmp);
		}
	}

	public receiveControlChange(e) {
		if (e.controller.number != this.channelNumber)
			return;

		if (e.value > 0) {
			if (this.noteSequence.length > 0) {
				console.log("Play sequence ", this.channelNumber);
				this.startPlaying();
			} else {
				console.log("Start recording ", this.channelNumber);
				this.startRecording();
			}
			
		} else {

			if (this.isRecording) {
				console.log("Stop recording ", this.channelNumber)
				this.stopRecording();
			} else {
				this.stopPlaying();
			}
			
		}
	}
}