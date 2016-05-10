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
  Object.keys(this.scores).forEach(function(nbMines) {
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

var app = angular.module("mineSweeper", [
  'LocalStorageModule'
]);

app.controller("GameController", [
  "$scope",
  function($scope) {
    var board = new Board(5, 5);
    board.initialize(1);
    $scope.board = board;

    $scope.revealCell = function(cell) {
      if (board.gameLost || board.gameWon) {
        return;
      }
      if (cell.hasMine) {
        board.gameLost = true;
        return;
      }
      if(!cell.revealed) {
        cell.revealed = true;
        board.roundsLeft = board.roundsLeft - 1;
      }
      if (board.roundsLeft === 0) {
        board.gameWon = true;
        board.score += 1;
        if (board.scores[board.nbMines] === undefined)
          board.scores[board.nbMines] = 0;
        board.scores[board.nbMines] += 1;
      }
    };

    $scope.newGame = function() {
      board.initialize($scope.nbMines);
    };

  }
]);
})();