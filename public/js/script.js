WebMidi.enable(function (err) {

  if (err) {
    console.log("WebMidi could not be enabled.", err);
  } else {
    console.log("WebMidi enabled!");
    for(var i in WebMidi.inputs) {
    	initInput(WebMidi.inputs[i]);
    }
    WebMidi.addListener("connected", (e) => {
    	if(e.input) {
    		initInput(e.input);	
    	}
    });
  }

});

function initInput(inputElement) {
	var pitch = 0;
	var noteMap = [];
	var stagingSequenceMap = [];
	var sequenceMap = [];
	var openCC = [];
	var playingSequences = [];
	inputElement.addListener("noteon","all",(e) => {
		var noteId = e.note.number;
		console.log("ON:", e);
		noteMap[noteId] = startPlay(freqMap(noteId,pitch),e.velocity,0);

		for(var i in openCC) {
			stagingSequenceMap[i].push(e);
		}
	})
	inputElement.addListener("noteoff","all",(e) =>{
		var noteId = e.note.number;
    	console.log("OFF: "+e.note.name+e.note.octave);
    	var osc = noteMap[noteId];
    	stopPlay(osc,0);

    	for(var i in openCC) {
			stagingSequenceMap[i].push(e);
		}
    });
    inputElement.addListener("controlchange","all",(e) =>{
    	if(e.controller.number >=9 && e.controller.number <=24 && e.value > 0) {
    		openCC[e.controller.number] = true;
    		stagingSequenceMap[e.controller.number] = [];
    	}
    	if(e.controller.number >=9 && e.controller.number <=24 && e.value == 0) {
    		delete openCC[e.controller.number];
    		if(stagingSequenceMap[e.controller.number].length > 0) {
    			sequenceMap[e.controller.number] = {
    				noteSequence:stagingSequenceMap[e.controller.number],
    				playing: false
    			};
    			console.log("sequence recorded");
    			var baseline;
    			for(var i in sequenceMap[e.controller.number].noteSequence) {
    				if(i==0) {
    					baseline = sequenceMap[e.controller.number].noteSequence[i].timestamp;
    				}
    				sequenceMap[e.controller.number].noteSequence[i].timestamp -= baseline;
    			}
    			sequenceMap[e.controller.number].sequenceLength = e.timestamp - baseline;
    		}
    		else {
    			console.log("sequence is being played");
    			if(typeof sequenceMap[e.controller.number] !== "undefined") {
    				playingSequences[e.controller.number] = [];
					for(var i in sequenceMap[e.controller.number].noteSequence) {
	    				var note = sequenceMap[e.controller.number].noteSequence[i];
	    				var noteNr = note.note.number;
	    				if(note.type == "noteon") {
	    					playingSequences[e.controller.number][noteNr] = startPlay(freqMap(note.note.number,pitch),note.velocity,e.timestamp + note.timestamp);
	    					stopPlay(playingSequences[e.controller.number][noteNr],e.timestamp + sequenceMap[e.controller.number].sequenceLength);
	    				}
	    				else {
	    					if(typeof playingSequences[e.controller.number][noteNr] !== "undefined") {
	    						stopPlay(playingSequences[e.controller.number][noteNr],e.timestamp + note.timestamp);	
	    					}
	    				}
	    			}
	    		}
    		}
    	}
    	
    });
    inputElement.addListener('pitchbend', "all", function(e) {
	    pitch = e.value;
	    for(var i in noteMap) {
	    	i = parseInt(i);
	    	noteMap[i].frequency.value = freqMap(i,pitch);
	    }
	    console.log(sequenceMap);
	});
}

context = new window.AudioContext();

function foo() {
	var lfo = context.createOscillator();
	var osc = context.createOscillator();
	var gain = context.createGain();

	lfo.frequency.value = 1;
	lfo.type = "triangle";
	lfo.connect(gain.gain);
	osc.connect(gain);
	//gain.connect(osc.frequency);
	osc.frequency.value = 440;
	lfo.start();
	osc.start();
	//gain.gain.value = 100;
	gain.connect(context.destination);

}

function shapy() {
	var osc = context.createOscillator();
	var shaper = context.createWaveShaper();
	shaper.curve = new Float32Array([1,-1]);
	osc.connect(shaper);
	shaper.connect(context.destination);
	osc.start();
	osc.frequency.value = 440;
}

var ss = '';

function bar() {
	fetch("/file").then((res) => {
		return res.json();
	}).then((data) => {
		ss = data;
		var input = [];
		for(var i in ss[0]) {
			input.push(ss[0][i]);
		}
		console.log(input);
		baz(input);
	});
	

}

var osc;

function baz(input) {
	var real = new Float32Array(input);
	var imag = new Float32Array(input.length);
	var wave = context.createPeriodicWave(imag,real);
	osc = context.createOscillator();
	osc.setPeriodicWave(wave);
	osc.connect(context.destination);
	osc.frequency.value = 440;
	osc.start();
}

function startPlay(frequency,velocity,timestamp) {
	var osc = context.createOscillator();
	osc.type = "square"
	var gain = context.createGain();
	osc.connect(gain);
	gain.connect(context.destination);
	//osc.type = "square";
	gain.gain.value = 0.5;
	osc.frequency.value = frequency;
	osc.start(timestamp/1000);
	return osc;
}

function stopPlay(osc,timestamp) {
	osc.stop(timestamp/1000);
}

function freqMap(noteId,pitchBend) {
	var frequencyMap = ["8.176","8.662","9.177","9.723","10.301","10.913","11.562","12.250","12.978","13.750","14.568","15.434","16.352","17.324","18.354","19.445","20.602","21.827","23.125","24.500","25.957","27.500","29.135","30.868","32.703","34.648","36.708","38.891","41.203","43.654","46.249","48.999","51.913","55.000","58.270","61.735","65.406","69.296","73.416","77.782","82.407","87.307","92.499","97.999","103.826","110.000","116.541","123.471","130.813","138.591","146.832","155.563","164.814","174.614","184.997","195.998","207.652","220.000","233.082","246.942","261.626","277.183","293.665","311.127","329.628","349.228","369.994","391.995","415.305","440.000","466.164","493.883","523.251","554.365","587.330","622.254","659.255","698.456","739.989","783.991","830.609","880.000","932.328","987.767","1046.502","1108.731","1174.659","1244.508","1318.510","1396.913","1479.978","1567.982","1661.219","1760.000","1864.655","1975.533","2093.005","2217.461","2349.318","2489.016","2637.020","2793.826","2959.955","3135.963","3322.438","3520.000","3729.310","3951.066","4186.009","4434.922","4698.636","4978.032","5274.041","5587.652","5919.911","6271.927","6644.875","7040.000","7458.620","7902.133","8372.018","8869.844","9397.273","9956.063","10548.080","11175.300","11839.820","12543.850"];
	var target = noteId;
	if(pitchBend<0) {
		if(noteId>0) {
			target = noteId-1;
		}
	}
	else {
		if(noteId<127) {
			target = noteId+1;
		}
	}
	var first = (1-Math.abs(pitchBend))*frequencyMap[noteId];
	var second = Math.abs(pitchBend)*frequencyMap[target];
	return first+second;
}

