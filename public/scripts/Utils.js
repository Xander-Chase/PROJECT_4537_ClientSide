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
        const payload = await fetch(url, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include"
        });
        if (payload.status === 401)
            localStorage.clear();
        return payload;
    }

    static async PostFetch(url, body)
    {
        const payload = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify(body),
        });
        if (payload.status === 401)
            localStorage.clear();
        return payload;
    }

    static async PutFetch(url, body)
    {
        const payload = await fetch(url, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify(body),
        });
        if (payload.status === 401)
            localStorage.clear();
        return payload;
    }

    static async DeleteFetch(url, body)
    {
        const payload = await fetch(url, {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify(body),
        });
        if (payload.status === 401)
            localStorage.clear();
        return payload;
    }
}