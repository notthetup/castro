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

window.addEventListener('load', function(){
    modal = document.getElementById('modal');
    modalClose = document.getElementById('close-button');
    modalClose.addEventListener('click', function(){
        modal.remove();
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var audioCtx = new AudioContext();
        var fader = audioCtx.createGain();
        fader.connect(audioCtx.destination);
        var guitar = new Guitar(audioCtx, fader);
        var string = new GuitarString(audioCtx, fader, 0, 2, 4);// E2
        var keyboard = new AudioKeys({
            polyphony: 1,
        });
        var dials;
        var valueMap = ['stringTension','characterVariation','stringDamping','stringDampingVariation','pluckDamping','pluckDampingVariation','stereoSpread'];

        keyboard.down( function(note) {
            string.pluck(audioCtx.currentTime, note.velocity/127, note.note-60);
        });

        if (navigator.requestMIDIAccess){
            navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject );
        }
        else{
            console.error("DOH! No MIDI support present in your browser.");
        }
    });
});

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
    console.log("Midi connected");
    midi.inputs.forEach(function(input){
        input.onmidimessage = function(event){
            var msg = MIDIMessage(event);
            // console.log(msg);
            if(msg.messageType === "controlchange"){
                var dialIndex = msg.controllerNumber-16;
                var newValue;

                if (dialIndex >= 0 && dialIndex < dials.length){
                    if (dialIndex === 6){
                        newValue = (msg.controllerValue-63)/64;
                        window.controlValues[valueMap[dialIndex]] = -newValue;
                    }else {
                        newValue = msg.controllerValue/127;
                        window.controlValues[valueMap[dialIndex]] = newValue;
                    }
                    $(dials[dialIndex]).val(newValue).trigger('change');
                }else if (msg.controllerNumber === 41 && msg.controllerValue === 0){
                    // play released
                    sequencer.startGuitarPlaying(guitar, audioCtx)
                }else if (msg.controllerNumber === 42 && msg.controllerValue === 0){
                    // pause released
                    sequencer.stopGuitarPlaying();
                }else if (msg.controllerNumber === 7){
                    // pause released
                    fader.gain.value = msg.controllerValue/127;
                    console.log(msg.controllerValue/127);
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



