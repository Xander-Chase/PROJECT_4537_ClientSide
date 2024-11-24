const API_UPDATE_ENDPOINT = "/api/user/updateStory";

// Component used to display the end of a story
class StoryEnd
{
    // Constructor for the StoryEnd class
    constructor(usrData, storyIndex, paginationIndex)
    {
        this.data = usrData;
        this.storyIndex = storyIndex;
        this.paginationIndex = paginationIndex;
        this.storyInfo = null;

        this.init();
    }

    // Initialize the StoryEnd component
    init = () =>
    {
        this.renderStoryDiv();
    }

    // Render the story div
    renderStoryDiv = () =>
    {
        // Check if story exists
        if (!this.checkIfStoryExists())
        {
            alert(NO_STORY_ERROR);
            window.location.href = "home.html";
        }

        // Get story info
        this.storyInfo = this.getStoryInfo();
        const titleElement = document.getElementById("storyTitle");
        const descElement = document.getElementById("storyDesc");
        // Set the title and description
        titleElement.value = this.storyInfo.title;
        descElement.value = this.storyInfo.description;

        this.renderButtons();
    }

    // Render the save story button
    renderSaveStory = () =>
    {
        // Save button functionality
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
                const userData = JSON.parse(localStorage.getItem(localStorageNames.data));
                userData.stories[parseInt(this.storyIndex)].title = titleElement.value;
                userData.stories[parseInt(this.storyIndex)].summary = descElement.value;
                localStorage.setItem(localStorageNames.data, JSON.stringify(userData));
            } else
                alert(ERROR_SAVING);
            saveButton.disabled = false;
        }
    }

    // Render the back button
    renderBackButton = () =>
    {
        // Get back button
        const backButton = document.getElementById("backButton");

        // Back button functionality
        {
            backButton.onclick = () => {
                window.location.href = "story.html";
            }
        }
    }

    // Render the export button
    renderExportButton = () =>
    {
        // Get export button
        const exportButton = document.getElementById("exportStory");
        // Reference: https://www.tutorialspoint.com/how-to-create-and-save-text-file-in-javascript
        
        exportButton.onclick = () => {
            let content = "";
            // Add all content to the content string
            this.storyInfo.contentRef.forEach((obj) => {
                content += obj.description + "\n";
            });
            // Create a new link element
            const link = document.createElement("a");
            // Create a new blob object
            const file = new Blob([content], { type: "text/plain" });

            // Set the link href and download attributes
            link.href = URL.createObjectURL(file);

            // Download the file
            link.download = "yourStory.txt";
            
            // Click the link explicitly
            link.click();

            // Remove the object URL
            URL.revokeObjectURL(link.href);
        }
    }

    // Render the buttons
    renderButtons = () =>
    {
        this.renderSaveStory();
        this.renderBackButton();
        this.renderExportButton();
    }

    // Check if the story exists
    checkIfStoryExists = () => this.storyIndex && this.paginationIndex;

    // Get the story info
    getStoryInfo = () =>
    {
        let stories = null;
        stories = this.data.stories[parseInt(this.storyIndex)];
        return {
            _id: stories._id,
            title: stories.title,
            description: stories.summary,
            contentRef: stories.content
        };
    }
}

// Export the StoryEnd class
export { StoryEnd };