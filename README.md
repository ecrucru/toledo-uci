
# Toledo NanoChess UCI

Toledo NanoChess is originally a killer chess engine because it is the smallest one in the world ! The quality of the code within so few bytes is totally incredible.

This UCI version is a derivative work of the library Toledo NanoChess released in 2013 for [JavaScript](http://nanochess.org/chess4.html). It has some benefits :

- Play with a desktop application through the modern UCI protocol.
- Undo the last move without losing your game.
- With pyChess' slider, select the strength of the AI when you start a new game (6 is a good value).
- Toledo plays both White and Black.
- Play Chess960.
- Information about the analysis : processing time, nodes, nodes per second...

Despite it was coded and tested in just two days, this UCI port doesn't aim to be the smallest one in the world... ;-)


## Install

First, install NodeJS.org which is the host application to run the script.

For pyChess, just add `toledo-uci.js` to the list of engines.

For WinBoard, add this new line in the engine list :

```
"Toledo NanoChess UCI" -fcp 'C:\full-path-to\node.exe "C:\full-path-to\toledo-uci.js"' -fn "Toledo NanoChess UCI" -fUCI
```

For the command line, execute `node toledo-uci.js`.


## License

Refer to the header of the main JavaScript file to know more about the license.


## Supported commands

- `uci`
- `setoption name Skill Level value (number)` where *(number)* is a level between 1 and 20
- `isready`
- `ucinewgame`
- `position startpos`
- `position startpos moves e2e4` with as many moves as needed
- `position fen (string)` where *(string)* is a complete position in FEN format
- `debug` displays Toledo NanoChess' internal variables
- `debug move (string)` where *(string)* is a move to perform written in UCI format (like `a2a1q`)
- `go`
- `go depth (number)` where *(number)* is the forced depth to reach (it temporarily overrides the current strength of the AI)
- `quit`

Any other command is unsupported (like `stop`) or partially ignored (like `go infinite`).
