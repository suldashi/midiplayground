/// <reference path="references.ts" />
declare var WebMidi;
declare var WebAudioScheduler;
declare var WAAClock;

var instruments = [];
var ctx = new AudioContext();
var sched = new WebAudioScheduler({context:ctx});

let masterGain = null;

function metronome(e) {
  console.log("bong",e);
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
var soundSink2 = new SoundSink(ctx);
var sequencer = new Sequencer(ctx);
sequencer.connectToSink(soundSink2);
WebMidi.enable(function (err) {

  if (err) {
    console.log("WebMidi could not be enabled.", err);
  } else {
    console.log("WebMidi enabled!");
    for(var i in WebMidi.inputs) {
    	initInstrument(WebMidi.inputs[i]);
    }
    WebMidi.addListener("connected", (e) => {
    	if(e.input) {
        initInstrument(e.input);
    	}
    });
  }

});

function initInstrument(midiInstrument) {
    var instrument = new Instrument(midiInstrument);
    instrument.connectToReceiver(soundSink);
    instrument.connectToReceiver(sequencer);
    instruments.push(instrument);
}