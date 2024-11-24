// Determine if the app is running on localhost
const isLocalhost = window.location.hostname === 'localhost';

// Set the API_URL based on the environment
const API_URL = !isLocalhost
    ? 'http://localhost:8080'
    : 'https://comp-4537-server-side-863fa8c790dd.herokuapp.com';

const localStorageNames = {
    data: "userData",
    isAuthenticated: "isAuthenticated",
    expirationDate: "expirationDate",
    storyIndex: "storyIndex",
    currentPaginationIndex: "currentPaginationIndex"
}