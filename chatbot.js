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

    const INTENTS = [
        {
            name: "greeting",
            patterns: [
                { value: "hello", weight: 3 },
                { value: "hi", weight: 3 },
                { value: "habari", weight: 3 },
                { value: "jambo", weight: 3 },
                { value: "mambo", weight: 3 },
                { value: "salamu", weight: 2 },
                { value: "hujambo", weight: 3 },
                { value: "vipi", weight: 2 },
                { value: "how are you", weight: 3 },
                { value: "hey", weight: 2 },
                { value: "hey mlue", weight: 3 },
                { value: "mlue", weight: 3 },
                { value: "hi mlue", weight: 3 },
                { value: "hello mlue", weight: 3 },
                { value: "mlue technology", weight: 3 }
            ]
        },
        {
            name: "services",
            patterns: [
                { value: "service", weight: 2 },
                { value: "services", weight: 2 },
                { value: "huduma", weight: 3 },
                { value: "unatoa huduma gani", weight: 4 },
                { value: "mnajihusisha na nini", weight: 4 },
                { value: "what services do you offer", weight: 4 },
                { value: "tell me about your services", weight: 4 },
                { value: "what can you do", weight: 3 },
                { value: "what do you offer", weight: 3 },
                { value: "what do you provide", weight: 3 },
                { value: "nifafanulie huduma zenu", weight: 4 },
                { value: "nifafanulie huduma mlue", weight: 4 },
                { value: "nifafanulie huduma mlue technology", weight: 5 }
            ]
        },
        {
            name: "contact",
            patterns: [
                { value: "contact", weight: 2 },
                { value: "wasiliana", weight: 3 },
                { value: "mawasiliano", weight: 3 },
                { value: "contacts", weight: 2 },
                { value: "how can i contact you", weight: 4 },
                { value: "how can i reach you", weight: 4 },
                { value: "nifafanulie jinsi ya kuwasiliana nanyi", weight: 5 },
                { value: "nifafanulie jinsi ya kuwasiliana na mlue", weight: 5 },
                { value: "nifafanulie jinsi ya kuwasiliana na mlue technology", weight: 5 },
                { value: "ninaweza kuwapataje", weight: 4 },
                { value: "ninaweza kuwasiliana nanyi", weight: 4 },
                { value: "ninaweza kuwasiliana na mlue", weight: 4 },
                { value: "ninaweza kuwasiliana na mlue technology", weight: 5 }
            ]
        },
        {
            name: "price",
            patterns: [
                { value: "pricing", weight: 2 },
                { value: "cost", weight: 2 },
                { value: "price", weight: 2 },
                { value: "budget", weight: 2 },
                { value: "bei zenu", weight: 3 },
                { value: "bei zenu zipoje", weight: 4 },
                { value: "how much does it cost", weight: 4 },
                { value: "what is the price", weight: 4 },
                { value: "nifafanulie bei zenu", weight: 4 },
                { value: "nifafanulie bei mlue", weight: 4 },
                { value: "nifafanulie bei mlue technology", weight: 5 },
                { value: "how much do your services cost", weight: 4 },
                { value: "what is the cost of your services", weight: 4 },
                { value: "what is the price of your services", weight: 4 },
                { value: "how much do you charge", weight: 4 },
                { value: "what do you charge", weight: 4 },
                { value: "what is your pricing", weight: 4 },
                { value: "ni bei gani huduma zenu", weight: 5 },
                { value: "ni bei gani huduma mlue", weight: 5 },
                { value: "ni bei gani huduma mlue technology", weight: 5 },
                { value: "nahitaji kujua bei za huduma zenu", weight: 5 },
                { value: "nahitaji kujua bei za huduma mlue", weight: 5 },
                { value: "nahitaji kujua bei za huduma mlue technology", weight: 5 },
                { value: "gharimu kiasi gani", weight: 4 }
            ]
        },
        {
            name: "support",
            patterns: [
                { value: "support", weight: 2 },
                { value: "msaada", weight: 3 },
                { value: "help", weight: 2 },
                { value: "assistance", weight: 2 },
                { value: "can you help me", weight: 4 },
                { value: "i need help", weight: 4 },
                { value: "nifafanulie msaada wenu", weight: 5 },
                { value: "nifafanulie msaada mlue", weight: 5 },
                { value: "nifafanulie msaada mlue technology", weight: 5 },
                { value: "can you assist me", weight: 4 },
                { value: "i need assistance", weight: 4 },
                { value: "how can you help me", weight: 4 },
                { value: "how can you assist me", weight: 4 },
                { value: "ninaweza kupata msaada gani kutoka kwenu", weight: 5 },
                { value: "ninaweza kupata msaada gani kutoka mlue", weight: 5 },
                { value: "ninaweza kupata msaada gani kutoka mlue technology", weight: 5 }
            ]
        },
        {
            name: "goodbye",
            patterns: [
                { value: "goodbye", weight: 3 },
                { value: "bye", weight: 3 },
                { value: "kwaheri", weight: 3 },
                { value: "tutaonana baadaye", weight: 4 },
                { value: "see you later", weight: 4 },
                { value: "goodbye mlue", weight: 4 },
                { value: "bye mlue", weight: 4 },
                { value: "kwaheri mlue", weight: 4 }
            ]
        },
        {
            name: "about",
            patterns: [
                { value: "who are you", weight: 5 },
                { value: "about you", weight: 4 },
                { value: "details about you", weight: 4 },
                { value: "tell me about you", weight: 5 },
                { value: "what is mlue", weight: 5 },
                { value: "what is mlue technology", weight: 5 },
                { value: "tell me about mlue", weight: 5 },
                { value: "nifafanulie mlue technology", weight: 5 },
                { value: "nifafanulie mlue", weight: 5 },
                { value: "nifafanulie kuhusu mlue technology", weight: 5 },
                { value: "nifafanulie kuhusu mlue", weight: 5 },
                { value: "nifafanulie kuhusu wewe", weight: 5 },
                { value: "nifafanulie kuhusu nyie", weight: 5 },
                { value: "kuhusu mlue", weight: 5 },
                { value: "kuhusu mlue technology", weight: 5 },
                { value: "mlue ni nini", weight: 5 },
                { value: "nyie ni nani", weight: 5 },
                { value: "kuhusu nyie", weight: 5 },
                { value: "kuhusu wewe", weight: 5 }
            ]
        },
        {
            name: "switchingLanguage",
            patterns: [
                { value: "use swahili", weight: 6 },
                { value: "switch to swahili", weight: 6 },
                { value: "change to swahili", weight: 6 },
                { value: "speak swahili", weight: 6 },
                { value: "talk in swahili", weight: 6 },
                { value: "reply in swahili", weight: 6 },
                { value: "tumia swahili", weight: 6 },
                { value: "badili kuwa swahili", weight: 6 },
                { value: "ongea swahili", weight: 6 },
                { value: "zungumza swahili", weight: 6 },
                { value: "use english", weight: 6 },
                { value: "switch to english", weight: 6 },
                { value: "change to english", weight: 6 },
                { value: "speak english", weight: 6 },
                { value: "talk in english", weight: 6 },
                { value: "reply in english", weight: 6 },
                { value: "tumia english", weight: 6 },
                { value: "badili kuwa english", weight: 6 },
                { value: "ongea english", weight: 6 },
                { value: "zungumza english", weight: 6 },
                { value: "language", weight: 2 },
                { value: "lugha", weight: 2 },
                { value: "swahili", weight: 2 },
                { value: "kiswahili", weight: 2 },
                { value: "english", weight: 2 },
                { value: "kiingereza", weight: 2 }
            ]
        },
        {
            name: "gracefulClosing",
            patterns: [
                { value: "thank you", weight: 4 },
                { value: "thanks", weight: 3 },
                { value: "asante", weight: 4 },
                { value: "nashukuru", weight: 4 },
                { value: "nashukuru sana", weight: 5 },
                { value: "nashukuru kwa msaada wako", weight: 5 },
                { value: "thank you mlue", weight: 5 },
                { value: "thanks mlue", weight: 5 },
                { value: "asante mlue", weight: 5 },
                { value: "nashukuru mlue", weight: 5 }
            ]
        }
    ];

    const INTENT_RESPONSE_PRIORITY = [
        "switchingLanguage",
        "about",
        "services",
        "contact",
        "price",
        "support",
        "greeting",
        "goodbye",
        "gracefulClosing"
    ];

    function detectIntent(text) {
        const normalized = (text || "").toLowerCase();
        const words = normalized.match(/[a-zA-Z\u00C0-\u024F]+/g) || [];

        function scoreIntent(intent) {
            let score = 0;

            intent.patterns.forEach(pattern => {
                const value = String(pattern.value || "").toLowerCase().trim();
                const weight = Number(pattern.weight || 0);
                if (!value || !weight) return;

                if (value.includes(" ")) {
                    if (normalized.includes(value)) {
                        score += weight;
                    }
                    return;
                }

                if (words.includes(value)) {
                    score += weight;
                    return;
                }

                // Partial stem support for sentence variants like "helping", "services", etc.
                if (value.length >= 4 && words.some(word => word.startsWith(value) || value.startsWith(word))) {
                    score += Math.max(1, Math.floor(weight / 2));
                }
            });

            if (intent.name === "about") {
                if (normalized.includes("mlue") && (normalized.includes("who") || normalized.includes("about") || normalized.includes("kuhusu") || normalized.includes("nani") || normalized.includes("nini"))) {
                    score += 3;
                }
            }

            if (intent.name === "switchingLanguage") {
                if (normalized.includes("swahili") || normalized.includes("kiswahili") || normalized.includes("english") || normalized.includes("kiingereza")) {
                    score += 2;
                }
            }

            return score;
        }

        let bestIntent = null;
        let bestScore = 0;

        for (const intent of INTENTS) {
            const score = scoreIntent(intent);
            if (score > bestScore) {
                bestIntent = intent.name;
                bestScore = score;
            } else if (score === bestScore && score > 0) {
                const currentPriority = INTENT_RESPONSE_PRIORITY.indexOf(bestIntent);
                const newPriority = INTENT_RESPONSE_PRIORITY.indexOf(intent.name);
                if (newPriority !== -1 && (currentPriority === -1 || newPriority < currentPriority)) {
                    bestIntent = intent.name;
                }
            }
        }

        if (bestScore < 2) {
            return null;
        }

        return bestIntent;
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
            greeting: {
                swahili: "Habari! Karibu MLUE Technology, tunaweza kukusaidia kwenye masuala ya kiteknolojia. Mimi ni msaidizi wako wa haraka, nikusaidie na nini leo? Unaweza kuchagua lugha ya mawasiliano, tukiwa na uwezo wa kuzungumza kwa Kiswahili na Kiingereza.",
                english: "Hello! Welcome to MLUE Technology, we can assist you with technology-related matters. I am your quick assistant, how can I help you today? You can choose your preferred language for communication, as we are capable of conversing in both Swahili and English."
            },
            services: {
                swahili: "Mlue Technology tunatoa huduma za kutengeneza tovuti (website), graphic design, backend API na suluhisho mbalimbali za kiteknolojia kwa maendeleo ya biashara yako. Ungependa tukuhudumiaje? karibu Mlue Technology kwa huduma bora za kiteknolojia.",
                english: "Mlue Technology offers services such as website development, graphic design, backend API, and various technology solutions for the growth of your business. How can we assist you? Welcome to Mlue Technology for excellent technology services."
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
                swahili: "Samahani, nipo hapa kukusaidia kuhusu Mlue Technology Pekee. Tafadhali wasiliana na timu ya msaada ya Mlue kwa maelezo zaidi: kwa barua pepe: mluetechnologytz@gmail.com au kwa simu: +255 752 804 154.",
                english: "Sorry, I am here to assist you with Mlue Technology specifically. Please contact the Mlue support team for more information: via email: mluetechnologytz@gmail.com or by phone: +255 752 804 154."
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

        const intent = detectIntent(message);
        if (knowledgeBase[intent]) {
            return language === "swahili"
                ? knowledgeBase[intent].swahili
                : knowledgeBase[intent].english;
        }
        return language === "swahili"
        ? "Naweza kusaidia kuhusu huduma za MLUE Technology kama POS systems, software, na branding. Ungependa kujua nini?"
        : "I can help with MLUE Technology services like POS systems, software, and branding. What would you like to know?";
    }

    const CHATBOT_STORAGE_KEY = "mlue-chatbot-state-v1";

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
    }

    function createChatbotMarkup() {
        const mount = document.createElement("div");
        mount.innerHTML = [
            '<button class="chatbot-toggle" id="chatToggle" aria-label="Open chat" aria-expanded="false">',
            '  <span class="chatbot-toggle__label">ask mlue</span>',
            '  <svg class="chatbot-toggle__icon chatbot-toggle__icon--chat" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
            '  <svg class="chatbot-toggle__icon chatbot-toggle__icon--close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
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
            '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
            '    </button>',
            '  </div>',
            '  <div class="chatbot__messages" id="chatMessages" data-i18n="chat.onboarding"></div>',
            '  <div class="chatbot__input">',
            '    <input type="text" id="chatInput" data-i18n-placeholder="chat.placeholder" placeholder="Ask about MLUE Technology..." autocomplete="off" />',
            '    <button id="chatSend" aria-label="Send">',
            '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
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

        if (!chatToggle.querySelector(".chatbot-toggle__label")) {
            const label = document.createElement("span");
            label.className = "chatbot-toggle__label";
            label.textContent = "ask mlue";
            chatToggle.insertBefore(label, chatToggle.firstChild);
        }

        const state = loadChatbotState();
        let chatLanguage = state.language;
        let pendingReplyTimer = null;
        let typingNode = null;
        let onboardingNode = null;

        function saveChatState() {
            state.language = chatLanguage;
            state.isOpen = chatWindow.classList.contains("chatbot--open");
            localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(state));
        }

        function getOnboardingText() {
            return document.documentElement.lang === "sw"
                ? "NIKUSAIDIEJE LEO?"
                : "HOW CAN I HELP YOU TODAY";
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
                    ? "Nimegundua unapendelea Kiswahili. Nitaendelea kukujibu kwa Kiswahili."
                    : "I detected you prefer English. I will continue replying in English.",
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
            saveChatState();

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

            chatInput.value = "";
            chatInput.disabled = false;
            chatSend.disabled = false;

            chatWindow.classList.remove("chatbot--open");
            chatToggle.classList.remove("chatbot-toggle--active");
            chatToggle.setAttribute("aria-expanded", "false");
            chatWindow.setAttribute("aria-hidden", "true");
            saveChatState();
        }

        function sendMessage() {
            const userText = chatInput.value.trim();
            if (!userText) {
                return;
            }

            if (state.showHeader) {
                state.showHeader = false;
                updateOnboarding();
                saveChatState();
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
                    saveChatState();
                } else {
                    applyImplicitLanguagePreference(userText);
                    appendMessage(generateResponse(userText, chatLanguage), "bot");
                    saveChatState();
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
        module.exports = { generateResponse, detectLanguage };
    }

    global.mlueChatbot = { generateResponse, detectLanguage };
})(typeof window !== "undefined" ? window : globalThis);

