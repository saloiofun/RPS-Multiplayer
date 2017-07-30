$(document).ready(function () {

  // Initialize Firebase
  var config = {
  	apiKey: "AIzaSyD5I9d3lgcgXhXokNbOQLDjdjL0UDIunYw",
  	authDomain: "sw-rps-game.firebaseapp.com",
  	databaseURL: "https://sw-rps-game.firebaseio.com",
  	projectId: "sw-rps-game",
  	storageBucket: "sw-rps-game.appspot.com",
  	messagingSenderId: "778090169442"
  };
  firebase.initializeApp(config);


  // Player's constructor
  function Player(name) {
    this.name = name;
    this.wins = 0;
    this.losses = 0;
  }

  // Initialize variables
  var database = firebase.database();
  var playerName;
  var playerData;
  
  // Write player's information to Database
  var writeUserData = function(player) {
  	database.ref(playerData).set({
  		name: player.name,
  		wins: player.wins,
  		losses: player.losses
  	});
  }

  // Write to player's choice to Database 
  var writeUserChoice = function(player, choice) {
  	database.ref(player).update({
  		choice: choice
  	});
  }

  // Remove player from Database 
  var removeUserOnDisconnect = function() {
    var connectedRef = database.ref(".info/connected");
    connectedRef.on("value", function(snap) {
      // Checks if player is in Database
      if (snap.val()) {
        var con = database.ref().child(playerData);
        con.onDisconnect().remove();
      }
    });
  }

  // Function to update the players stats (wins, losses)
  var playerStats = function (obj, element) {
    var name = $("<p>").text(obj.name);
    var wins = $("<p>").text("Wins: " + obj.wins);
    var losses = $("<p>").text("Losses: " + obj.losses);

    $(element).empty();
    $(element).append(name);
    $(element).append(wins);
    $(element).append(losses);
  };

  $("#name-submit").on("click", function (event) {
    event.preventDefault();

    playerName = $("#player-name").val().trim();

    if (playerName) {
      var player = new Player(playerName);
      database.ref().once("value", function(snapshot) {
        var hasPlayerOne = snapshot.child("/player 1").exists();
        var hasPlayerTwo = snapshot.child("/player 2").exists();

        if ((!hasPlayerOne && !hasPlayerTwo) || (!hasPlayerOne && hasPlayerTwo))  {
          $("#name-header").html("<h1>Hi " + playerName + "! You are player 1</h1>");
          playerData = "/player 1";
          writeUserData(player);
          removeUserOnDisconnect();
        } 

        if (hasPlayerOne && !hasPlayerTwo) {
          $("#name-header").html("<h1>Hi " + playerName + "! You are player 2</h1>");
          playerData = "/player 2";
          writeUserData(player);
          removeUserOnDisconnect();
        }
        
      });
    }
  });

  database.ref().on("value", function(snapshot) {
    var hasPlayerOne = snapshot.child("/player 1").exists();
    var hasPlayerTwo = snapshot.child("/player 2").exists();

    if (hasPlayerOne) {
      var player = new Player(snapshot.child("/player 1/name").val());
      player.wins = snapshot.child("/player 1/wins").val();
      player.losses = snapshot.child("/player 1/losses").val();
      playerStats(player, "#player-one-stats");
    } else {
      $("#player-one-stats").html("<p>Wait for player 1</p>");
    }    

    if (hasPlayerTwo) {
      var player = new Player(snapshot.child("/player 2/name").val());
      player.wins = snapshot.child("/player 2/wins").val();
      player.losses = snapshot.child("/player 2/losses").val();
      playerStats(player, "#player-two-stats");
    } else {
      $("#player-two-stats").html("<p>Wait for player 2</p>");
    }

  });

  $(".rps").on("click", function() {
    var choice = $(this).attr("data-choice");
    if (choice === "rock") { 
      writeUserChoice(playerData, "Rock");
    };
    if (choice === "paper") { 
      writeUserChoice(playerData, "Paper");
    };
    if (choice === "scissors") { 
      writeUserChoice(playerData, "Scissors");
    };
  });

});