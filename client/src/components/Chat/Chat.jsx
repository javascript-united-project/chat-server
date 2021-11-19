import React, { useState, useEffect, useRef } from "react";
import queryString from "query-string";
import socketIOClient from "socket.io-client";

import InfoBar from "../InfoBar/InfoBar";
import Messages from "../Messages/Messages";
import Input from "../Input/Input";
import TextContainer from "../TextContainer/TextContainer";
import "./Chat.css";

const ENDPOINT = "http://localhost:5001";

const Chat = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [users, setUsers] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    const { name, room } = queryString.parse(window.location.search);
    socketRef.current = socketIOClient(ENDPOINT);

    setRoom(room);
    setName(name);

    socketRef.current.emit("join", { name, room }, (error) => {
      if (error) alert(error.message);
    });
  }, []);

  useEffect(() => {
    socketRef.current.on("message", (message) => {
      setMessages((_) => [...messages, message]);
    });
    socketRef.current.on("roomData", ({ users }) => {
      setUsers(users);
    });
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      socketRef.current.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
      <TextContainer users={users} />
    </div>
  );
};

export default Chat;
