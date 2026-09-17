(function (global) {
    "use strict";

    const SWAHILI_HINT_WORDS = [
        "habari", "jambo", "mambo", "asante", "karibu", "sawa", "huduma",
        "wasiliana", "mawasiliano", "bei", "msaada", "kwaheri", "kiswahili",
        "swahili", "tafadhali", "naomba", "nina", "nataka", "unataka", "vipi",
        "kuna", "nisaidie", "nisaidieni", "je", "hii", "hapo", "sana", "kuhusu",
        "kujua", "kujifunza", "zaidi", "nani", "nini", "nyie", "wewe"
    ];
    const ENGLISH_HINT_WORDS = [
        "hello", "hi", "thank", "welcome", "okay", "service", "contact",
        "price", "support", "goodbye", "english", "please",
        "help", "can", "could", "would", "what", "how", "when", "where",
        "why", "is", "are", "the", "you", "your", "i", "need", "want", "know", "learn",
        "more", "details", "about", "info", "information"
    ];

    const SWAHILI_HINT_PHRASES = [
        "nyie ni nani", "kuhusu nyie", "kuhusu wewe", "mlue ni nini",
        "niambie kuhusu", "nifafanulie"
    ];
    const ENGLISH_HINT_PHRASES = [
        "who are you", "about you", "details about you", "tell me about you",
        "what is mlue", "what is mlue technology", "tell me about mlue"
    ];

    function getLanguageScores(text) {
        const normalized = (text || "").toLowerCase();
        const words = normalized.match(/[a-zA-Z\u00C0-\u024F]+/g) || [];

        let swahiliScore = 0;
        let englishScore = 0;

        words.forEach(word => {
            if (SWAHILI_HINT_WORDS.includes(word)) swahiliScore += 1;
            if (ENGLISH_HINT_WORDS.includes(word)) englishScore += 1;
        });

        SWAHILI_HINT_PHRASES.forEach(phrase => {
            if (normalized.includes(phrase)) swahiliScore += 2;
        });
        ENGLISH_HINT_PHRASES.forEach(phrase => {
            if (normalized.includes(phrase)) englishScore += 2;
        });

        if (/\b(ni|wa|ya|za|la|cha|kwa|katika|hiyo|hili|huyu)\b/.test(normalized)) {
            swahiliScore += 1;
        }
        if (/\b(the|and|for|with|from|about|this|that)\b/.test(normalized)) {
            englishScore += 1;
        }

        return { swahiliScore, englishScore, wordsCount: words.length };
    }

    function inferPreferredLanguage(text) {
        const { swahiliScore, englishScore, wordsCount } = getLanguageScores(text);
        if (wordsCount === 0) return null;

        // For short prompts, one strong cue should be enough to pick a language.
        if (wordsCount <= 4) {
            if (swahiliScore > englishScore && swahiliScore >= 1) return "swahili";
            if (englishScore > swahiliScore && englishScore >= 1) return "english";
        }

        const diff = Math.abs(swahiliScore - englishScore);
        const maxScore = Math.max(swahiliScore, englishScore);

        if (maxScore < 2 || diff < 1) {
            return null;
        }
        return swahiliScore > englishScore ? "swahili" : "english";
    }

    function detectLanguage(text) {
    const inferred = inferPreferredLanguage(text);
    return inferred || "english";
}
    
    function getDefaultChatbotState() {
        return {
            messages: [],
            showHeader: true,
            isOpen: false,
            language: document.documentElement.lang === "sw" ? "swahili" : "english"
        };
    }

    function loadChatbotState() {
        try {
            const saved = localStorage.getItem(CHATBOT_STORAGE_KEY);
            if (!saved) {
                return getDefaultChatbotState();
            }

            const parsed = JSON.parse(saved);
            const defaults = getDefaultChatbotState();
            return {
                messages: Array.isArray(parsed.messages)
                    ? parsed.messages
                        .filter(item => item && (item.role === "user" || item.role === "bot") && typeof item.text === "string")
                        .slice(-40)
                    : defaults.messages,
                showHeader: typeof parsed.showHeader === "boolean" ? parsed.showHeader : defaults.showHeader,
                isOpen: typeof parsed.isOpen === "boolean" ? parsed.isOpen : defaults.isOpen,
                language: parsed.language === "swahili" || parsed.language === "english"
                    ? parsed.language
                    : defaults.language
            };
        } catch (_error) {
            return getDefaultChatbotState();
        }

        return getDefaultChatbotState();
    }

    function createChatbotMarkup() {
        const mount = document.createElement("div");

mount.innerHTML = [
  '<button class="chatbot-toggle" id="chatToggle" aria-label="Open chat" aria-expanded="false">',
  '  <span class="chatbot-toggle__label">',
  '    <span class="chatbot-toggle__spark" aria-hidden="true">✦</span>',
  '    <span data-i18n="chat.ask">Ask MLUE</span>',
  '  </span>',
  '  <svg class="chatbot-toggle__icon chatbot-toggle__icon--chat" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
  '    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  '  </svg>',
  '  <svg class="chatbot-toggle__icon chatbot-toggle__icon--close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
  '    <line x1="18" y1="6" x2="6" y2="18"/>',
  '    <line x1="6" y1="6" x2="18" y2="18"/>',
  '  </svg>',
  '</button>',

  '<div class="chatbot" id="chatWindow" aria-hidden="true">',
  '  <div class="chatbot__header">',
  '    <div class="chatbot__header-info">',
  '      <div class="chatbot__avatar">',
  '        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">',
  '          <rect width="32" height="32" rx="8" fill="#1565C0"/>',
  '          <path d="M8 22V10l5 6 5-6v12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  '          <path d="M22 10v12h6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  '        </svg>',
  '      </div>',
  '      <div>',
  '        <p class="chatbot__name">MLUE Assistant</p>',
  '        <p class="chatbot__status" data-i18n="chat.online">Online</p>',
  '      </div>',
  '    </div>',

  '    <button class="chatbot__close" id="chatClose" aria-label="Close chat">',
  '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
  '        <line x1="18" y1="6" x2="6" y2="18"/>',
  '        <line x1="6" y1="6" x2="18" y2="18"/>',
  '      </svg>',
  '    </button>',
  '  </div>',

  '  <div class="chatbot__messages" id="chatMessages" data-i18n="chat.onboarding"></div>',

  '  <div class="chatbot__input">',
  '    <input type="text" id="chatInput" data-i18n-placeholder="chat.placeholder" placeholder="Ask about MLUE Technology..." autocomplete="off" />',
  '    <button id="chatSend" aria-label="Send">',
  '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
  '        <line x1="22" y1="2" x2="11" y2="13"/>',
  '        <polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  '      </svg>',
  '    </button>',
  '  </div>',
  '</div>'
].join("\n");

        while (mount.firstChild) {
            document.body.appendChild(mount.firstChild);
        }
    }

    function initChatbotUI() {
        let chatToggle = document.getElementById("chatToggle");
        let chatWindow = document.getElementById("chatWindow");
        let chatClose = document.getElementById("chatClose");
        let chatMessages = document.getElementById("chatMessages");
        let chatInput = document.getElementById("chatInput");
        let chatSend = document.getElementById("chatSend");

        if (!chatToggle || !chatWindow || !chatClose || !chatMessages || !chatInput || !chatSend) {
            createChatbotMarkup();
            chatToggle = document.getElementById("chatToggle");
            chatWindow = document.getElementById("chatWindow");
            chatClose = document.getElementById("chatClose");
            chatMessages = document.getElementById("chatMessages");
            chatInput = document.getElementById("chatInput");
            chatSend = document.getElementById("chatSend");
        }

        if (!chatToggle || !chatWindow || !chatClose || !chatMessages || !chatInput || !chatSend) {
            return;
        }


        const state = loadChatbotState();
        let chatLanguage = state.language;
        let typingNode = null;
        let onboardingNode = null;

        function saveChatState() {
    state.language = chatLanguage;
    state.isOpen = chatWindow.classList.contains("chatbot--open");
}

        function getOnboardingText() {
            return document.documentElement.lang === "sw"
                ? "NIKUSAIDIEJE LEO?"
                : "HOW CAN I HELP YOU?";
        }

        function getWelcomeMessage() {
    return document.documentElement.lang === "sw"
        ? "Habari! Mimi ni MLUE AI. Naweza kukusaidia kuelewa suluhisho zetu za kiteknolojia, huduma tunazotoa, au kukuelekeza mahali pazuri pa kuanzia kwa mradi wako.\n\nUngependa kujua nini kuhusu MLUE Technology?"
        : "Hello! I'm MLUE AI. I can help you explore our technology solutions, understand our services, or guide you toward the right starting point for your project.\n\nWhat would you like to know about MLUE Technology?";
}

function ensureOnboardingNode() {
    if (onboardingNode && onboardingNode.isConnected) {
        return;
    }

    onboardingNode = document.createElement("div");
    onboardingNode.className = "chatbot__onboarding";
    onboardingNode.textContent = getOnboardingText();
}

function updateOnboarding() {
    const shouldShow = state.showHeader && state.messages.length === 0;

    if (shouldShow) {
        ensureOnboardingNode();

        onboardingNode.textContent = getOnboardingText();

        if (!onboardingNode.isConnected) {
            chatMessages.prepend(onboardingNode);
        }
    } else if (onboardingNode && onboardingNode.isConnected) {
        onboardingNode.remove();
    }
}

document.addEventListener("mlue-language-changed", () => {
    updateOnboarding();
});



        function getLanguageSwitch(text) {
            const normalized = (text || "").toLowerCase();
            const words = normalized.match(/[a-zA-Z\u00C0-\u024F]+/g) || [];

            const asksSwitch = [
                "use", "switch", "change", "speak", "talk", "reply",
                "tumia", "badili", "ongea", "zungumza"
            ].some(word => words.includes(word));

            const wantsSwahili = words.includes("swahili") || words.includes("kiswahili");
            const wantsEnglish = words.includes("english") || words.includes("kiingereza");

            if (wantsSwahili && (asksSwitch || words.length <= 3)) {
                return "swahili";
            }
            if (wantsEnglish && (asksSwitch || words.length <= 3)) {
                return "english";
            }
            return null;
        }

        function applyImplicitLanguagePreference(text) {
            const inferred = inferPreferredLanguage(text);

            if (!inferred || inferred === chatLanguage) {
                return;
            }

            chatLanguage = inferred;
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function linkifyBotMessage(text) {
    const escaped = escapeHtml(text);
    const markdownLinks = [];

    function cleanMarkdownArtifacts(value) {
        return String(value)
            .replace(/\*\*/g, "")
            .replace(/__/g, "")
            .trim();
    }

    function formatInline(value) {
        let formatted = value;

        // Inline code
        formatted = formatted.replace(
            /`([^`\n]+)`/g,
            "<code>$1</code>"
        );

        // Bold
        formatted = formatted.replace(
            /\*\*([^*\n]+)\*\*/g,
            "<strong>$1</strong>"
        );

        formatted = formatted.replace(
            /__([^_\n]+)__/g,
            "<strong>$1</strong>"
        );

        // Italic
        formatted = formatted.replace(
            /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
            "<em>$1</em>"
        );

        formatted = formatted.replace(
            /(?<!_)_([^_\n]+)_(?!_)/g,
            "<em>$1</em>"
        );

        return formatted;
    }

    // Protect Markdown links first.
    let formatted = escaped.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        (_, label, url) => {
            const cleanUrl = url
                .replace(/[*_]+$/g, "")
                .replace(/[.,!?;:]+$/g, "");

            const cleanLabel = formatInline(
                cleanMarkdownArtifacts(label)
            );

            const token = `@@MLUE_LINK_${markdownLinks.length}@@`;

            markdownLinks.push(
                `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanLabel}</a>`
            );

            return token;
        }
    );

    // Linkify ordinary URLs.
    formatted = formatted.replace(
        /(https?:\/\/[^\s<]+)/g,
        (match) => {
            const cleanUrl = match
                .replace(/[*_]+$/g, "")
                .replace(/[.,!?;:]+$/g, "");

            return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>`;
        }
    );

    // Linkify email addresses.
    formatted = formatted.replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        '<a href="mailto:$1">$1</a>'
    );

    // Apply inline Markdown.
    formatted = formatInline(formatted);

    // Convert lines into readable blocks/lists.
    const lines = formatted.split(/\r?\n/);
    const output = [];
    let inList = false;

    lines.forEach(line => {
        const listMatch = line.match(/^\s*[-*]\s+(.+)$/);

        if (listMatch) {
            if (!inList) {
                output.push("<ul>");
                inList = true;
            }

            output.push("<li>" + listMatch[1] + "</li>");
            return;
        }

        if (inList) {
            output.push("</ul>");
            inList = false;
        }

        if (line.trim() === "") {
            output.push("<div class='chatbot__message-spacer'></div>");
        } else {
            output.push("<div>" + line + "</div>");
        }
    });

    if (inList) {
        output.push("</ul>");
    }

    let result = output.join("");

    markdownLinks.forEach((link, index) => {
        result = result.replace(
            `@@MLUE_LINK_${index}@@`,
            link
        );
    });

    return result;
}

        function appendMessage(text, role, persist) {
            const shouldPersist = persist !== false;
            const wrap = document.createElement("div");
            wrap.className = "chat-msg chat-msg--" + role;

            const bubble = document.createElement("div");
            bubble.className = "chat-bubble";
            if (role === "bot") {
                bubble.innerHTML = linkifyBotMessage(text);
            } else {
                bubble.textContent = text;
            }

            wrap.appendChild(bubble);
            chatMessages.appendChild(wrap);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            if (shouldPersist) {
                state.messages.push({ role, text: String(text) });
                if (state.messages.length > 40) {
                    state.messages = state.messages.slice(-40);
                }
                saveChatState();
            }
        }

        function appendConsultationAction() {
    const wrap = document.createElement("div");
    wrap.className = "chat-msg chat-msg--bot";

    const action = document.createElement("div");
    action.className = "chatbot__consultation-action";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn--primary";
    button.textContent =
        chatLanguage === "swahili"
            ? "Anza Ushauri"
            : "Start Consultation";

    button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent =
            chatLanguage === "swahili"
                ? "Inaandaa maelezo..."
                : "Preparing consultation...";

        try {
            const history = state.messages
                .filter(
                    message =>
                        message.role === "user" ||
                        message.role === "bot"
                )
                .map(message => ({
                    role:
                        message.role === "user"
                            ? "user"
                            : "assistant",
                    content: message.text
                }))
                .slice(-40);

            const response = await fetch(
                "/.netlify/functions/consultation",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        history
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data?.emailSent) {
                throw new Error(
                    data?.error ||
                    "Unable to submit consultation"
                );
            }

            button.textContent =
                chatLanguage === "swahili"
                    ? "Ushauri umetumwa ✓"
                    : "Consultation Sent ✓";

            if (typeof window.openMLUEAppointmentModal === "function") {
    setTimeout(() => {
        window.openMLUEAppointmentModal();
    }, 400);
}
        } catch (error) {
            console.error(
                "MLUE consultation submission error:",
                error
            );

            button.disabled = false;
            button.textContent =
                chatLanguage === "swahili"
                    ? "Jaribu Tena"
                    : "Try Again";
        }
    });

    action.appendChild(button);
    wrap.appendChild(action);
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return wrap;
}

