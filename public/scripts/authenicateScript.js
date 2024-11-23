const TITLE_OPENING = "Your remaining usages,";
const EXCLIMATION_MARK = "!";
const DESCRIPTION_OPENING = "You have";
const DESCRIPTION_CLOSING = "remaining out of 20 API consumptions left!";
const LOGIN_FAILED = "Login failed. Please try again.";
const NETWORK_ERROR = "Network error. Please try again later.";
const API_REGISTER = "/api/auth/register";

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
        const registerPayload = await Utils.PostFetch(`${API_URL}${API_REGISTER}`, {
            username: username,
            email: email,
            password: password
        });

        const data = await registerPayload.json();
        if (registerPayload.ok)
        {
            alert('Signup successful! You can now log in.');
            window.location.href = 'index.html';
        }
        else
            throw new Error(data.error || "Registration failed. Please try again.");
    }
    catch (error)
    {
        console.error("Error:", error);
        alert(NETWORK_ERROR);
        registerButton.removeAttribute("disabled");
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
                const payload = await Utils.PostFetch(`${API_URL}/api/auth/login`, {
                    email: email,
                    password: password
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

                // Create new promise that gets user from database
                new Promise(async (res, rej) => {
                    try {
                        const userPayload = await Utils.GetFetch(`${API_URL}/api/user/info`, {});
                        
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
                        localStorage.setItem("isAuthenticated", "true");
                        localStorage.setItem("userData", JSON.stringify(dataJson));
                        // block scope
                        {
                            // expire in 1hr
                            const expirationDate = new Date().setHours(new Date().getHours() + 1);
                            localStorage.setItem("expirationDate", `${expirationDate}`);
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

async function NavigateUserProperlyAuthPage() {
    // If user is authenticated, redirect to home page
    if (localStorage.getItem("isAuthenticated")) {
        // If token is expired, redirect to login page
        if (isExpired())
            window.location.href = "index.html";
        // If token is not expired, redirect to home page
        else
            window.location.href = 'home.html';
    }
}

const NavigateUserProperlyAdminPage = async () => 
{
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData)
        window.location.href = "index.html";
    if (userData.role.role !== "admin")
        window.location.href = "home.html";   
}

async function NavigateUserProperlyKick () {
    // If token is expired, redirect to login page
    // If user is not authenticated, redirect to login page
    if (isExpired() || !localStorage.getItem("isAuthenticated"))
        window.location.href = "index.html";
}

const isExpired = () => {
    const expirationDate = parseInt(localStorage.getItem("expirationDate"));

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