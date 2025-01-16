import {
	CalendarClientID,
	CalendarAPI,
	WeatherAPI,
	NewsAPI,
} from "./config.js";

const CLIENT_ID = CalendarClientID;
const API_KEY = CalendarAPI; // Replace with your actual API key
const DISCOVERY_DOCS = [
	"https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

function handleClientLoad() {
	gapi.load("client:auth2", initClient);
}

function initClient() {
	gapi.client
		.init({
			apiKey: API_KEY,
			clientId: CLIENT_ID,
			discoveryDocs: DISCOVERY_DOCS,
			scope: SCOPES,
		})
		.then(() => {
			gapi.auth2
				.getAuthInstance()
				.signIn()
				.then(() => {
					console.log("Signed in successfully");
					listUpcomingEvents();
				})
				.catch((error) => {
					console.error("Error signing in", error);
				});
		})
		.catch((error) => {
			console.error("Error initializing client", error);
		});
}

function listUpcomingEvents() {
	gapi.client.calendar.events
		.list({
			calendarId: "primary",
			timeMin: new Date().toISOString(),
			showDeleted: false,
			singleEvents: true,
			maxResults: 10,
			orderBy: "startTime",
		})
		.then((response) => {
			console.log("Events response:", response); // Add this line
			const events = response.result.items;
			const calendarEvents = document.getElementById("calendar-events");
			calendarEvents.innerHTML = "";

			if (events.length > 0) {
				events.forEach((event) => {
					const li = document.createElement("li");
					const start = event.start.dateTime || event.start.date;
					li.textContent = `${start} - ${event.summary}`;
					calendarEvents.appendChild(li);
				});
			} else {
				calendarEvents.innerHTML = "<li>No upcoming events found.</li>";
			}
		})
		.catch((error) => {
			console.error("Error fetching events", error);
		});
}

function updateTime() {
	const now = new Date();
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const day = days[now.getDay()];
	const date = now.toLocaleDateString();

	let hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	const time = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")} ${ampm}`;

	document.getElementById("time").innerText = time;
	document.getElementById("date").innerText = `${day}, ${date}`;
}

function updateLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition((position) => {
			const { latitude, longitude } = position.coords;
			fetchWeather(latitude, longitude);
		});
	} else {
		document.getElementById("location").innerText =
			"Geolocation is not supported by this browser.";
	}
}

function fetchWeather(lat, lon) {
	const apiKey = WeatherAPI; // Replace with your OpenWeatherMap API key
	const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Katpadi&aqi=yes`;

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			console.log("Weather data:", data); // Add this line
			const city = data.location.name;
			const weather = data.current.condition.text;
			const temperature = data.current.temp_c;
			const iconUrl = data.current.condition.icon;
			document.getElementById("location").innerText = city;
			document.getElementById(
				"weather-info"
			).innerText = `${weather}, ${temperature}°C`;
			document.getElementById("weather-icon").src = iconUrl;
		})
		.catch((error) => {
			console.error("Error fetching weather data:", error);
			document.getElementById("location").innerText =
				"Error fetching location data.";
			document.getElementById("weather-info").innerText =
				"Error fetching weather data.";
		});
}

function fetchNews() {
	const apiKey = NewsAPI;
	const url = `https://newsapi.org/v2/everything?q=stock%20market&apiKey=${apiKey}`;

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			const articles = data.articles;
			let currentIndex = 0;
			const newsItem = document.getElementById("news-item");

			function displayNextArticle() {
				if (articles.length > 0) {
					newsItem.innerText = articles[currentIndex].title;
					currentIndex = (currentIndex + 1) % articles.length;
				}
			}

			displayNextArticle();
			setInterval(displayNextArticle, 10000); // 10 seconds delay
		})
		.catch((error) => {
			console.error("Error fetching news data:", error);
			document.getElementById("news-item").innerText =
				"Error fetching news data.";
		});
}

function displayQuotes() {
	const quotes = [
		"Focus on what you can control.",
		'"You become what you give your attention to." - Epictetus',
		'"We suffer more in imagination than in reality." - Seneca',
		"You can't learn what you think you already know.",
		"Stop waiting to demand the best for yourself.",
		'"Be tolerant with others and strict with yourself." - Marcus Aurelius',
		'"Don\'t explain your philosophy. Embody it." - Epictetus',
		"Associate only with people who improve you.",
		'"The greatest remedy for anger is delay." - Seneca',
		"Value time more than possessions.",
		"You always own the option of having no opinion.",
		'"Never be overheard complaining...even to yourself." - Marcus Aurelius',
		"Most of what we say and do is not essential.",
		"Difficulties show a person's character.",
		'"Limit yourself to the present." - Marcus Aurelius',
		"Receive without pride, let go without attachment.",
		"Stop caring about what other people say, think, or do.",
		"Anxiety is within you and your perceptions, not outside.",
		"Focus on effort, not results.",
		"To improve, you have to be OK with looking foolish.",
		"Build a life you don't need to escape from.",
	];
	let currentIndex = 0;
	const quoteItem = document.getElementById("quote-item");

	function displayNextQuote() {
		quoteItem.innerText = quotes[currentIndex];
		currentIndex = (currentIndex + 1) % quotes.length;
	}

	displayNextQuote();
	setInterval(displayNextQuote, 10000); // 10 seconds delay
}

setInterval(updateTime, 1000);
updateTime();
updateLocation();
fetchNews();
displayQuotes();
handleClientLoad();
