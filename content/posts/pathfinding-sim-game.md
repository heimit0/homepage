---
title: Pathfinding Sim Game
date: 2026-10-20
description: A Godot game that teaches A*, Dijkstra and DFS by letting you step through the algorithms line by line.
---

For the *Algorithms and Data Structures* module at HSMW I built a small game
that tries to make pathfinding algorithms actually stick. The repo is called
PathfindingSimGame; internally the project is **Neudinkel**.

The problem with learning A* or Dijkstra is that they're usually taught as a
block of pseudocode. You read it, you sort of follow it, and ten minutes later
it's gone. Neudinkel turns the algorithm into a 3D scene you can run, pause and
step through — and then *tests* you on it.

## Three modes

The game splits into three parts, roughly "make it", "watch it", "prove it":

- **Build mode** — you lay out your own network from tiles: streets, highways,
  sand paths and city blocks. Cities become the graph's nodes and the roads
  between them its edges.
- **Simulation mode** — you drop a start and a goal onto the network and run
  A*, Dijkstra or DFS. The search happens on the map you built.
- **Exam mode** — the game shows you a level and asks you to predict what the
  algorithm does next. You're graded with stars.

## The part I'm happiest with: micro-steps

The core design decision is how the algorithms are structured. Instead of one
big `while` loop, every search is decomposed into an array of tiny functions —
one per logical operation — with an index pointing at the current one:

```text
init unvisited  ->  init visited  ->  init costs  ->  add start
->  is open list empty?  ->  pop best node  ->  mark visited
->  is it the goal?  ->  for each neighbour  ->  relax edge  ->  ...
```

Each of those is its own function, and "step forward" just advances the index by
one. That means the game can do the one thing a static page can't: stop
*between* lines of pseudocode and show you exactly what changed — which node was
just popped, what its `g` cost is, whether the tentative cost actually improved
anything, and what got pushed onto the priority queue.

The A* version also renders its state as 3D labels floating over each node
(`g`, `h`, `f`, total cost), so you can watch the heuristic pull the search
towards the goal in real time.

## The graph

The map isn't a grid — it's a weighted graph. City tiles are nodes, and every
road type has its own traversal cost (`streetType` in the code), so a highway
and a sand path don't cost the same to cross. That's what makes Dijkstra and A*
actually differ here: Dijkstra expands purely by accumulated cost, while A* adds
a Euclidean heuristic (`h`) to bias towards the goal.

## Stack

Godot 4.5, written in C# on .NET 8, with a custom priority queue. Levels are
plain JSON. Everything lives at
[github.com/heimit0/PathfindingSimGame](https://github.com/heimit0/PathfindingSimGame).
