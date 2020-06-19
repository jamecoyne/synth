import React, { Component } from 'react';
import * as Tone from 'tone';
import BackendExample from './backendExample'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css'
import './App.css';

class App extends Component {

  synth = new Tone.Synth().toMaster();
  
  state = {
      ocatve: 3,
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

  play = (freq) => {
    this.synth.triggerAttackRelease(freq, this.state.duration);
  }
  
  playNode = midiNote => {
    midiNote =   0.0 + midiNote
    console.log('midiNote: ' + midiNote);
    let freq = Math.pow(2.0, (midiNote-69.0)/ 12.0) * 440.0;
    console.log('frequency:' + freq);
    this.play(freq);
  }

  stopNote = midiNote => {
    console.log('note stopped');
  }

  toggleClass() {
    if(document.getElementById("ex")?.classList.contains("row"))
    {
      document.getElementById("ex")?.classList.remove("row")
      document.getElementById("ex")?.classList.add("row_filled")
    } else {
      document.getElementById("ex")?.classList.remove("row_filled")
      document.getElementById("ex")?.classList.add("row")
    }
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
                id={"frequencySlider"}
                type={"range"}
                min={0}
                max={5}
                step={1}
                defaultValue={this.state.ocatve}
                onChange={
                  (e: React.FormEvent<HTMLInputElement>) => {
                    this.setState({note: parseFloat(e.currentTarget.value)})
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
        <button onClick={this.play}>play</button>
        <p>SEQUENCER</p>
        <div className={"transport"}></div>
        <div className={"container"}>
          <div className={"column"}>
            <div id = {"ex"} className={"row"} onMouseDown={this.toggleClass}></div>
            <div className={"row_filled"}></div>
            <div className={"row"}></div>
            <div className={"row"}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
          <div className={"column "}>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
            <div className={"row "}></div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;