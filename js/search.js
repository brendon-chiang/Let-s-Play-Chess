var SearchController = {};

SearchController.nodes;
SearchController.fh;
SearchController.fhf;
SearchController.depth;
SearchController.time;
SearchController.start;
SearchController.stop;
SearchController.best;
SearchController.thinking;

function ClearPvTable() {

    for (index = 0; index < PVENTRIES; index++) {
        GameBoard.PvTable[index].move = NOMOVE;
        GameBoard.PvTable[index].posKey = 0;
    }
}

function CheckUp() {
    if (($.now() - SearchController.start ) > SearchController.time) {
        SearchController.stop === true;
    }
}

function IsRepetition() {
    for (var index = GameBoard.hisPly - GameBoard.fiftyMove; index < GameBoard.hisPly - 1; index++) {
        if(GameBoard.posKey === GameBoard.history[index].posKey) {
            return true;
        }
    }

    return false;
}

function Quiescence(alpha, beta) {

    if ((SearchController.nodes & 2047) === 0) {
        CheckUp();
    }

    SearchController.nodes++;

    if( (IsRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply !== 0) {
        return 0;
    }

    if(GameBoard.ply > MAXDEPTH -1) {
        return EvalPosition();
    }

    var Score = EvalPosition();

    if(Score >= beta) {
        return beta;
    }

    if(Score > alpha) {
        alpha = Score;
    }

    GenerateCaptures();

    var MoveNum = 0;
    var Legal = 0;
    var OldAlpha = alpha;
    var BestMove = NOMOVE;
    var Move = NOMOVE;

    /* Get PvMove */
    /* Order PvMove */

    for (MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; MoveNum++) {

        /* Pick Next Best Move */

        Move = GameBoard.moveList[MoveNum];

        if (MakeMove(Move) === false) {
            continue;
        }
        Legal++;
        Score = -Quiescence( -beta, -alpha);

        TakeMove();

        if (SearchController.stop) {
            return 0;
        }

        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal == 1) {
                    SearchController.fhf++;
                }
                SearchController.fh++;
                return beta;
            }
            alpha = Score;
            BestMove = Move;
        }
    }

    if (alpha !== OldAlpha) {
        StorePvMove(BestMove);
    }

    return alpha;

}

function AlphaBeta(alpha, beta, depth) {


    if (depth <= 0) {
        return Quiescence(alpha, beta);
    }

    if ((SearchController.nodes & 2047) == 0) {
        CheckUp();
    }

    SearchController.nodes++;

    if ((IsRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply != 0) {
        return 0;
    }

    if (GameBoard.ply > MAXDEPTH -1) {
        return EvalPosition();
    }

    var InCheck = SqAttacked(GameBoard.pList[PCEINDEX(Kings[GameBoard.side],0)], GameBoard.side^1);
    if (InCheck === true)  {
        depth++;
    }

    var Score = -Infinity;

    GenerateMoves();

    var MoveNum = 0;
    var Legal = 0;
    var OldAlpha = alpha;
    var BestMove = NOMOVE;
    var Move = NOMOVE;

    /* Get PvMove */
    /* Order PvMove */

    for (MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply + 1]; MoveNum++) {

        /* Pick Next Best Move */

        Move = GameBoard.moveList[MoveNum];

        if (MakeMove(Move) === false) {
            continue;
        }
        Legal++;
        Score = -AlphaBeta( -beta, -alpha, depth-1);

        TakeMove();

        if (SearchController.stop === true) {
            return 0;
        }

        if (Score > alpha) {
            if (Score >= beta) {
                if (Legal === 1) {
                    SearchController.fhf++;
                }
                SearchController.fh++;
                /* Update Killer Moves */

                return beta;
            }
            alpha = Score;
            BestMove = Move;
            /* Update History Table */
        }
    }

    if (Legal === 0) {
        if (InCheck === true) {
            return -MATE + GameBoard.ply;
        } else {
            return 0;
        }
    }

    if (alpha !== OldAlpha) {
        StorePvMove(BestMove);
    }

    return alpha;
}

function ClearForSearch() {
    var index;
    for(index = 0; index < 14 * BOARD_SQUARE_NUM; index++) {
        GameBoard.searchHistory[index] = 0;
    }

    for(index = 0; index < 3 * MAXDEPTH; index++) {
        GameBoard.searchKillers[index] = 0;
    }

    ClearPvTable();
    GameBoard.ply = 0;
    SearchController.nodes = 0;
    SearchController.fh = 0;
    SearchController.fhf = 0;
    SearchController.start = $.now();
    SearchController.stop = false;
}

function SearchPosition() {

    var bestMove = NOMOVE;
    var bestScore = -Infinity;
    var currentDepth = 0;
    var line;
    var PvNum;
    var c;
    ClearForSearch();

    for( currentDepth = 1; currentDepth <= /*SearchController.depth*/ 5; currentDepth++) {

        bestScore = AlphaBeta(-Infinity, Infinity, currentDepth);

        if (SearchController.stop === true) {
            break;
        }

        bestMove = ProbePvTable();
        line = 'D:' + currentDepth + ' Best:' + PrMove(bestMove) + ' Score:' + bestScore +
            ' nodes:' + SearchController.nodes;

        PvNum = GetPvLine(currentDepth);
        line += ' Pv:';
        for (c = 0; c < PvNum; c++) {
            line += ' ' + PrMove(GameBoard.PvArray[c]);
        }
        console.log(line);

    }


    SearchController.best = bestMove;
    SearchController.thinking = false;

}
































