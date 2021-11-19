import React, { useState } from "react";

import "./Input.css";

const Input = ({ sendMessage }) => {
  const [message, setMessage] = useState("");
  
  return (
    <form className="form">
      <input
        className="input"
        type="text"
        placeholder="전송하려는 메세지를 입력하세요."
        value={message}
        onChange={({ target: { value } }) => setMessage(value)}
      />
      <button
        className="sendButton"
        onClick={(e) => {
          e.preventDefault();
          return sendMessage(message);
        }}
      >
        전송
      </button>
    </form>
  );
};

export default Input;
