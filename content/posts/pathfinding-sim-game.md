---
title: Pathfinding Sim Game
date: 2026-10-20
description: A Godot game that steps through A*, Dijkstra and DFS one instruction at a time, on a hexagonal road network.
---

For the Algorithms and Data Structures module at HSMW the task was to make
pathfinding understandable, and most people hand in a write-up. I built a game
instead. It's called Neudinkel (repo: PathfindingSimGame), it's in Godot, and
the entire premise is that you watch A*, Dijkstra and DFS work through a map one
instruction at a time rather than just being shown the finished path.

The map is a hex grid, not squares. Each tile knows up to six neighbours, and a
tile's role falls out of how many it has: zero means empty grass, exactly two
means road, anything else means city. The algorithms search over the cities, and
the roads between them are the edges. Those edges are weighted by road type —
Autobahn costs 1, Landstraße 2, Feldweg 3, Sandweg 4 — so a route that cuts
through a few sand tiles is genuinely more expensive than one that sticks to the
highway. That weighting is the whole reason Dijkstra and A* produce visibly
different searches on this map. On a uniform grid there'd be almost nothing to
look at.

The thing I'm most proud of is how the algorithms are written, because there is
no `while` loop anywhere. Each search is a list of tiny functions, one per
operation, plus an index that points at the current one. Stepping forward just
runs `steps[currentStep](graph)` and advances the index. A* has sixteen of
these: init the open list, pop the cheapest node, mark it visited, check whether
it's the goal, loop the neighbours, compute the tentative `g`, compare it,
update `cameFrom`, and so on.

That decomposition is the entire trick, because it means the pause happens
*between* instructions. The UI highlights the matching line of pseudocode and
shows what changed on the map at that exact moment. The A* version draws `g`,
`h` and `f` as 3D labels floating above each node, and a side panel mirrors the
priority queue, so you can watch the open list change as the search moves. A*
uses a plain Euclidean distance over the tile coordinates for `h`, which is
enough to visibly pull the frontier toward the goal.

A lot of it is held together with duct tape, and I kind of like that it shows.
The priority queue is a hand-rolled sorted list with an O(n) insert, because
.NET's own PriorityQueue annoyed me — the code comment literally reads "C#s PQ
ist irgendwie Müll". Each algorithm hardcodes a breakpoint step so that "run
forward" advances a batch of steps and then pauses at a natural point instead of
flying to the end. And the step loop carries a 100,000 iteration guard, which is
there because at some point I genuinely wrote an infinite loop and had to find
out the hard way.

There are three modes. Baumodus lets you build your own network from the tiles.
Simulationsmodus is where you pick an algorithm, set a start and a goal, and
step through it with the pseudocode and the queue on screen. Prüfungsmodus runs
part of an algorithm and asks you to predict the next move, then grades you with
stars. That last one is what makes it a game instead of a visualiser, and it
forces you to actually know what the algorithm does next rather than just watch
it.

It's Godot 4.5 with C# on .NET 8, levels are plain JSON, and there's a custom
priority queue, a hex-grid graph, and three algorithms all waiting to be poked
at. Code lives at
[github.com/heimit0/PathfindingSimGame](https://github.com/heimit0/PathfindingSimGame).