function appendConsultationAction() {
    const wrap = document.createElement("div");
    wrap.className = "chat-msg chat-msg--bot";

    const action = document.createElement("div");
    action.className = "chatbot__consultation-action";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn--primary";
    button.textContent =
        chatLanguage === "swahili"
            ? "Anza Ushauri"
            : "Start Consultation";

    button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent =
            chatLanguage === "swahili"
                ? "Inaandaa maelezo..."
                : "Preparing consultation...";

        try {
            const history = state.messages
                .filter(
                    message =>
                        message.role === "user" ||
                        message.role === "bot"
                )
                .map(message => ({
                    role:
                        message.role === "user"
                            ? "user"
                            : "assistant",
                    content: message.text
                }))
                .slice(-40);

            const response = await fetch(
                "/.netlify/functions/consultation",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        history
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data?.emailSent) {
                throw new Error(
                    data?.error ||
                    "Unable to submit consultation"
                );
            }

            button.textContent =
                chatLanguage === "swahili"
                    ? "Ushauri umetumwa ✓"
                    : "Consultation Sent ✓";

            if (typeof window.openMLUEAppointmentModal === "function") {
    setTimeout(() => {
        window.openMLUEAppointmentModal();
    }, 400);
}
        } catch (error) {
            console.error(
                "MLUE consultation submission error:",
                error
            );

            button.disabled = false;
            button.textContent =
                chatLanguage === "swahili"
                    ? "Jaribu Tena"
                    : "Try Again";
        }
    });

    action.appendChild(button);
    wrap.appendChild(action);
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return wrap;
}

        function appendTyping() {
            const wrap = document.createElement("div");
            wrap.className = "chat-msg chat-msg--bot";

            const bubble = document.createElement("div");
            bubble.className = "chat-bubble chat-bubble--typing";
            bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

            wrap.appendChild(bubble);
            chatMessages.appendChild(wrap);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return wrap;
        }

        function openChat() {
    chatWindow.classList.add("chatbot--open");
    chatToggle.classList.add("chatbot-toggle--active");
    chatToggle.setAttribute("aria-expanded", "true");
    chatWindow.setAttribute("aria-hidden", "false");

    if (state.messages.length === 0) {
        updateOnboarding();
        state.showHeader = false;
        saveChatState();
    } else {
        saveChatState();
    }

    chatInput.focus();
}

        function closeChat() {

    if (typingNode && typingNode.isConnected) {
        typingNode.remove();
    }

    typingNode = null;

    // Clear the current conversation from memory.
    state.messages = [];
    state.showHeader = true;

    chatMessages.innerHTML = "";

    onboardingNode = null;

    chatInput.value = "";
    chatInput.disabled = false;
    chatSend.disabled = false;

    chatWindow.classList.remove("chatbot--open");
    chatToggle.classList.remove("chatbot-toggle--active");

    chatToggle.setAttribute("aria-expanded", "false");
    chatWindow.setAttribute("aria-hidden", "true");

    saveChatState();
}

