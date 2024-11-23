const API_REGISTER = "/api/auth/register";

// Handler for the register form submission
const onRegister = async (event) => {
    event.preventDefault(); // Prevent page reload on form submit

    // Disable the register button to prevent multiple submissions
    const registerButton = event.target.registerButton;
    registerButton.toggleAttribute("disabled");

    // Collect username, email and password from input fields
    const username = event.target.username.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    try
    {
        // Make a POST request to the register API from server
        const registerPayload = await Utils.PostFetch(`${API_URL}${API_REGISTER}`, {
            username: username,
            email: email,
            password: password
        });

        // If the registration was successful, alert the user and redirect to login page
        const data = await registerPayload.json();
        if (registerPayload.ok)
        {
            alert('Signup successful! You can now log in.');
            window.location.href = 'index.html';
        }
        // If the registration failed, alert the user with the error message
        else
            throw new Error(data.error || "Registration failed. Please try again.");
    }
    catch (error)
    {
        // Handle errors here
        console.error("Error:", error);
        alert(NETWORK_ERROR); // en.js
        registerButton.removeAttribute("disabled");
    }
}

// Handler for the login form submission
const onLogin = async (event) => {
    event.preventDefault(); // Prevent page reload on form submit

    // Disable the login button to prevent multiple submissions
    const loginButton = event.target.loginButton;
    loginButton.toggleAttribute("disabled");

    // Collect email and password from input fields
    const email = event.target.floatingInput.value;
    const password = event.target.floatingPassword.value;

    try {
        // Make a Promise consisting of a POST request to the login API
        const response = new Promise(async (res, rej) => {
            try {
                const payload = await Utils.PostFetch(`${API_URL}/api/auth/login`, {
                    email: email,
                    password: password
                });
        
                // If the response is OK, resolve the promise
                if (payload.ok)
                    res();
                else
                    // If the response is not OK, reject the promise with the response JSON
                    rej(payload.json());
                
            } catch (err) {
                // Catch error and reject the promise with the error
                rej(err);
            }
        });

        // Handle the response from the login API
        response.then(
            // If logged in successfully
            async () => {                

                // Create new promise that gets user from database
                new Promise(async (res, rej) => {
                    try {
                        // Get the user from the database
                        const userPayload = await Utils.GetFetch(`${API_URL}/api/user/info`, {});
                        
                        // If the user was successfully retrieved, resolve the promise
                        if (userPayload.ok)
                            res(userPayload);
                        else
                            // If the user was not successfully retrieved, reject the promise with the response JSON
                            rej(userPayload.json());
                    }
                    catch (err)
                    {
                        // Catch error and reject the promise with the error
                        rej(err);
                    }
                }).then(
                    // If we were able to get the user
                    async (userPayload) => {
                        // Parse the response JSON
                        const dataJson = await userPayload.json();

                        // Display the user's remaining API consumptions
                        const title = `${TITLE_OPENING} ${dataJson.user.username}${EXCLIMATION_MARK}`;
                        const description = `${DESCRIPTION_OPENING} ${dataJson.apiUsage.count} ${DESCRIPTION_CLOSING}`;
                        document.getElementById("panel").innerHTML = 
                            `<h1 class="display-4 fw-bold lh-1 text-body-emphasis mb-3">
                                ${title}
                            </h1>
                            <p class="col-lg-10 fs-4">
                                ${description}
                            </p>
                            <button
                            class="w-50 btn btn-lg btn-primary"
                            onclick="window.location.href = 'home.html'">
                            Home
                            </button>`;

                        // Set the user's data in local storage
                        localStorage.setItem(localStorageNames.isAuthenticated, "true"); // constants.js
                        localStorage.setItem(localStorageNames.data, JSON.stringify(dataJson));

                        // block scope
                        {
                            // expire in 1hr
                            const expirationDate = new Date().setHours(new Date().getHours() + 1);
                            localStorage.setItem(localStorageNames.expirationDate, `${expirationDate}`);
                        }

                    },
                    async (payload) => {
                        // If failed to get the user
                        let data = payload.error ?? payload;
                        alert(data || LOGIN_FAILED);
                        loginButton.removeAttribute("disabled");
                    }
                )
            },
            async (payload) => {
                // If login failed
                let data = payload.error;
                alert(data || LOGIN_FAILED);
                loginButton.removeAttribute("disabled");
            }          
        )
    } catch (error) {
        // Handle network errors
        console.error("Error:", error);
        alert(NETWORK_ERROR);

        // Re-enable the login button
        loginButton.removeAttribute("disabled");
    }
}

// Handler for users who already are logged in and are in the login/signup page
const NavigateUserProperlyAuthPage = async () => {
    // If user is authenticated, redirect to home page
    if (localStorage.getItem(localStorageNames.isAuthenticated)) {
        // If token is expired, redirect to login page
        if (isExpired())
            window.location.href = "index.html";
        // If token is not expired, redirect to home page
        else
            window.location.href = 'home.html';
    }
}

// Handler for users who attempt to access admin page without being an admin
const NavigateUserProperlyAdminPage = async () => 
{
    // If user is not authenticated, redirect to login page
    const userData = JSON.parse(localStorage.getItem(localStorageNames.data)); // constants.js
    // If theres no user data, redirect to login page
    if (!userData)
        window.location.href = "index.html";
    if (userData.role.role !== "admin")
        window.location.href = "home.html";   
}

// Handler for users who attempt to access home page without being logged in
const NavigateUserProperlyKick = async () =>
{
    // If token is expired, redirect to login page
    // If user is not authenticated, redirect to login page
    if (isExpired() || !localStorage.getItem(localStorageNames.isAuthenticated))
        window.location.href = "index.html";
}

// Checks if token is expired
const isExpired = () => {
    const expirationDate = parseInt(localStorage.getItem(localStorageNames.expirationDate));

    // If expiration date is not set, clear local storage and redirect to login page
    if (!expirationDate) {
        localStorage.clear();
        return true;
    }

    // If is already expired, clear local storage and redirect to login page
    if (new Date().getTime() > expirationDate) {
        localStorage.clear();
        return true;
    }
    return false;
}