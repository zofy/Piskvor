var game = {};
var ajax = {};
var websockets = {};

websockets.ws = new WebSocket('ws://localhost:8000/ws_game');

// WEBSOCKETS FUNCTIONS

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
    //window.location = '/logout';
}

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

// GAME FUNCTIONS

game.boardSetup = function(){
    $('.square.middle').on('click', function(){
        console.log('You clicked ' + game.board.index($(this)));

    });
}

game.changeColor = function(){

}

game.init = function(){
    game.board = $('.square.middle');
    game.boardSetup();
}

game.init();