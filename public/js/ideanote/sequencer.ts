/// <reference path="references.ts" />
class Sequencer {
	private scheduler;
	private audioContext;
	private sink:SoundSink;
	private inputInstrument:Instrument;
	private noteSequence:Array<SequenceNote>;
	private sequenceLength:number;

	// Recording
	private isRecording:boolean = false;
	private recordingBuffer:Array<SequenceNote>;
	private recordStartTime;

	constructor(audioContext) {
		this.audioContext = audioContext;
	    this.scheduler = new WebAudioScheduler(audioContext);
	    this.noteSequence = new Array<SequenceNote>();
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

		var firstNoteTime = this.noteSequence[0].playbackTime;
		for (var i in this.noteSequence) {
			this.noteSequence[i].playbackTime -= firstNoteTime;
			this.noteSequence[i].playbackTime = this.noteSequence[i].playbackTime / 1000;
		}

		this.recordingBuffer = [];
		this.sequenceLength = this.audioContext.currentTime - (firstNoteTime / 1000);
	}

	public startPlaying() {
		console.log("Sequence looped");
		var sequence = this.noteSequence;
		if(typeof this.sink !== "undefined") {
			this.scheduler.start((e) => {
				for(var i in sequence) {
					this.scheduler.insert(e.playbackTime + sequence[i].playbackTime,(e) => {
						this.sink.receiveNote(e.args.note);
					},{note:sequence[i].note});
				}
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
}