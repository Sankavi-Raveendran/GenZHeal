// import React from 'react';

// import './Message.css';

// import ReactEmoji from 'react-emoji';

// const Message = ({ message: { text, user }, name }) => {
//   let isSentByCurrentUser = false;

//   const trimmedName = name.trim().toLowerCase();

//   // const messageClass = isSentByCurrentUser ? 'justifyEnd' : 'justifyStart';
//   // const boxClass = isSentByCurrentUser ? 'backgroundBlue colorWhite' : 'backgroundLight colorDark';
//   // const textClass = isSentByCurrentUser ? 'pl-10' : 'pr-10';

//   if(user === trimmedName) {
//     isSentByCurrentUser = true;
//   }

//   return (
//     isSentByCurrentUser
//       ? (
//         <div className="messageContainer justifyEnd">
//           <p className="sentText pr-10">{trimmedName}</p>
//           <div className="messageBox backgroundBlue">
//             <p className="messageText colorWhite">{ReactEmoji.emojify(text)}</p>
//           </div>
//         </div>
//         )
//         : (
//           <div className="messageContainer justifyStart">
//             <div className="messageBox backgroundLight">
//               <p className="messageText colorDark">{ReactEmoji.emojify(text)}</p>
//             </div>
//             <p className="sentText pl-10 ">{user}</p>
//           </div>
//         )
//   );
// }

// export default Message;

import React from 'react';
import './Message.css';
import ReactEmoji from 'react-emoji';

const Message = ({ message: { text, user }, name }) => {
  const trimmedName = name.trim().toLowerCase();
  const isSentByCurrentUser = user === trimmedName;

  const messageClass = isSentByCurrentUser ? 'justifyEnd' : 'justifyStart';
  const boxClass = isSentByCurrentUser ? 'backgroundBlue colorWhite' : 'backgroundLight colorDark';
  
  return (
    <div className={`messageContainer ${messageClass}`}>
      {isSentByCurrentUser ? (
        <>
          <p className="sentText pr-10">{trimmedName}</p>
          <div className={`messageBox ${boxClass}`}>
            <p className="messageText">{ReactEmoji.emojify(text)}</p>
          </div>
        </>
      ) : (
        <>
          <div className={`messageBox ${boxClass}`}>
            <p className="messageText">{ReactEmoji.emojify(text)}</p>
          </div>
          <p className="sentText pl-10">{user}</p>
        </>
      )}
    </div>
  );
}

export default Message;
