const API_LOGOUT = "/api/auth/logout";

/**
* Gets user data and uses that data to check the role of the user
* @returns {Promise<bool>} - Promise that resolves if the user is an admin, rejects otherwise
*/
const isAdmin = async () =>
{
  const userData = JSON.parse(localStorage.getItem(localStorageNames.data));
  return userData.role.role === "admin";
};

// Loads header
const loadHeader = async () =>
{
  try {
    
    // Get header 
    const response = await fetch('./components/header.html');

    // Set the header element with HTML text
    const headerString = await response.text();

    // get text from header and then parse it into HTML
    const parser = new DOMParser();
    const headerHTML = parser.parseFromString(headerString, "text/html");

    const isAdminUser = await isAdmin();
    const authButtons = headerHTML.getElementsByClassName("auth-button");

    // If user is not an admin, hide the admin dashboard button
    if (!isAdminUser)
      headerHTML.getElementById("adminDashboard").style.display = "none";
    
    // If user is authenicated, hide the sign in buttons
    Object.values(authButtons).forEach(element => {
      element.style.display = "none";
    });

    // Set the header element
    const headerElement = headerHTML.getElementById("header");
    document.getElementById("header").innerHTML = headerElement.innerHTML;
    
    // Add event listener to logout button
    document.getElementById("logout-button").addEventListener("click", async () => {
      const response = await Utils.PostFetch(`${API_URL}${API_LOGOUT}`, null);
        if (response.ok) {
          // Clear local storage and redirect to index
          localStorage.clear();
          window.location.href = 'index.html';
        } else {
          alert(FAILURE_LOGOUT);
        }
      });

    // Load the script
    const script = document.createElement("script");
    script.textContent = `
      const removeSignInButtons = () => {
        const elements = [...document.getElementsByClassName("signin-button")];
        elements.forEach(element => {
          element.style.display = "none";
        });
      };
      if (localStorage.getItem("isAuthenicated")) {
          removeSignInButtons();
      }
    `;
    document.body.appendChild(script);
  } catch (error) {
    console.error(FAILURE_LOADING_HEADER, error);
  }
};

// Remove story data
const removeStoryData = async () => {
  localStorage.removeItem(localStorageNames.storyIndex);
  localStorage.removeItem(localStorageNames.currentPaginationIndex);
}

export {loadHeader, isAdmin, removeStoryData};