var board = null;
var game = new Chess();
var $status = $('#status');
var moveFrom = null;
var moveTo = null;
var selectedSquare = null;

// SOUNDS - High quality chess sounds
const moveSound = new Audio('https://images.chesscomfiles.com/chess-themes/pieces/neo/sounds/move-self.mp3');
const captureSound = new Audio('https://images.chesscomfiles.com/chess-themes/pieces/neo/sounds/capture.mp3');
const checkSound = new Audio('https://images.chesscomfiles.com/chess-themes/pieces/neo/sounds/move-check.mp3');

function removeHighlights() {
    $('#myBoard .square-55d63').removeClass('highlight-yellow hint-dot highlight-red');
}

function applyHighlights() {
    // Highlight Last Move (Yellow)
    if (moveFrom) $('#myBoard .square-' + moveFrom).addClass('highlight-yellow');
    if (moveTo) $('#myBoard .square-' + moveTo).addClass('highlight-yellow');

    // Highlight King if in Check (Red)
    if (game.in_check()) {
        var kingSquare = findKing(game.turn());
        $('#myBoard .square-' + kingSquare).addClass('highlight-red');
    }
}

function findKing(color) {
    var b = game.board();
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var p = b[i][j];
            if (p && p.type === 'k' && p.color === color) {
                return String.fromCharCode(97 + j) + (8 - i);
            }
        }
    }
}

function handleSound(move) {
    if (game.in_check()) {
        checkSound.play();
    } else if (move.flags.includes('c') || move.flags.includes('e')) {
        captureSound.play();
    } else {
        moveSound.play();
    }
}

function onSquareClick() {
    var square = $(this).attr('data-square');

    // Selecting a piece
    if (selectedSquare === null) {
        var piece = game.get(square);
        if (piece && piece.color === game.turn()) {
            selectedSquare = square;
            removeHighlights();
            applyHighlights();
            $(this).addClass('highlight-yellow');
            
            var moves = game.moves({ square: square, verbose: true });
            moves.forEach(m => $('#myBoard .square-' + m.to).addClass('hint-dot'));
        }
    } 
    // Attempting a move
    else {
        var move = game.move({ from: selectedSquare, to: square, promotion: 'q' });

        if (move === null) {
            selectedSquare = null;
            // Recursively call to select the new piece if it belongs to the player
            var piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                onSquareClick.call(this);
            } else {
                removeHighlights();
                applyHighlights();
            }
            return;
        }

        handleSound(move);
        moveFrom = move.from;
        moveTo = move.to;
        selectedSquare = null;
        
        board.position(game.fen());
        updateStatus();
    }
}

function updateStatus() {
    var status = game.turn() === 'b' ? 'Black to move' : 'White to move';
    if (game.in_checkmate()) status = 'CHECKMATE!';
    else if (game.in_draw()) status = 'DRAW';
    $status.html(status);
}

var config = {
    draggable: true,
    position: 'start',
    onDrop: function(source, target) {
        var move = game.move({ from: source, to: target, promotion: 'q' });
        if (move === null) return 'snapback';
        
        handleSound(move);
        moveFrom = source;
        moveTo = target;
        updateStatus();
    },
    onSnapEnd: function() {
        board.position(game.fen());
        removeHighlights();
        applyHighlights();
    },
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = ChessBoard('myBoard', config);

// Mobile-optimized click handler
$('#myBoard').on('touchstart click', '.square-55d63', function(e) {
    e.preventDefault();
    onSquareClick.call(this);
});

updateStatus();
    
