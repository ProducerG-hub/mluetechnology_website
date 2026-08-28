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


// =====================================================
// MLUE TECHNOLOGY — BUSINESS KNOWLEDGE
// =====================================================

const businessKnowledge = {

    // -------------------------------------------------
    // COMPANY
    // -------------------------------------------------

    company: {

        name: "MLUE Technology",

        location: {
            city: "Dar es Salaam",
            country: "Tanzania",
            display: {
                english: "Dar es Salaam, Tanzania",
                swahili: "Dar es Salaam, Tanzania"
            }
        }

    },


    // -------------------------------------------------
    // SOLUTIONS
    // -------------------------------------------------

    solutions: {

        businessSoftware: {

            title: {
                english: "Business Software Solutions",
                swahili: "Suluhisho za Programu za Biashara"
            },

            description: {
                english:
                    "We engineer software systems that help businesses manage operations, automate workflows, improve productivity, and make better decisions.",

                swahili:
                    "Tunatengeneza mifumo ya programu inayosaidia biashara kusimamia shughuli, kufanya kazi kiotomatiki, kuongeza tija, na kufanya maamuzi bora."
            },

            capabilities: [
                "Custom Software",
                "Business Systems",
                "APIs & Backend",
                "E-Commerce"
            ]

        },


        locationIntelligence: {

            title: {
                english: "Location Intelligence",
                swahili: "Location Intelligence"
            },

            description: {
                english:
                    "We use GIS, spatial data, and mapping technologies to transform location information into actionable decisions.",

                swahili:
                    "Tunatumia GIS, spatial data, na teknolojia za ramani kubadilisha taarifa za maeneo kuwa taarifa zinazosaidia kufanya maamuzi."
            },

            capabilities: [
                "GIS Analysis",
                "Spatial Data",
                "Site Selection",
                "Mapping"
            ]

        }

    },


    // -------------------------------------------------
    // ENGINEERING CAPABILITIES
    // -------------------------------------------------

    capabilities: {

        uiUx: {
            title: "UI / UX",

            description: {
                english:
                    "Interfaces designed around clarity, usability, and real user workflows.",

                swahili:
                    "Tunatengeneza interfaces zinazozingatia uwazi, urahisi wa matumizi, na mahitaji halisi ya watumiaji."
            }
        },


        cloudDeployment: {
            title: "Cloud & Deployment",

            description: {
                english:
                    "Reliable deployment infrastructure designed for performance and growth.",

                swahili:
                    "Miundombinu ya deployment inayotengenezwa kwa kuzingatia utendaji bora na ukuaji."
            }
        },


        maintenanceSupport: {
            title: "Maintenance & Support",

            description: {
                english:
                    "Continuous improvement, maintenance, and technical support after deployment.",

                swahili:
                    "Uboreshaji endelevu, matengenezo, na msaada wa kiufundi baada ya mfumo kuanza kutumika."
            }
        }

    },


    // -------------------------------------------------
    // PRICING
    // -------------------------------------------------

    pricing: {

        transparent: true,

        url:
            "https://mluetechnology.me/pricing/"

    },


    // -------------------------------------------------
    // PROJECTS
    // -------------------------------------------------

    projects: {

        url:
            "https://mluetechnology.me/projects/"

    },


    // -------------------------------------------------
    // APPOINTMENT
    // -------------------------------------------------

    appointment: {

        url:
            "https://mluetechnology.me/#home"

    },


    // -------------------------------------------------
    // CONTACT
    // -------------------------------------------------

    contact: {

        email:
            "mluetechnologytz@gmail.com",

        phone:
            "+255 752 804 154",

        contactPage:
            "https://mluetechnology.me/#contact"

    },


    // -------------------------------------------------
    // ESCALATION
    // -------------------------------------------------

    escalation: {

        whatsapp:
            "https://wa.me/255620196710",

        phone:
            "+255 620 196 710",

        purpose:
            "Additional information or assistance outside the chatbot knowledge base."

    }

};

