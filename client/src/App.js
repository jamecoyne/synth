import React, { Component } from 'react';
import * as Tone from 'tone';
import logo from './logo.svg';

import './App.css';

class App extends Component {
  state = {
    response: '',
    post: '',
    responseToPost: '',
  };
  
  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }
  
  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    
    return body;
  };
  
  handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/api/world', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.text();
    
    this.setState({ responseToPost: body });
  };

  play(){
    //create a synth and connect it to the master output (your speakers)
    const synth = new Tone.Synth().toMaster();
    var note = document.getElementById('frequencySlider').value;
    var duration = document.getElementById('durationSlider').value;
    var attack = document.getElementById('attackSlider').value;
    var decay = document.getElementById('decaySlider').value;
    var sustain = document.getElementById('sustainSlider').value;
    var release = document.getElementById('releaseSlider').value;
    synth.envelope.attack = attack;
    synth.envelope.decay = decay;
    synth.envelope.sustain = sustain;
    synth.envelope.release = release;
    console.log(note + 'Hz, ' + duration + 'sec');
    synth.triggerAttackRelease(note, duration);
  }
  
render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
      
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <p>{this.state.response}</p>
        <form onSubmit={this.handleSubmit}>
          <p>
            <strong>Post to Server:</strong>
          </p>
          <input
            type="text"
            value={this.state.post}
            onChange={e => this.setState({ post: e.target.value })}
          />
          <button type="submit">Submit</button>
        </form>
        <p>{this.state.responseToPost}</p>
        TONEJS<br></br>
        <table>
        <tr>
            <th colspan="2">Note and Duration</th>
          </tr>
          <tr>
            <td>
              Frequency (Hz)
            </td>
            <td>
              <input id="frequencySlider"  type="range" min="20" max="4000" step="1" defaultValue="262"/>
            </td>
          </tr>
          <tr>
            <td>
              Duration (sec)
            </td>
            <td>
              <input id="durationSlider"  type="range" min="0.1" max="2" step=".1" defaultValue="1"/>
            </td>
          </tr>
          <tr>
            <th colspan="2">Envelope</th>
          </tr>
          <tr>
            <td>
              Attack
            </td>
            <td>
              <input id="attackSlider"  type="range" min="0.1" max="2" step=".1" defaultValue="1"/>
            </td>
          </tr>
          <tr>
            <td>
              Decay
            </td>
            <td>
              <input id="decaySlider"  type="range" min="0.1" max="2" step=".1" defaultValue="1"/>
            </td>
          </tr>
          <tr>
            <td>
              Sustain
            </td>
            <td>
              <input id="sustainSlider"  type="range" min="0.1" max="2" step=".1" defaultValue="1"/>
            </td>
          </tr>
          <tr>
            <td>
              Release
            </td>
            <td>
              <input id="releaseSlider"  type="range" min="0.1" max="2" step=".1" defaultValue="1"/>
            </td>
          </tr>
        </table>
        <button onClick={this.play}>play</button>
      </div>
    );
  }
}

export default App;