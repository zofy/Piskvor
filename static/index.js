/**
 * Created by Patrik on 16. 7. 2016.
 */

var index = {};
var ajax = {};
var websockets = {};

websockets.ws = new WebSocket('ws://localhost:8000/ws_index');

// AJAX FUNCTIONS

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

ajax.searchPlayer = function(){
//    name._xsrf = index.getCookie("_xsrf");
    $.ajax({
        type: 'POST',
        url: '/getPlayers',
        data: {'name': $.param($('#search').val())},
        success: function(json){index.refreshUsers(json)},
        dataType: 'json'
    });
}

// WEBSOCKETS FUNCTIONS

websockets.handleMessage = function(msg){
    try{
        var json = JSON.parse(msg);
    }catch(e){
        console.log(msg);
    }finally{
        if('refresh' in json) {ajax.refreshUsers();}
        else if ('proposal' in json) { index.showNotification('proposal', json['proposal']); }
        else if ('answer' in json) { if (json['answer'] < 1){ index.showNotification('answer', json['opponent']); } else { window.location = '/game'; } }
        else if ('available' in json) { index.showNotification('available', json['available']); }
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
    $('#notifications').html('<h1>An error with connection occurred</h1>');
}

websockets.ws.onclose = function(){
    console.log('Connection closed!');
}

// INDEX FUNCTIONS

index.getCookie = function(name){
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

index.refreshUsers = function(json){
    var newHtml = '';
    console.log(json.users);
    json.users.forEach(function(user){
        newHtml += '<li><span style="cursor: pointer"><i class="fa fa-user-plus"></i></span>' + user + '</li>';
    });
    $('#search_results').html(newHtml);
}

index.showNotification = function(action, opponent=""){
    if (action === "proposal") {
        var option = '<h2>' + opponent + ' wants to play with you!' + '</h2>' +
        '<button>Accept</button> <button>Decline</button>';
        $('#notifications').html(option);
    } else if (action === "answer") {
        $('#notifications').html(opponent + ' does not want to play with you!');
    } else if (action === "available") {
        $('#notifications').html(opponent + ' is currently unavailable.');
    }
}

index.optionSetup = function(){
    $('#notifications').on('click', 'button', function(){
        var opponent = $($('#notifications h2').get(0)).text().split(" ")[0];
        if ($(this).html() === 'Accept') {websockets.ws.send('{"answer": 1, "opponent": "' + opponent + '"}'); window.location = '/game';}
        else if ($(this).html() === 'Decline') { websockets.ws.send('{"answer": 0, "opponent": "' + opponent + '"}'); }
        $('#notifications').html('');
    });
}

index.proposalSetup = function(){
    $('ul').on('click', 'span', function(){
        console.log('Proposal on the way!');
        websockets.ws.send('{"proposal": "' + $($(this).parent()).text() + '"}');
    });
}

index.searchSetup = function(){
    $('#search').keyup(function(){
        ajax.searchPlayer();
    });
}

index.init = function(){
    index.optionSetup();
    index.proposalSetup();
    index.searchSetup();
}

index.init();