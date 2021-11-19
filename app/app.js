const express = require('express');
const moment = require('moment');

const userService = require('./service/user');
const SUBJECT_CODE_RECORDS = require('./utils/quiz');

const port = 5001;
const server = require('http').createServer(express());
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});

io.use((socket, next) => {
    const { name, room } = socket.handshake.query
    if (!name || !room)
        next(new Error("unauthorized event"));
    next();
});

io.on("connection", (socket) => {
    const { name, room } = socket.handshake.query

    socket.join(room); ``

    const { error, user } = userService.addUser(
        { id: socket.id, name, room }
    );
    /** TODO: 에러 핸들링 필요 */

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
        // console.log(user);
        io.in(user.room).emit('message', { user: user.name, text: message.body })
    })

    //     io.to(user.room).emit('roomData', {
    //         room: user.room,
    //         users: userService.getUsersInRoom(user.room)
    //     })
    //     callback();
    // });


    socket.on("chatSocket", (socketData, room) => {// 전체채팅시 사용하는 소켓
        io.to(room).emit("chatSocket", { //받은 소켓의 데이터를  객체형식으로 모아서 client.js로 보내줌
            name: socketData.name,
            message: socketData.message,
            time: moment(new Date()).format("h:mm A")
        })
    })

    socket.on("partChatSocket", (data, room) => { // 귓속말에 사용하는 소켓
        io.to(room).emit("partChatSocket", { // 귓속말 소켓을 받았을때 전체채팅과 같은방식으로 데이터를 client.js 로 보내준다.
            name: data.name,
            message: data.message,
            time: moment(new Date()).format("h:mm A"),
            // 여기서의 type은 귓속말을 보냈을때 모든 사용자가 이 소켓을 받고 그중에 data.type이 자신의 이름과 동일할때 html 리스트
            //에 추가 시키게 하여 귓속말을 구현함
            type: data.type
        })
    })

    socket.on("error", (err) => {
        if (err && err.message === "unauthorized event")
            socket.disconnect();
    });

    socket.on("disconnect", () => {
        const user = userService.removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', {
                user: 'Admin',
                text: `${user.name} 님이 방을 나갔습니다.`,
            })
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: userService.getUsersInRoom(user.room),
            })
            console.log(`${user.name}가 떠났어요.`)
            socket.leave(user.room);
        }
    })
})

server.listen(port, () => console.log(`${port} Port Server is open!!`))
