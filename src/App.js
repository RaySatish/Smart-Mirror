import React, { useEffect, useState } from "react";
import "./App.css";

const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;

function App() {
	const [time, setTime] = useState("");
	const [date, setDate] = useState("");
	const [events, setEvents] = useState([]);
	const [location, setLocation] = useState("");
	const [weather, setWeather] = useState("");
	const [weatherIcon, setWeatherIcon] = useState("");
	const [quote, setQuote] = useState("");
	const [news, setNews] = useState("");
	const [quoteVisible, setQuoteVisible] = useState(true);
	const [newsVisible, setNewsVisible] = useState(true);

	useEffect(() => {
		updateTime();
		const timeInterval = setInterval(updateTime, 1000);
		updateLocation();
		fetchNews();
		displayQuotes();

		return () => {
			clearInterval(timeInterval);
		};
	}, []);

	const updateTime = () => {
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
		hours = hours ? hours : 12;
		const time = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")} ${ampm}`;

		setTime(time);
		setDate(`${day}, ${date}`);
	};

	const updateLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				const { latitude, longitude } = position.coords;
				fetchWeather(latitude, longitude);
			});
		} else {
			setLocation("Geolocation is not supported by this browser.");
		}
	};

	const fetchWeather = (lat, lon) => {
		if (!WEATHER_API_KEY) {
			console.error("Weather API key is missing");
			return;
		}

		const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=yes`;

		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				const city = data.location.name;
				const weather = data.current.condition.text;
				const temperature = data.current.temp_c;
				const iconUrl = data.current.condition.icon;
				setLocation(city);
				setWeather(`${weather}, ${temperature}°C`);
				setWeatherIcon(iconUrl);
			})
			.catch((error) => {
				console.error("Error fetching weather data:", error);
				setLocation("Error fetching location data.");
				setWeather("Error fetching weather data.");
			});
	};

	const fetchNews = () => {
		if (!NEWS_API_KEY) {
			console.error("News API key is missing");
			return;
		}

		const url = `https://newsapi.org/v2/everything?q=stock%20market&apiKey=${NEWS_API_KEY}`;

		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				const articles = data.articles;
				let currentIndex = 0;

				function displayNextArticle() {
					setNewsVisible(false);
					setTimeout(() => {
						if (articles.length > 0) {
							setNews(articles[currentIndex].title);
							currentIndex = (currentIndex + 1) % articles.length;
						}
						setNewsVisible(true);
					}, 500);
				}

				displayNextArticle();
				setInterval(displayNextArticle, 10000);
			})
			.catch((error) => {
				console.error("Error fetching news data:", error);
				setNews("Error fetching news data.");
			});
	};

	const displayQuotes = () => {
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

		function displayNextQuote() {
			setQuoteVisible(false);
			setTimeout(() => {
				setQuote(quotes[currentIndex]);
				currentIndex = (currentIndex + 1) % quotes.length;
				setQuoteVisible(true);
			}, 500);
		}

		displayNextQuote();
		setInterval(displayNextQuote, 10000);
	};

	return (
		<div className="App">
			<div id="datetime">
				<div id="date">{date}</div>
				<div id="time">{time}</div>
			</div>
			<div id="calendar">
				<h2>To-Do List</h2>
				<ul id="calendar-events">
					{events.length > 0 ? (
						events.map((event, index) => (
							<li key={index}>
								{event.start.dateTime || event.start.date} - {event.summary}
							</li>
						))
					) : (
						<li>No upcoming events found.</li>
					)}
				</ul>
			</div>
			<div id="info">
				<div id="location">{location}</div>
				<div id="weather">
					<img id="weather-icon" src={weatherIcon || null} alt="Weather Icon" />
					<span id="weather-info">{weather}</span>
				</div>
			</div>
			<div id="quotes">
				<div id="quote-item" className={quoteVisible ? "visible" : "hidden"}>
					{quote}
				</div>
			</div>
			<div id="news">
				<div id="news-item" className={newsVisible ? "visible" : "hidden"}>
					{news}
				</div>
			</div>
			<pre id="content" style={{ whiteSpace: "pre-wrap" }}></pre>
		</div>
	);
}

export default App;
