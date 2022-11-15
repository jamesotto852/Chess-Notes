board_setup = function(data, title) {

  const game = data.find(d => d.title === title)
  var pos = game.start - 1

  var moved = false

  var onDragMove = function() {
    moved = true

    d3.select('#reset-' + title)
      .classed('btn-outline-secondary', false)
      .classed('btn-success', true)

    d3.select('#analyze-' + title).property("disabled", true)
    d3.select('#prev-' + title).property("disabled", true)
    d3.select('#next-' + title).property("disabled", true)
  }

  // Note: boolean arrays don't survive transpose(), need to use characters ("show" and "hide")
  var board = Chessboard(title, {showNotation: game.notation === 'show', position: game.positions[pos], draggable: true, dropOffBoard: 'trash', onDragMove: onDragMove})

  d3.select('#prev-' + title).property("disabled", pos == 0)
  d3.select('#next-' + title).property("disabled", pos == game.positions.length - 1)

  $('#next-' + title).on('click', function () {
    if (pos < game.positions.length - 1) {
      pos = pos + 1
      board.position(game.positions[pos])
    }

    d3.select('#analyze-' + title).property("disabled", false)
    d3.select('#prev-' + title).property("disabled", false)
    d3.select('#next-' + title).property("disabled", pos == game.positions.length - 1)
  })

  $('#prev-' + title).on('click', function () {
    if (pos > 0) {
      pos = pos - 1
      board.position(game.positions[pos])
    }

    d3.select('#analyze-' + title).property("disabled", false)
    d3.select('#prev-' + title).property("disabled", pos == 0)
    d3.select('#next-' + title).property("disabled", false)
  })

  $('#reset-' + title).on('click', function() {
    // if pieces have been moved, reset to previous spot
    if (!moved) {
      pos = game.start - 1
    }

    board.position(game.positions[pos])

    d3.select('#analyze-' + title).property("disabled", false)
    d3.select('#prev-' + title).property("disabled", pos == 0)
    d3.select('#next-' + title).property("disabled", pos == game.positions.length - 1)

    d3.select('#reset-' + title)
      .classed('btn-outline-secondary', true)
      .classed('btn-success', false)

    moved = false
  })

  $('#analyze-' + title).on('click', function() {
    window.open(game.link[pos], '_blank');
  })

}
