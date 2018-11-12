let WebMidi = require("./webmidi.min");

class WebMidiSingleton {
    constructor() {
        this.instruments = [];
    }
    enableMIDI() {
        return new Promise((resolve,reject) => {
            WebMidi.enable((err) => {
                if (err) {
                    console.error("WebMidi could not be enabled.", err);
                    reject(err);
                } else {
                  console.log("WebMidi enabled!");
                  for(var i in WebMidi.inputs) {
                      console.log(WebMidi.inputs[i]);
                      this.instruments.push(WebMidi.inputs[i]);
                  }
                  WebMidi.addListener("connected", (e) => {
                      if(e.input) {
                          console.log(e.input);	
                          this.instruments.push(e.input);
                      }
                  });
                }
              });
        });
    }
}

module.exports = new WebMidiSingleton();