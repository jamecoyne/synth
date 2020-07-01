import React, { Component } from 'react';

type colProps = {
    idx: number;
    rows: boolean[];
    callback: (colIdx, col) => void;
}

class SequencerColumn extends Component<colProps> {

    state = {
        filled: [false,false,false,false],
    }

    toggleClass(hek : HTMLElement) {
        if(hek.classList.contains("row"))
        {
          hek.classList.remove("row")
          hek.classList.add("row_filled")
          this.state.filled[parseInt(hek.innerHTML)] = true;
          //this.props.rows[parseInt(hek.innerHTML)] = true;
        } else {
          hek.classList.remove("row_filled")
          hek.classList.add("row")
          this.state.filled[parseInt(hek.innerHTML)] = false;
          //this.props.rows[parseInt(hek.innerHTML)] = false;
        }
        this.props.callback(this.props.idx, this.state.filled);
      }

    render(){
        //default values
        //this.setState({filled : [false,false,false,false]})
        return(
            <div className={"column"} key={this.props.idx}>
                <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}>0</div>
                <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}>1</div>
                <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}>2</div>
                <div className={"row"} onMouseDown={(e: React.FormEvent<HTMLElement>) => {this.toggleClass(e.currentTarget)}}>3</div>
            </div>
        )
    }
}

export default SequencerColumn;