const API_ENDPOINT = "/api/generate-story";
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
                    localStorage.setItem('storyText', data.generatedStoryPart);
                    localStorage.setItem('promptOptions', JSON.stringify(data.promptOptions));
                    // Reset current page number
                    localStorage.setItem('currentPageNumber', '1');
                    // Redirect to the story page
                    window.location.href = 'story.html';

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
        console.log("Dashboard loaded");

        let stories = [
            {
                title: "The Cat and the Hat",
                description: "A story about a cat and a hat",
            },
            
            {
                title: "The Cat and the Hat",
                description: "A story about a cat and a hat",
            }
            
        ]

        stories.forEach((story) => {
            this.renderStory(story);
        });
    }
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

    async fetchList() {}

    renderStory(story)
    {
        console.log(story);
        let template = document.getElementById("story-item-template");   

        // clone node
        let clone = template.content.cloneNode(true);
        clone.querySelector(".title").textContent = story.title;
        clone.querySelector(".story-item-description").textContent = story.description;

        // append node
        document.getElementById("story-list").appendChild(clone);
    }

    
}
export {Dashboard};