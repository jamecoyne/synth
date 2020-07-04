import React, {Component} from 'react';
import SequencerColumn from './seq_col';
import * as Tone from 'tone';
import update from 'react-addons-update';

type ColumnData = {
    data : boolean[];
    selected : boolean;
}

type tableProps = {
    len : number;
    actualTable : boolean[][];
    callback : (colIdx, col) => void;
}

type tableState = {
    actualTable : ColumnData[]
    seqNotes : string[]
}

class SequencerTable extends Component<tableProps, tableState> {

    synth = new Tone.PolySynth(Tone.Synth).toMaster();
    running = false;


    // initalize array to hold each cell with each cell as true
    constructor(props) {
        super(props);
        this.state = {
            actualTable : new Array(16).fill(
                {
                    data: new Array(12).fill(true),
                    selected: false
                }
            ),
            seqNotes : ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5']
        };
    }

    tableCallback = (colIdx, col) =>
    {
        console.log('callback called back: ' + col + ' id ' + colIdx);
        this.setState({
            actualTable: update(this.state.actualTable, {[colIdx]: {data: {$set: col}}})
        });
        this.props.callback(colIdx, col);
    }

    play = (freq) => {
        this.synth.triggerAttackRelease(freq, '4n');
    }

    updateColumnSelected = (colId : number, value : boolean) => {
        if(colId < 0) colId = this.state.actualTable.length-1;
            this.setState({
                actualTable: update(this.state.actualTable, {[colId]: {selected: {$set: value}}})
            });
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
            this.updateColumnSelected(step-1, false);
            this.updateColumnSelected(step, true);
            
            for(let i=0; i<this.state.actualTable[step].data.length; i++)
            {
                if(!this.state.actualTable[step].data[i])
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
            this.state.actualTable[step].selected = false;
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
                    this.state.actualTable.map(
                        (value, index)=> {
                            return  <SequencerColumn
                            idx={index}
                            size={12} 
                            selected={value.selected}
                            callback={this.tableCallback}
                         />}
                    )
                }
            </div>
            </>
        )
    }
}

export default SequencerTable