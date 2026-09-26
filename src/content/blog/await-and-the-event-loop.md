---
title: "Why Await Actually Fixes a Race"
date: 2025-11-05
blurb: "What the JavaScript event loop is actually promising you, and the mechanical reason one added await fixed a race condition."
tags: ["debugging", "javascript"]
draft: false
parent: the-three-day-bug
---

The fix for the three-day bug was one word: `await`. That's satisfying to write and a little unsatisfying to leave unexplained, so here's the mechanical reason it worked.

JavaScript runs your code on a single thread. Only one line executes at any given instant, there is no version of two pieces of your own code running at the exact same moment. So where does a "race" even come from, if nothing is truly simultaneous?

It comes from *order*, not simultaneity. Work like a network request or a cache warming up doesn't block that single thread while it finishes. Instead, JavaScript hands the waiting off and moves on to the next line immediately. When the slow thing finally finishes, it doesn't interrupt whatever is running, it gets placed in a queue (the event loop's job) and runs only once the thread is free. Which of two queued things runs first depends on which one finished waiting first, and that can vary from one run to the next: load, network conditions, cache state, whatever. That's the "sometimes" in a race condition. Nothing was ever truly at the same time; the *order* just wasn't guaranteed.

`await` is a promise, literally, to the engine: don't run the next line until this specific queued thing has happened. It doesn't make anything faster. It pins one edge of the ordering down so the rest of the function can't run ahead of it. In the buggy version, `getUser` read `cache.users[id]` without that promise, so it sometimes ran before the cache had anything in it, and sometimes ran after, depending on the queue. Adding `await cache.ready` didn't change what work happened; it changed the one thing that mattered, which piece of work the engine was allowed to run first.

That's the whole trick behind most race-condition fixes: you're rarely adding new logic, you're just telling the engine which ordering it already had to respect but wasn't.
