// Determine if the app is running on localhost
const isLocalhost = window.location.hostname === 'localhost';

// Set the API_URL based on the environment
const API_URL = isLocalhost
    ? 'http://localhost:8080'
    : "https://storybox.azurewebsites.net";

const localStorageNames = {
    data: "userData",
    isAuthenticated: "isAuthenticated",
    expirationDate: "expirationDate",
    storyIndex: "storyIndex",
    currentPaginationIndex: "currentPaginationIndex"
}