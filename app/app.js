const express = require('express');
const moment = require('moment');

const userService = require('./service/user');

const port = 5001;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});

const nameList_sd = [] // 소프트웨어 설계 채팅방 
const nameList_sw = [] // 소프트웨어 개발 채팅방 
const nameList_db = [] // 데이터베이스 활용 채팅방
const nameList_im = [] // 정보시스템 구축 관리 채팅방

// const pattern = /\([^.(?!\n)]+\)/

io.on("connection", (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        if (!name || !room)
            callback({ message: "쿼리가 들어오지 않았습니다" });
        const { error, user } = userService.addUser(
            { id: socket.id, name, room }
        );
        if (error)
            callback({ message: error });

        socket.emit('message', {
            user: 'admin',
            text: `${user.name}, ${user.room}에 오신것을 환영합니다.`,
        })
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: userService.getUsersInRoom(user.room)
        })
        callback();
    });

    socket.on("room", (room, name) => {
        socket.join(room)
        if (room == "sd") { // 소프트웨어 설계 채팅방
            socket.id = "(sd)" + name
            nameList_sd.push(name)
            io.to(room).emit("naming", nameList_sd, name)
            io.to(room).emit("members", nameList_sd) // developing
        }
        else if (room == "sw") { // 소프트웨어 개발 채팅방
            socket.id = "(sw)" + name
            nameList_sw.push(name)
            io.to(room).emit("naming", nameList_sw, name)
            io.to(room).emit("members", nameList_sw) // developing
        }
        else if (room == "db") { // 데이터베이스 활용 채팅방
            socket.id = "(db)" + name
            nameList_db.push(name)
            io.to(room).emit("naming", nameList_db, name)
            io.to(room).emit("members", nameList_db) // developing
        }
        else if (room == "im") { // 정보 시스템 구축 관리 채팅방
            socket.id = "(im)" + name
            nameList_im.push(name)
            io.to(room).emit("naming", nameList_im, name)
            io.to(room).emit("members", nameList_im) // developing
        } else {
            console.error("잘못된 채팅방 코드");
        }
    })
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
        }
    })

})

server.listen(port, () => console.log(`${port} Port Server is open!!`))
