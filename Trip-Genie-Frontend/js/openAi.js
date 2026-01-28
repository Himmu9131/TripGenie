
function encryptToken(token) {
    return btoa(token.split('').map(char => String.fromCharCode(char.charCodeAt(0) + 5)).join(''));
}

function decryptToken(encrypted) {
    return atob(encrypted).split('').map(char => String.fromCharCode(char.charCodeAt(0) - 5)).join('');
}


const ENCRYPTED_GITHUB_TOKEN="bG11ZFZmV2xOdDhNR3F7R396Vn1/NXlpOnpuTk06SX5SWzd2PnA4Ow==";
const endpoint = "https://models.github.ai/inference";
const MODEL = "openai/gpt-4.1";

async function callGitHubAI(prompt){
    try {

        const GITHUB_TOKEN = decryptToken(ENCRYPTED_GITHUB_TOKEN);
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GITHUB_TOKEN}`},
                body: JSON.stringify({
      messages: [
        { role:"system", content: "You are a helpful assistant." },
        { role:"user", content: prompt }
      ],
      temperature:1,
      top_p:1,
      model: MODEL
    })
        });
        if(!response.ok){
            throw new Error(`API call failed:${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if(data.choices && data.choices.length > 0){
            return data.choices[0].message.content;
        }
        else{
            console.error("No choices returned from API:", data);
            throw new Error(`No choices returned from API:${response.status} ${response.statusText}`);}
    } catch (error) {
           console.error("Error calling GitHub AI:", error);
              throw error;   
    }
}


