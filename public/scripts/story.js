const API_ENDPOINT = "/api/user/generateNext";

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
        this.renderDiv();
    }

    renderDiv()
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

        titleElement.value = this.storyInfo.title;
        descElement.value = this.storyInfo.description;
        storyTextElement.innerHTML = Utils.cleanString(this.storyInfo.storyText);

        this.displayPrompts(this.storyInfo.promptOptions);
        this.renderPaginationButtons();
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
            // 

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
                    this.data = {
                        ...this.data,
                        stories: storyData.storyObj.story
                    }
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
            if (paginationIndex === listLength - 1)
                nextButton.disabled = true;
            else
                nextButton.disabled = false;

            nextButton.onclick = () => {
                localStorage.setItem("currentPaginationIndex", paginationIndex + 1);
                window.location.reload();
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

    getStoryInfo()
    {
        let paginationIndex = parseInt(this.paginationIndex);
        let stories = null;
        if (this.data.stories.title === undefined)
            stories = this.data.stories[parseInt(this.storyIndex)];
        else
            stories = this.data.stories;
        return {
            _id: stories._id,
            storyText: stories.content[paginationIndex].description,
            promptOptions: stories.content[paginationIndex].prompts,
            title: stories.title,
            description: stories.summary,
            contentRef: stories.content
        };
    }
}

export { Story };