var Guitar = require('./src/guitar.js');
var GuitarString = require('./src/guitarstring.js');
var sequencer = require('./src/sequencer.js');
var audiokeys = require('./src/sequencer.js');
var MIDIMessage = require('midimessage');

window.controlValues =  {
    stringTension:0,
    characterVariation:0.5,
    stringDamping:0.5,
    stringDampingVariation:0.25,
    stringDampingCalculation:"magic",
    pluckDamping:0.5,
    pluckDampingVariation:0.25,
    body: "none",
    stereoSpread:0.2
}

// calculate the constant used for the low-pass filter
// used in the Karplus-Strong loop
window.calculateSmoothingFactor = function (string, tab, options, note) {
    var smoothingFactor;
    if (options.stringDampingCalculation == "direct") {
        smoothingFactor = options.stringDamping;
    } else if (options.stringDampingCalculation == "magic") {
        // this is copied verbatim from the flash one
        // is magical, don't know how it works
        var noteNumber = (string.semitoneIndex + tab - 19)/44;
        smoothingFactor =
            options.stringDamping +
            Math.pow(noteNumber, 0.5) * (1 - options.stringDamping) * 0.5 +
            (1 - options.stringDamping) *
                Math.random() *
                options.stringDampingVariation;
    }
    return smoothingFactor;
}


window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
// var guitar = new Guitar(audioCtx, audioCtx.destination);
var string = new GuitarString(audioCtx, audioCtx.destination, 0, 2, 4);// E2
var keyboard = new AudioKeys({
    polyphony: 1,
});
var dials;

keyboard.down( function(note) {
    string.pluck(audioCtx.currentTime, note.velocity/127, note.note-60);
});

if (navigator.requestMIDIAccess){
    navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject );
}
else{
    console.error("DOH! No MIDI support present in your browser.");
}

function onMIDIInit (midi){
    dials = $(".dial")

    onMIDIConect(midi);

    midi.onstatechange = function(event){
        console.log("MIDIConnectionEvent on port", event.port);
        if (event.port.type === "input" && event.port.connection === "open"){
            onMIDIConect(midi);
        }
    }
}

function onMIDIConect(midi){
    midi.inputs.forEach(function(input){
        input.onmidimessage = function(event){
            var midiMessage = MIDIMessage(event);
            // console.log(midiMessage);
            if(midiMessage.messageType === "controlchange"){
                var dialIndex = midiMessage.controllerNumber-16;
                var newValue = midiMessage.controllerValue/127;
                if (dialIndex < dials.length){
                    $(dials[dialIndex]).val(newValue).trigger('change');
                }

            }
        }
    });
}

function onMIDIReject (error){
    console.error(error);
    return;
}

// keyboard.up( function(note) {
    // guitar.strings[1].pluck(audioCtx.currentTime, note.velocity/127, null, note.frequency);
// });


// sequencer.startGuitarPlaying(guitar, audioCtx);



