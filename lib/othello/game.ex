
defmodule Othello.Game do

  def start_link do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  def put(gname, game) do
    Agent.update(__MODULE__, &Map.put(&1, gname, game))
    game
  end

  def get(gname) do
    Agent.get(__MODULE__, &Map.get(&1, gname))
  end

  def join(gname, user, observer) do
    grid = List.duplicate(nil, 64) |>
    List.replace_at(27, 'X') |>
    List.replace_at(28, 'O') |>
    List.replace_at(36, 'X') |>
    List.replace_at(35, 'O')

    game = get(gname)

    if game do
      game
    else
      game = %{name: gname, observer: observer, host: user, clickLog: %{"tiles" => grid, "xCount" => 2, "oCount" => 2, "wasXTurn" => true}, clickCount: 0, clickCount: 0}
      put(gname, game)
    end

  end

  def reset(state) do
    clickLog = Map.get(state, "clickLog")
    history0 = Enum.fetch!(clickLog, 0)
    wasXTurn = Map.get(history0, "wasXTurn")

    %{
      clickLog: Enum.slice(clickLog, 0, 1),
      clickCount: 0,
      xTurn: wasXTurn
    }
  end

  def gameResult(xCount, oCount) do
    if(xCount+oCount<64) do
      nil
    else
      if(xCount === oCount) do
        "XO"
      else
        if(xCount > oCount) do
          "X"
        else
          "O"
        end
      end
    end
  end

  def forfunc(y, previousXLocation, previousYLocation, xTurn, changedGrid, changedTiles, oneOrMoreChanged, location, weight) do

    xLocation = rem(y, 8)
    yLocation = (y - rem(y,8)) / 8

    terminatingCond1 = abs(previousXLocation - xLocation) > 1 || abs(previousYLocation - yLocation) > 1

    if(terminatingCond1) do
      changedGrid
    else
      if(!xTurn) do
        toMatch = "X"
      else
        toMatch = "O"
      end

      if(xTurn) do
        reverseLetter = "X"
      else
        reverseLetter = "O"
      end

      if(Enum.fetch!(changedTiles, y) === toMatch) do

        changedTiles = Enum.to_list(changedTiles)
        changedTiles = List.replace_at(changedTiles, y, reverseLetter)
        oneOrMoreChanged = true
        previousXLocation = xLocation
        previousYLocation = yLocation

        y = y + weight
        if (y<64) do
          changedGrid = forfunc(y, previousXLocation, previousYLocation, xTurn, changedGrid, changedTiles, oneOrMoreChanged, location, weight)
        else
          changedGrid
        end

      else
        if((Enum.fetch!(changedTiles,y) === reverseLetter) && oneOrMoreChanged) do

          changedTiles = Enum.to_list(changedTiles)
          changedTiles = List.replace_at(changedTiles, location, reverseLetter)
          changedGrid = Enum.slice(changedTiles, 0, Enum.count(changedTiles))
          changedGrid
        else
          changedGrid
        end
        changedGrid
      end
    end

  end

  def forEachfunc(weight, changedGrid, beginX, beginY, tiles, location, xTurn) do

    if (changedGrid) do
      changedTiles = Enum.slice(changedGrid, 0, Enum.count(changedGrid))
    else
      changedTiles = Enum.slice(tiles, 0, Enum.count(tiles))
    end

		oneOrMoreChanged = false
		previousXLocation = beginX
    previousYLocation = beginY

    if (location+weight<64) do
      y = location+weight
    else
      y = location
    end

    changedGrid = forfunc(y, previousXLocation, previousYLocation, xTurn, changedGrid, changedTiles, oneOrMoreChanged, location, weight)

    changedGrid
  end

  def changeTiles(tiles, location, xTurn) do
    changedGrid = nil

		beginX = rem(location, 8)
    beginY = (location - rem(location,8)) / 8

		if (Enum.fetch!(tiles, location) != nil) do
		   nil
		else

      changedGrid1 = forEachfunc(1, changedGrid, beginX, beginY, tiles, location, xTurn)
      changedGrid2 = forEachfunc(7, changedGrid1, beginX, beginY, tiles, location, xTurn)
      changedGrid3 = forEachfunc(8, changedGrid2, beginX, beginY, tiles, location, xTurn)
      changedGrid4 = forEachfunc(9, changedGrid3, beginX, beginY, tiles, location, xTurn)
      changedGrid5 = forEachfunc(-1, changedGrid4, beginX, beginY, tiles, location, xTurn)
      changedGrid6 = forEachfunc(-7, changedGrid5, beginX, beginY, tiles, location, xTurn)
      changedGrid7 = forEachfunc(-8, changedGrid6, beginX, beginY, tiles, location, xTurn)
      changedGrid8 = forEachfunc(-9, changedGrid7, beginX, beginY, tiles, location, xTurn)
      changedGrid8

    end
  end

  def possibleMoves(color, tiles) do
    squares0 = tiles |> Enum.with_index(0) |> Enum.map(fn {k,v}->{v,k} end) |> Map.new
    squaress = Enum.to_list(squares0)
    squares1 = Enum.map(squares0, fn{index,value} -> mapFunc(color, tiles, index) end)
    squares2 =
      Enum.filter(squares1, fn(element) -> element == nil end)
    squares2

  end

  def mapFunc(color, tiles, index) do
    if (changeTiles(tiles, index, color) == nil) do
      nil
    else
      index
    end
  end

  def reduceFunc1(acc, present) do
    if (present === "X") do
      acc = acc + 1
    else
      acc = acc
    end
  end

  def reduceFunc2(acc, present) do
    if (present === "O") do
      acc = acc + 1
    else
      acc = acc
    end
  end

  def clickEvent(index, state) do
    clickLog = Map.get(state, "clickLog")
    clickCount = Map.get(state, "clickCount")
    clickLog = Enum.slice(clickLog, 0, clickCount+1)
    present = Enum.fetch!(clickLog, clickCount)

    xCount = Map.get(present, "xCount")
    oCount = Map.get(present, "oCount")
    tiles = Map.get(present, "tiles")
    tile = Enum.fetch!(tiles, index)

    if (gameResult(xCount, oCount) || tile) do
      nil
    else
      changedTiles = changeTiles(Map.get(present, "tiles"), index, Map.get(state, "xTurn"))

      if(changedTiles == nil) do
        nil
      else

        xCount = Enum.reduce(changedTiles, 0, fn(present,acc) -> reduceFunc1(acc,present) end)
        oCount = Enum.reduce(changedTiles, 0, fn(present,acc) -> reduceFunc2(acc,present) end)

        list = possibleMoves(!Map.get(state,"xTurn"), changedTiles)

        if(length(list) > 0) do
          skipTurn = !Map.get(state, "xTurn")
        else
          skipTurn = Map.get(state, "xTurn")
        end

        clickLog = clickLog ++ [(%{"tiles" => changedTiles, "xCount" => xCount, "oCount" => oCount, "wasXTurn" => skipTurn})]

        state = Map.put(state, "clickLog", clickLog)
        state = Map.put(state, "clickCount", length(clickLog)-1)
        state = Map.put(state, "xTurn", skipTurn)

        %{
          clickLog: Map.get(state, "clickLog"),
          clickCount: Map.get(state, "clickCount"),
          xTurn: Map.get(state, "xTurn")
        }
      end
		end
  end
end
