const express = require('express');
const app = express();
const PORT= 8000;
// const path = require('path');


// app.use(path)
// app.use(express.json());



    const server = app.listen(PORT,(err)=>{
        console.log('running on port '+PORT);
    })

    const io = require('socket.io')(server);

    io.on('connection',(socket)=>{

        socket.on('messageToServer',(data)=>{
            socket.emit('messageToClient',data)
        });


        // socket.on('joinRoom',(data)=>{
        //     socket.join(data.signal_room);
        // })

        socket.on('signal',(data)=>{
            socket.to(data.signal_room).broadcast.emit('signaling_message',data);
        })

        socket.on('ready',(data)=>{
            console.log(data)
            console.log(data.signal_room)
           socket.join(data.signal_room);
           socket.to(data.signal_room).broadcast.emit('signaling_message',{type:'user_here'});
        
        })

    });


 