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
    if (game.checkWin(game.opponentPoints) === true) {
        return 10;
    } else if (game.checkWin(game.myPoints) === true) {
        return -10;
    } else if (game.freeSquares.length === 0) {
        return 0;
    }

    depth++;
    var scores = [], moves = [];
    for(var i = 0; i < game.freeSquares.length; i++){
        var square = game.freeSquares[i];
        moves.push(square);

        if(player === 1){
            game.opponentSquares.push(square);
            game.addPoint(square, game.opponentPoints);
            game.freeSquares.splice(i, 1);
            scores.push(comp.makeMove(0, depth));
            game.freeSquares.push(square);
            game.removePoint(square, game.opponentPoints);
            game.opponentSquares.splice(game.opponentSquares.indexOf(square), 1);
        }else if (player === 0){
            game.mySquares.push(square);
            game.addPoint(square, game.myPoints);
            game.freeSquares.splice(i, 1);
            scores.push(comp.makeMove(1, depth));
            game.freeSquares.push(square);
            game.removePoint(square, game.myPoints);
            game.mySquares.splice(game.mySquares.indexOf(square), 1);
        }
    }
    if (player === 1){
        var maxScoreIdx = scores.indexOf(Math.max.apply(Math, scores));
        comp.result = moves[maxScoreIdx];
        console.log(moves);
        return scores[maxScoreIdx];
    } else if (player === 0) {
        var minScoreIdx = scores.indexOf(Math.min.apply(Math, scores));
        //console.log(scores);
        //console.log(minScoreIdx);
        //console.log(moves);
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

game.play = function(){
    //comp.init();
    //console.log(game.freeSquares);
    //console.log('Mypoints ' + game.mySquares);
    //console.log('Comps points ' + game.opponentSquares);
    comp.makeMove(1, 0);
    var square = comp.result;
    console.log(square);
    game.freeSquares.splice(game.freeSquares.indexOf(square), 1);
    game.opponentSquares.push(square);
    game.addPoint(square, game.opponentPoints);
    var realSquare = $(game.board).get(square);
    game.forToggling.splice($(game.forToggling).index(realSquare), 1);
    $(game.forToggling).removeClass('noEvent');
}

game.boardSetup = function(){
    $('.square.middle').on('click', function(){
        $(this).css('background-color', game.myColor);
        var idx = game.board.index(this);
        game.freeSquares.splice(game.freeSquares.indexOf(idx), 1);
        game.mySquares.push(idx);
        game.addPoint(idx, game.myPoints);
        $(this).addClass('noEvent');
        game.forToggling.splice($(game.forToggling).index(this), 1);
        $(game.forToggling).addClass('noEvent');
        if (game.checkWin(game.myPoints) === true) console.log('winner huhuhuuuu');
        //comp.init();
        //comp.makeMove();
        //console.log(comp.result);
        game.play();
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