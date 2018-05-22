<?php
    if(isset($_GET["keyword"])) {
        if(isset($_GET["address"])) {
            $address = $_GET["address"];
            $geoJSON = file_get_contents('https://maps.googleapis.com/maps/api/geocode/json?address='.urlencode($address).'&key=API_KEY');
            $geoInfo = json_decode($geoJSON, true);
            $geoLocation = $geoInfo["results"][0]["geometry"]["location"];
            $latitude = $geoLocation["lat"]; //float
            $longitude = $geoLocation["lng"];
        }
        else {
            $latitude = $_GET["latitude"];
            $longitude = $_GET["longitude"];
        }
        $keyword = urlencode($_GET["keyword"]);
        $radius = $_GET["distance"] * 1609.344;
        $type = $_GET["category"];

        $nearbySearchURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=".$latitude.",".$longitude."&radius=".$radius."&keyword=".$keyword."&key=API_KEY";

        if($type != "default") {
            $nearbySearchURL .= "&type=".$type;
        }

        $nearbyJSON = file_get_contents($nearbySearchURL);
        $searchResult = json_decode($nearbyJSON, true);
        $searchResult["location"] = array('lat' => (float)$latitude,
                                          'lng' => (float)$longitude);
        $resultsJSON = json_encode($searchResult);
        echo $resultsJSON;
        exit();
        
    }
    
    if(isset($_GET["placeid"])) {
        $placeDetailsURL = "https://maps.googleapis.com/maps/api/place/details/json?placeid=".$_GET["placeid"]."&key=API_KEY";
        $detailsJSON = file_get_contents($placeDetailsURL);
        $details = json_decode($detailsJSON, true);
        $reviews = null;
        if(isset($details["result"]["reviews"])) {
            $reviews = $details["result"]["reviews"];
        }
        
        $photo_num = 0;
        if(isset($details["result"]["photos"])) {
            $photos = $details["result"]["photos"];
            
            for($i = 0; $i < count($photos) && $i < 5; $i++) {
                $photo_url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=".$photos[$i]["photo_reference"]."&key=API_KEY";
                $photo = file_get_contents($photo_url);
                file_put_contents("image".$i.".jpg", $photo);
            }
            $photo_num = $i;
        }
        $newDetails = array("reviews" => $reviews, "photo_num" => $photo_num);
        echo json_encode($newDetails);
        exit();
    }
    
?>

