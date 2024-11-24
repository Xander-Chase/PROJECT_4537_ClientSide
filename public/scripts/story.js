const API_ENDPOINT = "/api/user/generateNext";
const API_UPDATE_ENDPOINT = "/api/user/updateStory";

// Class to handle story generation
class Story
{
    // Constructor, get data and call init
    constructor(usrData, storyIndex, paginationIndex)
    {
        this.data = usrData;
        this.storyIndex = storyIndex;
        this.paginationIndex = paginationIndex;
        this.storyInfo = null;

        this.init();
    }

    // Initialize the story div
    init = () =>
    {
        this.renderStoryDiv();
        this.renderSaveStory();
    }

    // Render the story div
    renderStoryDiv = () =>
    {
        // Check if story exists
        if (!this.checkIfStoryExists())
        {
            // If story does not exist, alert and redirect to home
            alert(NO_STORY_ERROR);
            window.location.href = "home.html";
        }

        // Get story info
        this.storyInfo = this.getStoryInfo();

        // Set story title, description, and story text
        const titleElement = document.getElementById("storyTitle");
        const descElement = document.getElementById("storyDesc");
        const storyTextElement = document.getElementById("story_description");
        let pageNumberElement = document.getElementById("page_number");
        pageNumberElement.innerHTML = `${PAGINATION_OPEN}${parseInt(this.paginationIndex) + 1}${PAGINATION_CLOSE}`;
        titleElement.value = this.storyInfo.title;
        descElement.value = this.storyInfo.description;
        storyTextElement.innerHTML = Utils.cleanString(this.storyInfo.storyText);

        // Display prompts
        this.displayPrompts(this.storyInfo.promptOptions);
        if (this.storyInfo.chosen)
        {
            // Disable all buttons once a choice has been made, occurs when the user goes to a previous page
            const buttons = document.getElementsByClassName("ai_generated_prompt");
            for (let i = 0; i < buttons.length; i++)
                buttons[i].disabled = true;
        }
        // Render pagination buttons
        this.renderPaginationButtons();
    }

    // Render the save story button functionality
    renderSaveStory = () =>
    {
        // Get save button
        const saveButton = document.getElementById("saveStory");
        saveButton.onclick = async () => {
            // Disable button
            saveButton.disabled = true;

            // Get title and description elements
            const titleElement = document.getElementById("storyTitle");
            const descElement = document.getElementById("storyDesc");

            // Feed API with title and description + storyId
            const payload = await Utils.PutFetch(`${API_URL}${API_UPDATE_ENDPOINT}`, {
                title: titleElement.value,
                summary: descElement.value,
                storyId: this.storyInfo._id,
            });

            // If successful, update local storage
            if (payload.ok)
            {
                // set local storage
                const userData = JSON.parse(localStorage.getItem(localStorageNames.data));
                userData.stories[parseInt(this.storyIndex)].title = titleElement.value;
                userData.stories[parseInt(this.storyIndex)].summary = descElement.value;
                localStorage.setItem(localStorageNames.data, JSON.stringify(userData));
            } else
                alert(ERROR_SAVING);

            // Re-enable button
            saveButton.disabled = false;
        }
    }

    // Display prompts
    displayPrompts = (promptOptions) =>
    {
        // Get prompt element div and clear it
        // Will be used to place all prompt options
        const promptElement = document.getElementById("prompt_choices");

        // Check if promptOptions is not null, and not empty
        if (!promptOptions && promptOptions.length <= 0)
        {
            const paragraph = document.createElement("p");
            paragraph.innerHTML = NO_PROMPTS;
            promptElement.innerHTML = paragraph;
            return;
        }

        promptElement.innerHTML = ""; // Clear existing prompt options

        // Check if page is at the end of the story
        if (!this.checkIfEndOfStory())
            promptOptions.forEach((content, index) => {
                const buttonElement = this.renderPromptButton(content, index);
                promptElement.appendChild(buttonElement);
            });
    }

