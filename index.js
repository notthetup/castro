var Guitar = require('./src/guitar.js');
var sequencer = require('./src/sequencer.js')

window.getControlsValues =  {
    stringTension: stringTension,
    characterVariation: characterVariation,
    stringDamping: stringDamping,
    stringDampingVariation: stringDampingVariation,
    stringDampingCalculation: stringDampingCalculation,
    pluckDamping: pluckDamping,
    pluckDampingVariation: pluckDampingVariation,
    body: body,
    stereoSpread: stereoSpread
}

// calculate the constant used for the low-pass filter
// used in the Karplus-Strong loop
window.calculateSmoothingFactor = function (string, tab, options) {
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


var guitar;
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
guitar = new Guitar(audioCtx, audioCtx.destination);
sequencer.startGuitarPlaying(guitar, audioCtx);



