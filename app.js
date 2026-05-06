var board = null;
var game = new Chess();
var $status = $('#status');
var squareSelected = null;

// Colors/Selectors
var whiteSquareGrey = '#a9a9a9';
var blackSquareGrey = '#696969';

function removeHighlights() {
    $('#myBoard .square-55d63').removeClass('highlight-move hint-dot highlight-check');
}

function highlightSquare(square, type) {
    var $el = $('#myBoard .square-' + square);
    $el.addClass(type);
}

function onSquareClick(square) {
    // Get list of legal moves for this square
    var moves = game.moves({
        square: square,
        verbose: true
    });

    // If a square is already selected, try to move there
    if (squareSelected) {
        var move = game.move({
            from: squareSelected,
            to: square,
            promotion: 'q'
        });

        // Illegal move
        if (move === null) {
            squareSelected = null;
            removeHighlights();
            // If they clicked another of their own pieces, select that instead
            if (game.get(square) && game.get(square).color === game.turn()) {
                onSquareClick(square);
            }
            return;
        }

        // Legal move made
        board.position(game.fen());
        squareSelected = null;
        removeHighlights();
        
        // Highlight last move
        highlightSquare(move.from, 'highlight-move');
        highlightSquare(move.to, 'highlight-move');
        
        updateStatus();
        return;
    }

    // If no square selected, check if we can select this one
    if (game.get(square) && game.get(square).color === game.turn()) {
        squareSelected = square;
        removeHighlights();
        highlightSquare(square, 'highlight-move');
        
        // Show dots for legal moves
        moves.forEach(function(m) {
            highlightSquare(m.to, 'hint-dot');
        });
    }
}

function updateStatus() {
    var status = '';
    var moveColor = (game.turn() === 'b') ? 'Black' : 'White';

    // Highlight King if in check
    if (game.in_check()) {
        // Find the king's square
        var boardState = game.board();
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                var piece = boardState[i][j];
                if (piece && piece.type === 'k' && piece.color === game.turn()) {
                    var sq = String.fromCharCode(97 + j) + (8 - i);
                    highlightSquare(sq, 'highlight-check');
                }
            }
        }
    }

    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
    } else if (game.in_draw()) {
        status = 'Game over, drawn position';
    } else {
        status = moveColor + ' to move';
        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check!';
        }
    }

    $status.html(status);
}

var config = {
    draggable: true,
    position: 'start',
    onDrop: function(source, target) {
        var move = game.move({ from: source, to: target, promotion: 'q' });
        if (move === null) return 'snapback';
        removeHighlights();
        highlightSquare(move.from, 'highlight-move');
        highlightSquare(move.to, 'highlight-move');
        updateStatus();
    },
    onSnapEnd: function() { board.position(game.fen()); },
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = ChessBoard('myBoard', config);

// Add the click listener to all squares
$('#myBoard').on('click', '.square-55d63', function() {
    var square = $(this).attr('data-square');
    onSquareClick(square);
});

updateStatus();
