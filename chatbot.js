(function (global) {
    "use strict";

    // Creating a simple chatbot using keyword matching (no external AI API).
    function detectLanguage(text) {
        const swahiliWords = [
            "habari", "jambo", "mambo", "asante", "karibu", "sawa",
            "huduma", "wasiliana", "mawasiliano", "bei", "msaada", "kwaheri"
        ];
        const englishWords = [
            "hello", "hi", "thank", "welcome", "okay", "service",
            "contact", "price", "support", "goodbye"
        ];

        const messageWords = (text || "").toLowerCase().split(/\s+/);
        return messageWords.some(word => swahiliWords.includes(word))
            ? "swahili"
            : messageWords.some(word => englishWords.includes(word))
                ? "english"
                : "english";
    }

    function generateResponse(message) {
        const language = detectLanguage(message);
        const text = (message || "").toLowerCase();

        const knowledgeBase = {
            default: {
                swahili: "Habari! Karibu MLUE Technology, tunaweza kukusaidia kwenye masuala ya kiteknolojia. Mimi ni msaidizi wako wa haraka, nikusaidie na nini leo? Unaweza kuchagua lugha ya mawasiliano, tukiwa na uwezo wa kuzungumza kwa Kiswahili na Kiingereza.",
                english: "Hello! Welcome to MLUE Technology, we can assist you with technology-related matters. I am your quick assistant, how can I help you today? You can choose your preferred language for communication, as we are capable of conversing in both Swahili and English."
            },
            services: {
                swahili: "Mlue Technology tunatoa huduma za kutengeneza tovuti (website), graphic design, backend API na suluhisho mbalimbali za kiteknolojia kwa maendeleo ya biashara yako.",
                english: "Mlue Technology offers services such as website development, graphic design, backend API, and various technology solutions for the growth of your business."
            },
            contact: {
                swahili: "Unaweza kuwasiliana na timu ya msaada ya Mlue kupitia barua pepe: mluetechnologytz@gmail.com, au kupitia simu: +255 752 804 154 na kupitia tovuti yetu https://mluetechnology.me.",
                english: "You can contact the Mlue support team via email: mluetechnologytz@gmail.com, or by phone: +255 752 804 154, or through our website https://mluetechnology.me."
            },
            price: {
                swahili: "Bei za huduma zetu zinategemea aina ya huduma unayohitaji. Tafadhali tembelea tovuti yetu https://mluetechnology.me/pricing au wasiliana nasi kwa maelezo zaidi ili tuweze kutoa nukuu sahihi kwa mahitaji yako.",
                english: "The prices of our services depend on the type of service you need. Please visit our website https://mluetechnology.me/pricing or contact us for more details so we can provide an accurate quote for your needs."
            },
            support: {
                swahili: "Timu yetu ya msaada iko tayari kukusaidia na masuala yoyote unayoweza kuwa nayo. Tafadhali wasiliana nasi kupitia barua pepe: mluetechnologytz@gmail.com",
                english: "Our support team is ready to assist you with any questions or issues you may have. Please contact us via email: mluetechnologytz@gmail.com"
            },
            unknown: {
                swahili: "Samahani, siwezi kukusaidia kwa sasa. Tafadhali wasiliana na timu ya msaada ya Mlue kwa maelezo zaidi: kwa barua pepe: mluetechnologytz@gmail.com au kwa simu: +255 752 804 154.",
                english: "Sorry, I cannot assist you at the moment. Please contact the Mlue support team for more information: via email: mluetechnologytz@gmail.com or by phone: +255 752 804 154."
            },
            goodbye: {
                swahili: "Asante kwa kuwasiliana na Mlue Technology. Ikiwa una maswali zaidi, usisite kuuliza! Tunatarajia kukusaidia tena siku zijazo.",
                english: "Thank you for contacting Mlue Technology. If you have any more questions, feel free to ask! We look forward to assisting you again in the future."
            },
            gracefulClosing: {
                swahili: "Nafurahi kukusaidia. Ikiwa una maswali zaidi, usisite kuuliza! Tunatarajia kukusaidia tena siku zijazo.",
                english: "I'm glad I could help! If you have any more questions, feel free to ask! We look forward to assisting you again in the future."
            }
        };

        if (text.includes("service") || text.includes("huduma")) {
            return knowledgeBase.services[language];
        }
        if (text.includes("contact") || text.includes("wasiliana") || text.includes("mawasiliano")) {
            return knowledgeBase.contact[language];
        }
        if (text.includes("price") || text.includes("bei")) {
            return knowledgeBase.price[language];
        }
        if (text.includes("support") || text.includes("msaada")) {
            return knowledgeBase.support[language];
        }
        if (text.includes("sawa") || text.includes("okay") || text.includes("ok")) {
            return knowledgeBase.gracefulClosing[language];
        }
        if (text.includes("goodbye") || text.includes("kwaheri") || text.includes("thank you") || text.includes("asante")) {
            return knowledgeBase.goodbye[language];
        }
        if (text.includes("hello") || text.includes("habari") || text.includes("hi") || text.includes("jambo") || text.includes("mambo")) {
            return knowledgeBase.default[language];
        }
        return knowledgeBase.unknown[language];
    }

    function initChatbotUI() {
        const chatToggle = document.getElementById("chatToggle");
        const chatWindow = document.getElementById("chatWindow");
        const chatClose = document.getElementById("chatClose");
        const chatMessages = document.getElementById("chatMessages");
        const chatInput = document.getElementById("chatInput");
        const chatSend = document.getElementById("chatSend");

        if (!chatToggle || !chatWindow || !chatClose || !chatMessages || !chatInput || !chatSend) {
            return;
        }

        let hasWelcomed = false;
        let pendingReplyTimer = null;
        let typingNode = null;

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
            const linkedUrls = escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
            return linkedUrls.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
        }

        function appendMessage(text, role) {
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

            if (!hasWelcomed) {
                const isSwahili = document.documentElement.lang === "sw";
                appendMessage(isSwahili ? "Habari! Karibu MLUE Technology. Naweza kukusaidiaje leo?" : "Hello! Welcome to MLUE Technology. How can I help you today?", "bot");
                hasWelcomed = true;
            }

            chatInput.focus();
        }

        function closeChat() {
            if (pendingReplyTimer) {
                clearTimeout(pendingReplyTimer);
                pendingReplyTimer = null;
            }

            if (typingNode && typingNode.isConnected) {
                typingNode.remove();
            }
            typingNode = null;

            chatMessages.innerHTML = "";
            chatInput.value = "";
            chatInput.disabled = false;
            chatSend.disabled = false;
            hasWelcomed = false;

            chatWindow.classList.remove("chatbot--open");
            chatToggle.classList.remove("chatbot-toggle--active");
            chatToggle.setAttribute("aria-expanded", "false");
            chatWindow.setAttribute("aria-hidden", "true");
        }

        function sendMessage() {
            const userText = chatInput.value.trim();
            if (!userText) {
                return;
            }

            appendMessage(userText, "user");
            chatInput.value = "";
            chatSend.disabled = true;
            chatInput.disabled = true;

            typingNode = appendTyping();
            pendingReplyTimer = setTimeout(() => {
                if (typingNode && typingNode.isConnected) {
                    typingNode.remove();
                }
                typingNode = null;
                pendingReplyTimer = null;
                appendMessage(generateResponse(userText), "bot");
                chatSend.disabled = false;
                chatInput.disabled = false;
                chatInput.focus();
            }, 550);
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
        chatInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
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
        module.exports = { generateResponse, detectLanguage };
    }

    global.mlueChatbot = { generateResponse, detectLanguage };
})(typeof window !== "undefined" ? window : globalThis);

