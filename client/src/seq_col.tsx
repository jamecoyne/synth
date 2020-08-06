import React, { Component } from "react";
import { Button, Container, Row, Col, Form } from "react-bootstrap";

type colProps = {
  idx: number;
  size: number;
  callback: (colIdx: any, col: any) => void;
  actualColumn: boolean[];
  selected: boolean;
};

type colState = {
  filled: boolean[];
};

class SequencerColumn extends Component<colProps, colState> {

    // state needs to live in the constructor otherwise it won't work
    constructor(props) {
        super(props);
        this.state = {
            filled: (new Array(props.size)).fill(true),
        }
    }

    toggleClass(hek : number) {
        // create temp var to hold state in & update new change
        var tempState = this.state.filled;
        tempState[hek] = !tempState[hek];
        // update state
        this.setState({filled: tempState})
        // call callback
        this.props.callback(this.props.idx, this.state.filled);
        //console.log('Cell updated at ' + this.props.idx + ', ' + hek);
      }

    render(){
        return(
            <div className={`column ${this.props.selected ? 'column_filled' : ''}`}>
                {/* render each cell using map function */}
                {this.props.actualColumn.map((value, index) => 
                
                    <div 
                        //conditionally render filled or not 
                        className={value ? "seq_cell" : "row_filled"}
                        // when clicked update column state, which forces the component to rerender, then call the callback 
                        onClick={() => this.toggleClass(index)}
                    />
                )}
            </div>
        )
    }
}

export default SequencerColumn;
