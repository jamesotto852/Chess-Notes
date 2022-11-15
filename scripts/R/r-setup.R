library("tidyverse")
library("glue")
library("chess")

move_g <- function(..., fen) move(game(fen = fen), ...)
move_v <- function(v, fen = NULL) lift_dv(move_g, fen = fen)(v)

move_v(c("e4", "e5"))
move_v(c("Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Nxc6", "Qf6", "Qd2", "dxc6", "Nc3"),
       fen = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2")

move_v(c("e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Nxc6", "Qf6", "Qd2", "dxc6", "Nc3"))

fen_seq <- function(game) {
  k <- ply_number(game)
  map_chr(k:0, \(i) fen(back(game, i)))
}

trim_fen <- function(fen) str_extract(fen, "^[^ ]*")
fen_subset <- function(fen, k) fen[k:length(fen)]

lichess_link = function(positions) {
  positions |>
    str_replace_all(" ", "%20") |>
    map_chr(\(fen) str_c("https://lichess.org/analysis/", fen))
}

add_game <- function(df = NULL, title, moves, start = 1, notation = FALSE, position = "start") {
  if (is.null(df)) {
    tibble(
      title = title,
      moves = list(moves),
      start = start,
      notation = if (notation) "show" else "hide",
      position = position
    )
  } else {
    bind_rows(df, add_game(df = NULL, title, moves, start, notation, position))
  }
}


clean_chess_df <- function(df) {

  df |>
    rowwise() |>
    mutate(games = list(move_v(moves, if (position == "start") NULL else position))) |>
    mutate(positions = list(fen_seq(games))) |>
    mutate(link = list(lichess_link(positions))) |>
    mutate(positions = list(trim_fen(positions))) |>
    # mutate(positions = list(fen_subset(positions, start))) |>
    select(-games) |>
    ungroup()

}

# Add in html for board + buttons
put_board <- function(title) {

glue('
<div id="{title}">

</div>
<div style="text-align: center; margin-top: 4px;">
<button id="analyze-{title}" class="btn btn-outline-primary">
<i class="fa-solid fa-magnifying-glass"></i>
</button>
<button id="prev-{title}" class="btn btn-outline-secondary">
<i class="fa-solid fa-arrow-left"></i>
</button>
<button id="reset-{title}" class="btn btn-outline-secondary">
<i class="fa-solid fa-arrows-rotate"></i>
</button>
<button id="next-{title}" class="btn btn-outline-secondary">
<i class="fa-solid fa-arrow-right"></i>
</button>
</div>
')
}
