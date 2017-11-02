/*====================================================================================================
 *
 *	Toledo JavaScript Chess Engine
 *	(C) Copyright 2009-2013 Oscar Toledo G. [biyubi@gmail.com]
 *			http://nanochess.org/chess4.html
 *
 *	Development of a UCI-compatible interface based on the release of 2013-05-10
 *	(C) Copyright 2017 ecrucru
 *			https://github.com/ecrucru/toledo-uci/
 *			https://github.com/ecrucru/anticrux/		(Reused parts of code)
 *
 *	License :
 *		- Free for non commercial use
 *		- Contact the original author for any commercial use
 *		- Allowed derivative works with the mention of the authors
 *		- No guarantee
 *
 *====================================================================================================
 *
 *	z = constant equal to 15 to apply the bitmask 1111b on I[] to extract the piece and the player
 *	I[0..119] = board of 120 cells, I[21]=a8, I[98]=h1, 
 *	I[] = tag | player | piece
 *		> tag = 10000b to mark the original position used in castling
 *		> player = 0000b for black, 1000b for white
 *		> piece = 001b for pawn, 010b for king, 011b for knight, 100b for bishop, 101b for rook,
 *                110b for queen, 111b for invalid piece
 *	s = positional identifier in I[] of the selected cell on the board
 *	B = positional identifier in I[] of the source cell
 *	b = positional identifier in I[] of the target cell
 *	u = positional identifier in I[] of the target pawn which has activated an enpassant cell
 *	i = processed player|piece, it serves to promote a pawn to another piece
 *	y = current player, 0000b=white, 1000b=black, the sides are reversed with I[] to allow XOR
 *
 *	Any name beginning with an underscore "_" is not part of the original library.
 *
====================================================================================================*/



//====================================================================================================
// Toledo NanoChess original library (with few changes)

var B, i, y, u, b, I = [], G, x, z, M, l;

function X(w, c, h, e, S, s)
{
	var	t, o, L, E, d, O = e,			// That's the letters of the original author's name :-)
		N = -M * M,
		K = 78 - h << x,
		p, g, n, m, A, q, r, C, J, a = y ? -x : x;
	y ^= 8;
	G++;
	_uciNodes++;
	d = w || s && s >= h && X(0, 0, 0, 21, 0, 0) > M;
	do
	{
		if (o = I[p = O])
		{
			q = o & z ^ y;
			if (q < 7)
			{
				A = q-- & 2 ? 8 : 4;
				C = o - 9 & z ? [53, 47, 61, 51, 47, 47][q] : 57;
				do
				{
					r = I[p += l[C]];
					if (!w | p == w)
					{
						g = q | p + a - S ? 0 : S;
						if (!r & (!!q | A < 3 || !!g) || (r + 1 & z ^ y) > 9 && q | A > 2)
						{
							if (m = !(r - 2 & 7))
								return y ^= 8, I[G--] = O, K;
							J = n = o & z;
							E = I[p - a] & z;
							t = q | E - 7 ? n : (n += 2, 6 ^ y);
							while (n <= t)
							{
								L = r ? l[r & 7 | 32] - h - q : 0;
								if (s)
									L += (1 - q ? l[(p - p % x) / x + 37] - l[(O - O % x) / x + 37] + l[p % x + 38] * (q ? 1 : 2) - l[O % x + 38] + (o & 16) / 2 : !!m * 9) + (!q ? !(I[p - 1] ^ n) + !(I[p + 1] ^ n) + l[n & 7 | 32] - 99 + !!g * 99 + (A < 2) : 0) + !(E ^ y ^ 9);
								if (s > h || 1 < s & s == h && L > z | d)
								{
									I[p] = n, I[O] = m ? (I[g] = I[m], I[m] = 0) : g ? I[g] = 0 : 0;
									L -= X(s > h | d ? 0 : p, L - N, h + 1, I[G + 1], J = q | A > 1 ? 0 : p, s);
									if (!(h || s - 1 | B - O | i - n | p - b | L < -M))
										return B = b, G--, u = J;
									J = q - 1 | A < 7 || m || !s | d | r | o < z || X(0, 0, 0, 21, 0, 0) > M;
									I[O] = o;
									I[p] = r;
									m ? (I[m] = I[g], I[g] = 0) : g ? I[g] = 9 ^ y : 0;
								}
								if (L > N || s > 1 && L == N && !h && Math.random() < 0.5)
								{
									I[G] = O;
									if (s > 1)
									{
										if (h && c - L < 0)
											return y ^= 8, G--, L;
										if (!h)
											i = n, B = O, b = p;
									}
									N = L;
								}
								n += J || (g = p, m = p < O ? g - 3 : g + 2, I[m] < z | I[m + O - p] || I[p += p - O]) ? 1 : 0;
							}
						}
					}
				} while (!r & q > 2 || (p = O, q | A > 2 | o > z & !r && ++C * --A));
			}
		}
	} while (++O > 98 ? O = 20 : e - O);
	return y ^= 8, G--, N + M * M && N > -K + 1924 | d ? N : 0;
}



