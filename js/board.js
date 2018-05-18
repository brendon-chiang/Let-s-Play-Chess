function PCEINDEX(pce, pceNum) {
    return (pce * 10 + pceNum);
}

var GameBoard = {};

GameBoard.pieces = new Array(BOARD_SQUARE_NUM);
GameBoard.side = COLOURS.WHITE;
GameBoard.fiftyMove = 0;
GameBoard.hisPly = 0; // Total moves made in the game
GameBoard.history = [];
GameBoard.ply = 0; // Half of hisPly
GameBoard.enPas = 0;
GameBoard.castlePerm = 0;
GameBoard.material = new Array(2); // WHITE, BLACK material of pieces
GameBoard.pceNum = new Array(13); // indexed by Pce
GameBoard.PvTable = [];
GameBoard.PvArray = new Array(MAXDEPTH);
GameBoard.searchHistory = new Array( 14 * BOARD_SQUARE_NUM);
GameBoard.searchKillers = new Array(3 * MAXDEPTH);

/*
pce * 10 + pceNum  <--- pceIndex Number

ie., pceNum[bP] = 4

for(num = 0 to 3) {
    bP * 10 + num; 70, 71, 72, 73
    sq = pList[70]...


 */
GameBoard.pList = new Array(14*10);
GameBoard.posKey = 0; // Help detect repetition to end game

GameBoard.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveListStart = new Array(MAXDEPTH);

// DEBUGGER
function CheckBoard() {

    var t_pceNum = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var t_material = [ 0, 0];
    var sq64, t_piece, t_pce_num, sq120, colour, pcount;

    for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
        for(t_pce_num = 0; t_pce_num < GameBoard.pceNum[t_piece]; t_pce_num++) {
            sq120 = GameBoard.pList[PCEINDEX(t_piece,t_pce_num)];
            if (GameBoard.pieces[sq120] !== t_piece) {
                console.log('Error Pce Lists');
                return false;
            }
        }
    }

    // Make sure pceCounter and material is correct
    for (sq64 = 0; sq64 < 64; ++sq64) {
        sq120 = SQ120(sq64);
        t_piece = GameBoard.pieces[sq120];
        t_pceNum[t_piece]++;
        t_material[PieceCol[t_piece]] += PieceVal[t_piece];
    }

    for (t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
        if(t_pceNum[t_piece] !== GameBoard.pceNum[t_piece]) {
            console.log('Error t_pceNum');
            return false;
        }
    }

    if (t_material[COLOURS.WHITE] !== GameBoard.material[COLOURS.WHITE] ||
        t_material[COLOURS.BLACK] !== GameBoard.material[COLOURS.BLACK]) {
        console.log('Error t_material');
        return false;
    }

    if(GameBoard.side!==COLOURS.WHITE && GameBoard.side!==COLOURS.BLACK) {
        console.log('Error GameBoard.side');
        return false;
    }

    if(GeneratePosKey()!==GameBoard.posKey) {
        console.log('Error GameBoard.posKey');
        return false;
    }
    return true;
}


function PrintBoard() {

    var sq,file,rank,piece;
    console.log("\nGame Board:\n");
    for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        var line = (RankChar[rank] + "   ");
        for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FileRankToSquare(file,rank);
            piece = GameBoard.pieces[sq];
            line += (" " + PceChar[piece] + " ");
        }
        console.log(line);
    }

    console.log("");
    var line = "   ";
    for(file = FILES.FILE_A; file <= FILES.FILE_H; file++){
        line += (' ' + FileChar[file] + ' ');
    }

    console.log(line);
    console.log("side:" + SideChar[GameBoard.side]);
    console.log("enPas:" + GameBoard.enPas);
    line = "";

    if(GameBoard.castlePerm & CASTLEBIT.WKCA) line += 'K';
    if(GameBoard.castlePerm & CASTLEBIT.WQCA) line += 'Q';
    if(GameBoard.castlePerm & CASTLEBIT.BKCA) line += 'k';
    if(GameBoard.castlePerm & CASTLEBIT.BQCA) line += 'q';
    console.log("castle:" + line);
    console.log("key: " + GameBoard.posKey.toString(16));
}

