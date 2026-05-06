var board = null;
var game = new Chess();
var moveFrom = null;
var moveTo = null;
var selectedSquare = null;

// HTML Audio Elements
const sndMove = document.getElementById('snd-move');
const sndCapture = document.getElementById('snd-capture');
const sndCheck = document.getElementById('snd-check');

// Audio Unlocker for Mobile Safari/Chrome
let audioUnlocked = false;
function unlockAudio() {
    if (!audioUnlocked) {
        sndMove.play().then(() => { sndMove.pause(); sndMove.currentTime = 0; }).catch(() => {});
        audioUnlocked = true;
    }
}

function playSound(move) {
    if (!move) return;
    if (game.in_check()) {
        sndCheck.currentTime = 0; sndCheck.play().catch(e=>{});
    } else if (move.flags.includes('c') || move.flags.includes('e')) {
        sndCapture.currentTime = 0; sndCapture.play().catch(e=>{});
    } else {
        sndMove.currentTime = 0; sndMove.play().catch(e=>{});
    }
}

// Clears absolutely everything (dots, yellow, red)
function clearAllHighlights() {
    $('#myBoard .square-55d63').removeClass('highlight-yellow hint-dot hint-capture highlight-red');
}

// Re-applies only the permanent highlights (Last Move + Check)
function restorePermanentHighlights() {
    // 1. Last Move (Yellow)
    if (moveFrom) $('#myBoard .square-' + moveFrom).addClass('highlight-yellow');
    if (moveTo) $('#myBoard .square-' + moveTo).addClass('highlight-yellow');

    // 2. Check (Red King)
    if (game.in_check()) {
        var b = game.board();
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (b[i][j] && b[i][j].type === 'k' && b[i][j].color === game.turn()) {
                    var sq = String.fromCharCode(97 + j) + (8 - i);
                    $('#myBoard .square-' + sq).addClass('highlight-red');
                }
            }
        }
    }
}

function onSquareClick() {
    unlockAudio();
    var square = $(this).attr('data-square');

    // SCENARIO 1: Clicking the already selected piece -> Deselect it.
    if (selectedSquare === square) {
        selectedSquare = null;
        clearAllHighlights();
        restorePermanentHighlights();
        return;
    }

    var piece = game.get(square);

    // SCENARIO 2: Clicking a new piece of your own color -> Select it and show dots.
    if (piece && piece.color === game.turn()) {
        selectedSquare = square;
        clearAllHighlights();
        restorePermanentHighlights();
        
        // Highlight the piece you just tapped
        $(this).addClass('highlight-yellow');
        
        // Show legal moves
        var moves = game.moves({ square: square, verbose: true });
        moves.forEach(m => {
            var targetSquare = $('#myBoard .square-' + m.to);
            if (game.get(m.to)) {
                targetSquare.addClass('hint-capture'); // Hollow circle if attacking
            } else {
                targetSquare.addClass('hint-dot'); // Solid dot for empty square
            }
        });
        return;
    }

    // SCENARIO 3: Clicking a destination to make a move.
    if (selectedSquare) {
        var move = game.move({ from: selectedSquare, to: square, promotion: 'q' });

        // If illegal move, just deselect
        if (move === null) {
            selectedSquare = null;
            clearAllHighlights();
            restorePermanentHighlights();
            return;
        }

        // Legal move executed!
        moveFrom = move.from;
        moveTo = move.to;
        selectedSquare = null;
        
        playSound(move);
        board.position(game.fen(), false); // false = instant snap, no slow animation
        
        clearAllHighlights();
        restorePermanentHighlights();
    }
}

var config = {
    draggable: true,
    position: 'start',
    onDrop: function(source, target) {
        unlockAudio();
        var move = game.move({ from: source, to: target, promotion: 'q' });
        
        if (move === null) return 'snapback';
        
        moveFrom = source;
        moveTo = target;
        playSound(move);
        
        clearAllHighlights();
        restorePermanentHighlights();
    },
    onSnapEnd: function() {
        board.position(game.fen());
        clearAllHighlights();
        restorePermanentHighlights();
    },
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = ChessBoard('myBoard', config);

// Master click/touch listener
$('#myBoard').on('mousedown touchstart', '.square-55d63', function(e) {
    e.preventDefault();
    onSquareClick.call(this);
});

restorePermanentHighlights();
                      
