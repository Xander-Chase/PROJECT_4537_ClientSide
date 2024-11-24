const API_ENDPOINT = "/api/user/generate";
const API_USAGE_ENDPOINT = "/api/user/getApiUsage";
const API_DELETE = "/api/user/deleteStory";

// Dashboard class component
class Dashboard {
    // Call the constructor with the user data
    constructor(data) {
        this.init();
        this.userData = data;
    }

    // Initialize the dashboard
    init = () => 
    {
        this.loadList();
        this.loadButtonFunctionality();
    }

    // Load the button functionality
    loadButtonFunctionality = () =>
    {
        // Set the generate a story / new story button to call the API
        document.getElementById("index_form").onsubmit = async (event) => 
        {
            // Dont re-fresh page
            event.preventDefault(); 

            let spinner =
            // Set loading spinner
            document.getElementById("loading");
            spinner.style.visibility = "visible";

            // Disable the submit button
            document.getElementById("submitPrompt").disabled = true;

            // You have to call the database again to get the amount of API Usages...
            // If the user has no API usages left, then alert them and return
            const usagePayload = await Utils.GetFetch(`${API_URL}${API_USAGE_ENDPOINT}`, {});
            if (usagePayload.ok)
            {
                // Get the amount of API usages left
                const amount = (await usagePayload.json()).apiUsage.count;
                {
                    // replace local storage with the new amount
                    let userData = JSON.parse(localStorage.getItem(localStorageNames.data)); // constants.js
                    userData.apiUsage.count = amount;
                    localStorage.setItem(localStorageNames.data, JSON.stringify(userData));
                }

                // If the user has no API usages left, alert them and return
                if (amount === 0)
                {
                    alert(INSUFFICIENT_API_USAGES);
                    // hide spinner
                    spinner.style.visibility = "hidden";
                    // Don't continue the function
                    return;
                }
            }

            // Get the prompt given by the user
            const prompt = document.getElementById("prompt").value;
            try {
                // Fetch the story
                await this.fetchStory(prompt)
                    .then(
                        (data) => {

                        // Store the generated story + prompts in localStorage
                        let userData = JSON.parse(localStorage.getItem(localStorageNames.data)); // constants.js

                        // If stories is an array
                        if (userData.stories.title === undefined)
                        {
                            userData.stories.push(data.storyObj.story);
                            // Set the story index to the last story
                            localStorage.setItem(localStorageNames.storyIndex, userData.stories.length - 1);
                        }
                        else // If stories is an object - not really confident on removing this part
                            userData.stories = [userData.stories, data.storyObj.story];

                        // Store the updated user data in localStorage
                        localStorage.setItem(localStorageNames.data, JSON.stringify(userData));
                        // Reset current page number
                        localStorage.setItem(localStorageNames.currentPaginationIndex, 0);
                        // Redirect to the story page
                        window.location.href = "story.html";
                    },
                    // If the story failed to generate, alert the user
                    (error) => { alert(error); }
            )
            } catch (error) {
                document.getElementById("submitPrompt").disabled = false;
                console.error(error);
                alert(ERROR_GEN_STORY_TWO);
            }
        }
    }

    // Load the list of stories
    loadList = () =>
    {
        let stories = JSON.parse(localStorage.getItem(localStorageNames.data)).stories;
        if (stories.title !== undefined)
            // If stories is an object, render the story
            this.renderStory(stories);
        else
            stories.forEach((story, index) => {
                this.renderStory(story, index);
            });
    }

    // Function to generate a story
    fetchStory = async (prompt) =>
    {
        // Fetch the story from the API
        return new Promise(async (res, rej) => {
            const response = await Utils.PostFetch(`${API_URL}${API_ENDPOINT}`, 
                { prompt: prompt, userId: this.userData.user._id }
            );

            // If the response is okay, return the data
            if (response.ok)
                res(await response.json());
            else
                // If the response is not okay, reject the promise
                rej(ERROR_GEN_STORY);
        });
    }

    // Render the story
    renderStory = (story, index) =>
    {
        // get template node
        let template = document.getElementById("story-item-template");   

        // clone node
        let clone = template.content.cloneNode(true);
        clone.querySelector(".title").textContent = story.title;
        clone.querySelector(".story-item-description").textContent = story.summary;
        clone.querySelector(".go").addEventListener("click", () => {


            localStorage.setItem(localStorageNames.currentPaginationIndex, 0);
            if (index !== undefined) // if index is defined, use that
                localStorage.setItem(localStorageNames.storyIndex, index);
            else // if index is not defined, find the index
                localStorage.setItem(localStorageNames.storyIndex, 0);

            // redirect to story page
            window.location.href = "story.html";
        });

        // add event listener to delete button
        clone.querySelector(".delete").addEventListener("click", async () => {
            // get stories from local storage
            let stories = JSON.parse(localStorage.getItem(localStorageNames.data)).stories;

            // find the index of the story
            let storyIndex = 0;
            if (index !== undefined) // if index is defined, use that
                storyIndex = index;
            else // if index is not defined, find the index
                storyIndex = stories.findIndex((s) => s._id === story._id);

            // call api first then check if success or not
            // if success, then remove from local storage
            // if failed, alert user
            const deletePayload = await Utils.DeleteFetch(`${API_URL}${API_DELETE}`, {
                storyId: stories[storyIndex]._id
            });

            // if success
            if (deletePayload.ok)
            {
                // remove from local storage
                const data = JSON.parse(localStorage.getItem(localStorageNames.data));
                stories.splice(storyIndex, 1);
                localStorage.setItem(localStorageNames.data, JSON.stringify({ 
                    ...data,
                    stories: stories
                 }));
                // refresh page
                window.location.reload();
            }
            else
                alert(FAILURE_STORY_DELETION);
        });

        // append node
        document.getElementById("story-list").appendChild(clone);
    }
}

// Export the Dashboard class for home.html
export {Dashboard};