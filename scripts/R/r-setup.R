library("tidyverse")
library("glue")
library("here")
library("chess")

`%||%` <- function(LHS, RHS) {
  if (is.null(LHS)) RHS else LHS
}

# For reformatting + copying in PGN from elsewhere
pgn_to_vec <- function(pgn) {
  pgn |>
    str_replace_all("\\d*\\.", "") |>
    str_split(" ") |>
    unlist() |>
    dput()
}

move_g <- function(..., fen) move(game(fen = fen), ...)
move_v <- function(v, fen = NULL) lift_dv(move_g, fen = fen)(v)

fen_seq <- function(game) {
  k <- ply_number(game)
  map_chr(k:0, \(i) fen(back(game, i)))
}

pgn_full <- function(game) {
  pgn(back(game, ply_number(game))) |>
    str_extract("1.*$") # cut out header info
}

trim_fen <- function(fen) str_extract(fen, "^[^ ]*")
fen_subset <- function(fen, k) fen[k:length(fen)]

lichess_link <- function(positions) {
  positions |>
    str_replace_all(" ", "%20") |>
    map_chr(\(fen) str_c("https://lichess.org/analysis/", fen))
}

add_game <- function(df = NULL, title, moves, start = 1, notation = FALSE, orientation = "white", position = "start", variations = NA, type = "main") {
  if (is.null(df)) {
    tibble(
      title = title,
      moves = list(moves),
      start = start,
      notation = if (notation) "show" else "hide",
      orientation = orientation,
      position = position,
      type = type,
      variations = list(variations),
    )
  } else {
    bind_rows(df, add_game(df = NULL, title, moves, start, notation, orientation, position, variations, type))
  }
}

add_variation <- function(df, title, moves, start = NULL, notation = NULL, position = NULL) {

  # title will be used in html id -- must start with a letter!
  if (!str_detect(title, "^[a-zA-Z]")) stop("Variation titles must begin with a letter [a-zA-Z]")


  main <- df |>
    filter(type == "main") |>
    slice_tail(n = 1)

  add_game(
    df, title, moves,
    start %||% main$start,
    notation %||% main$notation == "show",
    main$orientation,
    position %||% main$position,
    variations = NA,
    type = "variation"
  )

}

write_png <- function(df, title) {
  cat(df$pgn, file = here(glue("pgn-files/{title}.pgn")), sep="\n\n")

  df
}

clean_chess_df <- function(df) {

  df |>
    rowwise() |>
    mutate(games = list(move_v(moves, if (position == "start") NULL else position))) |>
    mutate(pgn = pgn_full(games)) |>
    mutate(positions = list(fen_seq(games))) |>
    mutate(link = list(lichess_link(positions))) |>
    mutate(positions = list(trim_fen(positions))) |>
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
<button id="flip-{title}" class="btn btn-outline-secondary">
<i class="fa-solid fa-shuffle"></i>
</button>
</div>
')
}
