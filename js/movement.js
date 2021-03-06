function MoveExists(move) {

    GenerateMoves();

    var index;
    var moveFound = NOMOVE;
    for (index = GameBoard.moveListStart[GameBoard.ply]; index < GameBoard.moveListStart[GameBoard.ply + 1]; index++) {
        moveFound = GameBoard.moveList[index];
        if (MakeMove(moveFound) === false) {
            continue;
        }
        TakeMove();
        if (move === moveFound) {
            return true;
        }
    }
    return false;
}


function MOVE(from, to, captured, promoted, flag) {
    return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function AddNormalMove(move) {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] = 0;
}

function AddCaptureMove(move) {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] = 0;
}

function AddEnPassantMove(move) {
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]++] = 0;
}

function AddWhitePawnCaptureMove(from, to, cap) {
    if (RanksBrd[from] === RANKS.RANK_7) {
        AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
    } else {
        AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

function AddBlackPawnCaptureMove(from, to, cap) {
    if (RanksBrd[from] === RANKS.RANK_2) {
        AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
        AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
    } else {
        AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
    }
}

function AddWhitePawnNormalMove(from, to) {
    if (RanksBrd[from] === RANKS.RANK_7) {
        AddNormalMove(MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0));
        AddNormalMove(MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0));
        AddNormalMove(MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0));
        AddNormalMove(MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0));
    } else {
        AddNormalMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

function AddBlackPawnNormalMove(from, to) {
    if (RanksBrd[from] === RANKS.RANK_2) {
        AddNormalMove(MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0));
        AddNormalMove(MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0));
        AddNormalMove(MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0));
        AddNormalMove(MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0));
    } else {
        AddNormalMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
    }
}

