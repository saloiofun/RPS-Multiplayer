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
  function Player(name, wins, losses) {
    this.name = name;
    this.wins = wins;
    this.losses = losses;
  }

  // Initialize variables
  var database = firebase.database();
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

    var playerName = $("#player-name").val().trim();

    if (playerName) {

      var player = new Player(playerName, 0, 0);

      database.ref().once("value", function(snapshot) {
        var hasPlayerOne = snapshot.child("/player 1").exists();
        var hasPlayerTwo = snapshot.child("/player 2").exists();

        if ((!hasPlayerOne && !hasPlayerTwo) || (!hasPlayerOne && hasPlayerTwo))  {
          $("#name-header").html("<h1>Hi " + playerName + "! You are player 1</h1>");
          playerData = "/player 1";
          writeUserData(player);

          var playerRef = database.ref(playerData);
          playerRef.on("value", function(snapshot) {
            player.wins = snapshot.val().wins;
            player.losses = snapshot.val().losses;
            playerStats(player, "#player-one-stats");
          })

          removeUserOnDisconnect();

        } 
        if (hasPlayerOne && !hasPlayerTwo) {
          $("#name-header").html("<h1>Hi " + playerName + "! You are player 2</h1>");
          playerData = "/player 2";
          writeUserData(player);

          var playerRef = database.ref(playerData);
          playerRef.on("value", function(snapshot) {
            player.wins = snapshot.val().wins;
            player.losses = snapshot.val().losses;
            playerStats(player, "#player-two-stats");
          })

          removeUserOnDisconnect();
        }

      });
    }

  });

  $(".rps").on("click", function() {
    var choice = $(this).attr("data-choice");
    if (choice === "rock") { 
      writeUserChoice(playerData, "Rock") 
    };
    if (choice === "paper") { 
      writeUserChoice(playerData, "Paper") 
    };
    if (choice === "scissors") { 
      writeUserChoice(playerData, "Scissors") 
    };
  });

});