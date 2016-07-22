var game = {};
var ajax = {};
var websockets = {};

websockets.ws = new WebSocket('ws://localhost:8000/ws_game');

websockets.ws.onopen = function(){
    console.log('Joining the game...');
    ajax.getNick();
}

websockets.ws.onmessage = function(msg){
    console.log("Message: " + msg.data);
}

websockets.ws.onerror = function(){
    console.log("An error occurred!");
}

websockets.ws.onclose = function(){
    console.log("Closing the connection...");
    window.location = '/logout';
}

ajax.getNick = function(){
    $.ajax({
        type: 'GET',
        url: '/getNick',
        success: function(json){
            webSockets.ws.send('{"nick": ' + '"' + json['nick'] + '", ' + '"' + "ts" + '":' + ' "' + json['ts'] + '"' + '}')
        },
        dataType: 'json'
    });
}