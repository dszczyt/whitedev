(function() {
"use strict";

function Board(x, y) {
  this.x = x;
  this.y = y;
  this.gameLost = false;
  this.gameWon = false;
  this.score = 0;
  this.scores = {};
  this.nbMines = 0;

  this.cells = [];

  for (let i = 0 ; i < this.x ; i += 1) {
    let xCells = [];
    for (let j = 0 ; j < this.y ; j += 1) {
      xCells.push(new Cell());
    }
    this.cells.push(xCells);
  }
}

Board.prototype.initialize = function(nb) {
  this.gameLost = false;
  this.gameWon = false;
  this.nbMines = nb;

  this.roundsLeft = this.x * this.y - nb;
  for (let i = 0 ; i < this.x ; i += 1) {
    for (let j = 0 ; j < this.y ; j += 1) {
      this.cells[i][j].initialize();
    }
  }
  for(let i = 0 ; i < nb ; i += 1) {
    let x = Math.round(Math.random() * (this.x - 1));
    let y = Math.round(Math.random() * (this.y - 1));
    if(this.cells[x][y].hasMine) {
      i -= 1;
    } else {
      this.cells[x][y].hasMine = true;

      if(x > 0 && y > 0)
        this.cells[x-1][y-1].minesAround += 1;

      if(x > 0)
        this.cells[x-1][y].minesAround += 1;

      if(x > 0 && y < this.y - 1)
        this.cells[x-1][y+1].minesAround += 1;

      if(x < this.x -1 && y > 0)
        this.cells[x+1][y-1].minesAround += 1;

      if (x < this.x - 1)
        this.cells[x+1][y].minesAround += 1;

      if (x < this.x - 1 && y < this.y - 1)
        this.cells[x+1][y+1].minesAround += 1;

      if (y > 0)
        this.cells[x][y-1].minesAround += 1;

      if (y < this.y - 1)
        this.cells[x][y+1].minesAround += 1;
    }
  }
};

Board.prototype.total = function() {
  var result = 0;
  Object.keys(this.scores).forEach((nbMines) => {
    result += nbMines * this.scores[nbMines];
  });
  return result;
};

function Cell() {
  this.initialize();
}

Cell.prototype.initialize = function() {
  this.revealed = false;
  this.hasMine = false;
  this.minesAround = 0;
};

angular.module("mineSweeper", [
  'LocalStorageModule'
]);

angular.module('mineSweeper').factory(
  "scores",
  [
    "localStorageService",
    function(localStorageService) {
      var scores = localStorageService.get('scores') || {};
      return {
        get: function() {
          return scores;
        },
        save: function() {
          return localStorageService.set('scores', scores);
        },
        increment: function(key) {
          if (scores[key] === undefined)
            scores[key] = 0;
          scores[key] += 1;
          this.save();
        }
      };
    }
  ]
);

angular.module('mineSweeper').controller("GameController", [
  "scores",
  function(scores) {
    this.nbMines = 1;
    this.updateBoard = () => {
      this.board = new Board(
        this.i_rows || 5,
        this.i_cols || 5
      );
      this.board.initialize(this.nbMines || 1);
    };

    this.updateBoard();

    /*this.revealCell = (cell) => {
      if (this.board.gameLost || this.board.gameWon) {
        return;
      }
      if (cell.hasMine) {
        this.board.gameLost = true;
        return;
      }
      if(!cell.revealed) {
        cell.revealed = true;
        this.board.roundsLeft = this.board.roundsLeft - 1;
      }
      if (this.board.roundsLeft === 0) {
        this.board.gameWon = true;
        this.board.score += 1;
        let key = this.board.nbMines;

        scores.increment(key);
      }
    };*/

    this.newGame = () => {
      this.board.initialize(this.nbMines);
    };

  }
]);

angular.module('mineSweeper').directive(
  "minesweeper",
  function() {
    return {
      restrict: 'E',
      templateUrl: "/templates/minesweeper.html",
      controller: "GameController",
      scope: {
        rows: "=",
        cols: "="
      },
      bindToController: true,
      controllerAs: "vm"
    };
  }
);

angular.module('mineSweeper').directive(
  "minesweeperScores",
  function() {
    return {
      restrict: 'E',
      templateUrl: "/templates/minesweeperScores.html",
      scope: {},
      bindToController: true,
      controllerAs: 'vm',
      controller: [
        "scores",
        function(scores) {
          this.scores = scores.get();
        }
      ]
    };
  }
);

angular.module('mineSweeper').directive(
  'cell',
  function() {
    return {
      restrict: 'E',
      bindToController: true,
      controllerAs: 'vm',
      require: '^minesweeper',
      templateUrl: '/src/templates/cell.html',
      scope: {
        object: "="
      },
      link: function(scope, element, attributes, minesweeperCtrl) {
        scope.vm.minesweeperCtrl = minesweeperCtrl;
      },
      controller: [
        function() {
          this.revealed = this.object.revealed;
          this.hasMine = this.object.hasMine;
          this.minesAround = this.object.minesAround;

          this.revealCell = () => {
            console.log('reveal cell');
            if (this.minesweeperCtrl.gameLost || this.minesweeperCtrl.gameWon) {
              return;
            }
            if (this.hasMine) {
              this.minesweeperCtrl.gameLost = true;
              return;
            }
            if(!this.revealed) {
              this.revealed = true;
              this.minesweeperCtrl.roundsLeft = this.minesweeperCtrl.roundsLeft - 1;
            }
            // if (this.board.roundsLeft === 0) {
            //   this.minesweeperCtrl.gameWon = true;
            //   this.minesweeperCtrl.score += 1;
            //   let key = this.minesweeperCtrl.nbMines;
            //
            //   scores.increment(key);
            // }
          };
        }
      ]
    };
  }
);

})();
