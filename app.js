var board = null
var game = new Chess()

function onDragStart (source, piece, position, orientation) {
  if (game.game_over()) return false
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' 
  })
  if (move === null) return 'snapback'
  updateStatus()
}

function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = game.turn() === 'b' ? 'Black to move' : 'White to move'
  if (game.in_checkmate()) status = 'Checkmate!'
  document.getElementById('status').innerHTML = status
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  // This tells the app to get piece images from the official website
  pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
}
board = ChessBoard('board', config)
       
