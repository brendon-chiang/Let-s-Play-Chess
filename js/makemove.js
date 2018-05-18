// I will 100% forget this.
// We move the piece to remove to the end of the array, and shorten the array length by 1 to remove.
function ClearPiece(sq) {

    var pce = GameBoard.pieces[sq];
    var col = PieceCol[pce];
    var index;
    var t_pceNum = -1;

    HASH_PCE(pce, sq);

    GameBoard.pieces[sq] = PIECES.EMPTY;
    GameBoard.material[col] -= PieceVal[pce];

    for (index = 0; index < GameBoard.pceNum[pce]; index++) {
        if (GameBoard.pList[PCEINDEX(pce, index)] === sq){
            t_pceNum = index;
            break;
        }
    }

    GameBoard.pceNum[pce]--;
    GameBoard.pList[PCEINDEX(pce, t_pceNum)] = GameBoard.pList[PCEINDEX(pce, GameBoard.pceNum[pce])];
}

function AddPiece(sq, pce) {

    var col = PieceCol[pce];

    HASH_PCE(pce, sq);

    GameBoard.pieces[sq] = pce;
    GameBoard.material[col] += PieceVal[pce];
    GameBoard.pList[PCEINDEX(pce, GameBoard.pceNum[pce])] = sq;
    GameBoard.pceNum[pce]++;

}

function MovePiece(from, to) {

    var index = 0;
    var pce = GameBoard.pieces[from];

    HASH_PCE(pce, from);
    GameBoard.pieces[from] = PIECES.EMPTY;

    HASH_PCE(pce, to);
    GameBoard.pieces[to] = pce;

    for (index = 0; index < GameBoard.pceNum[pce]; index++) {
        if (GameBoard.pList[PCEINDEX(pce, index)] === from) {
            GameBoard.pList[PCEINDEX(pce, index)] = to;
            break;
        }
    }
}

function MakeMove(move) {

    var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = GameBoard.side;

    GameBoard.history[GameBoard.hisPly].posKey = GameBoard.posKey;

    if ((move & MFLAGEP) !== 0) {
        if(side === COLOURS.WHITE) {
            ClearPiece(to-10);
        } else {
            ClearPiece(to+10);
        }
    } else if ((move & MFLAGCA) !== 0) {
        switch(to) {
            case SQUARES.C1:
                MovePiece(SQUARES.A1, SQUARES.D1);
                break;
            case SQUARES.C8:
                MovePiece(SQUARES.A8, SQUARES.D8);
                break;
            case SQUARES.G1:
                MovePiece(SQUARES.H1, SQUARES.F1);
                break;
            case SQUARES.G8:
                MovePiece(SQUARES.H8, SQUARES.F8);
                break;
            default: break;
        }
    }

    if (GameBoard.enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    GameBoard.history[GameBoard.hisPly].move = move;
    GameBoard.history[GameBoard.hisPly].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.hisPly].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.hisPly].castlePerm = GameBoard.castlePerm;

    GameBoard.castlePerm &= CastlePerm[from];
    GameBoard.castlePerm &= CastlePerm[to];
    GameBoard.enPas = SQUARES.NO_SQ;

    HASH_CA();

    var captured = CAPTURED(move);
    GameBoard.fiftyMove++;

    if (captured !== PIECES.EMPTY) {
        ClearPiece(to);
        GameBoard.fiftyMove = 0;
    }

    GameBoard.hisPly++;
    GameBoard.ply++;

    if (PiecePawn[GameBoard.pieces[from]] === true) {
        GameBoard.fiftyMove = 0;
        if ((move & MFLAGPS) !== 0) {
            if (side === COLOURS.WHITE) {
                GameBoard.enPas = from + 10;
            } else {
                GameBoard.enPas = from - 10;
            }
            HASH_EP();
        }
    }

    MovePiece(from, to);

    var prPce = PROMOTED(move);
    if (prPce !== PIECES.EMPTY)   {
        ClearPiece(to);
        AddPiece(to, prPce);
    }

    GameBoard.side ^= 1;
    HASH_SIDE();

    if (SqAttacked(GameBoard.pList[PCEINDEX(Kings[side],0)], GameBoard.side))  {
        // TakeMove();
        return false;
    }

    return true;
}

