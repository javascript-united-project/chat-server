const express = require('express');
const { createAdapter } = require('@socket.io/redis-adapter');

require('dotenv/config');
const { PORT } = process.env;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*"
  }
});

const userService = require('./service/user');
const SUBJECT_CODE_RECORDS = require('./utils/quiz');
const pubClient = require('./db/redis');
const subClinet = pubClient.duplicate();

// +++ Working...
// io.adapter(createAdapter(pubClient, subClinet));

io.use((socket, next) => {
  const { name, room } = socket.handshake.query
  if (!name || !room)
    return next(new Error("unauthorized event"));
  next();
});

io.on("connection", (socket) => {
  const { name, room } = socket.handshake.query

  const { error, user } = userService.addUser(
    { id: socket.id, name, room }
  );
  if (error) {
    console.log(`${socket.id}: ${error}`);
    io.to(socket.id).emit('error', {
      user: '관리자',
      text: error
    });
    return;
  }

  socket.join(room);

  socket.emit('message', {
    user: '관리자',
    text: `${user.name}님, 『${SUBJECT_CODE_RECORDS[user.room]}』방에 오신것을 환영합니다.`,
  })

  socket.broadcast.to(user.room).emit('message', {
    user: '관리자',
    text: `${user.name} 님이 가입하셨습니다.`,
  })

  socket.on('sendMessage', (message) => {
    const user = userService.getUser(socket.id)
    io.in(user.room).emit('message', { user: user.name, text: message.body })
  })

  // +++ 정의된 이벤트 미들웨어의 에러를 잡지 못한다
  socket.on("error", (err) => console.error(err));

  socket.on("disconnect", () => {
    const user = userService.removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', {
        user: '관리자',
        text: `${user.name} 님이 방을 나갔습니다.`,
      })
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: userService.getUsersInRoom(user.room),
      })

      console.log(`${user.id}(${user.name})가 떠났어요.`)
      socket.leave(user.room);
    }
  })
})

server.listen(PORT, _ => console.log(`${PORT} Port Server is open!!`))