async function getAIResponse(userText) {
    const history = state.messages
        .slice(0, -1)
        .filter(message =>
            message.role === "user" || message.role === "bot"
        )
        .map(message => ({
            role: message.role === "user" ? "user" : "assistant",
            content: message.text
        }))
        .slice(-20);

    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userText,
            chatLanguage,
            history
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error || "Unable to get AI response");
    }

    if (!data?.reply) {
        throw new Error("AI returned an empty response");
    }

    return {
    reply: data.reply,
    consultationReady: Boolean(data.consultationReady)
};
}

        async function sendMessage() {
    const userText = chatInput.value.trim();

    if (!userText || chatInput.disabled) {
        return;
    }

    if (state.showHeader) {
        state.showHeader = false;
        updateOnboarding();
    }

    appendMessage(userText, "user");

    chatInput.value = "";
    chatSend.disabled = true;
    chatInput.disabled = true;

    typingNode = appendTyping();

    try {
        const requestedLanguage = getLanguageSwitch(userText);

        if (requestedLanguage) {
            chatLanguage = requestedLanguage;

            appendMessage(
                requestedLanguage === "swahili"
                    ? "Lugha imebadilishwa kuwa Kiswahili. Endelea kuuliza chochote, nitakujibu kwa Kiswahili."
                    : "Language switched to English. Continue with any question, and I will reply in English.",
                "bot"
            );

            saveChatState();
            return;
        }

        applyImplicitLanguagePreference(userText);

        const result = await getAIResponse(userText);

appendMessage(result.reply, "bot");

if (result.consultationReady) {
    appendConsultationAction();
}

saveChatState();

    } catch (error) {
        console.error("MLUE chatbot error:", error);

        appendMessage(
            chatLanguage === "swahili"
                ? "Samahani, kuna tatizo la muda katika kuwasiliana na AI. Tafadhali jaribu tena."
                : "Sorry, there was a temporary problem connecting to the AI service. Please try again.",
            "bot"
        );

    } finally {
        if (typingNode && typingNode.isConnected) {
            typingNode.remove();
        }

        typingNode = null;

        chatSend.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
}

        chatToggle.addEventListener("click", () => {
            if (chatWindow.classList.contains("chatbot--open")) {
                closeChat();
            } else {
                openChat();
            }
        });

        chatClose.addEventListener("click", closeChat);
        chatSend.addEventListener("click", sendMessage);
        chatInput.addEventListener("input", () => {
            if (state.showHeader && chatInput.value.length > 0) {
                state.showHeader = false;
                updateOnboarding();
                saveChatState();
            }
        });
        chatInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
        });

        // Render persisted conversation for continuity across pages.
        chatMessages.innerHTML = "";
        state.messages.forEach(item => {
            appendMessage(item.text, item.role, false);
        });
        updateOnboarding();

        if (state.isOpen) {
            openChat();
        } else {
            closeChat();
        }

        document.addEventListener("mlue-language-changed", () => {
            chatLanguage = document.documentElement.lang === "sw" ? "swahili" : "english";
            updateOnboarding();
            saveChatState();
        });
    }

    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initChatbotUI);
        } else {
            initChatbotUI();
        }
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { detectLanguage };
    }

    global.mlueChatbot = {
    detectLanguage
};

})(typeof window !== "undefined" ? window : globalThis);

