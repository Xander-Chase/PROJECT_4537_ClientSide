const API_ENDPOINT = "/api/user/generateNext";
const API_UPDATE_ENDPOINT = "/api/user/updateStory";

class Story
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
        this.renderSaveStory();
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
        const storyTextElement = document.getElementById("story_description");
        let pageNumberElement = document.getElementById("page_number");

        pageNumberElement.innerHTML = `Page ${parseInt(this.paginationIndex) + 1} of 10`;
        titleElement.value = this.storyInfo.title;
        descElement.value = this.storyInfo.description;
        storyTextElement.innerHTML = Utils.cleanString(this.storyInfo.storyText);

        this.displayPrompts(this.storyInfo.promptOptions);
        if (this.storyInfo.chosen)
        {
            const buttons = document.getElementsByClassName("ai_generated_prompt");
            for (let i = 0; i < buttons.length; i++)
                buttons[i].disabled = true;
        }
        this.renderPaginationButtons();
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
                userData.stories[parseInt(this.storyIndex)].title = titleElement.value;
                userData.stories[parseInt(this.storyIndex)].summary = descElement.value;
                localStorage.setItem("userData", JSON.stringify(userData));
            } else
                alert("Error saving story");
            saveButton.disabled = false;
        }
    }
    displayPrompts(promptOptions)
    {
        const promptElement = document.getElementById("prompt_choices");
        // Check if promptOptions is not null, and not empty
        if (!promptOptions && promptOptions.length <= 0)
        {
            const paragraph = document.createElement("p");
            paragraph.innerHTML = "No prompts available";
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

    renderPromptButton(content, index)
    {
        let buttonElement = document.createElement("button");
        buttonElement.classList.add("ai_generated_prompt");
        buttonElement.innerHTML = `Option ${index + 1}: ${Utils.cleanString(content)}...`
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
                const storyPayload = await Utils.PutFetch(`${API_URL}${API_ENDPOINT}`, {
                    prompt: `${Utils.cleanString(content)}`,
                    userId: this.data.user._id,
                    storyId: this.storyInfo._id,
                    paginationIndex: parseInt(this.paginationIndex),
                    prevList: this.storyInfo.contentRef,
                    chosenIndex: index
                });

                if (storyPayload.ok)
                {
                    const storyData = await storyPayload.json();
                    this.data.stories[parseInt(this.storyIndex)] = storyData.storyObj.story;
                    // set local storage
                    localStorage.setItem("userData", JSON.stringify(this.data));
                    // set pagination index
                    localStorage.setItem("currentPaginationIndex", parseInt(this.paginationIndex) + 1);

                    // reload page
                    window.location.reload();
                }
            } catch (error)
            {
                // re-enable buttons
                for (let i = 0; i < buttons.length; i++)
                    buttons[i].disabled = false;

                console.error("Error fetching story:", error);
                alert("Error fetching story");
            }
        }

        return buttonElement;
    }

    renderPaginationButtons()
    {
        const nextButton = document.getElementById("nextButton");
        const backButton = document.getElementById("backButton");

        const listLength = this.storyInfo.contentRef.length;
        let paginationIndex = parseInt(this.paginationIndex);
        // Back button functionality
        {
            // we can turn off the visibility
            if (paginationIndex === 0)
                backButton.disabled = true;
            else
                backButton.disabled = false;

            backButton.onclick = () => {
                localStorage.setItem("currentPaginationIndex", paginationIndex - 1);
                window.location.reload();
            }
        }

        // Next Button functionality
        {
            // const nextButton = document.getElementById("nextButton");
            // nextButton.innerHTML = "&gt; Finish";

            if (paginationIndex === listLength - 1 && !this.checkIfEndOfStory())
                nextButton.disabled = true;
            else
                nextButton.disabled = false;

            if (this.checkIfEndOfStory())
                nextButton.innerHTML = "&gt; Finish";
            nextButton.onclick = () => {
                if (this.checkIfEndOfStory())
                    window.location.href = "storyEnd.html";
                else
                {
                    localStorage.setItem("currentPaginationIndex", paginationIndex + 1);
                    window.location.reload();
                }
            }
        }
    }
    checkIfStoryExists()
    {
        // checks for storyIndex
        // checks for currentPaginationIndex

        // If either of the two are not set, return false
        // If both are set, return true
        return this.storyIndex && this.paginationIndex;
    }

    // max 10 content per story
    checkIfEndOfStory()
    {
        return parseInt(this.paginationIndex) === 9;
    }
    getStoryInfo()
    {
        let paginationIndex = parseInt(this.paginationIndex);
        let stories = null;
        stories = this.data.stories[parseInt(this.storyIndex)];
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

export { Story };