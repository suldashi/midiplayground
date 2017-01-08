/// <reference path="references.ts" />
class SoundSink {
	private audioContext;
	private waveName = "square";
	private noteMap;
	private enabled = true;
	private noteFrequencies = ["8.176","8.662","9.177","9.723","10.301","10.913","11.562","12.250","12.978","13.750","14.568","15.434","16.352","17.324","18.354","19.445","20.602","21.827","23.125","24.500","25.957","27.500","29.135","30.868","32.703","34.648","36.708","38.891","41.203","43.654","46.249","48.999","51.913","55.000","58.270","61.735","65.406","69.296","73.416","77.782","82.407","87.307","92.499","97.999","103.826","110.000","116.541","123.471","130.813","138.591","146.832","155.563","164.814","174.614","184.997","195.998","207.652","220.000","233.082","246.942","261.626","277.183","293.665","311.127","329.628","349.228","369.994","391.995","415.305","440.000","466.164","493.883","523.251","554.365","587.330","622.254","659.255","698.456","739.989","783.991","830.609","880.000","932.328","987.767","1046.502","1108.731","1174.659","1244.508","1318.510","1396.913","1479.978","1567.982","1661.219","1760.000","1864.655","1975.533","2093.005","2217.461","2349.318","2489.016","2637.020","2793.826","2959.955","3135.963","3322.438","3520.000","3729.310","3951.066","4186.009","4434.922","4698.636","4978.032","5274.041","5587.652","5919.911","6271.927","6644.875","7040.000","7458.620","7902.133","8372.018","8869.844","9397.273","9956.063","10548.080","11175.300","11839.820","12543.850"];
	constructor(audioContext) {
	    this.audioContext = audioContext;
	    this.noteMap = [];
	}

	public receiveNote(noteData) {
		if(this.enabled) {
			if(noteData.type=="noteon") {
				var osc = this.audioContext.createOscillator();
				osc.type=this.waveName;
				var gain = this.audioContext.createGain();
				osc.connect(gain);
				gain.connect(this.audioContext.destination);
				gain.gain.value = 0.5;
				osc.frequency.value = this.noteFrequencies[noteData.note.number];
				osc.start(0);
				this.noteMap[noteData.note.number] = osc;
			}
			else {
				if(typeof this.noteMap[noteData.note.number] !== "undefined") {
					this.noteMap[noteData.note.number].stop();
					delete this.noteMap[noteData.note.number];	
				}
			}
		}
		
	}

	public setWaveType(waveName:string) {
		this.waveName = waveName;
	}

	public disable() {
		this.enabled = false;
		for(var i in this.noteMap) {
			this.noteMap[i].stop();
			delete this.noteMap[i];
		}
	}

	public enable() {
		this.enabled = true;
	}

	public reset() {
		this.disable();
		this.enable();
	}
}