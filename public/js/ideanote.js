class SoundSink {
    constructor(audioContext) {
        this.waveName = "square";
        this.enabled = true;
        this.noteFrequencies = ["8.176", "8.662", "9.177", "9.723", "10.301", "10.913", "11.562", "12.250", "12.978", "13.750", "14.568", "15.434", "16.352", "17.324", "18.354", "19.445", "20.602", "21.827", "23.125", "24.500", "25.957", "27.500", "29.135", "30.868", "32.703", "34.648", "36.708", "38.891", "41.203", "43.654", "46.249", "48.999", "51.913", "55.000", "58.270", "61.735", "65.406", "69.296", "73.416", "77.782", "82.407", "87.307", "92.499", "97.999", "103.826", "110.000", "116.541", "123.471", "130.813", "138.591", "146.832", "155.563", "164.814", "174.614", "184.997", "195.998", "207.652", "220.000", "233.082", "246.942", "261.626", "277.183", "293.665", "311.127", "329.628", "349.228", "369.994", "391.995", "415.305", "440.000", "466.164", "493.883", "523.251", "554.365", "587.330", "622.254", "659.255", "698.456", "739.989", "783.991", "830.609", "880.000", "932.328", "987.767", "1046.502", "1108.731", "1174.659", "1244.508", "1318.510", "1396.913", "1479.978", "1567.982", "1661.219", "1760.000", "1864.655", "1975.533", "2093.005", "2217.461", "2349.318", "2489.016", "2637.020", "2793.826", "2959.955", "3135.963", "3322.438", "3520.000", "3729.310", "3951.066", "4186.009", "4434.922", "4698.636", "4978.032", "5274.041", "5587.652", "5919.911", "6271.927", "6644.875", "7040.000", "7458.620", "7902.133", "8372.018", "8869.844", "9397.273", "9956.063", "10548.080", "11175.300", "11839.820", "12543.850"];
        this.audioContext = audioContext;
        this.noteMap = [];
    }
    receiveNote(noteData) {
        if (this.enabled) {
            if (noteData.type == "noteon") {
                var osc = this.audioContext.createOscillator();
                osc.type = this.waveName;
                var gain = this.audioContext.createGain();
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                gain.gain.value = 0.5;
                osc.frequency.value = this.noteFrequencies[noteData.note.number];
                osc.start(0);
                this.noteMap[noteData.note.number] = osc;
            }
            else {
                if (typeof this.noteMap[noteData.note.number] !== "undefined") {
                    this.noteMap[noteData.note.number].stop();
                    delete this.noteMap[noteData.note.number];
                }
            }
        }
    }
    setWaveType(waveName) {
        this.waveName = waveName;
    }
    disable() {
        this.enabled = false;
        for (var i in this.noteMap) {
            this.noteMap[i].stop();
            delete this.noteMap[i];
        }
    }
    enable() {
        this.enabled = true;
    }
    reset() {
        this.disable();
        this.enable();
    }
}
class Instrument {
    constructor(midiObject) {
        this.noteReceivers = [];
        this.midiObject = midiObject;
        midiObject.addListener("noteon", "all", (e) => {
            this.sendNote(e);
        });
        midiObject.addListener("noteoff", "all", (e) => {
            this.sendNote(e);
        });
        midiObject.addListener("controlchange", "all", (e) => {
            this.sendControlChange(e);
        });
    }
    sendNote(note) {
        for (var i in this.noteReceivers) {
            this.noteReceivers[i].receiveNote(note);
        }
    }
    sendControlChange(e) {
        for (var i in this.noteReceivers) {
            if (typeof this.noteReceivers[i].receiveControlChange !== 'undefined')
                this.noteReceivers[i].receiveControlChange(e);
        }
    }
    connectToReceiver(noteReceiver) {
        this.noteReceivers.push(noteReceiver);
    }
}
class SequenceNote {
    constructor(playbackTime = null, note = null) {
        if (playbackTime !== null) {
            this.playbackTime = playbackTime;
        }
        if (note !== null) {
            this.note = note;
        }
    }
}
class Sequencer {
    constructor(audioContext, channel) {
        this.isRecording = false;
        this.audioContext = audioContext;
        this.scheduler = new WebAudioScheduler(audioContext);
        this.noteSequence = new Array();
        this.channelNumber = channel;
        this.sequenceLength = 1;
        this.recordingBuffer = [];
    }
    startRecording() {
        this.isRecording = true;
    }
    stopRecording() {
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
    startPlaying() {
        var sequence = this.noteSequence;
        if (typeof this.sink !== "undefined") {
            this.scheduler.start((e) => {
                var offset = 0;
                for (var j = 0; j < 50; j++) {
                    for (var i in sequence) {
                        this.scheduler.insert(e.playbackTime + sequence[i].playbackTime + offset, (e) => {
                            this.sink.receiveNote(e.args.note);
                        }, { note: sequence[i].note });
                    }
                    offset += this.sequenceLength;
                }
            });
        }
    }
    stopPlaying() {
        this.scheduler.stop(true);
        this.scheduler.removeAll();
        this.sink.reset();
    }
    connectToSink(audioSink) {
        this.sink = audioSink;
    }
    receiveNote(noteData) {
        if (this.isRecording) {
            var tmp = new SequenceNote(noteData.timestamp, noteData);
            this.recordingBuffer.push(tmp);
        }
    }
    receiveControlChange(e) {
        if (e.controller.number != this.channelNumber)
            return;
        if (e.value > 0) {
            if (this.noteSequence.length > 0) {
                console.log("Play sequence ", this.channelNumber);
                this.startPlaying();
            }
            else {
                console.log("Start recording ", this.channelNumber);
                this.startRecording();
            }
        }
        else {
            if (this.isRecording) {
                console.log("Stop recording ", this.channelNumber);
                this.stopRecording();
            }
            else {
                this.stopPlaying();
            }
        }
    }
}
var instruments = [];
var ctx = new AudioContext();
var sched = new WebAudioScheduler({ context: ctx });
let masterGain = null;
function metronome(e) {
    console.log("bong", e);
    const t0 = e.playbackTime;
    sched.insert(t0 + 0.000, ticktack, { frequency: 880, duration: 1.0 });
    sched.insert(t0 + 0.500, ticktack, { frequency: 440, duration: 0.1 });
    sched.insert(t0 + 1.000, ticktack, { frequency: 440, duration: 0.1 });
    sched.insert(t0 + 1.500, ticktack, { frequency: 440, duration: 0.1 });
    sched.insert(t0 + 2.000, metronome);
}
function ticktack(e) {
    const t0 = e.playbackTime;
    const t1 = t0 + e.args.duration;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.frequency.value = e.args.frequency;
    osc.start(t0);
    osc.stop(t1);
    osc.connect(amp);
    amp.gain.setValueAtTime(0.5, t0);
    amp.gain.exponentialRampToValueAtTime(1e-6, t1);
    amp.connect(masterGain);
    sched.nextTick(t1, () => {
        osc.disconnect();
        amp.disconnect();
    });
}
sched.on("start", () => {
    masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
});
sched.on("stop", () => {
    masterGain.disconnect();
    masterGain = null;
});
var soundSink = new SoundSink(ctx);
var channelSequencers = [];
for (var i = 20; i < 28; i++) {
    var soundSink2 = new SoundSink(ctx);
    var sequencer = new Sequencer(ctx, i);
    sequencer.connectToSink(soundSink2);
    channelSequencers.push(sequencer);
}
WebMidi.enable(function (err) {
    if (err) {
        console.log("WebMidi could not be enabled.", err);
    }
    else {
        console.log("WebMidi enabled!");
        for (var i in WebMidi.inputs) {
            initInstrument(WebMidi.inputs[i]);
        }
        WebMidi.addListener("connected", (e) => {
            if (e.input) {
                initInstrument(e.input);
            }
        });
    }
});
function initInstrument(midiInstrument) {
    var instrument = new Instrument(midiInstrument);
    instrument.connectToReceiver(soundSink);
    for (var i in channelSequencers) {
        instrument.connectToReceiver(channelSequencers[i]);
    }
    instruments.push(instrument);
}