//====================================================================================================
// Wrapper to use it as an UCI-compatible engine


//-- Initialization
var	_uciStrength = 4,
	_uciNodes,
	_uciLast = '';

var _fs = require('fs');
_uciReset();
process.title = 'Toledo NanoChess UCI';
process.on('SIGINT', function() {
	process.exit(0);
});
process.stdin.on('readable', function() {
	var _obj, _input, _k;

	//-- Input block of data
	_obj = process.stdin.read();
	if (_obj === null)
		return;
	_input = _obj.toString();

	//-- Simplifies the input
	_input = _input.split("\r").join('');
	_input = _input.split("\t").join(' ');
	_k = _input.length;
	while (true)
	{
		_input = _input.split('  ').join(' ');
		if (_input.length != _k)
			_k = _input.length;
		else
			break;
	}

	//-- Splits the input line by line
	_input = _input.split("\n");
	for (_k=0 ; _k<_input.length ; _k++)
	{
		_line = _input[_k];
		if (_line.length === 0)
			continue;
		_uciProcess(_line);
	}
});


//-- Library
function _uciWrite(pLine)
{
	if (typeof _fs != 'undefined')
		_fs.writeSync(1, pLine + "\r\n");
	else
		console.log(pLine + "\r\n");
	_uciLast = pLine;
}

