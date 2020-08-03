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
    currUser : String,
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

//todo : remove hard code, attach these methods to instrument save/load button as well as register/login
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

//create user
register = async () => {
  const response = await fetch('/api/createuser', {
    method : 'POST',
    headers : {
      'Content-type' : 'application/json'
    },
    body : JSON.stringify({
      un : 'newUsername',
      pw : 'newPassword'
    })
  });
  const body = await response.text();
  switch (body) {
    case 'Username taken!' : {
      //do something with UI
      break;
    }
    case 'User successfully created!' : {
      this.setState({currUser : 'newUsername'});
      break;
    }
  }
  console.log(body);
}

//log in as user
login = async () => {
  const response = await fetch('/api/login', {
    method : 'POST',
    headers : {
      'Content-type' : 'application/json'
    },
    body : JSON.stringify({
      un : 'janesmith',
      pw : '12345'
    })
  });
  const body = await response.text();
  switch (body) {
    case 'Login successful!' : {
      this.setState({currUser : 'janesmith'});
      break;
    }
    case 'Password incorrect!' : {
      //do something with the login UI
      break;
    }
    case 'User does not exist' : {
      //do something with the login UI
      break;
    }
  }
  console.log('Login successful!');
}

testDB = async () => {
  //url to grab from
  //test user creation
  const createresponse = await fetch('/api/createuser', {
      method : 'POST',
      headers : {
          'Content-type' : 'application/json'
      },
      body : JSON.stringify({
          un : 'newUsername',
          pw : 'newPassword'
      })
  });
  const createbody = await createresponse.text();
  console.log(createbody);



  //test user login
  const loginresponse = await fetch('/api/login', {
      method : 'POST',
      headers : {
          'Content-type' : 'application/json'
      },
      body : JSON.stringify({
          un : 'janesmith',
          pw : '12345'
      })
  });
  const loginbody = await loginresponse.text();
  console.log(loginbody);



  //test sequence save
      //not really doable without the client running



  //test sequence load
  const seqloadresponse = await fetch('/api/tbload', {
      method : 'POST',
      headers : {
          'Content-type' : 'application/json'
      },
      body : JSON.stringify({
          username : 'janesmith',
          seq_name : 'my_sequence'
      })
  });
  const seqloadbody = await seqloadresponse.json();
  console.log('Sequence loaded!');



  //test sequence list get
  const seqlistresponse = await fetch('/api/getseqlist', {
      method : 'POST',
      headers : {
          'Content-type' : 'application/json'
      },
      body : JSON.stringify({
          username : 'janesmith',
      })
  });
  const seqlistbody = await seqlistresponse.json();
  console.log('Got sequence list!');



  //test inst preset save
      //not really doable without the client running


  
  //test inst preset load
  const instloadresponse = await fetch('/api/loadinst', {
      method : 'POST',
      headers : {
          'Content-type' : 'application/json'
      },
      body : JSON.stringify({
          username : 'janesmith',
          preset_name : 'my_instrument'
      })
  });
  const instloadbody = JSON.parse(await instloadresponse.text());
  console.log('Instrument loaded!')


  
  //test inst preset list get
  const instlistresponse = await fetch('/api/getinstlist', {
      method : 'POST',
      headers : {
          'Content-type' : 'application/json'
      },
      body : JSON.stringify({
          username : 'janesmith',
      })
  });
  const instlistbody = await instlistresponse.json();
  console.log('Got instrument list!');

  //all tests successful
  console.log('All tests successful!');
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
        <button onClick={this.login}>login</button>
        <button onClick={this.register}>register</button>
        <button onClick={this.saveState.bind(this)}>Save State</button>
        <FileUploader
          accept=".json"
          title="Load State"
          uploadedFileCallback={e => {
            this.loadState.bind(this)(e);
          }}
        />
        <button onClick={this.testDB}>testDB</button>
      </div>
    );
  }
}

export default App;
