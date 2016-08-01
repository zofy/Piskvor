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
        if ('color' in json) { game.changeOpponent(json['color']); console.log('efewf');}
        else if ('connection' in json) { if (json['connection'] === 1) {game.start(); if (json['begin'] === 1) { $(game.forToggling).removeClass('noEvent') } } else { console.log('Lost conn...'); window.location = '/'; } }
        else if('point' in json) { game.markOpponent(json['point']); }
        else if ('continue' in json) { game.continueSetup(json['me'], json['opponent']);  }
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

game.continueToggling = function(){
    var alreadyClicked = [];
    $.merge($.merge(alreadyClicked, game.mySquares), game.opponentSquares);
    for(var i = 0; i < alreadyClicked.length; i++){
        var square = $(game.board).get(alreadyClicked[i]);
        $(square).addClass('noEvent');
        $(game.forToggling).splice($(game.forToggling).index(square), 1);
    }
}

game.fillMyPoints = function(array){
    for(var i = 0; i < array.length; i++){
        game.mySquares.push(array[i]);
        game.addPoint(array[i], game.myPoints);
    }
}

game.continueSetup = function(myArray, opponentsArray){
    game.myColor = myArray[0];
    game.fillMyPoints(myArray[1]);
    $(game.me).css('background-color', myArray[0]);
    $(game.opponent).css('background-color', opponentsArray[0]);
    game.changeSquares(myArray[0], myArray[1]);
    game.opponentsColor = opponentsArray[0];
    game.opponentSquares = opponentsArray[1];
    game.changeSquares(opponentsArray[0], opponentsArray[1]);
    game.continueToggling();
    if (myArray[2] )
}

game.changeOpponent = function(color){
    $(game.opponent).css('background-color', color);
    game.opponentsColor = color;
    game.changeSquares(color, game.opponentSquares);
}

game.markOpponent = function(idx){
    $($(game.board).get(idx)).css('background-color', game.opponentsColor);
    var square = $(game.board).get(idx);
    game.opponentSquares.push(idx);
    game.forToggling.splice($(game.forToggling).index(square), 1);
    $(game.forToggling).removeClass('noEvent');
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
        game.addPoint(idx, game.myPoints);
        if (game.checkWin(game.myPoints) === true) { console.log('You won!'); }
        game.mySquares.push(idx);
        $(this).addClass('noEvent');
        game.forToggling.splice($(game.forToggling).index(this), 1);
        $(game.forToggling).addClass('noEvent');
        websockets.ws.send('{"point": "' + idx + '"}');
    });
    game.me.on('click', function(){
        var color = game.randomColor();
        game.myColor = color;
        $(this).css('background-color', color);
        game.changeSquares(color, game.mySquares);
        websockets.ws.send('{"color": "' + color + '"}');
    });
    $(game.forToggling).addClass('noEvent');
}

game.randomColor = function(){
    return 'rgb(' + Math.round(256*Math.random()) + ', ' + Math.round(256*Math.random()) + ', ' + Math.round(256*Math.random()) + ')';
}

game.start = function(){
    var color = game.randomColor();
    game.myColor = color;
    $(game.me).css('background-color', color);
    websockets.ws.send('{"color": "' + color + '"}');
}

game.addPoint = function(point, collection){
    if (Math.floor(point / 3) === 0)  { collection[0][0].push(point); }
    else if (Math.floor(point / 3) === 1)  { collection[0][1].push(point); }
    else if (Math.floor(point / 3) === 2)  { collection[0][2].push(point); }

    if (point % 3 === 0)  { collection[1][0].push(point); }
    else if (point % 3 === 1)  { collection[1][1].push(point); }
    else if (point % 3 === 2)  { collection[1][2].push(point); }

    if (point === 0 || point === 4 || point === 8) { collection[2].push(point); }
    if (point === 2 || point === 4 || point === 6) { collection[3].push(point); }
}

game.checkWin = function(collection){
    for(var i = 0; i < collection.length; i++){
        if (i < 2){
            for (var j = 0; j < 3; j++){
                if (collection[i][j].length === 3) return true;
            }
        }else if (collection[i].length === 3) return true;
    }
    return false;
}

game.init = function(){
    game.board = $('.square.middle');
    game.me = $('.square.side.me');
    game.opponent = $('.square.side.opponent');
    game.myColor = game.me.css('background-color');
    game.opponentsColor = game.opponent.css('background-color');
    game.mySquares = [];
    game.myPoints = [[[], [], []], [[], [], []], [], []];
    game.opponentSquares = [];
    game.forToggling = $('.square.middle');
    game.boardSetup();
}

game.init();