<!DOCTYPE HTML>
<html>
<head>
    <title>myplace</title>
    <style>
        body {
            text-align: center;
            margin-top: 20px;
            margin-bottom: 300px;
        }
        
        #searchForm {
            border: 3px solid lightgray;
            background-color: rgb(250,250,250);
            display: inline-block;
            width: 624px;
            padding-left: 10px;
            padding-right: 10px;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        
        form {
            text-align: left;
            
        }
        
        #submit {
            margin-left: 62px;
        }
        
        h1{
            font-weight: lighter;
			font-style: italic;
			margin: 0;
        }
        
        hr {
            border-top: 1px solid lightgray;
        }
        
        #searchResult {
            width: 80%;
            display: inline-block;
        }
        
        #resultTable {
            border-collapse: collapse;
            width: 100%;
            
        }
        
        #resultTable td, #resultTable th, #reviewsTable td, #photosTable td {
            border: 2px solid lightgray;
        }
        
        #resultTable td {
            text-align: left;
        }
        
        .place-name, .address{
/*            , #resultTable th*/
            padding-left: 15px;
            padding-right: 15px;
        }
        
        #resultTable img {
            width: 60px;
            height: 40px;
        }
        
        .map {
            width: 400px;
            height: 300px;
            position: absolute;
        }

        #travel-mode-list {
            border-collapse: collapse;
            position: absolute;
            z-index: 10000;
            background-color: rgb(241,241,241);
            
        }
        
        #travel-mode-list td{
            border: 0;
        }
        
        #travel-mode-list td a{
            display: inline-block;
            padding: 10px;
        }
        
        #travel-mode-list td:hover{
            background-color: rgb(220,220,220)
        }
        
        .map-directions {
            margin-left: 4px;
        }
        
        #placeDetails {
            width: 650px;
            display: inline-block;
        }
        
        #placeDetails h4{
            margin-top: 0;
            margin-bottom: 30px;
        }
        
        #reviewsTable, #photosTable {
            display: none;
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 30px;
        }
        
        #reviewsTable td, #photosTable td {
            width: 650px;
        }
        
        #hint1, #hint2 {
            margin-bottom: 5px;
        }
        
        #reviewsTable .review-text {
            text-align: left;
        }
        
        .photo-cell {
            padding: 15px;
        }
        
        #photosTable img {
            width: 100%;
        }
        
        a {
            color: black;
            text-decoration: none;
        }
        
        .address>a:active {
            color: rgb(135,135,135);
        }
        
        #no-records {
            width: 75%;
            border: 2px solid lightgray;
            display: inline-block;
            background-color: rgb(241,241,241);
        }
        
        
    </style>
    
    <script src="https://maps.googleapis.com/maps/api/js?key=API_KEY" async defer></script>
    
    <script>
        function checkRadios() {
            var radios = document.getElementsByName("location");
            var locBox = document.getElementById("place");
            if(radios[0].checked) {
                locBox.disabled = true;
            }
            if(radios[1].checked) {
                locBox.disabled = false;
                locBox.required = true;
            }
        }
        
        function getGeolocation() {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "http://ip-api.com/json", true);
            xhr.onreadystatechange = function () {
                if(xhr.readyState == 4 && xhr.status == 200) {
                    geojson = xhr.responseText;
                    geojsonObj = JSON.parse(geojson);
                    if(geojsonObj) {
                        var submitBTN = document.getElementById("submit");
                        submitBTN.disabled = false;
                    }
                }
            }
            xhr.send();
            
        }
        
        function formValidation() {
            if(document.getElementById("keyword").value == "") {
                return false;
            }

            if(document.getElementsByName("location")[1].checked &&
                document.getElementById("place").value == "") {
                return false;
            }

            return true;
        }

        function searchPlaces() {

            if(formValidation()) {
                var formData = "";
                formData += "keyword=" + document.getElementById("keyword").value + "&";
                formData += "category=" + document.getElementById("category").value + "&";
                var distance = document.getElementById("distance").value;
                distance = distance == "" ? "10" : distance;
                formData += "distance=" + distance + "&";

                if(document.getElementsByName("location")[0].checked) {
                    formData += "latitude=" + geojsonObj.lat + "&";
                    formData += "longitude=" + geojsonObj.lon;
                }
                else {
                    formData += "address=" + document.getElementById("place").value;
                }

                var url = "place.php?" + formData;
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.onreadystatechange = function () {
                    if(xhr.readyState == 4 && xhr.status == 200) {
                        searchResult = xhr.responseText;
                        placesJSON = JSON.parse(searchResult);
                        displaySearchResult();
                    }
                }
                xhr.send();
            }
        }

        function displaySearchResult() {
            document.getElementById("placeDetails").innerHTML = "";
            
            result_html = "";
            results = placesJSON.results;
            if(results.length == 0) {
                result_html += "<p id='no-records'>No Records has been found</p>";
            }
            else {
                result_html += "<table id='resultTable'>"
                result_html += "<tr><th style='width:100px'>Category</th><th>Name</th><th>Address</th></tr>"
                for(i = 0; i < results.length; i++) {
                    result_html += "<tr>";
                    result_html += "<td><img src='" + results[i]["icon"] + "'></td>";
                    result_html += "<td class='place-name'>";
                    result_html += "<a href='#' onclick='showPlaceDetails(" + i +");return false'>" + results[i]["name"] + "</a>";
                    result_html += "</td>";
                    result_html += "<td class='address' id='result-address-" + i + "'>";
                    result_html += "<a href='#' onclick='displayMap(" + i + ");return false'>" + results[i]["vicinity"] + "</a>";
                    result_html += "</td>";
                    result_html += "</tr>";
                }
                result_html += "</table>";
            }
            document.getElementById("searchResult").innerHTML = result_html;

        }
        
        function showPlaceDetails(num) {
            var placeid = results[num]["place_id"];
            var url = "place.php?placeid=" + placeid;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if(xhr.readyState == 4 && xhr.status == 200) {
                    detailsJSON = xhr.responseText;
                    placeDetails = JSON.parse(detailsJSON);
                    document.getElementById("searchResult").innerHTML = "";
                    details_html = "<h4>" + results[num]["name"] + "</h4>";
                    generateReviewsHTML();
                    generatePhotosHTML();
                    document.getElementById("placeDetails").innerHTML = details_html;
                }
            }
            xhr.send();
        }
        
        function generateReviewsHTML() {
            details_html += "<a href='#' onclick='changeDisplayOfReviews();return false'>";
            details_html += "<p id='hint1'>click to show reviews</p>";
            details_html += "<img id='reviews-arrow-button' src='http://cs-server.usc.edu:45678/hw/hw6/images/arrow_down.png' width=30>";
            details_html += "</a>";
            
            reviews = placeDetails.reviews;
            
            details_html += "<table id='reviewsTable'>";
            
            if(reviews == null || reviews.length == 0) {
                details_html += "<tr><td><b>No Reviews Found</b></td></tr>";
            }
            else {
                for(i = 0; i < reviews.length; i++) { 
                    details_html += "<tr><td>";
                    var profile_photo_url = reviews[i]["profile_photo_url"];
                    if(profile_photo_url) {
                        details_html += "<img src='" + profile_photo_url +"' height=30>";
                    }
                    details_html += "<b>" + reviews[i]["author_name"] + "</b>"
                    details_html += "</td></tr>"
                    var review_text = reviews[i].text
                    review_text = review_text == "" ? "<br>" : review_text;
                    details_html += "<tr><td class='review-text'>" + review_text + "</td></tr>";
                }
            }
            details_html += "</table>";
        }
        
        function generatePhotosHTML() {
            details_html += "<a href='#' onclick='changeDisplayOfPhotos();return false'>";
            details_html += "<p id='hint2'>click to show photos</p>";
            details_html += "<img id='photos-arrow-button' src='http://cs-server.usc.edu:45678/hw/hw6/images/arrow_down.png' width=30>";
            details_html += "</a>";
            
            var photo_num = placeDetails.photo_num;
            details_html += "<table id='photosTable'>"
            if(photo_num == 0) {
                details_html += "<tr><td><b>No Photos Found</b></td></tr>";
            }
            else {
                for(i = 0; i < photo_num; i++) {
                    details_html += "<tr><td class='photo-cell'>";
                    var image_url = "image" + i + ".jpg";
                    details_html += "<a href='" + image_url + "' target='_blank'><img src='" + image_url + "?random=" + Math.random() + "'></a>";
                    details_html += "</td></tr>";
                }
            }
            details_html += "</table>";
        }
        
        function showReviews() {
            document.getElementById("reviewsTable").style.display = "block";
            document.getElementById("hint1").innerHTML = "click to hide reviews";
            document.getElementById('reviews-arrow-button').src = 'http://cs-server.usc.edu:45678/hw/hw6/images/arrow_up.png';
        }
        
        function hideReviews() {
            document.getElementById("reviewsTable").style.display = "none";
            document.getElementById("hint1").innerHTML = "click to show reviews";
            document.getElementById('reviews-arrow-button').src = 'http://cs-server.usc.edu:45678/hw/hw6/images/arrow_down.png';
        }
        
        function showPhotos() {
            document.getElementById("photosTable").style.display = "block";
            document.getElementById("hint2").innerHTML = "click to hide photos";
            document.getElementById('photos-arrow-button').src = 'http://cs-server.usc.edu:45678/hw/hw6/images/arrow_up.png';
        }
        
        function hidePhotos() {
            document.getElementById("photosTable").style.display = "none";
            document.getElementById("hint2").innerHTML = "click to show photos";
            document.getElementById('photos-arrow-button').src = 'http://cs-server.usc.edu:45678/hw/hw6/images/arrow_down.png';
        }
        
        function changeDisplayOfReviews() {
            var reviews_table = document.getElementById("reviewsTable");
            var photos_table = document.getElementById("photosTable");
            if(reviews_table.style.display != "block") {
                showReviews();
                if(photos_table.style.display == "block") {
                    hidePhotos();
                }
            }
            else {
                hideReviews();
            }
        }
        
        function changeDisplayOfPhotos() {
            var reviews_table = document.getElementById("reviewsTable");
            var photos_table = document.getElementById("photosTable");
            if(photos_table.style.display != "block") {
                showPhotos();
                if(reviews_table.style.display == "block") {
                    hideReviews();
                }
            }
            else {
                hidePhotos();
            }
        }
        
        function displayMap(num) {
            
            var td = document.getElementById('result-address-' + num);
            map_directions_id = 'map-directions-' + num;
            map_directions = document.getElementById(map_directions_id);
            
            map_id = "map" + num;
            
            if(map_directions) {
                td.removeChild(map_directions);
            }
            else {
                
                placeLoc = results[num].geometry.location;
                map_html = "<div id='" + map_directions_id + "' class='map-directions'>";
                map_html += "<table id='travel-mode-list'>";
                map_html += "<tr><td><a href='#' onclick='displayRoute(1);return false'>Walk there</td></tr>";
                map_html += "<tr><td><a href='#' onclick='displayRoute(2);return false'>Bike there</td></tr>";
                map_html += "<tr><td><a href='#' onclick='displayRoute(3);return false'>Drive there</td></tr>";
//                map_html += "<tr><td onclick='displayRoute(2)'>Bike there</td></tr>";
//                map_html += "<tr><td onclick='displayRoute(3)'>Drive there</td></tr>";
                map_html += "</table>";
                map_html += "<div id='" + map_id + "' class='map'></div>";
                map_html += "</div>"
                
                td.innerHTML += map_html;
                initMap();
            }
        }
        
        function initMap() {
            directionService = new google.maps.DirectionsService;
            directionsDisplay = new google.maps.DirectionsRenderer;
            map = new google.maps.Map(document.getElementById(map_id), {
                center: placeLoc,
                zoom: 13
            });
            marker = new google.maps.Marker({
                position: placeLoc,
                map: map,
            });
            directionsDisplay.setMap(map);
        }
        
        function displayRoute(choice) {
            marker.setVisible(false);
            if(choice == 1) {
                mode = 'WALKING';
            }
            if(choice == 2) {
                mode = 'BICYCLING';
            }
            if(choice == 3) {
                mode = 'DRIVING';
            }
            var request = {
                origin: placesJSON.location,
                destination: placeLoc,
                travelMode: mode
            };
            directionService.route(request, function(response, status) {
                if(status == 'OK') {
                    directionsDisplay.setDirections(response);
                }
            });
        }
        
        function clearAll() {
            document.getElementById("searchResult").innerHTML = "";
            document.getElementById("placeDetails").innerHTML = "";
            document.getElementById("keyword").value = "";
            document.getElementById("category").value = "default";
            document.getElementById("distance").value = "";
            document.getElementsByName("location")[0].checked = true;
            var locAddr = document.getElementById("place");
            locAddr.value = "";
            locAddr.disabled = true;
        }
        
        
    </script>
