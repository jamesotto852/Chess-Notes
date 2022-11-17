board_setup = function(data, title) {

  var game = data.find(d => d.title === title)

  // if there's just one variation, need to put in array
  var variations = game.variations

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

  // flip initial orientation if needed
  if (game.orientation === "black") {
    board.flip()
  }

  // resize board if window is resized
  $(window).resize(board.resize)

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

    // if pieces have not been moved, reset to beginning of line
    if (!moved) {

      // if looking at a variation, reset to main line
      if (!(variations === undefined) && variations.includes(game.title)) {

        d3.select('#' + game.title)
          .style("box-shadow", null)
          .style("color", null)

        game = data.find(d => d.title === title)

        pos = game.start - 1

        d3.select('#reset-' + title)
          .classed('btn-primary', false)
          .classed('btn-outline-secondary', true)

      // Otherwise, reset main line (possibly to start of game)
      } else {

        // if reset button is pressed at starting position, totally reset board
        if (pos === game.start - 1) {
          pos = 0
        } else {
          pos = game.start - 1
        }

      }



    } else {

      // color reset button correctly if pieces are moved:
      if (!(variations === undefined) && variations.includes(game.title)) {

        d3.select('#reset-' + title)
          .classed('btn-primary', true)
          .classed('btn-success', false)

      } else {

        d3.select('#reset-' + title)
          .classed('btn-outline-secondary', true)
          .classed('btn-success', false)

      }
    }

    board.position(game.positions[pos])

    d3.select('#analyze-' + title).property("disabled", false)
    d3.select('#prev-' + title).property("disabled", pos == 0)
    d3.select('#next-' + title).property("disabled", pos == game.positions.length - 1)

    moved = false

  })

  $('#analyze-' + title).on('click', function() {
    window.open(game.link[pos], '_blank');
  })

  $('#flip-' + title).on('click', board.flip)


  if (!(variations === undefined)) {

    if (!(Array.isArray(variations))) {
      variations = [variations]
    }

    for (let k = 0; k < variations.length; k++) {
      $('#' + variations[k]).on('click', function() {

        // if clicked on active variation, reset to main line
        if (game.title === variations[k]) {

          d3.select('#' + game.title)
            .style("box-shadow", null)
            .style("color", null)

          game = data.find(d => d.title === title)

          // Don't reset position if before start of game
          if (pos >= game.start) {
            pos = game.start - 1
          }

          board.position(game.positions[pos])

          d3.select('#reset-' + title)
            .classed('btn-primary', false)
            .classed('btn-outline-secondary', true)

        // otherwise, set to selected variation
        } else {

          game = data.find(d => d.title === variations[k])

          // Don't reset position if before start
          // (this allows for the complete viewing of variations)
          if (pos >= game.start) {
            pos = game.start - 1
          }

          board.position(game.positions[pos])

          d3.select('#reset-' + title)
            .classed('btn-outline-secondary', false)
            .classed('btn-success', false)
            .classed('btn-primary', true)

        // need to unset styling for other variations
        variations.filter(name => !(name === variations[k]))
          .map(name =>  {
            d3.select('#' + name)
              .style("box-shadow", null)
              .style("color", null)
              //.style("box-shadow", "inset 0 0 0 0 #2780e3")
              //.style("color", "#2780e3")
          })

        // indicate variation is selected
        d3.select('#' + variations[k])
          .style("box-shadow", "inset 10vw 0 0 0 #2780e3")
          .style("color", "white")

        }

        // activate/deactivate UI
        d3.select('#analyze-' + title).property("disabled", false)
        d3.select('#prev-' + title).property("disabled", pos == 0)
        d3.select('#next-' + title).property("disabled", pos == game.positions.length - 1)

      })
    }

  }

}
