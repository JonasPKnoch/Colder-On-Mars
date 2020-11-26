marsURL = "https://api.nasa.gov/insight_weather/?api_key=G5aurt9Kp7QofqhoOTiI3UnvE0cfe9zH9QDNvCIW&feedtype=json&ver=1.0";
marsHigh = null;
marsLow = null;
marsTemp = null;
marsHighWind = null;
marsLowWind = null;
marsWind = null;
marsPres = null;
marsFinished = false;
marsTime = null;

ipURL = "https://api.ipify.org/?format=json";
locationURLStart = "https://cors-anywhere.herokuapp.com/http://api.ipstack.com/";
locationURLEND = "?output=xml&access_key=66161098e213b5081ed1de5bd848a555";
weatherURL = "http://api.openweathermap.org/data/2.5/forecast?mode=xml&cnt=1&units=metric&appid=9e7bc438a43b93857a67bc6718040e2a&lat=";
weatherCity = null;
weatherTemp = null;
weatherPres = null;
weatherFinished = false;
utcTime = null;

allLoaded = false;

img = null;
loading = null;
fontNasa = null;


function loadMars() {
  loadJSON(marsURL, finishedMARS);
}

function finishedMARS(json) {
  newestSol = json.sol_keys[json.sol_keys.length-1];
  valid = false;
  
  while(!valid) {
    error = false;
    try{      
      marsHigh = json[newestSol].AT.mx;
      marsLow = json[newestSol].AT.mn;
      
      marsHighWind = json[newestSol].HWS.mx;
      marsLowWind = json[newestSol].HWS.mn;
      
      marsPres = json[newestSol].PRE.av;
    } catch {
      newestSol -= 1;
      error = true;
    }
    
    if(!error) {
      valid = true;
    }
  }
  
  
  marsFinished = true;
}

function loadIP() {
  loadJSON(ipURL, loadLocation);
}

function loadLocation(ip) {
  loadXML(locationURLStart + ip.ip + locationURLEND, loadWeather);
}

function loadWeather(location) {
  weatherCity = location.getChild("city").getContent();
  lat = location.getChild("latitude").getContent();
  lon = location.getChild("longitude").getContent();
  
  loadXML(weatherURL + lat + "&lon=" + lon, finishedWeather);
}

function finishedWeather(xml) {
  utcTime = xml.getChild("forecast").getChild("time").getString("from");
  weatherTemp = xml.getChild("forecast").getChild("time").getChild("temperature").getString("value");
  weatherWind = xml.getChild("forecast").getChild("time").getChild("windSpeed").getString("mps");
  weatherPres = xml.getChild("forecast").getChild("time").getChild("pressure").getString("value");
  weatherFinished = true;
}

function finalize() {
  utcTime = utcTime.slice(-5,-3);
  utcTime = float(utcTime);
  marsTime = (utcTime + 16.5)%24;
  
  marsHigh = float(marsHigh);
  marsLow = float(marsLow);
  dif = marsHigh - marsLow;
  marsTemp = marsLow + (dif * (abs(marsTime - 12)/12));
  
  marsHighWind = float(marsHighWind);
  marsLowWind = float(marsLowWind);
  dif = marsHighWind - marsLowWind;
  marsWind = marsLowWind + (dif * (abs(marsTime - 12)/12));
  
  marsPres = float(marsPres);
  
  weatherTemp = float(weatherTemp);
  weatherPres = float(weatherPres);
  weatherWind = float(weatherWind);
  
  allLoaded = true;
}

function preload() {
  fontNasa = loadFont("assets/nasalization-rg.ttf");
  img = loadImage("assets/Background.png");
  loading = loadImage("assets/InSight_spacecraft_model.png");
}

function drawMain() {
  image(img, 0, 0, 600, 600);
  
  textAlign(CENTER, CENTER);
  textSize(32);
  text(weatherCity, 150, 80);
  text("Mars", 450, 80);
  
  textSize(20);
  textAlign(LEFT);
  text("Tempurature: " + nf(weatherTemp, 0, 3) + " °C", 20, 150);
  text("Wind Speed: " + nf(weatherWind, 0, 3) + " M/S", 20, 210);
  text("Pressure: " + nf(weatherPres, 0, 3) + " hPa", 20, 270);
  
  textAlign(RIGHT);
  text("Tempurature: " + nf(marsTemp, 0, 3) + " °C", 580, 150);
  text("Wind Speed: " + nf(marsWind, 0, 3) + " M/S", 580, 210);
  text("Pressure: " + nf(marsPres, 0, 3) + " hPa", 580, 270);
  
  tempDif = weatherTemp - marsTemp;
  windDif = weatherWind - marsWind;
  presDif = weatherPres - marsPres;
  
  tempWord = "colder";
  windWord = "slower";
  presWord = "lower";
  
  if(tempDif < 0) {
    tempWord = "warmer";
  }
  if(windDif < 0) {
    windWord = "faster";
  }
  if(presDif < 0) {
    presWord = "higher (Also something is fucked up)";
  }
  
  textSize(18);
  textAlign(LEFT, TOP);
  text("On mars right now, it is " + nf(abs(tempDif), 0, 2) + " degrees " + tempWord + ", the wind is blowing " + nf(abs(windDif), 0, 2) + " meters per second " + windWord + " and the pressure is " + nf(abs(presDif), 0, 2) + " hectopascals " + presWord + " than it is in " + weatherCity + ".", 40, 350, 520, 600); 
}

function setup() {
  var canvas = createCanvas(600, 600);
  canvas.parent('sketch-holder');

  
  smooth();
  textFont(fontNasa);
  
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  fill(0, 0, 0);
  background(50, 0, 0);
  textSize(22);
  image(loading, 300, 300);
  text("Retrieving Data . . .", 300, 400);

  stroke(0, 0, 0);
  strokeWeight(2);
  imageMode(CORNER);
  fill(255, 255, 255);  
  
  loadMars();
  loadIP();
}


function draw() {
  if(!allLoaded) {
    if(marsFinished && weatherFinished) {
      finalize();
    }
  } else {
    drawMain();
    noLoop();
  }
}
