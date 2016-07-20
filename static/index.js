/**
 * Created by Patrik on 16. 7. 2016.
 */

var index = {};
var ajax = {};
var webSockets = {};

webSockets.ws = new WebSocket('ws://localhost:8000/ws');

ajax.getNick = function(){
    $.ajax({
        type: 'GET',
        url: '/getNick',
        success: function(json){
            alert("Your name is: " + json['nick']);
//            alert("Your ts is: " + json['ts']);
            webSockets.ws.send('{"nick": ' + '"' + json['nick'] + '", ' + '"' + "ts" + '":' + ' "' + json['ts'] + '"' + '}')
        },
        dataType: 'json'
    });
}

ajax.refreshUsers = function(){
    $.ajax({
        type: 'GET',
        url: '/liveUsers',
        success: function(json){index.refreshUsers(json)},
        dataType: 'json'
    });
}

webSockets.handleMessage = function(msg){
    try{
        var json = JSON.parse(msg);
    }catch(e){
        console.log(msg);
    }finally{
        if('refresh' in json) {ajax.refreshUsers();}
        else if ('proposal' in json) {alert(json['proposal'] + ' wants to play!');}
        else if ('answer' in json) {alert(json['answer'] + ' does not want to play with you!')}
    }
}

webSockets.ws.onopen = function(){
    console.log('Getting the name...');
    ajax.getNick();
}

webSockets.ws.onmessage = function(msg){
    console.log("Message: " + msg.data);
    webSockets.handleMessage(msg.data);
}

webSockets.ws.onclose = function(){
    console.log('Connection closed!');
    window.location = '/logout';
}


index.refreshUsers = function(json){
    var newHtml = '';
    console.log(json.users);
    json.users.forEach(function(user){
        newHtml += "<p>" + user + "</p>";
    });
    $('#users').html(newHtml);
}