// ===================================================
// MLUE Chatbot — Business Rules
// Determines WHAT the chatbot should do
// ===================================================

const businessRules = {

    pricing: {
        action: "redirect",
        url: "https://mluetechnology.me/pricing/",
        keywords: [
            "price",
            "pricing",
            "cost",
            "charge",
            "how much",
            "fee",
            "budget",
            "bei",
            "gharama",
            "malipo"
        ]
    },

    projects: {
        action: "redirect",
        url: "https://mluetechnology.me/projects/",
        keywords: [
            "project",
            "projects",
            "portfolio",
            "work",
            "previous work",
            "examples",
            "miradi",
            "kazi",
            "mifano"
        ]
    },

    consultation: {
        action: "appointment",
        url: "https://mluetechnology.me/#home",
        keywords: [
            "consultation",
            "consult",
            "meeting",
            "appointment",
            "book",
            "schedule",
            "talk to you",
            "talk with you",
            "ushauri",
            "mkutano",
            "miadi",
            "zungumza"
        ]
    },

    contact: {
        action: "contact",
        url: "https://mluetechnology.me/#contact",
        email: "mluetechnologytz@gmail.com",
        phone: "+255 752 804 154",
        keywords: [
            "contact",
            "email",
            "phone",
            "telephone",
            "number",
            "reach you",
            "contact you",
            "mawasiliano",
            "barua pepe",
            "simu"
        ]
    },

    escalation: {
        action: "whatsapp",
        url: "https://wa.me/255620196710",
        trigger: [
    "exact location",
    "exact address",
    "office address",
    "physical address",
    "office location",
    "where exactly",
    "where is your office",
    "anwani ya ofisi",
    "anwani kamili",
    "mahali hasa",
    "ofisi yenu iko wapi"
]
    },

    location: {
        action: "answer",
        display: {
            english: "Dar es Salaam, Tanzania",
            swahili: "Dar es Salaam, Tanzania"
        }
    },

    services: {
        action: "knowledgeBase",
        knowledgeKey: "services"
    },

    about: {
        action: "knowledgeBase",
        knowledgeKey: "about"
    },

    support: {
        action: "knowledgeBase",
        knowledgeKey: "support"
    },

    solution: {
    action: "solutionResponse"
   }

};

globalThis.mlueBusinessRules = businessRules;

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

    // ===================================================
// MLUE Chatbot — Solution Context Detection
// Identifies the client's business domain and
// software requirement without inventing details.
// ===================================================



    // ===================================================
// MLUE Chatbot — Business Rule Resolver
// Determines which business rule should execute
// ===================================================