function GeneratePosKey() {

    var finalKey = 0;
    var piece = PIECES.EMPTY;

    for (var sq = 0; sq < BOARD_SQUARE_NUM; sq ++) {
        piece = GameBoard.pieces[sq];
        if (piece !== PIECES.EMPTY && piece !== SQUARES.OFF_BOARD) {
                finalKey ^= PieceKeys[(piece * 120) + sq];
        }
    }

    if(GameBoard.side === COLOURS.WHITE) {
        finalKey ^= SideKey;
    }

    if(GameBoard.enPas !== SQUARES.NO_SQ) {
        finalKey ^= PieceKeys[GameBoard.enPas];
    }

    finalKey ^= CastleKeys[GameBoard.castlePerm];

    return finalKey;
}

function PrintPieceLists() {

    var piece, pceNum;

    for(piece = PIECES.wP; piece <= PIECES.bK; piece++) {
        for(pceNum = 0; pceNum < GameBoard.pceNum[piece]; pceNum++) {
            console.log('Piece ' + PceChar[piece] + ' on ' + PrSq(GameBoard.pList[PCEINDEX(piece,pceNum)]));
        }
    }
}

function UpdateListsMaterial() {

    var piece,sq,index,colour;

    // TODO: May need to come back to add for loops
    for(index = 0; index < GameBoard.pList.length; index++) {
        GameBoard.pList[index] = PIECES.EMPTY;
    }

    for(index = 0; index < GameBoard.material.length; index++) {
        GameBoard.material[index] = 0;
    }

    for(index = 0; index < GameBoard.pceNum.length; index++) {
        GameBoard.pceNum[index] = 0;
    }
    // TODO: May have to move the above for loops back into ResetBoard();
    for(index = 0; index < 64; index++) {
        sq = SQ120(index);
        piece = GameBoard.pieces[sq];
        if(piece !== PIECES.EMPTY) {
            colour = PieceCol[piece];

            GameBoard.material[colour] += PieceVal[piece];

            GameBoard.pList[PCEINDEX(piece,GameBoard.pceNum[piece])] = sq;
            GameBoard.pceNum[piece]++
        }
    }
}


function ResetBoard() {


    for(index = 0; index < BOARD_SQUARE_NUM; index++) {
        GameBoard.pieces[index] = SQUARES.OFF_BOARD;
    }

    for(index = 0; index < 64; index++) {
        GameBoard.pieces[SQ120(index)] = PIECES.EMPTY;
    }


    GameBoard.side = COLOURS.BOTH;
    GameBoard.enPas = SQUARES.NO_SQ;
    GameBoard.fiftyMove = 0;
    GameBoard.ply = 0;
    GameBoard.hisPly = 0;
    GameBoard.castlePerm = 0;
    GameBoard.posKey = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0; // TODO: come back to this later

}