    // Render prompt button functionality
    renderPromptButton = (content, index) =>
    {
        // Create button element
        let buttonElement = document.createElement("button");
        buttonElement.classList.add("ai_generated_prompt");
        buttonElement.innerHTML = `${PROMPT_OPENING}${index + 1}${PROMPT_MID}${Utils.cleanString(content)}${PROMPT_CLOSING}`;
        buttonElement.onclick = async () => {
            // Disable all buttons
            const buttons = document.getElementsByClassName("ai_generated_prompt");
            for (let i = 0; i < buttons.length; i++)
                buttons[i].disabled = true;

            // Set loading spinner
            const spinner = document.getElementById("loading");
            spinner.style.visibility = "visible";

            // Handle call to fetch story
            try
            {
                // Fetch story
                const storyPayload = await Utils.PutFetch(`${API_URL}${API_ENDPOINT}`, {
                    prompt: `${Utils.cleanString(content)}`, // Clean prompt
                    userId: this.data.user._id,
                    storyId: this.storyInfo._id,
                    paginationIndex: parseInt(this.paginationIndex),
                    prevList: this.storyInfo.contentRef,
                    chosenIndex: index
                });

                // If successful, update local storage and reload page
                if (storyPayload.ok)
                {
                    const storyData = await storyPayload.json();
                    this.data.stories[parseInt(this.storyIndex)] = storyData.storyObj.story;
                    // set local storage
                    localStorage.setItem(localStorageNames.data, JSON.stringify(this.data));
                    // set pagination index
                    localStorage.setItem(localStorageNames.currentPaginationIndex, parseInt(this.paginationIndex) + 1);

                    // reload page
                    window.location.reload();
                }
            } catch (error) // Handle error
            {
                // re-enable buttons
                for (let i = 0; i < buttons.length; i++)
                    buttons[i].disabled = false;

                console.error(ERROR_FETCH_STORY, error);
                alert(ERROR_FETCH_STORY_TWO);
            }
        }

        return buttonElement;
    }

    // Render pagination buttons
    renderPaginationButtons = () =>
    {

        // Get next and back buttons
        const nextButton = document.getElementById("nextButton");
        const backButton = document.getElementById("backButton");

        // Get list length and pagination index
        const listLength = this.storyInfo.contentRef.length;
        let paginationIndex = parseInt(this.paginationIndex);
        // Back button functionality
        {
            if (paginationIndex === 0)
                backButton.disabled = true;
            else
                backButton.disabled = false;

            backButton.onclick = () => {
                localStorage.setItem(localStorageNames.currentPaginationIndex, paginationIndex - 1);
                window.location.reload();
            }
        }

        // Next Button functionality
        {
            // If current index is at the end of the list, disable button
            if (paginationIndex === listLength - 1 && !this.checkIfEndOfStory())
                nextButton.disabled = true;
            else
                nextButton.disabled = false;

            // If at the end of the story, change button text to finish
            if (this.checkIfEndOfStory())
                nextButton.innerHTML = BUTTON_FINISH;
            nextButton.onclick = () => {
                // If at the end of the story, redirect to story end page
                if (this.checkIfEndOfStory())
                    window.location.href = "storyEnd.html";
                else
                {
                    // Otherwise
                    // Set local storage and reload page
                    localStorage.setItem(localStorageNames.currentPaginationIndex, paginationIndex + 1);
                    window.location.reload();
                }
            }
        }
    }

    // Check if story exists
    // by storyIndex and paginationIndex exists
    checkIfStoryExists = () => this.storyIndex && this.paginationIndex;

    // max 10 content per story
    checkIfEndOfStory = () => parseInt(this.paginationIndex) === 9;

    // Get story info
    getStoryInfo = () =>
    {
        // Get story info, parse index
        let paginationIndex = parseInt(this.paginationIndex);
        let stories = null;
        // Get story from data
        stories = this.data.stories[parseInt(this.storyIndex)];

        // then modify the return object
        return {
            _id: stories._id,
            storyText: stories.content[paginationIndex].description,
            promptOptions: stories.content[paginationIndex].prompts,
            chosen: stories.content[paginationIndex].chosenPrompt,
            title: stories.title,
            description: stories.summary,
            contentRef: stories.content
        };
    }
}

// Export Story class
export { Story };