defmodule OthelloWeb.GameController do
  use OthelloWeb, :controller
  alias Othello.Game

  def show(conn, %{"gname" => gname}) do
    user = get_session(conn, :user)

    game = Game.get(gname)
    host = (user == game[:host])
    if host===true do
      observer = "false"
    else
      observer = get_session(conn, :observer)
    end

    if !is_nil(user) and !is_nil(game) do
      render conn, "show.html", user: user, observer: observer, host: host, game: gname, clickLog: game[:clickLog], clickCount: game[:clickCount], xTurn: game[:xTurn], counter: game[:counter]
    else
      conn
      |> put_flash(:error, "Bad user or game chosen")
      |> redirect(to: "/")
    end
  end

  def join(conn, %{"join_data" => join}) do
    game = Game.join(join["game"], join["user"], join["observer"])

    conn
    |> put_session(:user, join["user"])
    |> put_session(:observer, join["observer"])
    |> redirect(to: "/g/" <> join["game"])
  end
end
