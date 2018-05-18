function PrSq(sq) {

    return (FileChar[FilesBrd[sq]] + RankChar[RanksBrd[sq]]);

}

function PrMove(move) {
    var MyStr;

    var ff = FilesBrd[FROMSQ(move)];
    var rf = RanksBrd[FROMSQ(move)];
    var ft = FilesBrd[TOSQ(move)];
    var rt = RanksBrd[TOSQ(move)];

    MyStr = FileChar[ff] + RankChar[rf] + FileChar[ft] + RankChar[rt];

    var promoted = PROMOTED(move);

    if (promoted !== PIECES.EMPTY) {
        var pchar = 'q';
        if (PieceKnight[promoted]) {
            pchar = 'n';
        } else if (PieceRookQueen[promoted] === true && PieceBishopQueen[promoted] === false){
            pchar = 'r';
        } else if (PieceRookQueen[promoted] === false && PieceBishopQueen[promoted] === true) {
            pchar = 'b';
        }
        MyStr += pchar;
    }
    return MyStr;
}

function PrintMoveList() {
    var index;
    var move;
    console.log('MoveList:');

    for (index = GameBoard.moveListStart[GameBoard.ply]; index < GameBoard.moveListStart[GameBoard.ply + 1]; index++) {
        move = GameBoard.moveList[index];
        console.log(PrMove(move));
    }
}