import React, { Component, Fragment } from "react";
import SequencerColumn from "./seq_col";
import * as Tone from "tone";
import update from "react-addons-update";
import {
  Button,
  Container,
  Row,
  Col,
  Form,
  Dropdown,
  Nav,
} from "react-bootstrap";

type ColumnData = {
  data: boolean[];
  selected: boolean;
};

type tableProps = {
  len: number;
  actualTable: boolean[][];
  callback: (colIdx: any, col: any) => void;
  octave: number;
  envelope: {};
  waveshape: {};
  currUser: string;
  instload: (inst: string) => void;
};

type tableState = {
  actualTable: ColumnData[];
  seqNotes: number[];
  octave: number;
  envelope: {};
  waveshape: {};
  running: boolean;
};

class SequencerTable extends Component<tableProps, tableState> {
  synth = new Tone.PolySynth(Tone.Synth).toMaster();
  // running = false;

  seqNotesFreq = [] as number[];
  // initalize array to hold each cell with each cell as true
  constructor(props: any) {
    super(props);
    this.state = {
      actualTable: new Array(16).fill({
        data: new Array(12).fill(true),
        selected: false,
      }),
      //copied midi notes from keyboard
      seqNotes: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
      //48,    49,   50,   51,   52,   53,   54,   55,   56,   57,   58,   59
      //'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'
      octave: this.props.octave,
      //default envelope vals
      running: false,
      envelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5,
      },
      waveshape: {},
    };
    //because I didn't want to reverse it myself
    this.state.seqNotes.reverse();
    //for letting the synth know which frequencies to attack/release
    // this.seqNotesFreq = this.state.seqNotes.map((value) => {
    //   return this.convertToFreq(value);
    // });
  }

  numberToNote = (number: any) => {
    const scale = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    return scale[number % 12];
  };
  tableCallback = (colIdx: any, col: any) => {
    console.log("callback called back: " + col + " id " + colIdx);
    this.setState({
      actualTable: update(this.state.actualTable, {
        [colIdx]: { data: { $set: col } },
      }),
    });
    this.props.callback(colIdx, col);
  };

  componentDidUpdate(props: any) {
    //update when envelope sliders change
    if (this.props.envelope !== this.state.envelope) {
      this.setState({ envelope: this.props.envelope });
      this.synth.set({ envelope: this.state.envelope });
    }
    //update when waveshape changes
    if (this.props.waveshape !== this.state.waveshape) {
      this.setState({waveshape: this.props.waveshape});
      this.synth.set({oscillator: this.state.waveshape});
    }
    //update when octave slider changes
    if (this.props.octave !== this.state.octave) {
      this.setState({ octave: this.props.octave });
      this.seqNotesFreq = this.state.seqNotes.map((value) => {
        return this.convertToFreq(value);
      });
    }
  }

  //for factoring in octave in frequency conversion (so that we can play accidentals)
  convertToFreq = (midiNote: any) => {
    console.log(this.state.octave);
    midiNote = 0.0 + midiNote;
    //console.log('midiNote: ' + midiNote);
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
    return freq;
  };

  loadTable = async () => {
    const response = await fetch("/api/tbload", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        username: "janesmith",
        seq_name: "my_sequence",
      }),
    });
    const body = await response.json();
    console.log(body);
    //set all the sequencer cells
    for (let i = 0; i < 16; i++) {
      this.tableCallback(i, body[i]);
    }
    console.log("Sequence loaded!");
  };

  //extremely impromptu function for saving the contents of the table to the database
  saveTable = async () => {
    const response = await fetch("/api/tbsave", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        username: "janesmith",
        seq_name: "my_sequence",
        seq_table: this.getRawTable(),
      }),
    });
    const body = await response.text();
    console.log(body);
  };

  loadInstrument = async (inst_name: any) => {
    // const response = await fetch("/api/loadinst", {
    //   method: "POST",
    //   headers: {
    //     "Content-type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     username: "janesmith",
    //     preset_name: "my_instrument",
    //   }),
    // });
    // const body = JSON.parse(await response.text());
    // this.synth.set(body);
    // //this does not reflect in the sliders
    // console.log("Instrument loaded!");
    this.props.instload('my_instrument');
  };
  //saves instrument preset
  saveInstrument = async () => {
    const response = await fetch("/api/saveinst", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        username: "janesmith",
        name: "my_instrument",
        inst: JSON.stringify({
          oscillator: this.synth.get().oscillator,
          envelope: this.synth.get().envelope,
        }),
      }),
    });
    const body = await response.text();
    console.log(body);
  };

  updateColumnSelected(colId: number, value: boolean) {
    if (colId < 0) colId = this.state.actualTable.length - 1;
    this.setState({
      actualTable: update(this.state.actualTable, {
        [colId]: { selected: { $set: value } },
      }),
    });
  }

  stopSequence() {
    //just to make sure the frequencies that are being stopped are the ones that are being played
    this.seqNotesFreq = this.state.seqNotes.map((value) => {
      return this.convertToFreq(value);
    });
    Tone.Transport.stop();
  }

  playSequence() {
    const { running } = this.state;
    //stops transport from making multiple schedules
    if (running) return;
    //inner transport init stuff
    this.setState({ running: true });
    // running = true;
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
      if (step === 0) {
        document
          .getElementById("seq_table")
          ?.children.item(this.state.actualTable.length - 1)
          ?.classList.remove("column_filled");
      }
      //marks highlighted column and unmarks the previous one
      this.updateColumnSelected(step - 1, false);
      this.updateColumnSelected(step, true);
      //go through current column
      for (let i = 0; i < this.state.actualTable[step].data.length; i++) {
        if (!this.state.actualTable[step].data[i]) {
          //so that notes played at the end of the sequence don't carry over to the beginning
          if (step === 0 || this.state.actualTable[step - 1].data[i])
            notesPlayed.push(this.convertToFreq(this.state.seqNotes[i]));
        } else {
          //if the frequency isn't being played (the cell isn't toggled on), get ready to release it
          notesReleased.push(this.convertToFreq(this.state.seqNotes[i]));
        }
      }
      //console.log("notes played: " + notesPlayed)
      this.synth.triggerAttack(notesPlayed);
      this.synth.triggerRelease(notesReleased);
      if (step === this.state.actualTable.length - 1) {
        //release all frequencies when reaching the end of the sequence
        this.synth.triggerRelease(this.seqNotesFreq);
      }
      //reset the array of notes to be played
      notesPlayed = [];
      index++;
    }, "16n");
    //reset everything when the stop button is pressed
    Tone.Transport.on("stop", () => {
      this.updateColumnSelected(step, false);
      step = 0;
      index = 0;
      this.setState({ running: false });
      // this.running = false;
      Tone.Transport.cancel();
      this.synth.triggerRelease(this.seqNotesFreq);
    });
    Tone.Transport.start();
  }

  //     //turns the table into a 2d array of booleans so that I don't have to mess with typing issues in the server
  getRawTable() {
    let rawTable = Array<boolean[]>(this.state.actualTable.length);
    for (let i = 0; i < this.state.actualTable.length; i++) {
      rawTable[i] = this.state.actualTable[i].data;
    }
    return rawTable;
  }

  render() {
    const { running } = this.state;
    return (
      <>
        <Container>
          <Col>
            <Row>
              <Col>
                <Nav className="container-fluid">
                  {running ? (
                    <Button onClick={this.stopSequence.bind(this)}>stop</Button>
                  ) : (
                    <Button onClick={this.playSequence.bind(this)}>play</Button>
                  )}
                  <Dropdown className="ml-auto">
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                      Save / Load
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={this.saveInstrument.bind(this)}>
                        save instrument
                      </Dropdown.Item>
                      <Dropdown.Item onClick={this.loadInstrument.bind(this)}>
                        load instrument
                      </Dropdown.Item>
                      <Dropdown.Item onClick={this.saveTable.bind(this)}>
                        save table
                      </Dropdown.Item>
                      <Dropdown.Item onClick={this.loadTable.bind(this)}>
                        load table
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Nav>
              </Col>
            </Row>
            <Row>
              <Col style={{ marginRight: "10px", width: "10vw" }}>
                {this.state.seqNotes.map((value) => {
                  const note = this.numberToNote(value);
                  return (
                    <Row
                      className={"seq_cell"}
                      onMouseDown={() => {
                        this.synth.triggerAttack(value);
                      }}
                      onMouseUp={() => {
                        this.synth.triggerRelease(value);
                      }}
                      onMouseOut={() => {
                        this.synth.triggerRelease(value);
                      }}
                    >
                      <div className={"text-center"}>
                        <p>{note}</p>
                      </div>
                    </Row>
                  );
                })}
              </Col>
              {this.state.actualTable.map((value, index) => {
                return (
                  <SequencerColumn
                    idx={index}
                    size={12}
                    selected={value.selected}
                    callback={this.tableCallback}
                    actualColumn={this.state.actualTable[index].data}
                  />
                );
              })}
            </Row>
          </Col>
        </Container>
      </>
    );
  }
}

export default SequencerTable;
