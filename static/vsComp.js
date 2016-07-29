var game = {};
var comp = {};

// COMPUTER FUNCTIONS

comp.makeMove = function(){

}

// GAME FUNCTIONS

game.start = function(){
    var color = game.randomColor();
    var compColor = game.randomColor();
    game.myColor = color;
    game.opponentsColor = compColor;
    $(game.me).css('background-color', color);
    $(game.opponent).css('background-color', compColor);
    game.forToggling = $('.square.middle');
}

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
        game.addPoint(idx, game.myPoints);
        $(this).addClass('noEvent');
        game.forToggling.splice($(game.forToggling).index(this), 1);
        $(game.forToggling).addClass('noEvent');
        if (game.checkWin(game.myPoints) === true) console.log('winner huhuhuuuu');
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
    game.opponentSquares = [];
    game.myPoints = [[[], [], []], [[], [], []], [], []];
    game.opponentPoints = [[[], [], []], [[], [], []], [], []];
    game.forToggling = [];
    game.boardSetup();
    game.start();
}

game.init();