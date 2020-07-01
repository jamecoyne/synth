import React, {Component} from 'react';
import SequencerColumn from './seq_col'

type tableProps = {
    len : number;
    //possibly add 2d boolean array here?
    actualTable : boolean[][];
    callback : (colIdx, col) => void;
}

class SequencerTable extends Component<tableProps> {

    state = {
        //???
        columns : this.props.len,
        //maybe hold the actual boolean table here?
        colObjs : SequencerColumn[this.props.len],
        accTable : this.props.actualTable
    }
    

    makeColumns(){
        let range = Array.from(Array(this.state.columns), (_, i) => i);
        this.state.colObjs = range.map((item) => <SequencerColumn idx={item} rows={this.state.accTable[item]} callback={this.props.callback}/>);

        return(this.state.colObjs)
    }

    /**
     * how do I update the simple bool table from here?
     * 
     * callback fn passed to seq_col called here that calls callback fn passed here from App
     * a simple calculus
     */

    tableCallback(colIdx, col)
    {
        this.props.callback(colIdx, col);
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