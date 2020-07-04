import React, {Component, Fragment} from 'react';
import SequencerColumn from './seq_col';
import * as Tone from 'tone';

type tableProps = {
    len : number;
    actualTable : boolean[][];
    callback : (colIdx, col) => void;
    octave : number;
    envelope : {};
}

type tableState = {
    actualTable : boolean[][]
    seqNotes : number[]
    octave : number;
    envelope : {}
}

class SequencerTable extends Component<tableProps, tableState> {

    synth = new Tone.PolySynth(Tone.Synth).toMaster();
    running = false;
    seqNotesFreq = [] as number[];

    // initalize array to hold each cell with each cell as true
    constructor(props) {
        super(props);
        this.state = {
            actualTable : new Array(16).fill(new Array(12).fill(true)),
            //copied midi notes from keyboard
            seqNotes : [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
                       //48,    49,   50,   51,   52,   53,   54,   55,   56,   57,   58,   59
                       //'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'
            
            octave : this.props.octave,
            //default envelope vals
            envelope: {
                attack: 0.5,
                decay: 0.5,
                sustain: 0.5,
                release: 0.5
            }
        };
        //because I didn't want to reverse it myself
        this.state.seqNotes.reverse();
        //for letting the synth know which frequencies to attack/release
        this.seqNotesFreq = this.state.seqNotes.map((value) => {return(this.convertToFreq(value))});
    }

    makeColumns(){
        return(
            this.state.actualTable.map(
                (value, index)=> 
             <SequencerColumn
                idx={index}
                size={12} 
                callback={this.tableCallback}
             />)
        );
    }

    tableCallback = (colIdx, col) =>
    {
        console.log('callback called back: ' + col + ' id ' + colIdx);
        var tempTable = this.state.actualTable;
        tempTable[colIdx] = col;
        this.setState({actualTable: tempTable})
        console.log(this.state);
        this.props.callback(colIdx, col);
    }

    componentDidUpdate(props) {
        //update when envelope sliders change
        if(this.props.envelope !== this.state.envelope)
        {
            this.setState({envelope: this.props.envelope});
            this.synth.set({envelope: this.state.envelope});
        }
        //update when octave slider changes
        if(this.props.octave !== this.state.octave)
        {
            this.setState({octave: this.props.octave});
            this.seqNotesFreq  = this.state.seqNotes.map((value) => {return(this.convertToFreq(value))});
        }
    }

    //for factoring in octave in frequency conversion (so that we can play accidentals)
    convertToFreq(midiNote) {
        console.log(this.state.octave)
        midiNote =   0.0 + midiNote
        //console.log('midiNote: ' + midiNote);
        let freq = Math.pow(2.0, (midiNote-69.0)/ 12.0) * 440.0;
        //applying octave to freq
        if(this.state.octave > 0){
            for(let i=0; i < this.state.octave; i++){
                freq = freq * 2;
            }
        }else if(this.state.octave < 0){
            for(let i=0; i > this.state.octave; i--){
                freq = freq / 2;
            }
        }
        //console.log('frequency:' + freq);
        return(freq);
    }

    playSequence = () => {

        //stops transport from making multiple schedules
        if(this.running)
            return;
        //inner transport init stuff
        this.running = true;
        let index = 0;
        let step = 0;
        //array of frequencies to attack
        let notesPlayed = [] as number[];
        //array of frequencies to release
        let notesReleased = [] as number[];
        //sets AudioContext because it sometimes isn't set
        Tone.start();
        Tone.Transport.scheduleRepeat((time) => {

            //reset note release array
            notesReleased = [];

            step = index % this.state.actualTable.length; 
            //gets rid of the highlight on the last column when the sequence starts over
            if(step === 0)
            {
                document.getElementById('seq_table')?.children.item(this.state.actualTable.length-1)?.classList.remove('column_filled')
            }
            //marks highlighted column and unmarks the previous one
            document.getElementById('seq_table')?.children.item(step)?.classList.add('column_filled')
            document.getElementById('seq_table')?.children.item(step-1)?.classList.remove('column_filled')
            //go through current column
            for(let i=0; i<this.state.actualTable[step].length; i++)
            {
                if(!this.state.actualTable[step][i])
                {   
                    //so that notes played at the end of the sequence don't carry over to the beginning
                    if(step === 0 || this.state.actualTable[step-1][i])
                        notesPlayed.push(this.convertToFreq(this.state.seqNotes[i]));
                } else {
                    //if the frequency isn't being played (the cell isn't toggled on), get ready to release it
                    notesReleased.push(this.convertToFreq(this.state.seqNotes[i]));
                }
            }
            //console.log("notes played: " + notesPlayed)
            this.synth.triggerAttack(notesPlayed);
            this.synth.triggerRelease(notesReleased);

            if(step === this.state.actualTable.length-1)
            {
                //release all frequencies when reaching the end of the sequence
                this.synth.triggerRelease(this.seqNotesFreq);
            }
            
            //reset the array of notes to be played
            notesPlayed = [];
            
            index++;
        }, "16n");
        //reset everything when the stop button is pressed
        Tone.Transport.on('stop', () => {
            document.getElementById('seq_table')?.children.item(step)?.classList.remove('column_filled')
            step = 0;
            index = 0;
            this.running = false;
            Tone.Transport.cancel();
            this.synth.triggerRelease(this.seqNotesFreq);
        })
        Tone.Transport.start();
        
    }

    stopSequence = () => {
        //just to make sure the frequencies that are being stopped are the ones that are being played
        this.seqNotesFreq  = this.state.seqNotes.map((value) => {return(this.convertToFreq(value))});
        Tone.Transport.stop();
    }

    render() {
        return(
            <>
            <button onClick={this.playSequence}>play</button>
            <button onClick={this.stopSequence}>stop</button>
            <div id="seq_table" className = "container">
                {
                    this.makeColumns()
                }
            </div>
            </>
        )
    }
}

export default SequencerTable