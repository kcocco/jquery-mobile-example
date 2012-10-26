// JavaScript Document - main.js
// alert("main.js fired");

// if we see page with id="checkout" then run this code
$.mobile.routerlite.pageinit("#search-state", function(page){
  alert("pageinit fired");
});

// every time we visit the page with id="checkout" then run this code
$.mobile.routerlite.pagechange("#search-state", function(page){
  alert("pagechange fired");
});