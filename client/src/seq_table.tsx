import React, {Component} from 'react';
import SequencerColumn from './seq_col'

type tableProps = {
    len : number;
    actualTable : boolean[][];
    callback : (colIdx, col) => void;
}

type tableState = {
    actualTable : boolean[][]
}

class SequencerTable extends Component<tableProps, tableState> {

    // initalize array to hold each cell with each cell as true
    constructor(props) {
        super(props);
        this.state = {
            actualTable : new Array(16).fill(new Array(12).fill(true))
        };
    }

    makeColumns(){
        return(
            this.state.actualTable.map(
                (value, index)=> 
             <SequencerColumn
                idx={index}
                size={12} 
                callback={this.tableCallback}
             />)
        );
    }

    tableCallback = (colIdx, col) =>
    {
        console.log('callback called back: ' + col + ' id ' + colIdx);
        var tempTable = this.state.actualTable;
        tempTable[colIdx] = col;
        this.setState({actualTable: tempTable})
        console.log(this.state);
    }

    render() {
        return(
            <div id="seq_table" className = "container">
                {
                    this.makeColumns()
                }
            </div>
        )
    }
}

export default SequencerTable