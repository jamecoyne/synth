import React, { Component } from "react";
import * as Tone from "tone";
import BackendExample from "./backendExample";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
// import "./piano.css";
import "./App.css";
import SequencerTable from "./seq_table";
import Filter from "./Filter";
import {
  Navbar,
  Nav,
  Button,
  Container,
  Row,
  Col,
  Form,
  ButtonGroup,
} from "react-bootstrap";

class App extends Component {
  synth = new Tone.Synth().toMaster();
  sequencer_row = [] as number[];
  sequencer_table = [] as Array<any>;
  state = {
    octave: 0,
    rows: 1, //how many rows of sequencer to display
    columns: 8, //how many cols of sequencer to display
    currentNote: "C4", //most recent notepress on keyboard, in Hz
    duration: 0.2,
    envelope: {
      attack: 0.5,
      decay: 0.5,
      sustain: 0.5,
      release: 0.5,
    },
    noteRange: {
      first: MidiNumbers.fromNote("c3"),
      last: MidiNumbers.fromNote("a4"),
    },
    //new sequencer stuff
    sequencer_cols: 16,
    sequencer_rows: 12,
    sequencer_table: new Array(16).fill(new Array(12).fill(true)),
  };

  keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: this.state.noteRange.first,
    lastNote: this.state.noteRange.last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  componentDidUpdate(props) {
    // set the synthesizer's envelope everytime a slider is changed
    this.synth.envelope.set(this.state.envelope);
  }

  stopSequence = () => {
    Tone.Transport.stop();
  };

  playSequence = () => {
    let index = 0;
    //this.setState({sequencer_row: [1,0,1,1,0,0,1,0]});
    Tone.Transport.scheduleRepeat((time) => {
      //let step = index % this.state.sequencer_cols;
      index++;
    }, "4n");
    Tone.Transport.start();
  };

  play = (freq) => {
    this.synth.triggerAttack(freq);
  };

  playNode = (midiNote) => {
    console.log(this.state.octave);
    midiNote = 0.0 + midiNote;
    console.log("midiNote: " + midiNote);
    let freq = Math.pow(2.0, (midiNote - 69.0) / 12.0) * 440.0;
    //applying octave to freq
    if (this.state.octave > 0) {
      for (let i = 0; i < this.state.octave; i++) {
        freq = freq * 2;
      }
    } else if (this.state.octave < 0) {
      for (let i = 0; i > this.state.octave; i--) {
        freq = freq / 2;
      }
    }
    console.log("frequency:" + freq);
    this.setState({ currentNote: freq });
    this.play(freq);
  };

  stopNote = (midiNote) => {
    console.log("note stopped");
    this.synth.triggerRelease();
  };

  //updateSequencer runs whenever a checkbox in Sequencer component is clicked, which modifys the global sequencer row
  updateSequencer(column) {
    console.log(column);
    if (this.sequencer_row.length > 0) {
      console.log("flag");
      this.sequencer_row.length = this.state.columns;
      for (let i = 0; i < this.sequencer_row.length; i++) {
        //must be a better way to check for empty values
        this.sequencer_row[i] =
          this.sequencer_row[i] === 1 || this.sequencer_row[i] === 0
            ? this.sequencer_row[i]
            : 0;
      }
    }
    if (this.sequencer_row[column - 1] === 1) {
      this.sequencer_row[column - 1] = 0;
    } else {
      this.sequencer_row[column - 1] = 1;
    }
    console.log(this.sequencer_row);
  }

  //callback function for maintaining the state here to pass to SequencerTable component
  updateSeqTable(colIdx: number, col: Array<boolean>) {
    console.log(
      "Column updated: " + colIdx + "\nNew values: " + col.toString()
    );
  }

  render() {
    return (
      <div className="App">
        <Navbar bg="dark" variant="dark">
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="container-fluid">
              <Nav.Link href="#home">Save</Nav.Link>
              <Nav.Link href="#link">Load</Nav.Link>
              <Nav.Link href="#link">Download</Nav.Link>
              <Nav.Item className="ml-auto">
                <Button>Log In</Button>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Container fluid>
          <Row>
            <Col style={{ borderRight: "1px solid white", height: "92vh" }}>
              Synthesizer
              <Row>
                <Col>
                  <Form>
                    <Form.Group controlId="">
                      <ButtonGroup aria-label="Basic example">
                        <Button variant="secondary">Square</Button>
                        <Button variant="secondary">Sin</Button>
                        <Button variant="secondary">Saw</Button>
                        <Button variant="secondary">Triangle</Button>
                      </ButtonGroup>
                    </Form.Group>

                    <Form.Group controlId="formBasicRange">
                      <Form.Label>Octave</Form.Label>
                      <Form.Control
                        type="range"
                        min={-2}
                        max={2}
                        step={1}
                        defaultValue={this.state.octave}
                        onChange={(event) => {
                          this.setState({
                            octave: parseFloat(event.target.value),
                          });
                        }}
                      />
                    </Form.Group>

                    <Form.Group controlId="formBasicRange">
                      <Form.Label>Duration (s)</Form.Label>
                      <Form.Control
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.1}
                        defaultValue={this.state.duration}
                        onChange={(event) => {
                          this.setState({
                            duration: parseFloat(event.target.value),
                          });
                        }}
                      />
                    </Form.Group>
                  </Form>
                </Col>
                <Col>
                  <Row>
                    <Filter />
                  </Row>
                  <Row>
                    Envelope
                    <Form>
                      <Form.Label>Attack</Form.Label>
                      <Form.Control
                        type="range"
                        min={0.1}
                        max={2}
                        step={0.1}
                        defaultValue={this.state.envelope.attack}
                        onChange={(event) => {
                          this.setState({
                            envelope: {
                              attack: parseFloat(event.target.value),
                            },
                          });
                        }}
                      />
                      <Form.Label>Decay</Form.Label>
                      <Form.Control
                        type="range"
                        min={0.1}
                        max={2}
                        step={0.1}
                        defaultValue={this.state.envelope.decay}
                        onChange={(event) => {
                          this.setState({
                            envelope: {
                              decay: parseFloat(event.target.value),
                            },
                          });
                        }}
                      />
                      <Form.Label>Sustain</Form.Label>
                      <Form.Control
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.1}
                        defaultValue={this.state.envelope.sustain}
                        onChange={(event) => {
                          this.setState({
                            envelope: {
                              sustain: parseFloat(event.target.value),
                            },
                          });
                        }}
                      />
                      <Form.Label>Release</Form.Label>
                      <Form.Control
                        type="range"
                        min={0.1}
                        max={2}
                        step={0.1}
                        defaultValue={this.state.envelope.release}
                        onChange={(event) => {
                          this.setState({
                            envelope: {
                              release: parseFloat(event.target.value),
                            },
                          });
                        }}
                      />
                    </Form>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col>
              Sequencer
              <Row>
                {/* <Piano
                  style={{ border: "1px solid blue" }}
                  noteRange={this.state.noteRange}
                  playNote={this.playNode}
                  stopNote={this.stopNote}
                  disabled={false}
                  keyboardShortcuts={this.keyboardShortcuts}
                /> */}

                <SequencerTable
                  len={this.state.sequencer_cols}
                  actualTable={this.sequencer_table}
                  callback={this.updateSeqTable}
                  octave={this.state.octave}
                  envelope={this.state.envelope}
                />
              </Row>
            </Col>
          </Row>
          {/* <Row style={{ border: "1px solid blue", height: "35vh" }}>
            Recording component goes here!
          </Row> */}
        </Container>
      </div>
    );
  }
}

export default App;
