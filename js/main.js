$(function() {
    init();
   console.log("Main Init Called");
   ParseFen(START_FEN);
   PrintBoard();
   GenerateMoves();
   PrintMoveList();
   CheckBoard();
   MakeMove(GameBoard.moveList[0]);
   PrintBoard();
   CheckBoard();
   TakeMove();
   PrintBoard();
   CheckBoard();
});

var piece1 = RAND_32();
var piece2 = RAND_32();
var piece3 = RAND_32();
var piece4 = RAND_32();

var key = 0;
key ^= piece1;
key ^= piece2;
key ^= piece3;
key ^= piece4;
console.log("key:" + key.toString(16));
key ^= piece1;
console.log("piece1 out key:" + key.toString(16));
key = 0;
key ^= piece2;
key ^= piece3;
key ^= piece4;
console.log("no piece1:" + key.toString(16));


function InitFilesRanksBrd() {
    var file = FILES.FILE_A;
    var sq = SQUARES.A1;

    for (index = 0; index < BOARD_SQUARE_NUM; index++) {
        FilesBrd[index] = SQUARES.OFF_BOARD;
        RanksBrd[index] = SQUARES.OFF_BOARD;
    }

    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FileRankToSquare(file, rank);
            FilesBrd[sq] = file;
            RanksBrd[sq] = rank;
        }
    }
}

function InitHashKeys() {

    for(index = 0; index < 14 * 120; index++) {
        PieceKeys[index] = RAND_32();
    }
     SideKey = RAND_32();

    for (index = 0; index < 16; index++) {
        CastleKeys[index] = RAND_32();
    }
}

function InitSq120To64() {

    var file = FILES.FILE_A;
    var sq = SQUARES.A1;
    var sq64 = 0;

    for (index = 0; index < BOARD_SQUARE_NUM; index++) {
        Sq120To64[index] = 65;
    }

    for(index = 0; index < 64; index++) {
        Sq64To120[index] = 120;
    }

    for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; rank++) {
        for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
            sq = FileRankToSquare(file, rank); // sq = 0 if FileRankToSquare(3, 3)
            Sq64To120[sq64] = sq;  // sq64 @ A1 = 0, but (FILE_A, RANK_1) returns 21
            Sq120To64[sq] = sq64; // now sq = 21, but to sq64 makes it 0 again
            sq64++;
        }
    }
}

function InitBoardVars() {
    for (index = 0; index < MAXGAMEMOVE; index++) {
        GameBoard.history.push({
            move: NOMOVE,
            castlePerm : 0,
            enPas : 0,
            fiftyMove : 0,
            posKey : 0
        });
    }
    for (index = 0; index < PVENTRIES; index++) {
        GameBoard.PvTable.push({
            move : NOMOVE,
            posKey : 0
        });
    }
}

function InitBoardSquares() {
    var light = 1;
    var rankName;
    var fileName;
    var divString;
    var rankIter;
    var fileIter;
    var lightString;

    for (rankIter = RANKS.RANK_8; rankIter >= RANKS.RANK_1; rankIter--) {
        light ^= 1;
        rankName = "rank" + (rankIter + 1);
        for (fileIter = FILES.FILE_A; fileIter <= FILES.FILE_H; fileIter++) {
            fileName = "file" + (fileIter + 1);
            if (light === 0) lightString = "Light";
            else lightString = "Dark";
            light ^= 1;
            divString = "<div class=\"Square " + rankName + " " + fileName + " " + lightString + "\"/>";
            $("#Board").append(divString);
        }
    }
}

function init() {
    console.log("init() called");
    InitFilesRanksBrd();
    InitHashKeys();
    InitSq120To64();
    InitBoardVars();
    InitBoardSquares();
}