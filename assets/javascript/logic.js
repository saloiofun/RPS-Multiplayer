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
  
  // Write player's information to Database
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

  // Write to player's choice to Database 
  var writePlayerChoice = function(player, choice) {
    database.ref(player).update({
      choice: choice
    });
  }

  var removePlayersChoice = function() {
    database.ref("/players/player 1/choice").remove();
    database.ref("/players/player 2/choice").remove();
    database.ref("/players/winner").remove();
  }

  //function to create player's avatar and slide animation
  var playerAvatarSlide = function(player, pName) {

    var playerImage = $("<img>");
    playerImage.addClass("img-fluid");
    playerImage.attr("src", "https://robohash.org/set_set3/" + pName + "?size=400x400");
    playerImage.attr("alt", pName + " avatar");

    $("#" + player).append(playerImage);
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

  var populateChat = function() {
    var chatRef = database.ref("/chat");
    chatRef.on("child_changed", function(snapshot) {
      console.log(snapshot.val());
      $("#chat-window").append("text");
    });
  }

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

  database.ref("/players").on("value", function(snapshot) {
    var hasPlayerOne = snapshot.child("/player 1").exists();
    var hasPlayerTwo = snapshot.child("/player 2").exists();
    var hasP1Choice = snapshot.hasChild("/player 1/choice");
    var hasP2Choice = snapshot.hasChild("/player 2/choice");
    var hasWinner = snapshot.hasChild("/winner");
    var p1Choice;
    var p2Choice;

    if (hasP1Choice) {
      p1Choice = snapshot.child("/player 1/choice").val();
    } 

    if (hasP2Choice) {
      p2Choice = snapshot.child("/player 2/choice").val();
    }

    if (hasPlayerOne) {
      var player1 = new Player(snapshot.child("/player 1/name").val());
      player1.wins = snapshot.child("/player 1/wins").val();
      player1.losses = snapshot.child("/player 1/losses").val();
      playerStats(player1, "#player-one-stats");
    } else {
      $("#player-one-stats").html("<p>Wait for player 1</p>");
    }    

    if (hasPlayerTwo) {
      var player2 = new Player(snapshot.child("/player 2/name").val());
      player2.wins = snapshot.child("/player 2/wins").val();
      player2.losses = snapshot.child("/player 2/losses").val();
      playerStats(player2, "#player-two-stats");
    } else {
      $("#player-two-stats").html("<p>Wait for player 2</p>");
    }

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
    }

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
        var p1Wins = snapshot.child("/player 1/wins").val();
        p1Wins++;
        database.ref("/players").child("/player 1/").update({
          wins :  p1Wins
        });

        var p2Losses = snapshot.child("/player 2/losses").val();
        p2Losses++;
        database.ref("/players").child("/player 2/").update({
          losses :  p2Losses
        });

        database.ref("/players").update({
          winner : snapshot.child("/player 1/name").val()
        })

      } else if ((p1Choice === "rock" && p2Choice === "paper") || (p1Choice === "scissors" && p2Choice === "rock") || (p1Choice === "paper" && p2Choice === "scissors")) {
        var p2Wins = snapshot.child("/player 2/wins").val();
        p2Wins++;
        database.ref("/players").child("/player 2/").update({
          wins :  p2Wins
        });

        var p1Losses = snapshot.child("/player 1/losses").val();
        p1Losses++;
        database.ref("/players").child("/player 1/").update({
          losses :  p1Losses
        });

        database.ref("/players").update({
          winner : snapshot.child("/player 2/name").val()
        })

      }

      setTimeout(removePlayersChoice, 3500);

    }
  }  

  $(".choices").delegate("img", "click", function() {
    var choice = $(this).attr("data-choice");
    if (choice === "rock") { 
      writePlayerChoice(pData, "rock");
      if (p1) {
        $("#player-one").empty();
        $(this).clone().addClass("big-choice float-right").appendTo("#player-one");
      } else {
        $("#player-two").empty();
        $(this).clone().addClass("big-choice float-left").appendTo("#player-two");
      }
      database.ref("/players").once("value", compareChoices);
    }
    if (choice === "paper") { 
      writePlayerChoice(pData, "paper");
      if (p1) {
        $("#player-one").empty();
        $(this).clone().addClass("big-choice float-right").appendTo("#player-one");
      } else {
        $("#player-two").empty();
        $(this).clone().addClass("big-choice float-left").appendTo("#player-two");
      }
      database.ref("/players").once("value", compareChoices);
    }
    if (choice === "scissors") { 
      writePlayerChoice(pData, "scissors");
      if (p1) {
        $("#player-one").empty();
        $(this).clone().addClass("big-choice float-right").appendTo("#player-one");
      } else {
        $("#player-two").empty();
        $(this).clone().addClass("big-choice float-left").appendTo("#player-two");
      }
      database.ref("/players").once("value", compareChoices);
    }
  });

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

  var chatRef = database.ref("/chat");
  chatRef.on("child_added", function(snapshot) {
    console.log(snapshot.key);
    $("#chat-window").append(snapshot.key + ": " + snapshot.val() + "<br>");
    chatRef.remove();
  });


});