function resolveBusinessRule(message, detectedIntent, solutionContext) {

    const text = String(message || "").toLowerCase().trim();

    // -------------------------------------------------
// 00 — SOLUTION CONTEXT PRIORITY
// -------------------------------------------------

if (
    solutionContext &&
    solutionContext.solution === "businessSoftware" &&
    solutionContext.domain
) {
    return {
        key: "solution",
        rule: businessRules.solution,
        solutionContext
    };
}

    // -------------------------------------------------
    // 01 — EXACT / SPECIFIC LOCATION REQUEST
    // -------------------------------------------------
    // General location questions should NOT escalate.
    // Specific office/address questions should.
    // -------------------------------------------------

    const specificLocationPatterns = [
        "exact location",
        "exact address",
        "office address",
        "physical address",
        "office location",
        "where exactly",
        "where is your office",
        "where is the office",
        "anwani ya ofisi",
        "anwani kamili",
        "mahali hasa",
        "ofisi yenu iko wapi",
        "ofisi iko wapi"
    ];

    if (
        specificLocationPatterns.some(pattern =>
            text.includes(pattern)
        )
    ) {
        return {
            key: "escalation",
            rule: businessRules.escalation
        };
    }


    // -------------------------------------------------
    // 02 — GENERAL LOCATION
    // -------------------------------------------------

    const generalLocationPatterns = [
        "where are you located",
        "where are you based",
        "where are you located",
        "location",
        "where are you",
        "mlipo wapi",
        "mko wapi",
        "upo wapi",
        "mahali mlipo",
        "eneo mlilopo"
    ];

    if (
        generalLocationPatterns.some(pattern =>
            text.includes(pattern)
        )
    ) {
        return {
            key: "location",
            rule: businessRules.location
        };
    }


    // -------------------------------------------------
    // 03 — PRICING
    // -------------------------------------------------

    if (
        detectedIntent === "price" ||
        businessRules.pricing.keywords.some(keyword =>
            text.includes(keyword)
        )
    ) {
        return {
            key: "pricing",
            rule: businessRules.pricing
        };
    }


    // -------------------------------------------------
    // 04 — PROJECTS / PORTFOLIO
    // -------------------------------------------------

    if (
        businessRules.projects.keywords.some(keyword =>
            text.includes(keyword)
        )
    ) {
        return {
            key: "projects",
            rule: businessRules.projects
        };
    }


    // -------------------------------------------------
    // 05 — CONSULTATION / APPOINTMENT
    // -------------------------------------------------

    if (
        businessRules.consultation.keywords.some(keyword =>
            text.includes(keyword)
        )
    ) {
        return {
            key: "consultation",
            rule: businessRules.consultation
        };
    }


    // -------------------------------------------------
    // 06 — CONTACT
    // -------------------------------------------------

    if (detectedIntent === "contact") {
        return {
            key: "contact",
            rule: businessRules.contact
        };
    }


    // -------------------------------------------------
    // 07 — KNOWLEDGE BASE RULES
    // -------------------------------------------------

    if (detectedIntent === "services") {
        return {
            key: "services",
            rule: businessRules.services
        };
    }

    if (detectedIntent === "about") {
        return {
            key: "about",
            rule: businessRules.about
        };
    }

    if (detectedIntent === "support") {
        return {
            key: "support",
            rule: businessRules.support
        };
    }


    // -------------------------------------------------
    // 09 — NO BUSINESS RULE MATCH
    // -------------------------------------------------




    return null;
}

// ===================================================
// MLUE CHATBOT — SOLUTION CONTEXT ENGINE
// Determines WHAT KIND OF SOLUTION the client needs
// ===================================================

