class Utils {
    // GitHub Co-Pilot assisted with this function
    static cleanString = (str) =>
    {
        // This is the pattern that we will only get from the AI response, nothing else
        let pattern = /[^a-zA-Z0-9 \" \' \, \. \-]/g;
        // Replace any character that does not contain this pattern with an empty string
        return str.replace(pattern, '');
    }

    // Default function to handle Get requests
    static GetFetch = async (url, body) =>
    {
        // No body in GET requests
        // Fetch the data from the URL
        const payload = await fetch(url, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include" // Include credentials in the request for JWT Cookies
        });

        // If unauthorized, clear the local storage
        if (payload.status === 401)
            localStorage.clear();
        return payload;
    }

    // Default function to handle Post requests
    static PostFetch = async (url, body) =>
    {
        // Fetch the data from the URL
        const payload = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify(body),
        });

        // If unauthorized, clear the local storage
        if (payload.status === 401)
            localStorage.clear();
        return payload;
    }

    // Default function to handle Put requests
    static PutFetch = async (url, body) =>
    {
        // Fetch the data from the URL
        const payload = await fetch(url, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify(body),
        });

        // If unauthorized, clear the local storage
        if (payload.status === 401)
            localStorage.clear();
        return payload;
    }

    // Default function to handle Delete requests
    static DeleteFetch = async (url, body) =>
    {
        // Fetch the data from the URL
        const payload = await fetch(url, {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify(body),
        });

        // If unauthorized, clear the local storage
        if (payload.status === 401)
            localStorage.clear();
        return payload;
    }
}