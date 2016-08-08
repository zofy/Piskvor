var game = {};
var comp = {};

// COMPUTER FUNCTIONS

comp.swap = function(array, pos1, pos2){
    var temp = array[pos1];
    array[pos1] = array[pos2];
    array[pos2] = temp;
}

comp.makeMove = function(player, depth, k){
    var player = typeof player !== 'undefined'? player: 1;
    var depth = typeof depth !== 'undefined'? depth: 0;
    var k = typeof k !== 'undefined'? k: 0;
    if (game.checkWin(game.opponentPoints) === true) {
        return 10 - depth;
    } else if (game.checkWin(game.myPoints) === true) {
        return depth - 10;
    } else if (k === game.freeSquares.length) {
        return 0;
    }

    depth++;
    var scores = [], moves = [];
    for(var i = k; i < game.freeSquares.length; i++){
        var square = game.freeSquares[i];
        moves.push(square);

        if(player === 1){
            game.addPoint(square, game.opponentPoints);
            comp.swap(game.freeSquares, k, i);
            scores.push(comp.makeMove(0, depth, k + 1));
            comp.swap(game.freeSquares, k, i);
            game.removePoint(square, game.opponentPoints);
        }else if (player === 0){
            game.addPoint(square, game.myPoints);
            comp.swap(game.freeSquares, k, i);
            scores.push(comp.makeMove(1, depth, k + 1));
            comp.swap(game.freeSquares, k, i);
            game.removePoint(square, game.myPoints);
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
    if (game.turn === 'comp') { game.play(); }
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

game.play = function(){
    comp.makeMove();
    var square = comp.result;
    console.log(square);
    game.opponentSquares.push(square);
    game.addPoint(square, game.opponentPoints);
    game.freeSquares.splice(game.freeSquares.indexOf(square), 1);
    game.markOpponent(square);
    if(game.checkWin(game.opponentPoints) === true) {console.log('Comp won!!!!!');}
    var realSquare = $(game.board).get(square);
    game.forToggling.splice($(game.forToggling).index(realSquare), 1);
    $(game.forToggling).removeClass('noEvent');
    $('#turn h1').text("It`s your turn!");
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
        game.freeSquares.splice(game.freeSquares.indexOf(idx), 1);
        $('#turn h1').text('Computer is on the move!');
        if(game.freeSquares.length > 0) game.play();
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

game.removePoint = function(point, collection){
    for (var i = 0; i < collection.length; i++){
        if (i < 2){
            for (var j = 0; j < collection[i].length; j++){
                var idx = collection[i][j].indexOf(point);
                if (idx > -1) collection[i][j].splice(idx, 1);
            }
        } else {
            var idx = collection[i].indexOf(point);
            if (idx > -1) collection[i].splice(idx, 1);
        }
    }
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

game.setUpTurn = function(){
    $('#turn span').on('click', function(){
        if ($(this).text() === 'Me') { game.turn = 'me'; $('#turn').html("<h1>It`s your turn</h1>"); }
        else if ($(this).text() === 'Computer') { game.turn = 'comp'; $('#turn').html("<h1>Comp is on the move!</h1>"); }
        $('.column').removeClass('invisible');
        game.init();
        game.start();
    });
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
}

game.turn = null;

game.setUpTurn();