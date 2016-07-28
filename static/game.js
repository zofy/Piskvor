var game = {};
var ajax = {};
var websockets = {};

websockets.ws = new WebSocket('ws://localhost:8000/ws_game');

// WEBSOCKETS FUNCTIONS

websockets.handleMessage = function(msg){
    try {
        var json = JSON.parse(msg);
    } catch (e){
        console.log(msg);
    } finally {
        if ('color' in json) { game.changeOpponent(json['color']); }
        else if ('connection' in json) { if (json['connection'] === 1) {game.start()} else { console.log('Lost conn...') } }
        else if('point' in json) { game.markOpponent(json['point']); }
    }
}

websockets.ws.onopen = function(){
    console.log('Joining the game...');
    ajax.getNick();
}

websockets.ws.onmessage = function(msg){
    console.log("Message: " + msg.data);
    websockets.handleMessage(msg.data);
}

websockets.ws.onerror = function(){
    console.log("An error occurred!");
    $('h1').html("An error with connection occurred");
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

game.changeOpponent = function(color){
    $(game.opponent).css('background-color', color);
    game.changeSquares(color, game.opponentSquares);
}

game.markOpponent = function(idx){
    $($(game.board).get(idx)).css('background-color', game.opponentsColor);
}

game.changeSquares = function(color, squares){
    $(squares).each(function(){
        $(game.board.get(this)).css('background-color', color);
    });
}

game.boardSetup = function(){
    $('.square.middle').on('click', function(){
        $(this).css('background-color', game.myColor);
        var idx = game.board.index(this);
        game.mySquares.push(idx);
        websockets.ws.send('{"point": "' + idx + '"}');
    });
    game.me.on('click', function(){
        var color = game.randomColor();
        game.myColor = color;
        $(this).css('background-color', color);
        game.changeSquares(color, game.mySquares);
    });
}

game.randomColor = function(){
    return 'rgb(' + Math.round(256*Math.random()) + ', ' + Math.round(256*Math.random()) + ', ' + Math.round(256*Math.random()) + ')';
}

game.start = function(){
    var color = game.randomColor();
    game.myColor = color;
    $(game.me).css('background-color', color);
    console.log('starting......');
    websockets.ws.send('{"color": "' + color + '"}');
}

game.init = function(){
    game.board = $('.square.middle');
    game.me = $('.square.side.me');
    game.opponent = $('.square.side.opponent');
    game.myColor = game.me.css('background-color');
    game.opponentsColor = game.opponent.css('background-color');
    game.mySquares = [];
    game.opponentSquares = [];
    game.boardSetup();
}

game.init();