function ParseFen(fen) {

    ResetBoard();

    var rank = RANKS.RANK_8;
    var file = FILES.FILE_A;
    var piece = 0;
    var count = 0;
    var i = 0;
    var sq120 = 0;
    var fenCnt = 0; // fen[fenCnt]
    const TOTAL_CASTLES = 4;

    // TODO: Apparently in FEN if you can omit the remaining empty spaces at the end. This doesn't do that
    while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
        count = 1;
        switch (fen[fenCnt]) {
            case 'p': piece = PIECES.bP; break;
            case 'r': piece = PIECES.bR; break;
            case 'n': piece = PIECES.bN; break;
            case 'b': piece = PIECES.bB; break;
            case 'k': piece = PIECES.bK; break;
            case 'q': piece = PIECES.bQ; break;
            case 'P': piece = PIECES.wP; break;
            case 'R': piece = PIECES.wR; break;
            case 'N': piece = PIECES.wN; break;
            case 'B': piece = PIECES.wB; break;
            case 'K': piece = PIECES.wK; break;
            case 'Q': piece = PIECES.wQ; break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.EMPTY;
                count = Number(fen[fenCnt]);
                break;

            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                continue;
            default:
                console.log("FEN error");
                return;

        }

        for(i = 0; i < count; i++) {
            sq120 = FileRankToSquare(file, rank);
            GameBoard.pieces[sq120] = piece;
            file++;
        }
        fenCnt++;
    } // while loop ends

    GameBoard.side = (fen[fenCnt] === 'w') ? COLOURS.WHITE : COLOURS.BLACK; // which side to play
    fenCnt += 2; // Which side to castle

    for (i = 0; i < TOTAL_CASTLES; i++) {
        if (fen[fenCnt] === ' ') {
            break;
        }
        switch(fen[fenCnt]) {
            case 'K': GameBoard.castlePerm |= CASTLEBIT.WKCA; break;
            case 'Q': GameBoard.castlePerm |= CASTLEBIT.WQCA; break;
            case 'k': GameBoard.castlePerm |= CASTLEBIT.BKCA; break;
            case 'q': GameBoard.castlePerm |= CASTLEBIT.BQCA; break;
            default: break;
        }
        fenCnt++;
    }
    fenCnt++;

    // TODO: check if it is a valid. We assume it's correct
    if (fen[fenCnt] !== '-') {
        file = toString(fen[fenCnt]);
        rank = Number(fen[fenCnt + 1]);
        console.log("fen[fenCnt]: " + fen[fenCnt] + " File: " + file + " Rank: " + rank);
        GameBoard.enPas = FileRankToSquare(file, rank);

    }
    GameBoard.posKey = GeneratePosKey();
    UpdateListsMaterial();
    PrintSqAttacked();
}

function PrintSqAttacked() {

    var sq,file,rank,piece;

    console.log("\nAttacked:\n");

    for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
        var line =((rank+1) + "  ");
        for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FileRankToSquare(file,rank);
            if (SqAttacked(sq, GameBoard.side) === true) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        console.log(line);
    }
    console.log("");
}

function SqAttacked(sq, side) {
    var pce;
    var t_sq;
    var index;

    if (side === COLOURS.WHITE) {
        // PAWNS
        if (GameBoard.pieces[sq - 11] === PIECES.wP || GameBoard.pieces[sq - 9] === PIECES.wP) {
            return true;
        }
    } else if (side === COLOURS.BLACK) {
        if (GameBoard.pieces[sq + 11] === PIECES.bP || GameBoard.pieces[sq + 9] === PIECES.bP) {
            return true;
        }
    }

    // KNIGHT
    for (index = 0; index < 8; index++) {
        pce = GameBoard.pieces[sq + KnDir[index]];
        if (pce !== SQUARES.OFF_BOARD && PieceCol[pce] === side && PieceKnight[pce] === true) {
            return true;
        }
    }

    // ROOKS & QUEEN
    for (index = 0; index < 4; index++) {
        dir = RkDir[index];
        t_sq = sq + dir;
        pce = GameBoard.pieces[t_sq];
        while ( pce !== SQUARES.OFF_BOARD) {
            if (pce !== PIECES.EMPTY) {
                if (PieceRookQueen[pce] === true && PieceCol[pce] === side) {
                    return true;
                }
                break;
            }
            t_sq += dir;
            pce = GameBoard.pieces[t_sq];
        }
    }

    // BISHOP & QUEEN
    for (index = 0; index < 4; index++) {
        dir = BiDir[index];
        t_sq = sq + dir;
        pce = GameBoard.pieces[t_sq];
        while ( pce !== SQUARES.OFF_BOARD) {
            if (pce !== PIECES.EMPTY) {
                if (PieceBishopQueen[pce] === true && PieceCol[pce] === side) {
                    return true;
                }
                break;
            }
            t_sq += dir;
            pce = GameBoard.pieces[t_sq];
        }
    }

    // KING
    for (index = 0; index < 8; index++) {
        pce = GameBoard.pieces[sq + KiDir[index]];
        if (pce !== SQUARES.OFF_BOARD && PieceCol[pce] === side && PieceKing[pce] === true) {
            return true;
        }
    }

}
