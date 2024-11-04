// Determine if the app is running on localhost
const isLocalhost = window.location.hostname === 'localhost';

// Set the API_URL based on the environment
const API_URL = isLocalhost
? 'http://localhost:8080'
: 'https://comp-4537-server-side-863fa8c790dd.herokuapp.com';

/**
const API_URL = isLocalhost
? 'http://localhost:8080'
: 'https://comp-4537-server-side-863fa8c790dd.herokuapp.com';
*/

const TITLE_OPENING = "Your remaining usages,";
const EXCLIMATION_MARK = "!";
const DESCRIPTION_OPENING = "You have";
const DESCRIPTION_CLOSING = "remaining out of 20 API consumptions left!";
const LOGIN_FAILED = "Login failed. Please try again.";
const NETWORK_ERROR = "Network error. Please try again later.";

const secretKey = "key";
const createToken = (username, password) => {

    // Check if the user exists
    // dont do this yet, we dont have database at moment
    // user = find user in database
    // if !user then return 401

    // Check if the password is correct
    // if user.password !== password then return 401

    // Create a token
    // const token = jwt.sign({userId: `${username}-${password}`}, secretKey, {
    //     expiresIn: '1h'
    // });

    // if (Storage !== undefined) {
    //     localStorage.setItem('token', token);
    // } else {
    //     console.log('Local storage is not supported');
    // }
}

const authenicate = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwt.verify(token, secretKey);
        localStorage.setItem('id', decoded);
        return true;
    }
    else
    {
        return false;
    }
}
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
                const payload = await fetch(`${API_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
        
                if (payload.ok)
                    res(payload);
                else
                    rej(payload.json());
                
            } catch (err) {
                rej(err);
            }
        });

        response.then(
            // If logged in successfully
            async (payload) => {

                // Parse the response JSON
                let data = await payload.json();

                // store the JWT token in localStorage
                localStorage.setItem("token", data.token);

                // Create new promise that gets user from database
                new Promise(async (res, rej) => {
                    try {
                        const userPayload = await fetch(`${API_URL}/api/auth/user`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${data.token}`,
                            }
                        });
                        
                        if (userPayload.ok)
                            res(userPayload);
                        else
                            rej(userPayload.json());
                    }
                    catch (err)
                    {
                        rej(err);
                    }
                }).then(
                    // If we were able to get the user
                    async (userPayload) => {
                        // Parse the response JSON
                        const dataJson = await userPayload.json();

                        // Display the user's remaining API consumptions
                        const title = `${TITLE_OPENING} ${dataJson.user.username}${EXCLIMATION_MARK}`;
                        const description = `${DESCRIPTION_OPENING} ${dataJson.user.api_consumptions} ${DESCRIPTION_CLOSING}`;
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
                let data = payload.error ?? payload;
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
    