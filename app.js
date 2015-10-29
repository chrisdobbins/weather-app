var app = require('express')();
var request = require('request');
var plotly = require('plotly')('autiedidact', 'elg4deeq2d');
var mongoose = require('mongoose');
var OWM_KEY = 'd348a3ecb87127952635c9cc3d3015af';
var mergeStream = require('merge-stream');
var jsonStream = require('JSONStream');

// MIDDLEWARE
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \
  Authorization');
next();
});

// ROUTES HERE FOR NOW -- 10/28

app.get('/', function() {
    //some way to access Angular app here

});
// WEATHER ROUTES
app.get('/api/weather/:latlng', function(req, response) {
  // ASSUMES THAT LOC IS IN 'LNG,LAT' FORMAT FOR NOW
    var location = req.params.latlng.split(",");
    // ^^ splits location param into array
    // because openweather's api requires
    // lat/long to be 'lat=lat&lon=long' format
    // lat is index 0, lng is index 1
    var lat = location[0];
    var lon = location[1];

    var formattedLocation = 'lat='+lat+'&lon='+lon;
    // TAKES LAT, LNG
    console.log('from inside app.get /api/weather/:location: ',location);
    var requestWeatherUrl = 'http://api.openweathermap.org/data/2.5/weather?' + formattedLocation + '&appid='+OWM_KEY;
    request(requestWeatherUrl).pipe(response);
});

app.get('/api/weather/cities/:city', function(req, response) {
  // FOR WEATHER BY CITY NAME
  console.log(req.params);
  var location = req.params.city.split(',');
  console.log(location);
  var state;
  var city = location[0];
  if (location.length === 2) {
    // means that user included a city and state
    state = location[1];
  }
  var requestUrl = (state === undefined ?
  'http://api.openweathermap.org/data/2.5/weather?q='+city :
  'http://api.openweathermap.org/data/2.5/weather?q='+city+','+state)+'&appid='+OWM_KEY;

  console.log(requestUrl);
  request(requestUrl).pipe(response);
});

// FORECAST ROUTES

app.get('/api/forecast/:latlng', function(req, response) {
  // gets forecast using lat and lng
  console.log(req.params.latlng);
  var location = req.params.latlng.split(',');
  var lat = location[0];
  var lon = location[1];
  var requestUrl = 'http://api.openweathermap.org/data/2.5/forecast?lat='+lat+'&lon='+lon+'&appid='+OWM_KEY;
  request(requestUrl).pipe(response);
});

app.get('/api/forecast/cities/:city', function(req, response) {
  // RESPONDS TO REQUESTS FROM FORECASTBYCITYCONTROLLER
  console.log(req.params.city);
  var fullLocation = req.params.city.split(', ');
  var city = fullLocation[0];
  var state = fullLocation[1];
  var requestUrl = (state === undefined ?
  'http://api.openweathermap.org/data/2.5/forecast?q='+city :
  'http://api.openweathermap.org/data/2.5/forecast?q='+city+','+state)+'&appid='+OWM_KEY;
  request(requestUrl).pipe(response);
});

app.get('/api/temp-sensor/', function(req, response) {
  // will get docs from MongoDB with
  // raw temp and humidity data from DHT11
  var dbLocation = 'mongodb://pulldata:phoenix1@ds059682.mongolab.com:59682/sensorreadings';
  var dbConnection = mongoose.createConnection(dbLocation);

  console.log('inside "GET" handler for /api/temp-sensor');
getHomeTemp();

function getHomeTemp() {
  var currentTempHumidity = [];
  var readingSchema = new mongoose.Schema({
      time: {type: Date, default: Date.now},
      temp: Number
  });
  var Reading = dbConnection.model('Readings', readingSchema);
  Reading.find({}).sort({time: -1}).limit(1).exec(function(err, data) {
    // retrieves last sensor reading
    if (err) {
      throw err;
    }
    currentTempHumidity.push(data);
    console.log(data);
    response.json(currentTempHumidity[currentTempHumidity.length-1]);
    currentTempHumidity.length = 0;
    //sends data array from db to requestor
  });
};
/* function graphData() {

         var plotlyData = [
             {
             x: times,
             y: temps,
             type: 'scatter'
             }
         ];
        var graphOptions = {filename: "Temp Data", fileopt: "overwrite"};
        plotly.plot(plotlyData, graphOptions, function(err, msg) {
           console.log(msg);
        });
    });
} */
});

app.listen(3000);
