const form = document.getElementById('readmeForm');
const outputElement = document.getElementById('output');
const apiKeyInput = document.getElementById('apiKey');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    outputElement.innerText = "Generating README... Please wait.";

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const apiKey = data.apiKey;

    if (!apiKey) {
        outputElement.innerText = "Error: OpenAI API Key is missing. Please enter your API key.";
        return;
    }

    // Remove apiKey from data sent in prompt to OpenAI
    const promptData = { ...data };
    delete promptData.apiKey;

    const prompt = `
Generate a professional and comprehensive README.md file for a software project with the following details.
The README should be well-structured, easy to read, and include appropriate Markdown formatting.

Project Title: ${promptData.title}

Description:
${promptData.description}

Key Features:
(Provide a bulleted list based on these keywords: ${promptData.features})

Installation Instructions:
(Format these steps clearly: ${promptData.installation})

Usage Example:
(Present this information clearly, ideally with code blocks if applicable: ${promptData.usage})

Technologies Used:
(List these technologies: ${promptData.tech})

License:
This project is licensed under the ${promptData.license} License.

Optional Sections (if you have context, otherwise omit):
- Contributing: (If applicable, add a brief note about contributing)
- Roadmap: (If applicable, mention future plans)
- Acknowledgements: (If applicable)

Make sure the output is only the README.md content, starting with the title.
Do not include any introductory phrases like "Here is your README.md file".
Format features as a bulleted list.
Use appropriate Markdown for headings, lists, code blocks, etc.
`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null); // Try to parse error, but don't fail if not JSON
            let errorMessage = `Error: ${response.status} ${response.statusText}`;
            if (errorData && errorData.error && errorData.error.message) {
                errorMessage += ` - ${errorData.error.message}`;
            }
            throw new Error(errorMessage);
        }

        const json = await response.json();
        const generatedContent = json.choices?.[0]?.message?.content?.trim();

        if (generatedContent) {
            outputElement.innerText = generatedContent;
        } else {
            outputElement.innerText = "Error: Could not extract content from API response. The response might be empty or malformed.";
            console.error("API Response:", json);
        }

    } catch (error) {
        console.error("Failed to generate README:", error);
        outputElement.innerText = `Error generating README: ${error.message}. Check the console for more details.`;
    }
});
