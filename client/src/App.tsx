import React, { Component } from 'react';
import * as Tone from 'tone';
import BackendExample from './backendExample'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css'
import './App.css';
import SequencerTable from './seq_table'

class App extends Component {
  synth = new Tone.PolySynth(Tone.Synth).toMaster();
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
  
  

  componentDidUpdate(props){
    // set the synthesizer's envelope everytime a slider is changed
    this.synth.set({envelope : this.state.envelope});
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
  	//console.log('frequency:' + freq);
	  //this.setState({currentNote: freq});
    this.synth.triggerRelease(freq);
  }

//callback function for maintaining the state here to pass to SequencerTable component
updateSeqTable(colIdx: number, col:Array<boolean>) {
  console.log("Column updated: " + colIdx + "\nNew values: " + col.toString());
}

//todo : remove hard code, attach these methods to instrument save/load button
//saves instrument preset
saveInstrument = async () => {
  const response = await fetch('/api/saveinst', {
      method: 'POST',
      headers : {
          'Content-type' : 'application/json',
      },
      body : JSON.stringify({
          username : 'janesmith',
          name : 'my_instrument',
          inst : JSON.stringify({
              octave : this.state.octave,
              oscillator : this.synth.get().oscillator,
              envelope : this.synth.get().envelope
          })
      })
  });
  const body = await response.text();
  console.log(body);
}

//load instrument preset
loadInstrument = async (inst_name) => {
  const response = await fetch('/api/loadinst', {
      method : 'POST',
      headers : {
          'Content-type' : 'application/json'
      },
      body : JSON.stringify({
          username : 'janesmith',
          preset_name : 'my_instrument'
      })
  });
  const body = JSON.parse(await response.text());
  this.synth.set(body.oscillator);
  this.synth.set(body.envelope);
  this.setState({octave : body.octave});
  //reflect change in the sliders
  
  console.log('Instrument loaded!');
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
        {/* {<BackendExample/>} */}
      </div>
    );
  }
}

export default App;
