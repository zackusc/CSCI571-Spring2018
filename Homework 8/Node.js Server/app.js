'use strict';
const path = require('path');
var express = require("express");
var cors = require("cors");
var https = require("https");
var request = require("request");
const yelp = require('yelp-fusion');

const apiKey = 'XXXXXXXXXX';
const googleApiKey = 'XXXXXXXXXX';
const yelpClient = yelp.client(apiKey);

var app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get("/results", function (req, res) {
    var lat, lng;
    var keyword = req.query.keyword;
    var radius = parseFloat(req.query.distance) * 1609.344;
    var type = req.query.category.toLowerCase().replace(' ', '_');
    var nearbySearchURL;

    if(!req.query.address) {
        lat = req.query.lat;
        lng = req.query.lng;

        nearbySearchURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURI(keyword)}&key=AIzaSyCkGo7qelxGcYihpTUyXC_uJ1CbZeWLULo`;

        if(type != "default") {
            nearbySearchURL += "&type=" + type;
        }

        https.get(nearbySearchURL, (response) => {
            response.setEncoding('utf8');
            let rawData = '';
            response.on('data', (chunk) => { rawData += chunk; });
            response.on('end', () => {
                var results = JSON.parse(rawData);
                results.location = {lat: +lat, lng: +lng};
                res.json(results);
            });
        });

    }
    else {
        var address = req.query.address;
        var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(address)}&key=AIzaSyDuj1EyZKvNEVM-tARb7jLgMRygj4wmIWk`;
        request.get(url, (error, response, body) => {
            let geoData = JSON.parse(body);
            let geoLocation = geoData.results[0].geometry.location;
            lat = geoLocation.lat;
            lng = geoLocation.lng;

            nearbySearchURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURI(keyword)}&key=AIzaSyCkGo7qelxGcYihpTUyXC_uJ1CbZeWLULo`;

            if(type != "default") {
                nearbySearchURL += "&type=" + type;
            }

            https.get(nearbySearchURL, (response1) => {
                response1.setEncoding('utf8');
                let rawData = '';
                response1.on('data', (chunk) => { rawData += chunk; });
                response1.on('end', () => {
                    var results = JSON.parse(rawData);
                    results.location = {lat: lat, lng: lng};
                    res.json(results);
                });
            });

        });

    }

});

app.get("/results/nextpage", (req, res) => {
    let url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=';
    url += req.query.pagetoken;
    url += '&key=AIzaSyCkGo7qelxGcYihpTUyXC_uJ1CbZeWLULo';

    https.get(url, (response) => {
        response.setEncoding('utf8');
        let rawData = '';
        response.on('data', (chunk) => { rawData += chunk; });
        response.on('end', () => {
            res.send(rawData);
        });
    });
});

app.get("/details", (req, res) => {
    const placeId = req.query.place_id;
    let url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${googleApiKey}`;

    console.log("detail url:\n" + url);

    request.get(url, (error, response, body) => {
        let detailsJson = JSON.parse(body);
        res.json(detailsJson);
    });
})


app.get("/yelp", (req, res) => {
    const request = {
        name: decodeURIComponent(req.query.name),
        address1: req.query.address1,
        address2: req.query.address2,
        city: req.query.city,
        state: req.query.state,
        country: req.query.country
    }

    // console.log(request);

    yelpClient.businessMatch('best', request).then(response => {
        // res.send(response.jsonBody);
        // console.log(response.jsonBody);
        if(response.jsonBody.businesses.length > 0) {
            let alias = response.jsonBody.businesses[0].alias;
            // alias = 'gary-danko-san-francisco';
            console.log(alias);
            yelpClient.reviews(alias).then(response2 => {
                res.send(response2.jsonBody);
            }).catch(e => console.log(e));
        } else {
            res.json({ reviews: []});
        }

    }).catch(e => {
        console.log(e);
    });
});

console.log("Express app running on port 3000");

app.listen(process.env.PORT || 3000);