function _uciProcess(pLine)
{
	var	_j, _x, _y, _buffer, _tab, _fen, _list, _promo,
		_match, _yold, _levelold, _B, _b,
		_nodes, _start, _end, _nps;

	//-- Processes
	_tab = pLine.split(' ');
	for (_j=0 ; (_j<10) || (_j<_tab.length) ; _j++)
		if (typeof _tab[_j] == 'undefined')
			_tab[_j] = '';
	if (_tab[0].length > 0)
		_uciLast = '';
	switch (_tab[0].toLowerCase())
	{
		case 'quit':
			process.exit(0);
			break;
			
		case 'uci':
			_uciWrite('id name Toledo NanoChess UCI');
			_uciWrite('id author More information at https://github.com/ecrucru/toledo-uci/');
			_uciWrite('option name Skill Level type spin default '+_uciStrength+' min 1 max 20');
			_uciWrite('option name UCI_Chess960 type check default false');
			_uciWrite('uciok');
			_uciWrite('copyprotection ok');
			break;

		case 'setoption':
			_match = pLine.match(/^setoption name skill level value ([0-9]+)$/i);
			if (_match !== null)
			{
				_uciStrength = Math.min(Math.max(parseInt(_match[1]), 2), 20);
				_uciWrite('set info Level '+_uciStrength+' set');
			}
			break;

		case 'isready':
			_uciWrite('readyok');
			break;

		case 'ucinewgame':
			_uciReset();
			break;

		case 'position':
		{
			//- Loads the initial position
			if (_tab[1].toLowerCase() == 'fen')
			{
				_fen = '';
				for (_j=2 ; _j<_tab.length ; _j++)
				{
					if (_tab[_j] == 'moves')
						break;
					_fen += (_fen.length > 0 ? ' ' : '') + _tab[_j];
				}
				if (!_uciLoadFen(_fen))
				{
					_uciWrite('info string Error : invalid FEN ' + _fen);
					return false;
				}
			}
			else if (_tab[1].toLowerCase() == 'startpos')
				_uciLoadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0');
			else
				return false;

			// Proceeds with the additional moves
			_b = false;
			for (_j=2 ; _j<_tab.length ; _j++)
			{
				if (_tab[_j].length === 0)
					continue;
				if (_tab[_j] == 'moves')
				{
					_b = true;
					continue;
				}
				if (_b && !_uciMove(_tab[_j]))
				{
					_uciWrite('info string Error : invalid move history');
					return false;
				}
			}
			break;
		}

		case 'go':
		{
			//- Forced depth
			_levelold = _uciStrength;
			for (_j=1 ; _j<_tab.length-1 ; _j++)
				if (_tab[_j].toLowerCase() == 'depth')
				{
					_uciStrength = parseInt(_tab[_j+1]);
					_uciStrength = (_uciStrength <= 0 ? _levelold : Math.max(2, _uciStrength));
					break;
				}

			//- Init
			_yold = y;
			_uciNodes = 0;

			//- Search
			_start = Date.now();
			X(0, 0, 0, 21, u, _uciStrength);
			_end = Date.now();
			_B = B;
			_b = b;
			_promo = (i != (I[B]&z));
			_nodes = _uciNodes;
			_nps = (_end-_start === 0 ? 0 : Math.floor(1000*_nodes/(_end-_start)));
			X(0, 0, 0, 21, u, 1);

			//- Output
			if (y == _yold)
				_uciWrite('bestmove 0000');
			else
			{
				_uciWrite('info depth '+_uciStrength+' time '+(_end-_start)+' nodes '+_nodes+' nps '+_nps+' pv 0000');
				_uciWrite('bestmove '+_uciIdToCoordinate(_B)+_uciIdToCoordinate(_b)+(_promo?'   nbrq'[(i&z)^y]:'').trim());
			}
			_uciStrength = _levelold;
			break;
		}

		case 'debug':
		{
			if (_tab[1] == 'move')
			{
				if (!_uciMove(_tab[2]))
				{
					_uciWrite('info string Error : invalid move');
					return false;
				}
			}
			else if (_tab[1] == 'board')
			{
				_uciWrite('info string Current state of the board :');
				for (_y=0 ; _y<8 ; _y++)
				{
					_buffer = '';
					for (_x=0 ; _x<8 ; _x++)
					{
						_j = 21 + 10*_y + _x;
						if (_buffer.length > 0)
							_buffer += ' ';
						if (I[_j] < 10)
							_buffer += ' ';
						_buffer += (I[_j] ? I[_j] : '.');
					}
					_uciWrite('info string   '+_buffer);
				}
			}
			else if (_tab[1] == 'quality')
			{
				_list = [
					// String: name of the test case
					// Array: [ uci command to run ; expected result ; string to be contained in the last emitted message ]

					['uci',        true, ''],
					['isready',    true, 'readyok'],
					['ucinewgame', true, ''],

					'Normal move for White',
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -', true, ''],
					['go depth 4', true, ''],

					'Normal move for Black',
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq -', true, ''],
					['go depth 4', true, ''],

					'Move with taken piece for White',
					['position fen rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -', true, ''],
					['go depth 6', true, 'e4d5'],

					'Move with taken piece for Black',
					['position fen rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq -', true, ''],
					['go depth 6', true, 'd8d5'],

					'Promotion for White',
					['position fen 1k6/7P/1K6/8/8/8/8/8 w - -', true, ''],
					['go depth 4', true, 'h7h8q'],

					'Promotion for Black',
					['position fen 8/8/8/8/8/1k6/7p/1K6 b - -', true, ''],
					['go depth 4', true, 'h2h1q'],

					'En passant for White',
					['position fen 1k6/8/1K6/6pP/8/8/8/8 w - g6', true, ''],
					['go depth 4', true, 'h5g6'],

					'En passant for Black',
					['position fen 1k6/8/1K6/8/5pP1/8/8/8 b - g3', true, ''],
					['go depth 4', true, 'f4g3'],

					'Short/King castling for White',
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq -', true, ''],
					['debug move e1g1', true, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQ -', true, ''],
					['debug move e1g1', true, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w kq -', true, ''],
					['debug move e1g1', false, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w - -', true, ''],
					['debug move e1g1', false, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w K -', true, ''],
					['debug move e1g1', true, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w Q -', true, ''],
					['debug move e1g1', false, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w k -', true, ''],
					['debug move e1g1', false, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w q -', true, ''],
					['debug move e1g1', false, ''],

					'Short/King castling for Black',
					['position fen rnbqk2r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq -', true, ''],
					['debug move e8g8', true, ''],
					['position fen rnbqk2r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQ -', true, ''],
					['debug move e8g8', false, ''],
					['position fen rnbqk2r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b kq -', true, ''],
					['debug move e8g8', true, ''],
					['position fen rnbqk2r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - -', true, ''],
					['debug move e8g8', false, ''],
					['position fen rnbqk2r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b K -', true, ''],
					['debug move e8g8', false, ''],
					['position fen rnbqk2r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b Q -', true, ''],
					['debug move e8g8', false, ''],
					['position fen rnbqk2r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b k -', true, ''],
					['debug move e8g8', true, ''],
					['position fen rnbqk2r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b q -', true, ''],
					['debug move e8g8', false, ''],

					'Long/Queen castling for White',
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w KQkq -', true, ''],
					['debug move e1c1', true, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w KQ -', true, ''],
					['debug move e1c1', true, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w kq -', true, ''],
					['debug move e1c1', false, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w - -', true, ''],
					['debug move e1c1', false, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w K -', true, ''],
					['debug move e1c1', false, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w Q -', true, ''],
					['debug move e1c1', true, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w k -', true, ''],
					['debug move e1c1', false, ''],
					['position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3KBNR w q -', true, ''],
					['debug move e1c1', false, ''],

					'Long/Queen castling for Black',
					['position fen r3kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq -', true, ''],
					['debug move e8c8', true, ''],
					['position fen r3kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQ -', true, ''],
					['debug move e8c8', false, ''],
					['position fen r3kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b kq -', true, ''],
					['debug move e8c8', true, ''],
					['position fen r3kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - -', true, ''],
					['debug move e8c8', false, ''],
					['position fen r3kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b K -', true, ''],
					['debug move e8c8', false, ''],
					['position fen r3kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b Q -', true, ''],
					['debug move e8c8', false, ''],
					['position fen r3kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b k -', true, ''],
					['debug move e8c8', false, ''],
					['position fen r3kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b q -', true, ''],
					['debug move e8c8', true, ''],

					'Initial position with additional complex moves',
					['position fen 7k/8/8/5K2/2p3Q1/2P5/P4P2/8 w - - 5 53 moves a2a4', true, ''],
					['go depth 3', true, ''],

					'Invalid number of kings in the position',
					['position fen k/8/8/8/8/8/8/K w - -',    true,  ''],
					['position fen 8/8/8/8/8/8/8/8 b - -',    false, ''],
					['position fen k6k/8/8/8/8/K7/8/8 w - -', false, ''],
					['position fen k6k/8/8/8/8/8/8/8 w - -',  false, ''],
					['position fen 8/8/8/8/8/KK6/8/8 w - -',  false, ''],
					['position fen k7/8/8/8/8/K6K/8/8 w - -', false, '']
				];
				for (_x=0 ; _x<_list.length ; _x++)
				{
					if (typeof _list[_x] === 'string')
						_uciWrite('info string --- Running test case: '+_list[_x]);
					else
					{
						if (	(_uciProcess(_list[_x][0]) != _list[_x][1]) ||
								((_list[_x][2].length > 0) && (_uciLast.indexOf(_list[_x][2]) === -1))
							)
						{
							_uciWrite('info string Error : the quality check failed on "'+_list[_x][0]+'" (step #'+_x+')');
							return false;
						}
						else
							if (!_list[_x][1])
								_uciWrite('info string This error was awaited by the quality test plan');
					}
				}
				_uciWrite('info string Info : the quality check is successfully completed with no error');
			}
			else
			{
				_list = ['B', 'i', 'y', 'u', 'b', 'I'];
				for (_j=0 ; _j<_list.length ; _j++)
					_uciWrite('info string '+_list[_j]+' = '+eval(_list[_j]));
			}
			break;
		}
	}
	
	return true;
}

function _uciReset()
{
	var _k;

	//-- Variables
	B = i = y = u = b = 0;				// That's the letters of the original author's email address :-)
	I = [];

	//-- Constants
	G = 120;
	x = 10;
	z = 15;
	M = 10000;
	l = [5, 3, 4, 6, 2, 4, 3, 5, 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 9, 9, 9, 9, 9, 9, 13, 11, 12, 14, 10, 12, 11, 13, 0, 99, 0, 306, 297, 495, 846, -1, 0, 1, 2, 2, 1, 0, -1, -1, 1, -10, 10, -11, -9, 9, 11, 10, 20, -9, -11, -10, -20, -21, -19, -12, -8, 8, 12, 19, 21];

	//-- Resets the board
	for (_k=0 ; _k < 120 ; _k++)
		I[_k] = ((_k >= 21) && (_k <= 98) && ((_k-20)%10>0) && ((_k-20)%10<9)) ? 0 : 7;
}

function _uciLoadFen(pFen)
{
	var	_list, _car, _black, _piece, _cast, _obj,
		_i, _x, _y, _initial;

	//-- Checks
	if (pFen.length === 0)
		return false;

	//-- Splits the input parameter
	_list = pFen.trim().split(' ');
	if (_list[0].split('/').length != 8)
		return false;

	//-- Castling
	_cast = [
		{	index : 0,																	//White
			rook  : [_list[2].match(/Q/)!==null, _list[2].match(/K/)!==null],
			row   : 7,
			kingC : 0
		},
		{	index : 0,																	//Black
			rook  : [_list[2].match(/q/)!==null, _list[2].match(/k/)!==null],
			row   : 0,
			kingC : 0
		}
	];
	_cast[0].king = (_cast[0].rook[0] || _cast[0].rook[1]);
	_cast[1].king = (_cast[1].rook[0] || _cast[1].rook[1]);

	//-- Loads the main position
	_uciReset();
	_x = 0;
	_y = 0;
	for (_i=0 ; _i<_list[0].length ; _i++)
	{
		_car = _list[0].charAt(_i);
		if ('12345678'.indexOf(_car) != -1)
			_x += parseInt(_car);
		else if (_car == '/')
		{
			_x = 0;
			_y++;
		}
		else if ('prnbqk'.indexOf(_car.toLowerCase()) != -1)
		{
			if (_x > 7)
				return false;
			else
			{
				_black = (_car == _car.toLowerCase());
				_piece = ' pknbrq'.indexOf(_car.toLowerCase());
				_obj = _cast[_black&1];
				if (_piece == 2)
					_obj.kingC++;
				if (	((_piece == 1) && (_y == (_black?1:6))) ||						//Pawn
						((_piece == 2) && _obj.king) ||									//King
						((_piece == 5) && _obj.rook[_obj.index] && (_y == _obj.row))	//Rook
					)
				{
					_initial = 16;
					if (_piece == 5)
						_obj.rook[_obj.index] = false;
					if (_piece == 2)
						_obj.index = 1;
				}
				else
					_initial = 0;
				I[21+10*_y+_x] = _initial | (_black ? 0 : 8) | _piece;
				_x++;
			}
		}
		else
			return false;
	}

	//-- Current player
	y = (_list[1].toLowerCase() == 'b' ? 8 : 0);

	//-- En passant
	u = (_list[3] == '-' ? 0 : _uciCoordinateToId(_list[3]) + (y==8 ? -10 : 10));

	return ((_cast[0].kingC == 1) && (_cast[1].kingC == 1));
}

function _uciCoordinateToId(pCoordinate)
{
	return 21 + 10*(8-parseInt(pCoordinate.substring(1))) + 'abcdefgh'.indexOf(pCoordinate.substring(0,1).toLowerCase());
}

function _uciIdToCoordinate(pId)
{
	var	_x = (pId-21)%10,
		_y = Math.floor((pId-21)/10);
	return 'abcdefgh'[_x]+(8-_y);
}

function _uciMove(pMove)
{
	var _idx, _y;
	_y = y;
	B = _uciCoordinateToId(pMove.substring(0,2));
	b = _uciCoordinateToId(pMove.substring(2,4));
	i = I[B] & z;
	if ((i & 7) == 1 & (b < 29 | b > 90))
	{
		_idx = 'qrbn'.indexOf(pMove.substring(4,5));
		if (_idx == -1)
			_idx = 0;
		i = (14 - _idx) ^ y;
	}
	X(0, 0, 0, 21, u, 1);
	return (y != _y);
}