function detectSolutionContext(message) {

    const text = String(message || "")
        .toLowerCase()
        .trim();

    if (!text) {
        return {
            solution: null,
            domain: null,
            requirements: []
        };
    }


    // ---------------------------------------------------
    // REQUIREMENT DETECTION
    // ---------------------------------------------------

    const requirementPatterns = [
        {
            key: "sales",
            patterns: [
                "sales",
                "selling",
                "sell",
                "mauzo",
                "kuuza",
                "biashara ya mauzo"
            ]
        },

        {
            key: "inventory",
            patterns: [
                "inventory",
                "stock",
                "stocks",
                "stock management",
                "bidhaa",
                "stoo",
                "usimamizi wa bidhaa"
            ]
        },

        {
            key: "customers",
            patterns: [
                "customers",
                "customer management",
                "clients",
                "client management",
                "wateja",
                "usimamizi wa wateja"
            ]
        },

        {
            key: "patients",
            patterns: [
                "patients",
                "patient management",
                "patient records",
                "wagonjwa",
                "usimamizi wa wagonjwa",
                "rekodi za wagonjwa"
            ]
        },

        {
            key: "reporting",
            patterns: [
                "reporting",
                "reports",
                "report",
                "analytics",
                "ripoti",
                "taarifa"
            ]
        },

        {
            key: "students",
            patterns: [
                "students",
                "student management",
                "student records",
                "wanafunzi",
                "usimamizi wa wanafunzi"
            ]
        },

        {
    key: "teacherManagement",
    patterns: [
        "teachers",
        "teacher management",
        "teacher records",
        "staff management",
        "teachers management",
        "walimu",
        "usimamizi wa walimu",
        "rekodi za walimu"
    ]
    },

        {
            key: "academicRecords",
            patterns: [
                "academic records",
                "academic management",
                "grades",
                "marks",
                "results",
                "mitihani",
                "matokeo",
                "alama"
            ]
        }
    ];


    const requirements = [];


    requirementPatterns.forEach(requirement => {

        const matched = requirement.patterns.some(pattern =>
            text.includes(pattern)
        );

        if (matched) {
            requirements.push(requirement.key);
        }

    });


    // ---------------------------------------------------
    // HEALTHCARE
    // ---------------------------------------------------

    const healthcarePatterns = [
        "hospital",
        "clinic",
        "healthcare",
        "medical",
        "patient",
        "patients",
        "patient management",
        "patient records",
        "hospital management",
        "hospital system",
        "clinic system",
        "hospitali",
        "mgonjwa",
        "wagonjwa",
        "huduma za afya"
    ];

    if (
        healthcarePatterns.some(pattern =>
            text.includes(pattern)
        )
    ) {

        return {
            solution: "businessSoftware",
            domain: "healthcare",
            requirements
        };

    }


    // ---------------------------------------------------
    // EDUCATION
    // ---------------------------------------------------

    const educationPatterns = [
        "school",
        "schools",
        "education",
        "student",
        "students",
        "student management",
        "school management",
        "school system",
        "academic",
        "college",
        "university",
        "chuo",
        "shule",
        "mwanafunzi",
        "wanafunzi",
        "mfumo wa shule",
        "mfumo wa wanafunzi"
    ];

    if (
        educationPatterns.some(pattern =>
            text.includes(pattern)
        )
    ) {

        return {
            solution: "businessSoftware",
            domain: "education",
            requirements
        };

    }


    // ---------------------------------------------------
    // RETAIL
    // ---------------------------------------------------

    const retailPatterns = [
        "retail",
        "shop",
        "store",
        "supermarket",
        "sales",
        "inventory",
        "stock",
        "customers",
        "products",
        "point of sale",
        "pos",
        "duka",
        "stoo",
        "mauzo",
        "bidhaa",
        "wateja"
    ];

    if (
        retailPatterns.some(pattern =>
            text.includes(pattern)
        )
    ) {

        return {
            solution: "businessSoftware",
            domain: "retail",
            requirements
        };

    }


    // ---------------------------------------------------
    // GENERAL BUSINESS / ORGANIZATION
    // ---------------------------------------------------

    const businessPatterns = [
        "business",
        "business system",
        "business management",
        "management system",
        "organization",
        "organisation",
        "organization system",
        "company system",
        "enterprise system",
        "operations",
        "workflow",
        "automation",
        "biashara",
        "mfumo wa biashara",
        "mfumo wa usimamizi",
        "shirika"
    ];

    if (
        businessPatterns.some(pattern =>
            text.includes(pattern)
        )
    ) {

        return {
            solution: "businessSoftware",
            domain: "generalBusiness",
            requirements
        };

    }


    // ---------------------------------------------------
    // NO SOLUTION CONTEXT
    // ---------------------------------------------------

    return {
        solution: null,
        domain: null,
        requirements
    };
}

function mergeSolutionContext(previousContext, currentContext, message) {

    const text = String(message || "")
        .toLowerCase()
        .trim();

    const continuationPatterns = [
        "also",
        "and",
        "additionally",
        "another",
        "i also need",
        "i also want",
        "we also need",
        "we also want",
        "pia",
        "na pia",
        "ongeza",
        "nahitaji pia",
        "nataka pia"
    ];

    const isContinuation =
        continuationPatterns.some(pattern =>
            text.includes(pattern)
        );

    // If this is not a continuation, use the current context normally
    if (!isContinuation || !previousContext) {
        return currentContext;
    }

    // If the current message does not identify a domain,
    // inherit the previous domain.
    const mergedDomain =
        currentContext.domain || previousContext.domain;

    const mergedSolution =
        currentContext.solution || previousContext.solution;

    // Combine old + new requirements without duplicates
    const mergedRequirements = [
        ...(previousContext.requirements || []),
        ...(currentContext.requirements || [])
    ];

    const uniqueRequirements = [
        ...new Set(mergedRequirements)
    ];

    return {
        solution: mergedSolution,
        domain: mergedDomain,
        requirements: uniqueRequirements
    };
}

