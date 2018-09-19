"use strict";
var globalMarker;
  
function initMap() {
  var myLatlng = {lat: 43.1566, lng: -77.6088};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    //defaultCenter: myLatlng
    center: myLatlng
  });
  var marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    icon: 'media/cloud2.png'
  });
    
  globalMarker = marker;
  
  map.addListener('click', function(e) {
      marker.setMap(null);
      marker = new google.maps.Marker({position: e.latLng, map: map, icon: 'media/cloud2.png'});
      var position = marker.getPosition();
      var lat = position.lat();
      var lon = position.lng();
      getWeather(lat, lon);
  });          
  
  marker.setMap(null);
  marker = new google.maps.Marker({position: {lat: 43.1566, lng: -77.6088}, map: map, icon: 'media/cloud2.png'});
  var position = marker.getPosition();
  var lat = position.lat();
  var lon = position.lng();
  getWeather(lat, lon);
  
  // get the first weather if geolocation is on
  navigator.geolocation.getCurrentPosition(function(position) {
      console.log("yay");
  });
}

function geolocation(position) {
  console.log("setting weather based on geolocation");
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var latLng = {lat:latitude , lng:longitude}
  // was called from navigator's coords
  globalMarker.setMap(null);
  globalMarker = new google.maps.Marker({position: latLng, map: map, icon: 'media/cloud2.png'});
  getWeather(latitude, longitude);
}

function loadWeather(lat, long) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
      // read in JSON
      var JSON = JSON.parse( xhr.responseText );
      var currentTemp = JSON.currently.temperature || "no temp";
      console.log(currentTemp);
  }
  var url = "https://api.darksky.net/forecast/4826106e3c1de8596a8ba42252c70372/" + lat + "," + long;
  xhr.open('GET',url,true);
  xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2010 00:00:00 GMT");
  xhr.setRequestHeader("Access-Control-Allow-Origin", "https://people.rit.edu");
  xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhr.send();
}

function getWeather(lat, long) {
  // build up our URL string
  var url = "https://api.darksky.net/forecast/4826106e3c1de8596a8ba42252c70372/" + lat + "," + long;
  
  document.querySelector("#content").innerHTML = "<b></b>";
  // call the web service, and download the file
  $("#content").fadeOut(100);
  $.ajax({
      dataType: "jsonp",
      url: url,
      data: null,
      success: jsonLoaded
  });
}

function jsonLoaded(obj){
  var temp = Math.trunc(obj.currently.temperature);
  var high = Math.trunc(obj.daily.data[0].temperatureHigh);
  var summary = obj.daily.data[0].summary;
  var humidity = Math.trunc(obj.currently.humidity *= 100);
  var uvIndex = obj.currently.uvIndex;
  var chanceRain = rainChance(obj);
  chanceRain = Math.trunc(chanceRain *= 100);
  setBackground(obj, summary);
  
  var section = document.createElement('section');
  
  var tempHTML = document.createElement('h1');
  tempHTML.textContent = "Current Temperature: " + temp + "°F";
  section.appendChild(tempHTML);
  
  var dailyHigh = document.createElement('h2');
  dailyHigh.textContent = "Daily High: " + high + "°F";
  section.appendChild(dailyHigh);
  
  var summaryHTML = document.createElement('p');
  summaryHTML.textContent = summary;
  section.appendChild(summaryHTML);
  
  var humidityHTML = document.createElement('p');
  humidityHTML.textContent = "humidity: " + humidity + "%";
  section.appendChild(humidityHTML);
  
  var uvIndexHTML = document.createElement('p');
  uvIndexHTML.textContent = "UV Index: " + uvIndex;
  section.appendChild(uvIndexHTML);
  
  var rainHTML = document.createElement('p');
  rainHTML.textContent = chanceRain + "% " + "chance of rain in the next 24 hours";
  section.appendChild(rainHTML);
  
  var content = document.querySelector('#content');
  content.innerHTML = "";
  content.appendChild(section);
  
  $("#content").fadeIn(800);
}

function rainChance(obj) {
  var chance = 0;
  for(var i = 0; i < 24; i++) {
      if(obj.hourly.data[i].precipProbability > chance)
          chance = obj.hourly.data[i].precipProbability;
  }
  return chance;
}

function setBackground(obj, desc) {
  // make description lowercase so we can compare it to lowercase letters
  desc = desc.toLowerCase();
  
  
  if(desc.search('foggy') != -1) {
      document.body.style.backgroundImage = "url('media/foggy1.jpg')";
  }
  else if(desc.search('partly cloudy') != -1) {
      document.body.style.backgroundImage = "url('media/partlyCloud.png')";
  }
  else if(desc.search('cloudy') != -1 || desc.search('overcast') != -1) {
      document.body.style.backgroundImage = "url('media/overcast1.jpg')";
  }
  else if(desc.search('rain') != -1) {
      document.body.style.backgroundImage = "url('media/rain2.jpg')";
  }
  else if(desc.search('snow') != -1) {
      document.body.style.backgroundImage = "url('media/snow1.jpg')";
  }
  else {
      document.body.style.backgroundImage = "url('media/sunny3.jpg')";
  }
}