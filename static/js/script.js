
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const newChatBtn = document.getElementById("new-chat");
const chatHistory = document.getElementById("chat-history");

let chats = JSON.parse(localStorage.getItem("chats")) || [];
let currentChatId = null;

function saveChats() {
    localStorage.setItem("chats", JSON.stringify(chats));
}

function displayHistory() {
    chatHistory.innerHTML = "";

    chats.forEach(chat => {
        const item = document.createElement("button");
        item.className = "history-item";
        item.textContent = chat.title;

        item.addEventListener("click", () => {
            openChat(chat.id);
        });

        chatHistory.appendChild(item);
    });
}

function createNewChat() {
    currentChatId = Date.now();

    const newChat = {
        id: currentChatId,
        title: "New Chat",
        messages: []
    };

    chats.unshift(newChat);
    saveChats();
    displayHistory();

    messages.innerHTML = "";
    welcome.style.display = "block";
}

function openChat(chatId) {
    const chat = chats.find(c => c.id === chatId);

    if (!chat) return;

    currentChatId = chatId;
    messages.innerHTML = "";
    welcome.style.display = chat.messages.length ? "none" : "block";

    chat.messages.forEach(msg => {
        const div = document.createElement("div");
        div.className = "message " + msg.sender;
        div.textContent = msg.text;
        messages.appendChild(div);
    });

    messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
    const message = input.value.trim();

    if (message === "") return;

    if (currentChatId === null) {
        createNewChat();
    }

    const chat = chats.find(c => c.id === currentChatId);

    welcome.style.display = "none";

    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = message;
    messages.appendChild(userMessage);

    chat.messages.push({
        sender: "user-message",
        text: message
    });

    if (chat.title === "New Chat") {
        chat.title = message.slice(0, 25);
    }

    saveChats();
    displayHistory();

    input.value = "";
    sendBtn.disabled = true;

    const typing = document.createElement("div");
    typing.className = "message bot-message";
    typing.textContent = "AI is typing...";
    messages.appendChild(typing);

    messages.scrollTop = messages.scrollHeight;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        typing.textContent = data.response;

        chat.messages.push({
            sender: "bot-message",
            text: data.response
        });

        saveChats();

    } catch (error) {
        typing.textContent = "Error: " + error.message;
    }

    sendBtn.disabled = false;
    input.focus();
    messages.scrollTop = messages.scrollHeight;
}

newChatBtn.addEventListener("click", createNewChat);
sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

displayHistory();
