import React, {Component} from 'react';
import SequencerColumn from './seq_col';
import * as Tone from 'tone';

type tableProps = {
    len : number;
    actualTable : boolean[][];
    callback : (colIdx, col) => void;
}

type tableState = {
    actualTable : boolean[][]
    seqNotes : string[]
}

class SequencerTable extends Component<tableProps, tableState> {

    synth = new Tone.PolySynth(Tone.Synth).toMaster();
    running = false;

    // initalize array to hold each cell with each cell as true
    constructor(props) {
        super(props);
        this.state = {
            actualTable : new Array(16).fill(new Array(12).fill(true)),
            seqNotes : ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5']
        };
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

    play = (freq) => {
        this.synth.triggerAttackRelease(freq, '4n');
    }

    playSequence = () => {

        if(this.running)
            return;
        // if(Tone.Transport.position !== "0:0:0")
        // {
        //     Tone.Transport.start()
        //     return;
        // }
        this.running = true;
        let index = 0;
        let step = 0;
        let notesPlayed = [] as string[];
        Tone.start();
        Tone.Transport.scheduleRepeat((time) => {
            step = index % this.state.actualTable.length; 
            if(step === 0)
            {
                document.getElementById('seq_table')?.children.item(15)?.classList.remove('column_filled')
            }
            document.getElementById('seq_table')?.children.item(step)?.classList.add('column_filled')
            document.getElementById('seq_table')?.children.item(step-1)?.classList.remove('column_filled')
            for(let i=0; i<this.state.actualTable[step].length; i++)
            {
                if(!this.state.actualTable[step][i])
                {
                    notesPlayed.push(this.state.seqNotes[i]);
                }
            }
            console.log("notes played: " + notesPlayed)
            this.synth.triggerAttackRelease(notesPlayed, '4n');
            notesPlayed = [];
            
            index++;
        }, "4n");
        Tone.Transport.on('stop', () => {
            document.getElementById('seq_table')?.children.item(step)?.classList.remove('column_filled')
            step = 0;
            index = 0;
            this.running = false;
            Tone.Transport.cancel();
        })
        Tone.Transport.start();
        
    }

    stopSequence = () => {
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