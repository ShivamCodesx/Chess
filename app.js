const boardElement = document.getElementById('chess-board');
const game = new Chess();

// Sound files
const sndMove = new Audio('https://images.chesscomfiles.com/chess-themes/pieces/neo/sounds/move-self.mp3');

const cg = Chessground(boardElement, {
    orientation: 'white',
    resizable: true,
    movable: {
        free: false,
        color: 'white',
        dests: getDests() // This automatically creates the "dots" for legal moves
    },
    events: {
        move: (orig, dest) => {
            game.move({ from: orig, to: dest });
            sndMove.play();
            cg.set({
                check: game.in_check(),
                lastMove: [orig, dest],
                movable: { dests: getDests() }
            });
        }
    },
    // This tells Chessground where to get the high-quality Lichess pieces
    drawable: { enabled: true } 
});

// Helper function to tell Chessground where pieces CAN move
function getDests() {
    const dests = new Map();
    game.SQUARES.forEach(s => {
        const ms = game.moves({ square: s, verbose: true });
        if (ms.length) dests.set(s, ms.map(m => m.to));
    });
    return dests;
}
