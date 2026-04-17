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

    // Creating a simple chatbot using keyword matching (no external AI API).
    function detectLanguage(text) {
        const inferred = inferPreferredLanguage(text);
        return inferred || "english";
    }

    function generateResponse(message, preferredLanguage) {
        const language = preferredLanguage || detectLanguage(message);
        const text = (message || "").toLowerCase();
        const words = text.match(/[a-zA-Z\u00C0-\u024F]+/g) || [];

        function hasWord(candidates) {
            return candidates.some(candidate => words.includes(candidate));
        }

        function hasPhrase(candidates) {
            return candidates.some(candidate => text.includes(candidate));
        }

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
                swahili: "Nafurahi kukusaidia. Ikiwa una maswali zaidi, usisite kuuliza! Tunatarajia kukusaidia tena siku zijazo. Unaweza ukaona kazi zetu kwenye tovuti yetu https://mluetechnology.me/projects",
                english: "I'm glad I could help! If you have any more questions, feel free to ask! We look forward to assisting you again in the future. You can check out our work on our website https://mluetechnology.me/projects"
            },
            switchingLanguage: {
                swahili: "Lugha imebadilishwa kwa Kiswahili. Sasa tunaweza kuendelea mazungumzo yetu kwa Kiswahili. Je, kuna jambo lolote unalotaka kujua au kusaidiwa nalo?",
                english: "Language switched to English. We can now continue our conversation in English. Is there anything specific you would like to know or need assistance with?"
            },
            about: {
                swahili: "Mlue Technology ni kampuni ya teknolojia inayotoa suluhisho bora za kiteknolojia kwa wateja wetu. Tunajivunia timu yetu yenye ujuzi na uzoefu katika kutengeneza tovuti, graphic design, backend API, na huduma nyingine za kiteknolojia. Lengo letu ni kusaidia biashara zako kukua na kufanikisha malengo yako ya kiteknolojia.",
                english: "Mlue Technology is a technology company dedicated to provide excellent technological solutions for our clients. We take pride in our skilled and experienced team in website development, graphic design, backend API, and other technology services. Our goal is to help your business grow and achieve your technology goals."
            }
        };

        if (hasWord(["service", "services", "huduma"])) {
            return knowledgeBase.services[language];
        }
        if (hasWord(["contact", "wasiliana", "mawasiliano","contacts"])) {
            return knowledgeBase.contact[language];
        }
        if (hasWord(["price", "pricing", "bei"])) {
            return knowledgeBase.price[language];
        }
        if (hasWord(["support", "msaada"])) {
            return knowledgeBase.support[language];
        }
        if (
            hasPhrase([
                "who are you",
                "about you",
                "details about you",
                "tell me about you",
                "what is mlue",
                "what is mlue technology",
                "tell me about mlue",
                "nyie ni nani",
                "kuhusu nyie",
                "kuhusu wewe",
                "mlue ni nini",
                "niambie kuhusu mlue",
                "mlue ni nani",
                "nifafanulie mlue",
                "nifafanulie kuhusu mlue",
                "who is mlue",
                "tell me about your company",
                "what do you do"
            ]) ||
            hasWord(["kuhusu"]) ||
            (hasWord(["mlue", "mlue technology"]) && hasWord(["about", "details", "info", "information", "nini", "what"]))
        ) {
            return knowledgeBase.about[language];
        }
        if (hasWord(["sawa", "okay", "ok"])) {
            return knowledgeBase.gracefulClosing[language];
        }
        if (hasWord(["goodbye", "kwaheri", "asante"]) || hasPhrase(["thank you"])) {
            return knowledgeBase.goodbye[language];
        }
        if (hasWord(["hello", "habari", "hi", "jambo", "mambo"])) {
            return knowledgeBase.default[language];
        }
        if (hasWord(["english", "kiingereza", "swahili", "kiswahili"])) {
            return knowledgeBase.switchingLanguage[language];
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
        let chatLanguage = document.documentElement.lang === "sw" ? "swahili" : "english";
        let pendingReplyTimer = null;
        let typingNode = null;

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
            appendMessage(
                inferred === "swahili"
                    ? "..."
                    : "...",
                "bot"
            );
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
                appendMessage(
                    chatLanguage === "swahili"
                        ? "Habari! Karibu MLUE Technology. Mimi ni msaidizi wako, Naweza kukusaidiaje leo?"
                        : "Hello! Welcome to MLUE Technology. I am your assistant, how can I help you today?",
                    "bot"
                );
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
            chatLanguage = document.documentElement.lang === "sw" ? "swahili" : "english";

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

                const requestedLanguage = getLanguageSwitch(userText);
                if (requestedLanguage) {
                    chatLanguage = requestedLanguage;
                    appendMessage(
                        requestedLanguage === "swahili"
                            ? "Lugha imebadilishwa kuwa Kiswahili. Endelea kuuliza chochote, nitakujibu kwa Kiswahili."
                            : "Language switched to English. Continue with any question, and I will reply in English.",
                        "bot"
                    );
                } else {
                    applyImplicitLanguagePreference(userText);
                    appendMessage(generateResponse(userText, chatLanguage), "bot");
                }
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