// UNDO MOVE
function TakeMove() {

    GameBoard.hisPly--;
    GameBoard.ply--;

    var move = GameBoard.history[GameBoard.hisPly].move;
    var from = FROMSQ(move);
    var to = TOSQ(move);

    if (GameBoard.enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    GameBoard.castlePerm = GameBoard.history[GameBoard.hisPly].castlePerm;
    GameBoard.fiftyMove = GameBoard.history[GameBoard.hisPly].fiftyMove;
    GameBoard.enPas = GameBoard.history[GameBoard.hisPly].enPas;

    if (GameBoard.enPas !== SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    GameBoard.side ^= 1;
    HASH_SIDE();

    if ((MFLAGEP & move) !== 0) {
        if (GameBoard.side === COLOURS.WHITE) {
            AddPiece(to - 10, PIECES.bP);
        } else {
            AddPiece(to + 10, PIECES.wP);
        }
    } else if ((MFLAGCA & move) !== 0) {
        // TODO: Check to make sure pieces on D1, D8, F1, F8 are rooks... pretty sure they are
        switch (to) {
            case SQUARES.C1: MovePiece(SQUARES.D1, SQUARES.A1); break;
            case SQUARES.C8: MovePiece(SQUARES.D8, SQUARES.A8); break;
            case SQUARES.G1: MovePiece(SQUARES.F1, SQUARES.H1); break;
            case SQUARES.G8: MovePiece(SQUARES.F8, SQUARES.H8); break;
            default: break;
        }
    }
    MovePiece(to, from);

    var captured = CAPTURED(move);
    if (captured !== PIECES.EMPTY) {
        AddPiece(to, captured);
    }
    if (PROMOTED(move) !== PIECES.EMPTY) {
        ClearPiece(from);
        AddPiece(from, (PieceCol[PROMOTED(move)] === COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }

}

function GenerateCaptures() {
    GameBoard.moveListStart[GameBoard.ply+1] = GameBoard.moveListStart[GameBoard.ply];

    var pceType;
    var pceNum;
    var sq;
    var pceIndex;
    var pce;
    var t_sq;
    var dir;

    if(GameBoard.side === COLOURS.WHITE) {
        pceType = PIECES.wP;

        for(pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceNum) {
            sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];

            if (SQOFFBOARD(sq + 9) === false && PieceCol[GameBoard.pieces[sq+9]] === COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq+9]);
            }

            if (SQOFFBOARD(sq + 11) === false && PieceCol[GameBoard.pieces[sq+11]] === COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq+11]);
            }

            if (GameBoard.enPas !== SQUARES.NO_SQ) {
                if (sq + 9 === GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq+9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
                }

                if (sq + 11 === GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq+11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
                }
            }

        }

    } else {
        pceType = PIECES.bP;

        for(pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceNum) {
            sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];

            if (SQOFFBOARD(sq - 9) === false && PieceCol[GameBoard.pieces[sq-9]] === COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq-9]);
            }

            if (SQOFFBOARD(sq - 11) === false && PieceCol[GameBoard.pieces[sq-11]] === COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq-11]);
            }

            if (GameBoard.enPas !== SQUARES.NOSQ) {
                if (sq - 9 === GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq-9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
                }

                if (sq - 11 === GameBoard.enPas) {
                    AddEnPassantMove( MOVE(sq, sq-11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
                }
            }
        }
    }

    pceIndex = LoopNonSlideIndex[GameBoard.side];
    pce = LoopNonSlidePce[pceIndex++];

    while (pce !== 0) {
        for(pceNum = 0; pceNum < GameBoard.pceNum[pce]; ++pceNum) {
            sq = GameBoard.pList[PCEINDEX(pce, pceNum)];

            for(index = 0; index < DirNum[pce]; index++) {
                dir = PceDir[pce][index];
                t_sq = sq + dir;

                if (SQOFFBOARD(t_sq) === true) {
                    continue;
                }

                if (GameBoard.pieces[t_sq] !== PIECES.EMPTY) {
                    if (PieceCol[GameBoard.pieces[t_sq]] !== GameBoard.side) {
                        AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0 ));
                    }
                }
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }

    pceIndex = LoopSlideIndex[GameBoard.side];
    pce = LoopSlidePce[pceIndex++];

    while (pce !== 0) {
        for(pceNum = 0; pceNum < GameBoard.pceNum[pce]; ++pceNum) {
            sq = GameBoard.pList[PCEINDEX(pce, pceNum)];

            for(index = 0; index < DirNum[pce]; index++) {
                dir = PceDir[pce][index];
                t_sq = sq + dir;

                while (SQOFFBOARD(t_sq) === false ) {

                    if (GameBoard.pieces[t_sq] !== PIECES.EMPTY) {
                        if (PieceCol[GameBoard.pieces[t_sq]] !== GameBoard.side) {
                            AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0 ));
                        }
                        break;
                    }
                    t_sq += dir;
                }
            }
        }
        pce = LoopSlidePce[pceIndex++];
    }
}