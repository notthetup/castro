var Guitar = require('./src/guitar.js');
var sequencer = require('./src/sequencer.js')
var audiokeys = require('./src/sequencer.js')

window.controlValues =  {
    stringTension:0.5,
    characterVariation:0.5,
    stringDamping:0.5,
    stringDampingVariation:0.5,
    stringDampingCalculation:"magic",
    pluckDamping:0.5,
    pluckDampingVariation:0.5,
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

keyboard.down( function(note) {
    console.log(note.note-60);
    string.pluck(audioCtx.currentTime, note.velocity/127, note.note-60);
    // sequencer.startGuitarPlaying(guitar,audioCtx);
});

keyboard.up( function(note) {
    // guitar.strings[1].pluck(audioCtx.currentTime, note.velocity/127, null, note.frequency);
});


// sequencer.startGuitarPlaying(guitar, audioCtx);



