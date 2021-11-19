import React, { useState, useEffect } from "react";
import queryString from "query-string";

import useChat from "../../hooks/useChat";
import InfoBar from "../InfoBar/InfoBar";
import Messages from "../Messages/Messages";
import Input from "../Input/Input";
// import TextContainer from "../TextContainer/TextContainer";
import "./Chat.css";

const Chat = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [err, setErr] = useState(false);
  const { messages, sendMessage } = useChat({ name, room });

  useEffect(() => {
    const { name, room } = queryString.parse(window.location.search);
    if (!name || !room) return setErr(true);
    setRoom(room);
    setName(name);
  }, []);

  // useEffect(() => {
  //   if (!socketRef.current) return;

  //   socketRef.current.on("roomData", ({ users }) => {
  //     setUsers(users);
  //   });
  // }, [messages]);

  if (err) return <h3>권한이 없습니다.</h3>;
  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input sendMessage={sendMessage} />
      </div>
      {/* <TextContainer users={users} /> */}
    </div>
  );
};

export default Chat;
