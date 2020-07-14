import React, { Component } from 'react';
import * as Tone from 'tone';
import BackendExample from './backendExample'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css'
import './App.css';
import SequencerTable from './seq_table'
import 'file-saver';
import FileUploader from 'file-uploader-js';


class App extends Component {
  synth = new Tone.Synth().toMaster();
  
  sequencer_row =  [] as number[];
  sequencer_table = [] as Array<any>; 
  state = {
    octave: 0,
  	rows : 1, //how many rows of sequencer to display
    columns : 8, //how many cols of sequencer to display
	  currentNote : 'C4', //most recent notepress on keyboard, in Hz
	  duration: 0.2,
    envelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5
    },
    noteRange: {
        first: MidiNumbers.fromNote('c3'),
        last: MidiNumbers.fromNote('a4'),
    },
    //new sequencer stuff
    sequencer_cols : 16,
    sequencer_rows : 12,
    sequencer_table : new Array(16).fill(new Array(12).fill(true)),
  }

  keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: this.state.noteRange.first,
    lastNote: this.state.noteRange.last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });
  
  saveState() {
    var FileSaver = require('file-saver');
    let state = JSON.stringify(this.state);
    var blob = new Blob([state], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, "state.json");
  }

  loadState = (file) => {
    this.setState(JSON.parse(file));
    this.setState({ state: this.state });
    //this.forceUpdate();
  }
  componentDidUpdate(props){
    // set the synthesizer's envelope everytime a slider is changed
    this.synth.envelope.set(this.state.envelope);
  }

  stopSequence = () => {
  	Tone.Transport.stop();
  }

  playSequence = () => {
	let index = 0;
	//this.setState({sequencer_row: [1,0,1,1,0,0,1,0]});
	Tone.Transport.scheduleRepeat((time) => {
    //let step = index % this.state.sequencer_cols; 
		index++;
	}, "4n");
	Tone.Transport.start();
	
  }

  play = (freq) => {
	this.synth.triggerAttack(freq);
  }
  
  playNode = midiNote => {
	console.log(this.state.octave)
    midiNote =   0.0 + midiNote
    console.log('midiNote: ' + midiNote);
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
	console.log('frequency:' + freq);
	this.setState({currentNote: freq});
    this.play(freq);
  }

  stopNote = midiNote => {
    console.log('note stopped');
    this.synth.triggerRelease();
  }



//callback function for maintaining the state here to pass to SequencerTable component
updateSeqTable(colIdx: number, col:Array<boolean>) {
  console.log("Column updated: " + colIdx + "\nNew values: " + col.toString());
}


render() {
    return (
      <div className="App">
        <Piano
          noteRange={this.state.noteRange}
          width={600}
          playNote={this.playNode}
          stopNote={this.stopNote}
          disabled={false}
          keyboardShortcuts={this.keyboardShortcuts}
        />
        {/* <BackendExample/> */}
        TONEJS
        <br/>
        <table>
        <tr>
            <th colSpan={2}>Note and Duration</th>
          </tr>
          <tr>
            <td>
              Octave
            </td>
            <td>
              <input 
                id={"octaveSlider"}
                type={"range"}
                min={-2}
                max={2}
                step={1}
                defaultValue={this.state.octave}
                onChange={
                  (e: React.FormEvent<HTMLInputElement>) => {
                    this.setState({octave: parseFloat(e.currentTarget.value)})
                  }
                }
              />
            </td>
          </tr>
          <tr>
            <td>
              Duration (sec)
            </td>
            <td>
              <input 
                id={"durationSlider"}
                type={"range"}
                min={0.1} 
                max={1}
                step={.1}
                defaultValue={this.state.duration}
                onChange={
                  (e: React.FormEvent<HTMLInputElement>) => {
                    this.setState({duration: parseFloat(e.currentTarget.value)})
                  }
                }
              />
            </td>
          </tr>
          <tr>
            <th colSpan={2}>Envelope</th>
          </tr>
          <tr>
            <td>
              Attack
            </td>
            <td>
              <input 
                id={"attackSlider"}  
                type={"range"} 
                min={0.1} 
                max={2}
                step={.1}
                defaultValue={this.state.envelope.attack}
                onChange={
                  (e: React.FormEvent<HTMLInputElement>) => {
                    this.setState({envelope: {attack: parseFloat(e.currentTarget.value)}})
                  }
                }
              />
            </td>
          </tr>
          <tr>
            <td>
              Decay
            </td>
            <td>
              <input
                id={"decaySlider"}  
                type={"range"}
                min={0.1}
                max={1}
                step={.1}
                defaultValue={this.state.envelope.decay}
                onChange={
                  (e: React.FormEvent<HTMLInputElement>) => {
                    this.setState({envelope: {decay: parseFloat(e.currentTarget.value)}})
                  }
                }
              />
            </td>
          </tr>
          <tr>
            <td>
              Sustain
            </td>
            <td>
              <input 
                id={"sustainSlider"}
                type={"range"}
                min={0.1}
                max={1}
                step={.1}
                defaultValue={this.state.envelope.sustain}
                onChange={
                  (e: React.FormEvent<HTMLInputElement>) => {
                    this.setState({envelope: {sustain: parseFloat(e.currentTarget.value)}})
                  }
                }
              />
            </td>
          </tr>
          <tr>
            <td>
              Release
            </td>
            <td>
              <input 
                id={"releaseSlider"}
                type={"range"}
                min={0.1}
                max={1}
                step={.1}
                defaultValue={this.state.envelope.release}
                onChange={
                  (e: React.FormEvent<HTMLInputElement>) => {
                    this.setState({envelope: {release: parseFloat(e.currentTarget.value)}})
                  }
                }
                />
            </td>
          </tr>
        </table>

		    <div className={"transport"}></div>
        <SequencerTable len={this.state.sequencer_cols} actualTable={this.sequencer_table} callback={this.updateSeqTable} octave={this.state.octave} envelope={this.state.envelope}/>
        <button onClick={() => {console.log(this.state)}} >print state</button>
        <button onClick={this.saveState.bind(this)}>Save State</button>
        <FileUploader
          accept=".json"
          title="Load State"
          uploadedFileCallback={e => {
            this.loadState.bind(this)(e);
          }}
        />
      </div>
    );
  }
}

export default App;

