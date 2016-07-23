/**
 * Created by Patrik on 16. 7. 2016.
 */

var index = {};
var ajax = {};
var webSockets = {};

webSockets.ws = new WebSocket('ws://localhost:8000/ws_index');

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
        else if ('proposal' in json) {index.showOptions(json['proposal']);}
        else if ('answer' in json) { if (json['answer'] < 1){alert(json['opponent'] + ' does not want to play with you!')}else{ console.log('redirect takes plaec here'); } }
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

webSockets.ws.onerror = function(){
    console.log('An error occurred!');
}

webSockets.ws.onclose = function(){
    console.log('Connection closed!');
}


index.refreshUsers = function(json){
    var newHtml = '';
    console.log(json.users);
    json.users.forEach(function(user){
        newHtml += "<p>" + user + "</p>";
    });
    $('#users').html(newHtml);
}

index.showOptions = function(opponent){
    var option = '<p>' + opponent + ' wants to play with you!' + '</p>' +
        '<p>Yes</p> <p>No</p>';
    $('#options').html(option);
}

index.optionSetup = function(){
    $('#options').on('click', 'p', function(){
        var opponent = $($('#options p').get(0)).text().split(" ")[0];
        if ($(this).html() === 'Yes') {webSockets.ws.send('{"answer": 1, "opponent": "' + opponent + '"}'); }
        else if ($(this).html() === 'No') {webSockets.ws.send('{"answer": 0, "opponent": "' + opponent + '"}');}
    });
}

index.init = function(){
    index.optionSetup();
}

index.init();