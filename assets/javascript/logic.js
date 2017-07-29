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

  // Initialize variables
  var database = firebase.database();
  var wins = 0;
  var losses = 0;
  
  function writeUserData(userId, name, wins, losses) {
  	database.ref("/player " + userId).set({
  		name: name,
  		wins: wins,
  		losses: losses
  	});
  }

  function writeUserChoice(userId, choice) {
  	database.ref("/player " + userId).update({
  		choice: choice
  	});
  }

  $("#rock").on("click", function() {
  	writeUserChoice(1, "Rock");
  });

  $("#paper").on("click", function() {
  	writeUserChoice(1, "Paper");
  });

  $("#scissors").on("click", function() {
  	writeUserChoice(1, "Scissors");
  });

  writeUserData(1, "Sandro", wins, losses);


});