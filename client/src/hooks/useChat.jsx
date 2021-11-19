import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:5001";

const useChat = ({ name, room }) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = socketIOClient(ENDPOINT, {
      query: { name, room },
    });

    socketRef.current.emit("join", (error) => {
      if (error) alert(error.message);
    });
  }, [name, room]);

  useEffect(() => {
    socketRef.current.on("message", (message) => {
      // const incomingMessage = {
      //   ...message,
      //   ownedByCurrentUser: message.senderId === socketRef.current.id,
      // };
      setMessages((prevMessages) => {
        return [...prevMessages, message];
      });
    });
  }, [room]);

  const sendMessage = (messageBody) => {
    socketRef.current.emit("sendMessage", {
      body: messageBody,
      senderId: socketRef.current.id,
    });
  };

  return { messages, sendMessage };
};

export default useChat;
