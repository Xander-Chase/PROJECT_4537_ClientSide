class Utils {
    // Helped with Co-Pilot
    static cleanString(str)
    {
        // This is the pattern that we will only get from the AI response, nothing else
        let pattern = /[^a-zA-Z0-9 \" \' \, \. \-]/g;
        // Replace any character that does not contain this pattern with an empty string
        return str.replace(pattern, '');
    }

    static async GetFetch(url, body)
    {
        return await fetch(url, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include"
        });
    }

    static async PostFetch(url, body)
    {
        console.log("rwar");
        return await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify(body),
        });
    }
}