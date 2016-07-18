/**
 * Created by Patrik on 16. 7. 2016.
 */
var webSockets = {};

webSockets.ws = new WebSocket('ws://localhost:8000/ws');

webSockets.getNick = function(){
    $.ajax({
        type: 'GET',
        url: '/getNick',
        success: function(json){
//            alert("Your name is: " + json['nick']);
            webSockets.ws.send('{"nick": ' + '"' + json['nick'] + '"' + '}')
        },
        dataType: 'json'
    });
}

webSockets.ws.onopen = function(){
    webSockets.getNick();
}

webSockets.ws.onmessage = function(msg){
    console.log("Message: " + msg.data);
}

webSockets.ws.onclose = function(){
    console.log('Connection closed!');
    window.location = '/logout';
}