const API_ENDPOINT = "/api/user/generate";
const ERROR_GEN_STORY = "Error generating story";
const ERROR_GEN_STORY_TWO = "An error occurred while generating the story.";
class Dashboard {
    constructor(data) {
        this.init();
        this.userData = data;
    }
    init() {
        this.loadList();

        this.loadButtonFunctionality();
    }
    loadButtonFunctionality() {
        document.getElementById("index_form").onsubmit = async (event) => {
            // Dont re-fresh page
            event.preventDefault(); 

            // Set loading spinner
            document.getElementById("loading").style.visibility = "visible";
            // Disable the submit button
            document.getElementById("submitPrompt").disabled = true;
            // Get the prompt given by the user
            const prompt = document.getElementById("prompt").value;
            try {
            // Fetch the story
            await this.fetchStory(prompt)
                .then(
                    (data) => {

                    // Store the generated story + prompts in localStorage
                    let userData = JSON.parse(localStorage.getItem("userData"));

                    // If stories is an array
                    if (userData.stories.title === undefined)
                    {
                        userData.stories.push(data.storyObj.story);
                        localStorage.setItem("storyIndex", userData.stories.length - 1);
                    }
                    else // If stories is an object
                        userData = {
                            ...userData,
                            stories: data.storyObj.story
                        }
                    // Store the updated user data in localStorage
                    localStorage.setItem("userData", JSON.stringify(userData));
                    // Reset current page number
                    localStorage.setItem("currentPaginationIndex", 0);
                    // Redirect to the story page
                    window.location.href = "story.html";

                    // {
                    //                         // Append story to the localPage
                    // // stories is now a json
                    // // let jsonStory = 
                    // // {
                    // //     0: []
                    // // }
                    // // Use this for Milestone 2, linked list
                    // // var count = Object.keys(jsonStory).length;
                    // // jsonStory[count] = [data.generatedStoryPart];
                    // let storyArray = localStorage.getItem("data");
                    // // This is just used for planning for the Milestone 2.
                    // if (storyArray == null) {
                    //     storyArray = JSON.stringify({
                    //         0: {
                    //             stories: [],
                    //             promptOptions: []
                    //         }
                    //     });
                    // }
                    // let jsonData = JSON.parse(storyArray);
                    // jsonData[0].stories.push(data.generatedStoryPart);
                    // jsonData[0].promptOptions.push(data.promptOptions);
                    // localStorage.setItem("data", JSON.stringify(jsonData));
                    // // Temporarily set current page to 1
                    // localStorage.setItem("currentPageNumber", "1");
                    // // Redirect to the story page
                    // window.location.href = "story.html";
                    // }
                    
                }
                ,
                (error) => { alert(error); }
            )
            } catch (error) {
                document.getElementById("submitPrompt").disabled = false;
                console.error(error);
                alert(ERROR_GEN_STORY_TWO);
            }
        }
    }

    loadList()
    {
        let stories = JSON.parse(localStorage.getItem("userData")).stories;
        if (stories.title !== undefined) {
            this.renderStory(stories);
        } else
        stories.forEach((story, index) => {
            this.renderStory(story, index);
        });
    }

    // Initial
    async fetchStory(prompt) {
        return new Promise(async (res, rej) => {
            const response = await Utils.PostFetch(`${API_URL}${API_ENDPOINT}`, 
                { prompt: prompt, userId: this.userData.user._id }
            );

            if (response.ok)
                res(await response.json());
            else
                rej(ERROR_GEN_STORY);
        });
    }

    renderStory(story, index)
    {
        let template = document.getElementById("story-item-template");   

        // clone node
        let clone = template.content.cloneNode(true);
        clone.querySelector(".title").textContent = story.title;
        clone.querySelector(".story-item-description").textContent = story.summary;
        clone.querySelector(".go").addEventListener("click", () => {
            localStorage.setItem("currentPaginationIndex", 0);
            if (index !== undefined)
                localStorage.setItem("storyIndex", index);
            else
                localStorage.setItem("storyIndex", 0);
            window.location.href = "story.html";
        });
        clone.querySelector(".delete").addEventListener("click", async () => {
            let stories = JSON.parse(localStorage.getItem("userData")).stories;
            let storyIndex = 0;
            if (index !== undefined) // if index is defined, use that
                storyIndex = index;
            else
                storyIndex = stories.findIndex((s) => s._id === story._id);

            // call api first then check if success or not
            // if success, then remove from local storage
            // if failed, alert user
            const deletePayload = await Utils.DeleteFetch(`${API_URL}/api/user/deleteStory`, {
                storyId: stories[storyIndex]._id
            });

            if (deletePayload.ok)
            {
                const data = JSON.parse(localStorage.getItem("userData"));
                stories.splice(storyIndex, 1);
                localStorage.setItem("userData", JSON.stringify({ 
                    ...data,
                    stories: stories
                 }));
                // refresh page
                window.location.reload();
            }
            else
            {
                alert("Failed to delete story");
            }
        });
        // append node
        document.getElementById("story-list").appendChild(clone);
    }

    
}
export {Dashboard};