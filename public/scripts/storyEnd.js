const API_ENDPOINT = "/api/user/generateNext";
const API_UPDATE_ENDPOINT = "/api/user/updateStory";

class StoryEnd
{
    
    constructor(usrData, storyIndex, paginationIndex)
    {
        this.data = usrData;
        this.storyIndex = storyIndex;
        this.paginationIndex = paginationIndex;
        this.storyInfo = null;

        this.init();
    }

    init()
    {
        this.renderStoryDiv();
    }

    renderStoryDiv()
    {
        if (!this.checkIfStoryExists())
        {
            alert("No story found, try typing a prompt!");
            window.location.href = "home.html";
        }
        this.storyInfo = this.getStoryInfo();
        const titleElement = document.getElementById("storyTitle");
        const descElement = document.getElementById("storyDesc");

        titleElement.value = this.storyInfo.title;
        descElement.value = this.storyInfo.description;

        this.renderButtons();
    }


    renderSaveStory()
    {
        const saveButton = document.getElementById("saveStory");
        saveButton.onclick = async () => {
            saveButton.disabled = true;
            const titleElement = document.getElementById("storyTitle");
            const descElement = document.getElementById("storyDesc");
            const payload = await Utils.PutFetch(`${API_URL}${API_UPDATE_ENDPOINT}`, {
                title: titleElement.value,
                summary: descElement.value,
                storyId: this.storyInfo._id,
            });
            if (payload.ok)
            {
                // set local storage
                const userData = JSON.parse(localStorage.getItem("userData"));
                if (userData.stories.title === undefined)
                {
                    userData.stories[parseInt(this.storyIndex)].title = titleElement.value;
                    userData.stories[parseInt(this.storyIndex)].summary = descElement.value;
                }
                else
                {
                    userData.stories.title = titleElement.value;
                    userData.stories.summary = descElement.value;
                }
                localStorage.setItem("userData", JSON.stringify(userData));
            } else
                alert("Error saving story");
            saveButton.disabled = false;
        }
    }

    renderBackButton()
    {
        const backButton = document.getElementById("backButton");

        // Back button functionality
        {
            backButton.onclick = () => {
                window.location.href = "story.html";
            }
        }
    }

    renderExportButton()
    {
        const exportButton = document.getElementById("exportStory");
        // Reference: https://www.tutorialspoint.com/how-to-create-and-save-text-file-in-javascript
        exportButton.onclick = () => {
            let content = "";
            this.storyInfo.contentRef.forEach((obj) => {
                content += obj.description + "\n";
            });
            const link = document.createElement("a");
            const file = new Blob([content], { type: "text/plain" });
            link.href = URL.createObjectURL(file);
            link.download = "yourStory.txt";
            link.click();
            URL.revokeObjectURL(link.href);
        }
    }

    renderButtons()
    {   
        this.renderSaveStory();
        this.renderBackButton();
        this.renderExportButton();
    }
    checkIfStoryExists = () => this.storyIndex && this.paginationIndex;

    getStoryInfo()
    {
        let stories = null;
        if (this.data.stories.title === undefined)
            stories = this.data.stories[parseInt(this.storyIndex)];
        else
            stories = this.data.stories;
        return {
            _id: stories._id,
            title: stories.title,
            description: stories.summary,
            contentRef: stories.content
        };
    }
}

export { StoryEnd };