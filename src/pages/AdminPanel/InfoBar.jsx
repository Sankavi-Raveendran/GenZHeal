// import React from 'react';

// import onlineIcon from '../../images/onlineIcon.png';
// import closeIcon from '../../images/closeIcon.png';

// import './InfoBar.css';

// const InfoBar = ({ room }) => (
//   <div className="infoBar">
//     <div className="leftInnerContainer">
//       <img className="onlineIcon" src={onlineIcon} alt="online icon" />
//       <h3>Jane</h3>
//       <h3>{room}</h3>
//     </div>
//     <div className="rightInnerContainer">
//       <a href="/"><img src={closeIcon} alt="close icon" /></a>
//     </div>
//   </div>
// );

// export default InfoBar;
import React from "react";

import onlineIcon from "../../images/onlineIcon.png";
import closeIcon from "../../images/closeIcon.png";

import "./InfoBar.css";

const InfoBar = ({ room, name, setSelectedChat }) => (
  <div className="infoBar">
    <div className="leftInnerContainer">
      <img className="onlineIcon" src={onlineIcon} alt="online icon" />
      <h3>
        {name} {room}
      </h3>
    </div>
    <div className="rightInnerContainer">
      <div onClick={() => setSelectedChat("")}>
        <img src={closeIcon} alt="close icon" />
      </div>
    </div>
  </div>
);

export default InfoBar;