</head>
<body onload="getGeolocation()">
    <div id="searchForm">
        <h1>Travel and Entertainment Search</h1>
        <hr>
        <form method="post" action="" onsubmit="return false">
            <table>
                <tr>
                    <td colspan="2">
                        Keyword
                        <input type="text" id="keyword" name="keyword" title="Please fill out this field." required></td>
                </tr>
                <tr>
                    <td colspan="2">
                        Category
                        <select name="category" id="category">
                            <option value="default">default</option>
                            <option value="cafe">cafe</option>
                            <option value="bakery">bakery</option>
                            <option value="restaurant">restaurant</option>
                            <option value="beauty_salon">beauty salon</option>
                            <option value="casino">casino</option>
                            <option value="movie_theater">movie theater</option>
                            <option value="lodging">lodging</option>
                            <option value="airport">airport</option>
                            <option value="train_station">train station</option>
                            <option value="subway_station">subway station</option>
                            <option value="bus_station">bus station</option>
                        </select>
                    </td>
                </tr>

                <tr>

                    <td width="50%">
                        Distance (miles)
                        <input type="text" id="distance" name="distance" placeholder="10">
                        from
                    </td>
                    <td width="50%">
                        <input type="radio" name="location" value="here" checked onclick="checkRadios()">
                        Here
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <input type="radio" name="location" value="other" onclick="checkRadios()">
                        <input type="text" id="place" name="place" placeholder="location" title="Please fill out this field." disabled>
                    </td>
                </tr>

            </table>
            <input id="submit" type="submit" name="submit" value="Search" disabled onclick="searchPlaces()">
            <input type="button" value="Clear" onclick="clearAll()">
        </form>
    </div>

    <div id="searchResult"></div>
    <div id="placeDetails"></div>
</body>
</html>








