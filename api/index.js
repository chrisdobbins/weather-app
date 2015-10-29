var request = require('request');
var city = 'New York, NY';
var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=d348a3ecb87127952635c9cc3d3015af';

request(url, getWeather);

function getWeather(error, response, body) {
    if (!error && response.statusCode === 200) {
      //console.log(response);
      console.log(body);
    }
};
