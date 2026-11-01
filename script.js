const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeIcon.textContent = "☀️";
    } else {
        themeIcon.textContent = "🌙";
    }
});
function updateDateTime() {
    const now = new Date();

    document.getElementById("weatherDate").textContent =
        now.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    document.getElementById("weatherTime").textContent =
        now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
}
// 1. DATE AND TIME
updateDateTime();
setInterval(updateDateTime, 1000);
// 2. CLEAR ERROR WHEN USER TYPES
const cityInput = document.querySelector(".search-bar input");
const errorMsg = document.querySelector(".error-msg");
cityInput.addEventListener("input", function(){
    errorMsg.textContent = ""
})
// 3. SELECTORS
const locationBtn = document.querySelector(".location-btn ");
const getWeather = document.querySelector(".search-bar button");
const apiKey = "00a97551b590cf841f0bf1fdca0fb829";
const cityName = document.querySelector("#city-Name");
const countryName = document.querySelector("#country-Name");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#wind-Speed");
const pressure = document.querySelector("#pressure");
const feelsLike = document.querySelector("#feels-Like");
const weatherDescription = document.querySelector("#weather-description");
const weatherIcon = document.querySelector(".temperature-section .weather-icon");
// 4. FUNCTION TO FETCH WEATHER DATA
function fetchWeather(city) {
    errorMsg.textContent = "SEARCHING...";
        const temperature = document.querySelector(".temperature");
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
        fetch(apiUrl)
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.message || "City not found. Please enter a valid city name.");
            }
            return data;
        });
    })
    .then(data => {
        console.log(data);

        errorMsg.textContent = "";
        console.log("Temperature:", data.main.temp);
        console.log("Humidity:", data.main.humidity);
        console.log("Wind speed:", data.wind.speed);
        console.log("Pressure:", data.main.pressure);
        console.log("Feels like:", data.main.feels_like);
        console.log("Weather condition:", data.weather[0].description);

        cityName.textContent = data.name;
        countryName.textContent = data.sys.country;

        const condition = data.weather[0].description;
        weatherDescription.textContent =condition.charAt(0).toUpperCase() + condition.slice(1);

        temperature.textContent = data.main.temp.toFixed(1) + "°C";
        humidity.textContent = data.main.humidity + "%";
        windSpeed.textContent = (data.wind.speed * 3.6).toFixed(1) + " km/h";
        pressure.textContent = data.main.pressure + " hPa";
        feelsLike.textContent = data.main.feels_like.toFixed(1) + "°C";
        // console.log("Weather condition:", data.weather[0].description);
        // console.log("Weather icon code:", iconCode);
        const iconCode = data.weather[0].icon;
        if (iconCode === "01n") {
            weatherIcon.innerHTML = "🌙";
        } 
        else if (iconCode === "01d") {
            weatherIcon.innerHTML = "☀️";
        } 
        else {
            weatherIcon.innerHTML = `<img
            src="https://openweathermap.org/img/wn/${iconCode}@2x.png"
            alt="${condition}">`;
        }
        fetchForecast(city);
    })
    .catch(error => {
        errorMsg.textContent = error.message;
        console.log("Error fetching weather:", error);
    });
}
// FUNCTION TO FETCH FORECAST DATA
function fetchForecast(city){
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    fetch(forecastUrl)
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.message || "Forecast data not found.");
            }
            return data;
        });
    })
    .then(data => {
            console.log("Forecast Data:", data);
            // Group forecast readings by local date
            const dailyForecast = {};
            data.list.forEach(item => {
                const cityTime = new Date(
                    (item.dt + data.city.timezone) * 1000
                );
                const date = cityTime.toISOString().split("T")[0];
                if (!dailyForecast[date]) {
                    dailyForecast[date] = {
                        temperatures: [],
                        conditions: []
                    };
                }
                dailyForecast[date].temperatures.push(item.main.temp);
                dailyForecast[date].conditions.push({
                    hour: cityTime.getUTCHours(),
                    condition: item.weather[0].main
                });
            });
            // Get the five forecast cards
            const forecastCards = document.querySelectorAll(".forecast-day");
            const days = Object.keys(dailyForecast).slice(0, 5);
            days.forEach((date, index) => {
                const dayData = dailyForecast[date];
                // Calculate minimum and maximum temperatures
                const temperatures = dayData.temperatures;
                const maxTemp = Math.round(Math.max(...temperatures));
                const minTemp = Math.round(Math.min(...temperatures));
                // Select the weather condition closest to midday
                const middayCondition = dayData.conditions.reduce((closest, current) => {
                    return Math.abs(current.hour - 12) < Math.abs(closest.hour - 12)
                        ? current
                        : closest;
                });
                const condition = middayCondition.condition;
                // Convert weather conditions into emojis
                let icon = "🌤️";
                if (condition === "Clear") {
                    icon = "☀️";
                } else if (condition === "Clouds") {
                    icon = "☁️";
                } else if (condition === "Rain" || condition === "Drizzle") {
                    icon = "🌧️";
                } else if (condition === "Thunderstorm") {
                    icon = "⛈️";
                } else if (condition === "Snow") {
                    icon = "❄️";
                } else if (
                    condition === "Mist" ||
                    condition === "Fog" ||
                    condition === "Haze"
                ) {
                    icon = "🌫️";
                }
                // Convert date into weekday name
                const weekday = new Date(date + "T12:00:00Z")
                    .toLocaleDateString("en-US", {
                        weekday: "short",
                        timeZone: "UTC"
                    });
                // Update HTML
                if (forecastCards[index]) {
    forecastCards[index].querySelector("p").textContent = weekday;
    forecastCards[index].querySelector("span").textContent = icon;
    forecastCards[index].querySelector("h4").textContent =
        `${maxTemp}° / ${minTemp}°`;
}
            });
        })
        .catch(error => {
            console.log("Forecast Error:", error);
        });
}
// FUNCTION TO FETCH POPULAR CITIES WEATHER
function fetchPopularCities() {
    const popularCityCards = document.querySelectorAll(".city-cards");
    popularCityCards.forEach(card => {
        const city = card.dataset.city;
        // Get weather data for each city
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
        fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (!data.main || !data.weather) {
                throw new Error("Weather data unavailable");
            }
            const temperature = card.querySelector("h3 span");
            const weatherIcon = card.querySelector("div > span");
            temperature.textContent = Math.round(data.main.temp) + "°C";
            const iconCode = data.weather[0].icon;
            weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${data.weather[0].description}">`;
        })
        .catch(error => {
            console.log("Popular City Error:", city, error);
        });
    });
}
// POPULAR CITIES CLICK EVENT
const popularCityCards = document.querySelectorAll(".city-cards");
popularCityCards.forEach(card => {
    card.addEventListener("click", function() {
        const city = card.dataset.city;
        fetchWeather(city);
    });
});
// 5. SEARCH BUTTON EVENT (CLICK )
getWeather.addEventListener("click", function() {

    const city = cityInput.value.trim();

    if (city === "") {
        errorMsg.textContent = "Enter Valid City Name";
        return;
    }

    fetchWeather(city);

});
// (KEYBOARD ENTER)
cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        const city = cityInput.value.trim();

        if (city === "") {
            errorMsg.textContent = "Enter Valid City Name";
            return;
        }

        fetchWeather(city);
    }

});
// 6. LOAD ISLAMABAD WEATHER WHEN WEBSITE OPENS
fetchWeather("Islamabad");
fetchPopularCities();
