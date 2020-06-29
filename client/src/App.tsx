import React, { Component } from 'react';
import * as Tone from 'tone';
import BackendExample from './backendExample'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css'
import './App.css';

// function SequencerCell (props) {
// 	return (
// 		<input type='checkbox' onClick={props.click(props.col)}></input>
// 	);
// }

function SequencerRow (props) {
  const columns = props.columns;

  
  let range = Array.from(Array(columns), (_, i) => i + 1);
  
  return (<ul>{range.map((item) => <input type='checkbox' key={item} onClick={() => {props.click(item)}}/>)}</ul>
	);
}

class App extends Component {
  synth = new Tone.Synth().toMaster();
  sequencer_row =  [] as number[];
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
      }
  };

  keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: this.state.noteRange.first,
    lastNote: this.state.noteRange.last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });
  
  

  componentDidUpdate(props){
    // set the synthesizer's envelope everytime a slider is changed
    this.synth.envelope.set(this.state.envelope);
  }

  stopSequence = () => {
  	Tone.Transport.stop();
  }

  playSequence = () => {
	let index = 0;
	this.setState({sequencer_row: [1,0,1,1,0,0,1,0]});
	Tone.Transport.scheduleRepeat((time) => {
		let step = index % this.sequencer_row.length; 
		if (this.sequencer_row[step] === 1) {
				this.play(this.state.currentNote);
			}	
		index++;
	}, "4n");
	Tone.Transport.start();
	
  }

  play = (freq) => {
	this.synth.triggerAttackRelease(freq, this.state.duration);
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
  }

  toggleClass(hek : HTMLElement) {
    if(hek.classList.contains("row"))
    {
      hek.classList.remove("row")
      hek.classList.add("row_filled")
    } else {
      hek.classList.remove("row_filled")
      hek.classList.add("row")
    }
  }
//updateSequencer runs whenever a checkbox in Sequencer component is clicked, which modifys the global sequencer row 
updateSequencer(column) {
	console.log(column);
	if(this.sequencer_row.length > 0) {
		console.log('flag');
		this.sequencer_row.length = this.state.columns;
		for(let i = 0; i < this.sequencer_row.length; i++) {
			//must be a better way to check for empty values
			this.sequencer_row[i] = this.sequencer_row[i] === 1 || this.sequencer_row[i] === 0? this.sequencer_row[i]:0;
		}
	}
	if (this.sequencer_row[column - 1] === 1){
		this.sequencer_row[column - 1] = 0;
	} else {
		this.sequencer_row[column - 1] = 1;	
	}
	console.log(this.sequencer_row);
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
        <button onClick={this.playSequence}>play</button>
		<button onClick={this.stopSequence}>stop</button>
        <p>SEQUENCER</p>
      <SequencerRow columns={this.state.columns} click={(item) => {this.updateSequencer(item)}}/>

		<div className={"transport"}></div>
        <div className={"container"}>
          <div className={"column"}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row_filled"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
          <div className={"column "}>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
            <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}></div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

