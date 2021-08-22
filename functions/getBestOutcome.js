exports.handler = async function(event, context, callback){

    const boardString = event.queryStringParameters.board;
    //we transform the board string query parameters into an array representing the 9 positions of the game
    const board = boardString.split("");
    const player = 'x';
    const computer = 'o';
    const unoccupied = ' ';
    const numberOfXs = boardString.split(player).length-1;
    const numberOfOs = boardString.split(computer).length-1;
    const numberOfEmptySpaces = boardString.split(unoccupied).length-1;

    var isBoardValid = true;
    var winner = checkForWinner();
    //here we check if the board provided contains characters other than x o or space
    board.forEach(function(position){
        if(position!==player&&position==!computer&&position!==unoccupied){
            isBoardValid = false;
        }
    })

    //if the board is not valid or if its not Os turn we return a 400 response code with an error message
    if (board.length!==9||!isBoardValid||numberOfEmptySpaces===0||winner!==null||isNotOsTurn())
   {
     const errorMessage = "board is not valid or it isn't O's turn"
     console.log(errorMessage)
     callback(
       null,
       {
         statusCode: 400,
         body: errorMessage
       }
     )
     return
   }

   function isNotOsTurn(){
    if(numberOfOs!==numberOfXs&&numberOfOs===numberOfXs+1){
      return true;
    }
   }

    function checkForWinner(){
        var winner = null;
        if((board[0]==player&&board[1]==player&&board[2]==player)||
        (board[3]==player&&board[4]==player&&board[5]==player)||
        (board[6]==player&&board[7]==player&&board[8]==player)||
        (board[0]==player&&board[3]==player&&board[6]==player)||
        (board[1]==player&&board[4]==player&&board[7]==player)||
        (board[2]==player&&board[5]==player&&board[8]==player)||
        (board[0]==player&&board[4]==player&&board[8]==player)||
        (board[2]==player&&board[4]==player&&board[6]==player)){
            winner='x';
        }
        if((board[0]==computer&&board[1]==computer&&board[2]==computer)||
        (board[3]==computer&&board[4]==computer&&board[5]==computer)||
        (board[6]==computer&&board[7]==computer&&board[8]==computer)||
        (board[0]==computer&&board[3]==computer&&board[6]==computer)||
        (board[1]==computer&&board[4]==computer&&board[7]==computer)||
        (board[2]==computer&&board[5]==computer&&board[8]==computer)||
        (board[0]==computer&&board[4]==computer&&board[8]==computer)||
        (board[2]==computer&&board[4]==computer&&board[6]==computer)){
            winner='o';
        }
        return winner;
    
    }
    
    //if there are no more available moves and there is no winner it means there is a tie
    function checkForTie(){
        var tie = null;
        var result = checkForWinner();
        if(result==null){
           var availableMoves = getAvailableMoves();
           if(availableMoves.length==0){
               tie ='tie';
           }
        }
        return tie;
    }
    
    function getAvailableMoves() {
        var availableMoves = new Array();
        for (var i = 0; i < board.length; i++)
        {
            if (board[i] === unoccupied)
                availableMoves.push(i);
        }
        return availableMoves;
    }
    //here we look for and make the best move for the computer 
    function getBestOutcome(){
        var bestScore = -Infinity;
        var move;
        for(var i=0;i<board.length;i++){
            if(board[i]==unoccupied){
                board[i]=computer;
                var score = minimax(board,0,false);
                board[i]=unoccupied;
                if(score>bestScore){
                    bestScore=score;
                    move = i;
                }
            }
        }
        //here we assign the optimal move to the computer and we return the board as a string
        board[move]=computer;
        return board.join("");
    }
    
    //this is our lookup table for the scores
    var scores={
        'x':-100,
        'o':100,
        'tie':0
    }
    /*here is my implementation of the minimax recursive algorithm.
    basically we are looking for all the possible moves 
    for the computer AKA the maximizing player
    and we assume the human player AKA the minimizing player is playing optimally too
    if it leads to a win we add a score of 100 minus the depth
    which is the number of turns it took to get there
    if it leads to x winning we substract 100
    if it leads to a tie it doesn't affect the score
    and by doing this we assign the computer the move
    with the best score*/
    function minimax(board, depth, isMaximizing) {
        let winner = checkForWinner();
        let tie = checkForTie();
    
        if (winner !== null) {
          return scores[winner];
        }
        if (tie !== null) {
            return scores[tie];
          }
      
        if (isMaximizing) {
          var bestScore = -Infinity;
          for (var i = 0; i < board.length; i++) {
              
              if (board[i] == unoccupied) {
                board[i] = computer;
                var score = minimax(board, depth + 1, false)-depth;
                board[i] = unoccupied;
                bestScore = Math.max(score, bestScore)-depth;
              }
            
          }
          return bestScore;
        } else {
          var bestScore = Infinity;
          for (var i = 0; i < board.length; i++) {
    
              if (board[i] == unoccupied) {
                board[i] = player;
                var score = minimax(board, depth + 1, true)+depth;
                board[i] = unoccupied;
                bestScore = Math.min(score, bestScore);
              }
            
          }
          return bestScore;
        }
      }
      
      const responseBoardString = getBestOutcome();
      return {
          statusCode : 200,
          body : responseBoardString
      }

}