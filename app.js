
'use strict';

var md5 = require('md5');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

var users = {};
var messages = [];
var history = 2;

io.on('connection', function(socket) {

    var me = false;

    console.log('Nouveau user in the chat');

    for(var u in users){
        socket.emit('newuser', users[u]);
    }
    for(var m in messages){
        socket.emit('newmsg', messages[m]);
    }

    socket.on('login', function(user){
        me = user;
        me.id = user.mail.replace('@', '-').replace('.', '-');
        me.mail = user.mail;
        me.username = user.username;
        me.avatar = 'https://gravatar.com/avatar/'+md5(user.mail)+ '?s=100';
        socket.emit('logged');
        users[me.id] = me;
        io.sockets.emit('newuser', me)
    });

    /* On recoit un nouveau msg */
    socket.on('newmsg', function(message){
        message.me = me;
        var date = new Date();
        message.h = date.getHours();
        message.min = date.getMinutes();
        messages.push(message);
        if(messages.length > history){
            messages.shift();
        }
        io.sockets.emit('newmsg', message);
    });


    socket.on('disconnect', function(){
        if(!me){
            return false;
        }
        delete users[me.id];
        io.sockets.emit('disuser', me);
    });

});

server.listen(4200);
