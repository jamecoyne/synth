import React, { Component, useState } from "react";
import Draggable from "react-draggable";

const Filter = (props) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleDrag = (e, ui) => {
    setPos({ x: ui.deltaX + pos.x, y: ui.deltaY + pos.y });
    console.log(pos);
  };

  return (
    <div className="filterBody">
      <Draggable bounds="parent" onDrag={handleDrag}>
        <div className="filterKnob"></div>
      </Draggable>
    </div>
  );
};
export default Filter;
