defmodule OthelloWeb.GameChannel do
  use OthelloWeb, :channel

  alias Othello.Game
  alias Phoenix.Socket

  def join("game:" <> gname, payload, socket) do

    game = Game.get(gname)
    Game.put(gname, game)

    if authorized?(payload) do
      socket = socket |> Socket.assign(:game, game)

      {:ok, socket}

    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  def handle_in("clickEvent", payload, socket) do

    gname = socket.assigns[:name]
    user = socket.assigns[:user]
    observer = socket.assigns[:observer]

    game = Game.clickEvent(payload["index"],payload["state"])
    Game.put(gname, game)

    socket = socket
    |> assign(:game, game)

    broadcast socket, "clickEvent", game

    {:reply, {:ok, %{"game" => game}}, socket}
  end

  def handle_in("reset", payload, socket) do

    gname = socket.assigns[:name]
    user = socket.assigns[:user]
    observer = socket.assigns[:observer]

    game = Game.reset(payload["state"])

    Game.put(gname, game)
    socket = socket
    |> assign(:game, game)

    broadcast socket, "reset", game

    {:reply, {:ok, %{"game" => game}}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the present topic (games:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
