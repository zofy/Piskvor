var game = {};
var comp = {};

// COMPUTER FUNCTIONS

comp.copyArray = function(collection){
    var output = [];
    for(var i = 0; i < collection.length; i++){
        output.push(collection[i]);
    }
    return output;
}

comp.init = function(){
    comp.result = null;
    comp.mySquares = comp.copyArray(game.mySquares);
    comp.opponentSquares = comp.copyArray(game.opponentSquares);
    comp.myPoints = comp.copyArray(game.myPoints);
    comp.opponentPoints = comp.copyArray(game.opponentPoints);
    comp.freeSquares = comp.copyArray(game.freeSquares);
}

comp.makeMove = function(player, depth){
    var player = typeof player !== 'undefined'? player: 1;
    var depth = typeof depth !== 'undefined'? depth: 0;
    if (game.checkWin(comp.opponentPoints) === true) {
        return 10 - depth;
    } else if (game.checkWin(comp.myPoints) === true) {
        return depth - 10;
    } else if (comp.freeSquares.length === 0) {
        return 0;
    }

    depth++;
    var scores = [], moves = [];
    for(var i = 0; i < comp.freeSquares.length; i++){
        var square = comp.freeSquares[i];

        if(player === 1){
            moves.push(square);
            comp.opponentSquares.push(square);
            game.addPoint(square, comp.opponentPoints);
            comp.freeSquares.splice(i, 1);
            scores.push(comp.makeMove(0, depth));
            comp.freeSquares.push(square);
            comp.opponentSquares.splice($(comp.opponentSquares).index(square), 1);
        }else if (player === 0){
            moves.push(square);
            comp.mySquares.push(square);
            game.addPoint(square, comp.myPoints);
            comp.freeSquares.splice(i, 1);
            scores.push(comp.makeMove(1, depth));
            comp.freeSquares.push(square);
            comp.mySquares.splice($(comp.mySquares).index(square), 1);
        }
    }
    if (player === 1){
        var maxScoreIdx = scores.indexOf(Math.max.apply(Math, scores));
        comp.result = moves[maxScoreIdx];
        return scores[maxScoreIdx];
    } else if (player === 0) {
        var minScoreIdx = scores.indexOf(Math.min.apply(Math, scores));
        comp.result = moves[minScoreIdx];
        return scores[minScoreIdx];
    }
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
        game.freeSquares.splice($(game.freeSquares).index(idx), 1);
        game.mySquares.push(idx);
        game.addPoint(idx, game.myPoints);
        $(this).addClass('noEvent');
        game.forToggling.splice($(game.forToggling).index(this), 1);
        $(game.forToggling).addClass('noEvent');
        if (game.checkWin(game.myPoints) === true) console.log('winner huhuhuuuu');
        comp.init();
        comp.makeMove();
        console.log(comp.result);
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
    game.freeSquares = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    game.boardSetup();
    game.start();
}

game.init();