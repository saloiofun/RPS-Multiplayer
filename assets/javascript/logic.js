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
  var p1 = false;
  var p2 = false;
  var pData;
  var player;

  // Create "logo"
  var createHeader = function(element) {
    var choices = ['rock', 'paper', 'scissors'];
    $(element).empty();

    var choiceRow = $("<div class=\"row justify-content-center\">");
    $(element).append(choiceRow);

    for (var i = 0; i < choices.length; i++) {
      var choiceCol = $("<div class=\"col-4\">");
      var choiceImg = $("<img class=\"img-fluid rps-intro\">");
      choiceImg.attr("src", "assets/images/" + choices[i] + ".png");
      choiceImg.attr("alt", choices[i]);

      choiceCol.append(choiceImg);
      choiceRow.append(choiceCol);
    }    
  }

  // Create HTML form for name input
  var createNameForm = function() {
    $("#name-header").empty();

    var form = $("<form autocomplete='off'>");
    var formGroup = $("<div class='form-group'><div class='input-group'>");
    var inputGroup = $("<div class='input-group'>");
    var input = $("<input id='player-name' type='name' class='form-control' placeholder='Enter your name'>");
    var span = $("<span class='input-group-btn'>");
    var button = $("<button id='name-submit' class='btn btn-info' type='submit'>START!</button>");

    span.append(button);
    inputGroup.append(input).append(span);
    formGroup.append(inputGroup);
    form.append(formGroup);

    $("#name-header").append(form);
  }

  // Create rock, paper, scissors buttons/images
  var createChoices = function(element) {
    var choices = ['rock', 'paper', 'scissors'];
    $(element).empty();

    for (var i = 0; i < choices.length; i++) {
      var choiceRow = $("<div class=\"row no-gutters justify-content-center\">");
      var choiceCol = $("<div class=\"col-4\">");
      var choiceImg = $("<img class=\"rps img-fluid\">");
      choiceImg.attr("src", "assets/images/" + choices[i] + ".png");
      choiceImg.attr("alt", choices[i]);
      choiceImg.attr("data-choice", choices[i]);

      choiceRow.append(choiceCol);
      choiceCol.append(choiceImg);
      $(element).append(choiceRow);
    }    
  }
  
  // Write player's information into Database
  var writePlayerData = function(player) {
  	database.ref(pData).set({
  		name: player.name,
  		wins: player.wins,
  		losses: player.losses
  	});
  }

  // Remove player from Database 
  var removeUserOnDisconnect = function() {
    var connectedRef = database.ref(".info/connected");
    connectedRef.on("value", function(snap) {
      // Checks if player is in Database
      if (snap.val()) {
        var con = database.ref().child(pData);
        con.onDisconnect().remove();
      }
    });
  }

  // Write player's choice to Database 
  var writePlayerChoice = function(player, choice) {
    database.ref(player).update({
      choice: choice
    });
  }

  // Remove player's choice and winner's node
  var removePlayersChoice = function() {
    database.ref("/players/player 1/choice").remove();
    database.ref("/players/player 2/choice").remove();
    database.ref("/players/winner").remove();
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

  // Append message from database into chat window
  var populateChat = function() {
    var chatRef = database.ref("/chat");
    chatRef.on("child_changed", function(snapshot) {
      console.log(snapshot.val());
      $("#chat-window").append("text");
    });
  }

  // Trigger when user submits name
  $("#name-header").delegate("#name-submit", "click", function (event) {
    event.preventDefault();

    var pName = $("#player-name").val().trim();

    if (pName) {
      database.ref("/players").once("value", function(snapshot) {
        var hasPlayerOne = snapshot.child("/player 1").exists();
        var hasPlayerTwo = snapshot.child("/player 2").exists();

        if ((!hasPlayerOne && !hasPlayerTwo) || (!hasPlayerOne && hasPlayerTwo))  {
          player = new Player(pName);
          p1 = true;
          $("#name-header").html("<h1>Hi " + pName + "! You are player 1</h1>");
          pData = "/players/player 1";
          writePlayerData(player);
          removeUserOnDisconnect();

        } else {
          player = new Player(pName);
          p2 = true;
          $("#name-header").html("<h1>Hi " + pName + "! You are player 2</h1>");
          pData = "/players/player 2";          
          writePlayerData(player);
          removeUserOnDisconnect();
        }

      }, function (error) {
       console.log("Error: " + error.code);
     });
    }
  });

  // Update website when any data in players folder is modified 
  database.ref("/players").on("value", function(snapshot) {
    var hasPlayerOne = snapshot.child("/player 1").exists();
    var hasPlayerTwo = snapshot.child("/player 2").exists();
    var hasP1Choice = snapshot.hasChild("/player 1/choice");
    var hasP2Choice = snapshot.hasChild("/player 2/choice");
    var hasWinner = snapshot.hasChild("/winner");
    var p1Choice;
    var p2Choice;
    var player1;
    var player2;

    // get player 1 choice
    if (hasP1Choice) {
      p1Choice = snapshot.child("/player 1/choice").val();
    } 

    // get player 2 choice
    if (hasP2Choice) {
      p2Choice = snapshot.child("/player 2/choice").val();
    }

    // display player 1 stats
    if (hasPlayerOne) {
      player1 = new Player(snapshot.child("/player 1/name").val());
      player1.wins = snapshot.child("/player 1/wins").val();
      player1.losses = snapshot.child("/player 1/losses").val();
      playerStats(player1, "#player-one-stats");
    } else {
      $("#player-one-stats").html("<p>Wait for player 1</p>");
    }    

    // display player 2 stats
    if (hasPlayerTwo) {
      player2 = new Player(snapshot.child("/player 2/name").val());
      player2.wins = snapshot.child("/player 2/wins").val();
      player2.losses = snapshot.child("/player 2/losses").val();
      playerStats(player2, "#player-two-stats");
    } else {
      $("#player-two-stats").html("<p>Wait for player 2</p>");
    }

    // Message to players and visitors
    if (hasPlayerOne && hasPlayerTwo) {
      if(!player) {
        $("#welcome-player").html("<h2>Game is On! Please wait for an available spot.</h2>");
      }
    } else if (!hasPlayerOne || !hasPlayerTwo) {
      $("#welcome-player").empty();
      createHeader("#game-stage");      
      $("#player-one").empty();
      $("#player-two").empty();
      if (p1) {
        $("#name-header").html("<h1>Hi " + player1.name + "! You are player 1</h1>");
      }
      if (p2) {
        $("#name-header").html("<h1>Hi " + player2.name + "! You are player 2</h1>");
      }
      if(!player) {
        createHeader("#game-stage");
        createNameForm(); 
      }
    }

    // Display both players choice and result
    if (hasP1Choice && hasP2Choice){
      var p1Image = $("<img class='big-choice float-right img-fluid' src='assets/images/" + p1Choice + ".png' alt='" + p1Choice + "'>");
      var p2Image = $("<img class='big-choice float-left img-fluid' src='assets/images/" + p2Choice + ".png' alt='" + p2Choice + "'>");
      $("#player-one").empty();
      $("#player-two").empty();
      $("#player-one").append(p1Image);
      $("#player-two").append(p2Image);

      if (hasWinner) {
        $("#game-stage").html("<h1>" + snapshot.child("/winner").val() + " Wins!</h1>");
      } else {
        $("#game-stage").html("<h1>Tie Game!</h1>"); 
      }

      setTimeout(removePlayersChoice, 3500);
    }

    // Message to players and create choices for seperate players
    if (hasPlayerOne && hasPlayerTwo) {
      $("#name-header").empty();
      if (p1) {
        $("#welcome-player").html("<h1>Hi " + player1.name + "! You are player 1</h1>");    
      }
      if (p2) {
        $("#welcome-player").html("<h1>Hi " + player2.name + "! You are player 2</h1>");
      }
      if (!hasP1Choice && !hasP2Choice) {
        $("#game-stage").empty();
        $("#player-one").empty();
        $("#player-two").empty();
        if (p1) {
          createChoices("#player-one");    
        }
        if (p2) {
          createChoices("#player-two");
        }
      }
    }

  }, function (error) {
   console.log("Error: " + error.code);
 });

  // Update the number of wins and losses in the database
  var writeWinnerLoser = function(snapshot, winner, looser) {
    var pWinner = snapshot.child("/" + winner + "/wins").val();
    pWinner++;
    database.ref("/players").child("/" + winner + "/").update({
      wins :  pWinner
    });

    var pLooser = snapshot.child("/" + looser + "/losses").val();
    pLooser++;
    database.ref("/players").child("/" + looser + "/").update({
      losses :  pLooser
    });
  }

  // Logic for compare players' choice
  var compareChoices = function(snapshot) {
    var hasP1Choice = snapshot.hasChild("/player 1/choice");
    var hasP2Choice = snapshot.hasChild("/player 2/choice");
    var p1Choice;
    var p2Choice;

    if (hasP1Choice) {
      p1Choice = snapshot.child("/player 1/choice").val();
    } 

    if (hasP2Choice) {
      p2Choice = snapshot.child("/player 2/choice").val();
    }

    if (p1Choice && p2Choice) {
      if ((p1Choice === "rock" && p2Choice === "scissors") || (p1Choice === "scissors" && p2Choice === "paper") || (p1Choice === "paper" && p2Choice === "rock")) {

        writeWinnerLoser(snapshot, "player 1", "player 2");

        database.ref("/players").update({
          winner : snapshot.child("/player 1/name").val()
        })

      } else if ((p1Choice === "rock" && p2Choice === "paper") || (p1Choice === "scissors" && p2Choice === "rock") || (p1Choice === "paper" && p2Choice === "scissors")) {

        writeWinnerLoser(snapshot, "player 2", "player 1");

        database.ref("/players").update({
          winner : snapshot.child("/player 2/name").val()
        })
      }
    }
  }  

  // Replace choices with big image/choice
  var showBigChoice = function(playerOne, img) {
    if (playerOne) {
      $("#player-one").empty();
      $(img).clone().addClass("big-choice float-right").appendTo("#player-one");
    } else {
      $("#player-two").empty();
      $(img).clone().addClass("big-choice float-left").appendTo("#player-two");
    }
  }

  $(".choices").delegate("img", "click", function() {
    var choice = $(this).attr("data-choice");
    if (choice === "rock") { 
      writePlayerChoice(pData, "rock");
      showBigChoice(p1, this);
      database.ref("/players").once("value", compareChoices);
    }
    if (choice === "paper") { 
      writePlayerChoice(pData, "paper");
      showBigChoice(p1, this);
      database.ref("/players").once("value", compareChoices);
    }
    if (choice === "scissors") { 
      writePlayerChoice(pData, "scissors");
      showBigChoice(p1, this);
      database.ref("/players").once("value", compareChoices);
    }
  });

  // Trigger when user submits message
  $("#message-submit").on("click", function(event) {
    event.preventDefault();
    var message = $("#message-input").val().trim();
    var name;
    player ? name = player.name : name = "Visitor";
    var chatRef = database.ref("/chat");
    chatRef.set({
      [name] : message
    });

    $("#message-input").val("");
  });

  // Add message into chat window
  var chatRef = database.ref("/chat");
  chatRef.on("child_added", function(snapshot) {
    $("#chat-window").append(snapshot.key + ": " + snapshot.val() + "<br>");
    $("#chat-window").scrollTop($("#chat-window")[0].scrollHeight);
    chatRef.remove();
  }, function (error) {
   console.log("Error: " + error.code);
 });

});