// ===================================================
// MLUE CHATBOT — SOLUTION CONTEXT MEMORY
// Remembers the client's current software requirement
// during the current chatbot session.
// ===================================================

let currentSolutionContext = {
    solution: null,
    domain: null,
    requirements: []
};

// ===================================================
// MLUE CHATBOT — CONSULTATION QUESTION ENGINE
// Determines the next useful question to ask the client.
// ===================================================

function getNextConsultationQuestion(context, language) {

    const requirements = context?.requirements || [];

    if (context?.domain === "healthcare") {

        if (!requirements.includes("patients")) {
            return language === "swahili"
                ? "Ni sehemu gani za usimamizi wa hospitali ungependa mfumo uzingatie zaidi?"
                : "Which areas of hospital management would you like the system to focus on most?";
        }

        if (!requirements.includes("reporting")) {
            return language === "swahili"
                ? "Je, pia unahitaji mfumo uwe na reporting na ripoti za shughuli za hospitali?"
                : "Would you also need reporting and operational reports for the hospital?";
        }

        return language === "swahili"
            ? "Je, kuna mahitaji mengine muhimu ambayo ungependa kuyaongeza kwenye mfumo?"
            : "Are there any other important requirements you would like to add to the system?";
    }


    if (context?.domain === "education") {

    const missingRequirements = [];


    if (!requirements.includes("students")) {
        missingRequirements.push(
            language === "swahili"
                ? "student management"
                : "student management"
        );
    }

    if (!requirements.includes("teacherManagement")) {
        missingRequirements.push(
            language === "swahili"
                ? "teacher management"
                : "teacher management"
        );
    }

    if (!requirements.includes("academicRecords")) {
        missingRequirements.push(
            language === "swahili"
                ? "academic records"
                : "academic records"
        );
    }

    if (!requirements.includes("reporting")) {
        missingRequirements.push(
            language === "swahili"
                ? "reporting"
                : "reporting"
        );
    }


    if (missingRequirements.length > 0) {

        const suggestions =
    missingRequirements
        .slice(0, 2)
        .join(", ");
        
        return language === "swahili"
            ? `Tumeshabaini mahitaji kama ${requirements.join(", ")}. Je, ungependa kuongeza vipengele vingine kama ${suggestions}?`
            : `We have noted requirements such as ${requirements.join(", ")}. Would you like to add any other modules such as ${suggestions}?`;
    }


    return language === "swahili"
        ? "Tumeshabaini mahitaji yako ya msingi ya mfumo. Je, kuna mahitaji mengine muhimu ungependa kuyaongeza?"
        : "We have identified your main system requirements. Are there any other important requirements you would like to add?";
    }


    if (context?.domain === "retail") {

        if (!requirements.includes("sales")) {
            return language === "swahili"
                ? "Je, mfumo unahitaji kusimamia mauzo pia?"
                : "Will the system also need to manage sales?";
        }

        if (!requirements.includes("inventory")) {
            return language === "swahili"
                ? "Je, unahitaji pia usimamizi wa stock na bidhaa?"
                : "Will you also need inventory and stock management?";
        }

        if (!requirements.includes("customers")) {
            return language === "swahili"
                ? "Je, ungependa mfumo pia usimamie taarifa za wateja?"
                : "Would you also like the system to manage customer information?";
        }

        return language === "swahili"
            ? "Je, kuna mahitaji mengine muhimu ya biashara ungependa kuyaongeza?"
            : "Are there any other important business requirements you would like to add?";
    }


    if (context?.domain === "generalBusiness") {

        return language === "swahili"
            ? "Ni shughuli gani kuu ungependa mfumo usimamie au kufanya kiotomatiki?"
            : "What are the main operations you would like the system to manage or automate?";
    }


    return language === "swahili"
        ? "Ni mahitaji gani muhimu ungependa mfumo wako uzingatie?"
        : "What are the main requirements you would like your system to address?";
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
    swahili: "MLUE Technology hutoa suluhisho za kiteknolojia zinazolenga kuboresha namna biashara zinavyofanya kazi, kufanya maamuzi, na kukua. Huduma zetu zinajumuisha Custom Software, Business Systems, API / Backend, E-Commerce, GIS / Location Intelligence, na AI / Intelligent Systems. Ungependa kujua zaidi kuhusu suluhisho gani?",

    english: "MLUE Technology provides technology solutions designed to improve how businesses operate, make decisions, and grow. Our solutions include Custom Software, Business Systems, API / Backend, E-Commerce, GIS / Location Intelligence, and AI / Intelligent Systems. Which solution would you like to explore?"
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

    


globalThis.mlueCurrentKnowledgeBase = knowledgeBase;
globalThis.mlueCurrentBusinessRules = businessRules;

    const intent = detectIntent(message);

// Detect solution context from the current message
const detectedSolutionContext =
    detectSolutionContext(message);


// ===================================================
// SOLUTION CONTEXT MEMORY
// ===================================================

// If the current message contains a complete/new
// solution context, update the stored context.
if (
    detectedSolutionContext &&
    detectedSolutionContext.solution === "businessSoftware" &&
    detectedSolutionContext.domain
) {
    currentSolutionContext = {
        solution: detectedSolutionContext.solution,
        domain: detectedSolutionContext.domain,
        requirements: [
            ...new Set(detectedSolutionContext.requirements || [])
        ]
    };
}

// If the current message adds requirements but does not
// specify the domain again, merge them with the previous
// solution context.
else if (
    currentSolutionContext.solution === "businessSoftware" &&
    detectedSolutionContext &&
    detectedSolutionContext.requirements &&
    detectedSolutionContext.requirements.length > 0
) {
    currentSolutionContext = {
        ...currentSolutionContext,

        requirements: [
            ...new Set([
                ...(currentSolutionContext.requirements || []),
                ...detectedSolutionContext.requirements
            ])
        ]
    };
}

// ---------------------------------------------------
// USE REMEMBERED CONTEXT FOR RESOLVER
// ---------------------------------------------------

const solutionContext =
    currentSolutionContext.solution === "businessSoftware"
        ? currentSolutionContext
        : detectedSolutionContext;

// ---------------------------------------------------
// DEBUG / DEVELOPMENT ACCESS
// ---------------------------------------------------

globalThis.mlueCurrentSolutionContext =
    currentSolutionContext;        


const resolvedRule =
    resolveBusinessRule(
        message,
        intent,
        solutionContext
    );


// ===================================================
// BUSINESS RULE EXECUTION
// ===================================================

if (resolvedRule) {

    const { key, rule } = resolvedRule;

    // -----------------------------------------------
// SOLUTION CONTEXT
// -----------------------------------------------

if (key === "solution") {

    const context = resolvedRule.solutionContext;

    if (context.domain === "healthcare") {

        return language === "swahili"
            ? "Tunaweza kukusaidia kutengeneza mfumo wa kidijitali unaolenga mahitaji ya hospitali yako. Tunaweza kujadili mahitaji kama usimamizi wa wagonjwa, taarifa, na workflows za hospitali."
            : "We can help you develop a digital management system tailored to your hospital's needs. We can discuss requirements such as patient management, reporting, and other hospital workflows.";
    }

    if (context.domain === "education") {

    const educationRequirementLabels = {
        students: {
            swahili: "usimamizi wa wanafunzi",
            english: "student management"
        },

        teacherManagement: {
            swahili: "usimamizi wa walimu",
            english: "teacher management"
        },

        academicRecords: {
            swahili: "rekodi za kitaaluma",
            english: "academic records"
        },

        reporting: {
            swahili: "ripoti na taarifa",
            english: "reporting"
        }
    };

    const requirements =
        (context.requirements || [])
            .filter(requirement =>
                educationRequirementLabels[requirement]
            )
            .map(requirement =>
                educationRequirementLabels[requirement][language]
            );

    if (language === "swahili") {

        if (requirements.length > 0) {

            return `Tunaweza kukusaidia kutengeneza mfumo wa usimamizi wa shule unaolenga mahitaji ya taasisi yako. Mfumo unaweza kujumuisha ${requirements.join(", ")}. Tunaweza kujadili mahitaji yako kwa undani na kubuni mfumo unaokidhi mahitaji ya taasisi yako. ${getNextConsultationQuestion(context, language)}`;
        }

        return "Tunaweza kukusaidia kutengeneza mfumo wa usimamizi wa shule unaolenga mahitaji ya taasisi yako. Tunaweza kujadili mahitaji yako na aina ya mfumo unaohitaji.";
    }

    if (requirements.length > 0) {

        return `We can help you develop a school management system tailored to your institution's needs. The system can include ${requirements.join(", ")}. We can discuss your requirements in more detail and design a solution that fits your institution's needs. ${getNextConsultationQuestion(context, language)}`;
    }

    return "We can help you develop a school management system tailored to your institution's needs. We can discuss your requirements and the type of system you need.";
}


    if (context.domain === "retail") {

    const requirements = context.requirements || [];

    const requirementText = requirements
        .map(requirement => {

            const labels = {
    sales: language === "swahili"
        ? "mauzo"
        : "sales",

    inventory: language === "swahili"
        ? "usimamizi wa stock"
        : "inventory management",

    customers: language === "swahili"
        ? "usimamizi wa wateja"
        : "customer management",

    reporting: language === "swahili"
        ? "ripoti"
        : "reporting"
    };

            return labels[requirement];
        })
        .filter(Boolean);

    const features = requirementText.length > 0
        ? requirementText.join(
            language === "swahili"
                ? ", "
                : ", "
        )
        : language === "swahili"
            ? "mahitaji ya biashara yako"
            : "your business requirements";

    return language === "swahili"
        ? `Tunaweza kukusaidia kutengeneza mfumo wa retail unaolenga ${features}. Tunaweza kuchambua mahitaji yako kwa undani na kupanga mfumo unaofaa kwa shughuli za biashara yako.`
        : `We can help you develop a retail management system focused on ${features}. We can analyze your requirements in more detail and design a solution that fits your business operations.`;
}

    if (context.domain === "generalBusiness") {

        return language === "swahili"
            ? "Tunaweza kukusaidia kutengeneza mfumo wa kidijitali unaolenga mahitaji ya biashara au shirika lako. Tungependa kuelewa zaidi kuhusu shughuli unazotaka mfumo usimamie."
            : "We can help you develop a digital management system tailored to your business or organization's needs. We would like to understand more about the operations you want the system to manage.";
    }

    const requirements = context.requirements || [];

    const requirementLabels = {
    sales: {
        swahili: "mauzo",
        english: "sales"
    },

    inventory: {
        swahili: "usimamizi wa stock",
        english: "inventory management"
    },

    customers: {
        swahili: "usimamizi wa wateja",
        english: "customer management"
    },

    patients: {
        swahili: "usimamizi wa wagonjwa",
        english: "patient management"
    },

    reporting: {
        swahili: "reporting na ripoti",
        english: "reporting"
    },

    students: {
        swahili: "usimamizi wa wanafunzi",
        english: "student management"
    },

    teacherManagement: {
    swahili: "usimamizi wa walimu",
    english: "teacher management"
   },

    academicRecords: {
        swahili: "rekodi za kitaaluma",
        english: "academic records"
    }
};
const requirementText = requirements
    .map(requirement =>
        requirementLabels[requirement]?.[language]
    )
    .filter(Boolean)
    .join(", ");
}


    // -----------------------------------------------
    // LOCATION
    // -----------------------------------------------

    if (key === "location") {

        return language === "swahili"
            ? `Tunapatikana ${rule.display.swahili}.`
            : `We are based in ${rule.display.english}.`;
    }


    // -----------------------------------------------
    // PRICING
    // -----------------------------------------------

    if (key === "pricing") {

        return language === "swahili"
            ? `Bei za huduma zetu zinategemea aina ya suluhisho unalohitaji. Unaweza kuona bei zetu kwa uwazi kwenye ukurasa wetu wa pricing: ${rule.url}`
            : `Our pricing depends on the type of solution you need. You can view our transparent pricing on our pricing page: ${rule.url}`;
    }


    // -----------------------------------------------
    // PROJECTS
    // -----------------------------------------------

    if (key === "projects") {

        return language === "swahili"
            ? `Unaweza kuona miradi na kazi tunazofanya kupitia ukurasa wetu wa projects: ${rule.url}`
            : `You can explore our projects and previous work on our projects page: ${rule.url}`;
    }


    // -----------------------------------------------
    // CONSULTATION
    // -----------------------------------------------

    if (key === "consultation") {

        return language === "swahili"
            ? `Unaweza kuweka appointment ya consultation kupitia tovuti yetu. Tembelea: ${rule.url}`
            : `You can book a consultation through our website. Visit: ${rule.url}`;
    }


    // -----------------------------------------------
    // CONTACT
    // -----------------------------------------------

    if (key === "contact") {

        return language === "swahili"
            ? `Unaweza kuwasiliana na timu ya MLUE Technology kupitia ${rule.email}, simu ${rule.phone}, au ukurasa wetu wa mawasiliano: ${rule.url}`
            : `You can contact the MLUE Technology team via ${rule.email}, phone ${rule.phone}, or through our contact page: ${rule.url}`;
    }


    // -----------------------------------------------
    // ESCALATION
    // -----------------------------------------------

    if (key === "escalation") {

        return language === "swahili"
            ? `Kwa maelezo haya maalum, ni bora kuwasiliana moja kwa moja na timu yetu kupitia WhatsApp: ${rule.url}`
            : `For this specific information, it would be best to contact our team directly via WhatsApp: ${rule.url}`;
    }


    // -----------------------------------------------
    // KNOWLEDGE BASE
    // -----------------------------------------------

    if (rule.action === "knowledgeBase") {

        const knowledgeKey =
            rule.knowledgeKey;

        if (knowledgeBase[knowledgeKey]) {

            return language === "swahili"
                ? knowledgeBase[knowledgeKey].swahili
                : knowledgeBase[knowledgeKey].english;
        }
    }
}



// ===================================================
// FALLBACK
// ===================================================

return language === "swahili"
    ? "Samahani, sina taarifa ya kutosha kuhusu hilo. Unaweza kuwasiliana moja kwa moja na timu yetu kupitia WhatsApp kwa maelezo zaidi: https://wa.me/255620196710"
    : "I don't have enough reliable information about that. You can contact our team directly via WhatsApp for further assistance: https://wa.me/255620196710";
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
        let pendingReplyTimer = null;
        let typingNode = null;
        let onboardingNode = null;

        function saveChatState() {
    state.language = chatLanguage;
    state.isOpen = chatWindow.classList.contains("chatbot--open");
}

        function getOnboardingText() {
            return document.documentElement.lang === "sw"
                ? "NIKUSAIDIEJE LEO?"
                : "HOW CAN I HELP YOU TODAY";
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

    if (state.messages.length === 0) {
        if (onboardingNode && onboardingNode.isConnected) {
            onboardingNode.remove();
        }

        appendMessage(getWelcomeMessage(), "bot");

        state.showHeader = false;
        saveChatState();
    } else {
        saveChatState();
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

    global.mlueChatbot = {
    generateResponse,
    detectLanguage,
    detectSolutionContext,
    businessKnowledge
};

})(typeof window !== "undefined" ? window : globalThis);