function GenerateMoves() {
    GameBoard.moveListStart[GameBoard.ply + 1] = GameBoard.moveListStart[GameBoard.ply];
    var sq;
    var pce;
    var pceType;
    var pceNum;
    var pceIndex;
    var t_sq;
    var dir;


    if (GameBoard.side === COLOURS.WHITE) {
        pceType = PIECES.wP;

        for (pceNum = 0; pceNum < GameBoard.pceNum[pceType]; pceNum++) {
            sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];

            if (GameBoard.pieces[sq + 10] === PIECES.EMPTY) {
                AddWhitePawnNormalMove(sq, sq + 10);
                if (RanksBrd[sq] === RANKS.RANK_2 && GameBoard.pieces[sq + 20] === PIECES.EMPTY) {
                    AddNormalMove(MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }
            if (SQOFFBOARD(sq + 9) === false && PieceCol[GameBoard.pieces[sq + 9]] === COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq + 9]);
            }
            if (SQOFFBOARD(sq + 11) === false && PieceCol[GameBoard.pieces[sq + 11]] === COLOURS.BLACK) {
                AddWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq + 11]);
            }
            if (GameBoard.enPas !== SQUARES.NO_SQ) {
                if (sq + 9 === GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
                if (sq + 11 === GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
        if (GameBoard.castlePerm & CASTLEBIT.WKCA) {
            if (GameBoard.pieces[SQUARES.F1] === PIECES.EMPTY && GameBoard.pieces[SQUARES.G1] === PIECES.EMPTY) {
                if (SqAttacked(SQUARES.F1, COLOURS.BLACK) === false && SqAttacked(SQUARES.E1, COLOURS.BLACK) === false) {
                    AddNormalMove(MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
        if (GameBoard.castlePerm & CASTLEBIT.WQCA) {
            if (GameBoard.pieces[SQUARES.D1] === PIECES.EMPTY && GameBoard.pieces[SQUARES.C1] === PIECES.EMPTY
            && GameBoard.pieces[SQUARES.B1] === PIECES.EMPTY) {
                if (SqAttacked(SQUARES.D1, COLOURS.BLACK) === false && SqAttacked(SQUARES.E1, COLOURS.BLACK) === false) {
                    AddNormalMove(MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
        pceIndex = LoopNonSlideIndex[GameBoard.side];
        pce = LoopNonSlidePce[pceIndex++];

        while (pce !== 0) {
            for (pceNum = 0; pceNum < GameBoard.pceNum[pce]; pceNum++) {
                sq = GameBoard.pList[PCEINDEX(pce, pceNum)];

                for (index = 0; index < DirNum[pce]; index++) {
                    dir = PceDir[pce][index];
                    t_sq = sq + dir;

                    // TODO: check if this is redundant
                    if (SQOFFBOARD(t_sq) === true) {
                        continue;
                    }

                    if (GameBoard.pieces[t_sq] !== PIECES.EMPTY) {
                        if (PieceCol[GameBoard.pieces[t_sq]] !== GameBoard.side) {
                            AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, MFLAGCAP));
                        }
                    } else {
                        AddNormalMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                    }
                }
            }
            pce = LoopNonSlidePce[pceIndex++]; //TODO: make sure this is in the right spot
        }

        pceIndex = LoopSlideIndex[GameBoard.side];
        pce = LoopSlidePce[pceIndex++];

        while (pce !== 0) {
            for (pceNum = 0; pceNum < GameBoard.pceNum[pce]; pceNum++) {
                sq = GameBoard.pList[PCEINDEX(pce, pceNum)];

                for (index = 0; index < DirNum[pce]; index++) {
                    dir = PceDir[pce][index];
                    t_sq = sq + dir;

                    while (SQOFFBOARD(t_sq) === false) {
                        if (GameBoard.pieces[t_sq] !== PIECES.EMPTY) {
                            if (PieceCol[GameBoard.pieces[t_sq]] !== GameBoard.side) {
                                AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, MFLAGCAP));
                            }
                            break;
                        }
                        AddNormalMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                        t_sq += dir;
                    }
                }
            }
            pce = LoopSlidePce[pceIndex++]; //TODO: make sure this is in the right spot
        }


    } else if (GameBoard.side === COLOURS.BLACK) {
        pceType = PIECES.bP;

        for (pceNum = 0; pceNum < GameBoard.pceNum[pceType]; pceNum++) {
            sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];

            if (GameBoard.pieces[sq - 10] === PIECES.EMPTY) {
                AddBlackPawnNormalMove(sq, sq - 10);
                if (RanksBrd[sq] === RANKS.RANK_7 && GameBoard.pieces[sq - 20] === PIECES.EMPTY) {
                    AddNormalMove(MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
                }
            }
            if (SQOFFBOARD(sq - 9) === false && PieceCol[GameBoard.pieces[sq - 9]] === COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq - 9]);
            }
            if (SQOFFBOARD(sq - 11) === false && PieceCol[GameBoard.pieces[sq - 11]] === COLOURS.WHITE) {
                AddBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq - 11]);
            }
            if (GameBoard.enPas !== SQUARES.NO_SQ) {
                if (sq - 9 === GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP))
                }
                if (sq - 11 === GameBoard.enPas) {
                    AddEnPassantMove(MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
                }
            }
        }
        if (GameBoard.castlePerm & CASTLEBIT.BKCA) {
            if (GameBoard.pieces[SQUARES.F8] === PIECES.EMPTY && GameBoard.pieces[SQUARES.G8] === PIECES.EMPTY) {
                if (SqAttacked(SQUARES.F8, COLOURS.BLACK) === false && SqAttacked(SQUARES.E8, COLOURS.BLACK) === false) {
                    AddNormalMove(MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
        if (GameBoard.castlePerm & CASTLEBIT.BQCA) {
            if (GameBoard.pieces[SQUARES.D8] === PIECES.EMPTY && GameBoard.pieces[SQUARES.C8] === PIECES.EMPTY
                && GameBoard.pieces[SQUARES.B8] === PIECES.EMPTY) {
                if (SqAttacked(SQUARES.D8, COLOURS.BLACK) === false && SqAttacked(SQUARES.E8, COLOURS.BLACK) === false) {
                    AddNormalMove(MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
                }
            }
        }
    }

    // get pce for side bN, bK

}