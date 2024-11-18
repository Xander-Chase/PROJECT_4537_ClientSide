/**
 * GetUserPromise - Checks if the user is authenicated and gets the user data
 * @returns {Promise} - Promise that resolves with the user data if the user is authenicated, rejects otherwise
 */
async function GetUserPromise() {
  return new Promise(async (resolve, reject) => {
    const response = await Utils.GetFetch(`${API_URL}/api/auth/user`);
    if (response.ok)
      resolve(response.json());
    else
      reject();
  });
}

/**
* Gets user data and uses that data to check the role of the user
* @returns {Promise<bool>} - Promise that resolves if the user is an admin, rejects otherwise
*/
async function isAdmin() {
  const userData = await GetUserPromise();
  console.log(userData);
  return userData.user.role === "admin";
};

// Loads header
async function loadHeader() {
  try {
    
    // Get header 
    const response = await fetch('./components/header.html');

    // Set the header element with HTML text
    const headerString = await response.text();

    const parser = new DOMParser();
    const headerHTML = parser.parseFromString(headerString, 'text/html');
    const isAdminUser = await isAdmin();
    const authButtons = headerHTML.getElementsByClassName("auth-button");
    const logOutButton = headerHTML.getElementById("logout-button");
    if (!isAdminUser)
      headerHTML.getElementById("adminDashboard").style.display = "none";
    
    // If user is authenicated, hide the sign in buttons
    Object.values(authButtons).forEach(element => {
      element.style.display = "none";
    });

    const headerElement = headerHTML.getElementById('header');
    document.getElementById('header').innerHTML = headerElement.innerHTML;
    
    document.getElementById('logout-button').addEventListener('click', async () => {
      console.log("Logging out");
      const response = await Utils.GetFetch(`${API_URL}/api/auth/logout`);
        if (response.ok) {
          localStorage.clear();
          window.location.href = 'index.html';
        } else {
          alert('Error logging out');
        }
      });

    // Load the script
    const script = document.createElement('script');
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
    console.error('Error loading header:', error);
  }

  };

export {loadHeader, isAdmin, GetUserPromise};