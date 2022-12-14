const apiKey = "5a3f3d652dfaa9c7716468ab35a9130f";
var userFormEl = $("#citySearch");

var updateCurrentWeather = function(response) {

    var dateEl = $("#todaysDate");
    var tempEl = $("#temp");
    var humidityEl = $("#humidity");
    var windSpeedEl = $("#windSpeed");
    var iconEl = $("#icon");


    var cityTemp = response.main.temp;
    var cityHumidity = response.main.humidity;
    var cityWindSpeed = response.wind.speed;
    var cityTimeCodeUnix = response.dt;
    var currentDate = new Date(cityTimeCodeUnix*1000).toLocaleDateString("en-US");
    var currentIcon = response.weather[0].icon;
    

    dateEl.text(currentDate);
    tempEl.text(cityTemp);
    humidityEl.text(cityHumidity);
    windSpeedEl.text(cityWindSpeed);
    iconEl.attr("src", "http://openweathermap.org/img/wn/" + currentIcon + ".png");

    var cityTimeCodeUnix = response.dt;
    var s = new Date(cityTimeCodeUnix*1000).toLocaleDateString("en-US")


    var locationArr = {
        lat: response.coord.lat,
        long: response.coord.lon
    }
    
    return locationArr;
}; 

var updateUVIndex = function(val) {
    var uvEl = $("#UV");
    uvEl.text(val);
    uvEl.removeClass();
    };

var getCurrentWeather = function(cityName) {
    
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {

        if (response.ok) {
            response.json().then(function(response) {
                var cityContainerEl = $("#city");
                cityContainerEl.text(cityName);
                updateSearchHistory(cityName);

                var location = updateCurrentWeather(response);
                get5DayForecast(cityName);
                
                var apiUrlUV = "https://api.openweathermap.org/data/2.5/uvi?lat=" + location.lat  + "&lon=" + location.long + "&appid=" + apiKey;
                return fetch(apiUrlUV);
            }).then(function(response) {
                response.json().then(function(response) {
                    updateUVIndex(response.value);
                });
            });
        } else {
            alert("City not found");
        };
    }).catch(function(error) {
        alert("Unable to connect to OpenWeather");
    })
};

var get5DayForecast = function(cityName) {
    var forecastContainerEl = $("#day-forecast");

    forecastContainerEl.html("");
    
    var apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {

        response.json().then(function(response) {

            var idx = getIndex(response);
    
            for (i=0;i<5;i++) {
                
                var actualIdx = i * 8 + idx + 4;
                if (actualIdx>39) {actualIdx = 39};
    
                var timeCodeUnix = response.list[actualIdx].dt;
                var time = new Date(timeCodeUnix*1000).toLocaleDateString("en-US");
                var icon = response.list[actualIdx].weather[0].icon;
                var temp = response.list[actualIdx].main.temp;
                var humidity = response.list[actualIdx].main.humidity;
    
                var cardEl = $("<div>").addClass("col-2 card bg-primary pt-2");
                var cardTitleEl = $("<h5>").addClass("card-title").text(time);
                var divEl = $("<div>").addClass("weather-icon");
                var cardIconEl = $("<img>").addClass("p-2").attr("src","http://openweathermap.org/img/wn/" + icon + ".png");
                var cardTempEl = $("<p>").addClass("result-text").text("Temp: " + temp + " " + String.fromCharCode(176) + "F");
                var cardHumidityEl = $("<p>").addClass("card-text mb-2").text("Humidity: " + humidity + "%");
    
                cardEl.append(cardTitleEl);
                divEl.append(cardIconEl);
                cardEl.append(divEl);
                cardEl.append(cardTempEl);
                cardEl.append(cardHumidityEl);
                forecastContainerEl.append(cardEl);
            }
        });
    }).catch(function(error) {
        alert("Unable to connect to OpenWeather");
    })
};

var formSubmitHandler = function(event) {
    target = $(event.target);
    targetId = target.attr("id");

    if (targetId === "citySearchList") {
        var city = target.text();
    } else if (targetId === "search-submit") {
        var city = $("#citySearch").val();
    };

    if (city) {
        getCurrentWeather(city);
    } else {
        alert("please enter a city");
    }

    target.blur();
};

var buildSearchHistory = function() {
    var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (searchHistory == null) {
        searchHistory = ["Los Angeles","Houston","Tokyo","Nashville","Portland","New York","Seattle"];
        localStorage.setItem("searchHistory",JSON.stringify(searchHistory));
    }
    var groupContainer = $(".list-group");
    groupContainer.html("");
    for (i in searchHistory) {
        var buttonEl = $("<button>")
            .addClass("list-group-item list-group-item-action")
            .attr("id", "citySearchList")
            .attr("type", "button")
            .text(searchHistory[i]);
        groupContainer.append(buttonEl);
    }
};


var updateSearchHistory = function(city) {
    var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    searchHistory.unshift(city);
    searchHistory.pop();
    localStorage.setItem("searchHistory",JSON.stringify(searchHistory));
    var listItems = $(".list-group-item");
    for (l in listItems) {
        listItems[l].textContent = searchHistory[l];
    };
}

var getIndex = function(response) {

    var idx = 0
    for (i=1;i<response.list.length;i++) {
        var currentTime = new Date(response.list[i].dt*1000);
        var lastTime = new Date(response.list[i-1].dt*1000);
        if (currentTime.getDay() != lastTime.getDay()) {
            if (i == 8) {
                idx = 0;
                return idx;
            } else {
                idx = i;
                return idx;
            };
        };
    };
};


buildSearchHistory();

$("button").click(formSubmitHandler);

$('#citySearch').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        var city = $("#citySearch").val();
        if (city) {
            getCurrentWeather(city);
        } else {
            alert("please enter a city");
        }
    }
});