/**
 * Created by Patrik on 16. 7. 2016.
 */

var index = {};
var ajax = {};
var websockets = {};

websockets.ws = new WebSocket('ws://localhost:8000/ws_index');

ajax.getNick = function(){
    $.ajax({
        type: 'GET',
        url: '/getNick',
        success: function(json){
            websockets.ws.send('{"nick": ' + '"' + json['nick'] + '", ' + '"' + "ts" + '":' + ' "' + json['ts'] + '"' + '}')
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

websockets.handleMessage = function(msg){
    try{
        var json = JSON.parse(msg);
    }catch(e){
        console.log(msg);
    }finally{
        if('refresh' in json) {ajax.refreshUsers();}
        else if ('proposal' in json) {index.showOptions(json['proposal']);}
        else if ('answer' in json) { if (json['answer'] < 1){alert(json['opponent'] + ' does not want to play with you!')}else{ window.location = '/game'; } }
        else if ('available' in json) { console.log(json['available'] + ' is currently unavailable.'); }
    }
}

websockets.ws.onopen = function(){
    console.log('Getting the name...');
    ajax.getNick();
}

websockets.ws.onmessage = function(msg){
    console.log("Message: " + msg.data);
    websockets.handleMessage(msg.data);
}

websockets.ws.onerror = function(){
    console.log('An error occurred!');
    $()
}

websockets.ws.onclose = function(){
    console.log('Connection closed!');
}


index.refreshUsers = function(json){
    var newHtml = '';
    console.log(json.users);
    json.users.forEach(function(user){
        newHtml += '<li><span style="cursor: pointer"><i class="fa fa-user-plus"></i></span>' + user + '</li>';
    });
    $('#search_results').html(newHtml);
}

index.showOptions = function(opponent){
    var option = '<p>' + opponent + ' wants to play with you!' + '</p>' +
        '<button>Accept</button> <button>Decline</button>';
    $('#notifications').html(option);
}

index.optionSetup = function(){
    $('#notifications').on('click', 'button', function(){
        var opponent = $($('#notifications p').get(0)).text().split(" ")[0];
        console.log(opponent);
        if ($(this).html() === 'Accept') {websockets.ws.send('{"answer": 1, "opponent": "' + opponent + '"}'); window.location = '/game';}
        else if ($(this).html() === 'Decline') {websockets.ws.send('{"answer": 0, "opponent": "' + opponent + '"}');}
    });
}

index.proposalSetup = function(){
    $('ul').on('click', 'span', function(){
        console.log('Proposal on the way!');
        websockets.ws.send('{"proposal": "' + $($(this).parent()).text() + '"}');
    });
}

index.init = function(){
    index.optionSetup();
    index.proposalSetup();
}

index.init();