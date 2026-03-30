/* ===================================================
   MLUE TECHNOLOGY — Chatbot
   Smart intent detection + Deep knowledge base + AI fallback
   =================================================== */

(function () {
  "use strict";

  // ---- Configuration ----
  // NOTE: For production, proxy API calls through your own backend
  // to avoid exposing the token. This is acceptable for demos/prototypes.
  const HF_API_URL = "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions";
  const HF_TOKEN = ""; // Add your Hugging Face token here
  const MAX_RESPONSE_LENGTH = 500;
  const REQUEST_TIMEOUT = 15000;

  // ---- Utility: get current language ----
  function getLang() {
    return typeof currentLang !== "undefined" ? currentLang : "en";
  }

  // ---- Intent Detection ----
  // Detects what the user is asking: definition, how-it-works, listing, contact, etc.
  function detectIntent(msg) {
    const m = msg.toLowerCase().trim();
    if (/^(who is|who are|who's|what is|what's|what are|define|meaning of|explain|describe|tell me about|nini|eleza|maana ya|ni nini|nani)/.test(m)) return "define";
    if (/^(how does|how do|how is|how can|how to|jinsi|vipi|namna)/.test(m)) return "how";
    if (/^(why|kwa nini)/.test(m)) return "why";
    if (/^(do you|can you|does mlue|is mlue|je|mnaweza)/.test(m)) return "capability";
    if (/^(where|wapi)/.test(m)) return "location";
    if (/(list|show me|give me|what services|orodhesha|nionyeshe|huduma)/.test(m)) return "list";
    if (/(price|cost|how much|bei|gharama|kiasi)/.test(m)) return "pricing";
    if (/(contact|reach|email|phone|whatsapp|wasiliana|barua|simu)/.test(m)) return "contact";
    if (/(thank|asante|shukrani)/.test(m)) return "thanks";
    if (/(bye|goodbye|kwaheri|tutaonana|baadaye)/.test(m)) return "goodbye";
    if (/(hello|hi |hey|good morning|good afternoon|good evening|habari|mambo|salaam|hujambo|shikamoo|sasa)/.test(m)) return "greeting";
    return "general";
  }

  // ---- Topic Detection ----
  // Each topic has weighted keywords — more specific terms score higher
  const topics = {
    pos: {
      keywords: {
        "point of sale": 10, "pos system": 10, "pos": 8,
        "sales system": 8, "cash register": 7, "checkout system": 7,
        "sales management": 6, "sales tracking": 6, "receipt": 5,
        "transaction": 5, "retail system": 7, "mfumo wa mauzo": 9,
        "mauzo": 5, "duka": 4, "biashara": 3
      }
    },
    inventory: {
      keywords: {
        "inventory management": 10, "inventory system": 9, "inventory": 7,
        "stock management": 9, "stock control": 8, "stock tracking": 8,
        "stock": 6, "warehouse": 6, "supply chain": 5,
        "usimamizi wa hesabu": 10, "hesabu": 5, "stoki": 7, "bidhaa": 4
      }
    },
    api: {
      keywords: {
        "api development": 10, "rest api": 10, "restful": 9, "api": 8,
        "backend development": 9, "backend": 7, "server side": 7,
        "web service": 6, "endpoint": 7, "microservice": 7,
        "api salama": 10, "seva": 5
      }
    },
    auth: {
      keywords: {
        "authentication": 10, "authorization": 10, "login system": 9,
        "user authentication": 10, "auth": 7, "oauth": 8, "jwt": 8,
        "login": 6, "signup": 5, "password": 5, "session": 5,
        "access control": 8, "role based": 7, "permissions": 7,
        "user roles": 8, "uthibitishaji": 9, "uidhinishaji": 9,
        "majukumu": 6, "ruhusa": 6
      }
    },
    customSoftware: {
      keywords: {
        "custom software": 10, "custom development": 10, "bespoke software": 9,
        "tailored solution": 8, "custom application": 9, "custom system": 8,
        "software development": 8, "app development": 7, "build software": 7,
        "programu maalum": 10, "kujenga programu": 8
      }
    },
    integration: {
      keywords: {
        "system integration": 10, "integration": 7, "third party": 6,
        "connect systems": 8, "data migration": 7, "api integration": 9,
        "muunganisho wa mifumo": 10, "muunganisho": 7
      }
    },
    automation: {
      keywords: {
        "workflow automation": 10, "automation": 8, "automate": 7,
        "business process": 7, "workflow": 6, "efficiency": 5,
        "otomatiki": 8, "mtiririko wa kazi": 9
      }
    },
    design: {
      keywords: {
        "graphic design": 10, "graphics design": 10, "ui design": 9,
        "ux design": 9, "ui/ux": 9, "user interface": 8,
        "user experience": 8, "web design": 7, "app design": 7,
        "design": 5, "usanifu": 7, "usanifu wa picha": 10
      }
    },
    branding: {
      keywords: {
        "branding": 9, "brand identity": 10, "logo design": 10,
        "logo": 7, "brand": 6, "corporate identity": 8,
        "visual identity": 8, "marketing material": 8,
        "marketing": 5, "nembo": 8, "chapa": 7, "utambulisho wa chapa": 10
      }
    },
    security: {
      keywords: {
        "security": 8, "cybersecurity": 9, "data protection": 9,
        "encryption": 8, "secure": 6, "data security": 9,
        "vulnerability": 7, "penetration": 6, "firewall": 5,
        "usalama": 8, "usalama wa data": 10
      }
    },
    scalability: {
      keywords: {
        "scalability": 9, "scalable": 8, "scale": 6, "performance": 7,
        "performance optimization": 10, "speed": 5, "load": 5,
        "high traffic": 7, "optimization": 7, "fast": 4,
        "uboreshaji wa utendaji": 10, "kukua": 5
      }
    },
    about: {
      keywords: {
        "mlue technology": 9, "mlue": 7, "your company": 8,
        "about you": 7, "who are you": 9, "who are mlue": 10,
        "who is mlue": 10, "company info": 8,
        "background": 5, "kampuni": 6, "mlue ni nini": 10,
        "nani ni mlue": 10, "mlue ni nani": 10
      }
    },
    mission: {
      keywords: {
        "mission": 9, "mission statement": 10, "purpose": 7,
        "goal": 5, "objective": 6, "dhamira": 9, "lengo": 6
      }
    },
    vision: {
      keywords: {
        "vision": 9, "vision statement": 10, "future plan": 7,
        "aspiration": 6, "maono": 9, "mustakabali": 7
      }
    }
  };

  // ---- Deep Knowledge Responses ----
  const responses = {
    en: {
      pos: {
        define: "A POS (Point of Sale) system is software and hardware that businesses use to process sales transactions. It handles checkout, payment processing, receipt generation, and records every sale. At MLUE Technology, we build modern POS systems that also include inventory tracking, sales reporting, and user role management — tailored for retail shops, restaurants, and service businesses.",
        how: "Our POS system works by recording each sale in real-time: the cashier selects products, the system calculates totals and taxes, processes the payment, generates a receipt, and automatically updates your inventory. Managers can view sales reports, track employee activity, and monitor stock levels — all from one dashboard.",
        why: "A POS system eliminates manual errors, speeds up checkout, gives you real-time sales data, and helps manage inventory automatically. MLUE's POS solutions are built for security and reliability, so you never lose a transaction.",
        capability: "Yes, MLUE Technology builds complete POS systems with sales processing, inventory management, user roles and permissions, and real-time reporting. We customize each system to fit your specific business type — whether retail, food service, or other industries.",
        general: "MLUE Technology develops modern POS (Point of Sale) systems that handle sales processing, inventory tracking, user permissions, and real-time reporting. Our POS solutions are designed for reliability, ease of use, and security."
      },
      inventory: {
        define: "Inventory management is the process of tracking all your products — what you have in stock, what's been sold, and what needs to be reordered. MLUE builds inventory systems that give you real-time visibility of your stock levels, alert you when items run low, and integrate directly with your POS to update automatically after each sale.",
        how: "Our inventory system tracks every product from the moment it enters your store. When a sale happens through the POS, stock is automatically deducted. You get low-stock alerts, can set reorder points, view stock history, and generate reports — all from a single dashboard.",
        general: "MLUE Technology builds inventory and stock management systems that track products in real-time, automate stock updates on sales, send low-stock alerts, and generate detailed reports to help you make smarter business decisions."
      },
      api: {
        define: "An API (Application Programming Interface) is a set of rules that allows different software applications to communicate with each other. For example, when a mobile app fetches data from a server, it uses an API. MLUE Technology builds secure, well-documented RESTful APIs that connect your frontend apps, mobile apps, and third-party services to your backend systems.",
        how: "Our APIs work by exposing secure endpoints that your applications call to send or retrieve data. We implement proper authentication (JWT, OAuth), input validation, rate limiting, and error handling. Your frontend or mobile app sends a request, the API processes it, interacts with the database, and returns the response — all securely and efficiently.",
        why: "APIs let your systems talk to each other. Without them, your mobile app can't fetch data, your website can't process payments, and your services can't integrate. MLUE builds APIs that are fast, secure, and built to handle growth.",
        capability: "Yes, MLUE Technology specializes in API and backend development. We build RESTful APIs, implement authentication and authorization systems, optimize performance, and integrate with third-party services like payment gateways and messaging platforms.",
        general: "MLUE Technology develops secure, high-performance APIs and backend systems. Our services include RESTful API design, authentication (JWT, OAuth), database optimization, and third-party integrations — all built with security best practices."
      },
      auth: {
        define: "Authentication is verifying who a user is (login with username/password, OAuth, etc.). Authorization is controlling what a verified user can access (roles and permissions). Together, they protect your system by ensuring only the right people access the right data. MLUE builds robust auth systems using industry standards like JWT tokens and OAuth 2.0.",
        how: "Our auth systems work in layers: first, the user logs in with credentials (authentication). The system generates a secure token (JWT). On each subsequent request, the token is verified. Then role-based access control (authorization) determines what the user can see or do — admin, manager, staff, etc. We also implement refresh tokens, session management, and secure password hashing.",
        general: "MLUE Technology implements secure authentication and authorization systems using JWT, OAuth 2.0, role-based access control, and encrypted password storage — ensuring your application stays protected."
      },
      customSoftware: {
        define: "Custom software development is the process of designing and building software specifically for your business needs — rather than using generic off-the-shelf products. MLUE Technology creates tailored applications that fit your exact workflows, integrate with your existing tools, and scale as your business grows.",
        how: "We start by understanding your business processes and requirements. Then we design the system architecture, build it using modern technologies, test thoroughly, and deploy. We follow agile practices — so you see progress along the way and can provide feedback. After launch, we provide ongoing support and maintenance.",
        why: "Off-the-shelf software forces you to adapt to its limitations. Custom software adapts to you. It matches your exact workflow, integrates with your existing systems, gives you complete ownership, and scales with your business — no licensing fees or unnecessary features.",
        general: "MLUE Technology builds custom software tailored to your business — from internal tools and management systems to customer-facing applications. We handle everything from design to deployment and ongoing support."
      },
      integration: {
        define: "System integration is the process of connecting different software systems so they work together and share data. For example, connecting your POS to your accounting software, or linking your website to a payment gateway. MLUE handles integration so your tools work as one unified system.",
        how: "We integrate systems through APIs, webhooks, and middleware. We map data between systems, handle format conversions, set up automated sync, and ensure error handling. Whether it's connecting CRMs, payment gateways, messaging services, or databases — we make them communicate reliably.",
        general: "MLUE Technology connects your business tools through system integration — linking POS, accounting, payment gateways, CRMs, and other software into one seamless workflow."
      },
      automation: {
        define: "Workflow automation is using software to perform repetitive business tasks automatically — like sending invoices, updating records, generating reports, or notifying staff. MLUE builds automation systems that save time, reduce errors, and let your team focus on what matters.",
        how: "We analyze your current manual processes, identify repetitive tasks, and build automated workflows using custom code or integration tools. Triggers (like a new sale or a form submission) kick off automated actions (send email, update database, generate report). Everything runs reliably in the background.",
        general: "MLUE Technology automates your business workflows — from invoice generation to stock alerts to report scheduling. We identify manual bottlenecks and build reliable automation that saves time and reduces errors."
      },
      design: {
        define: "UI/UX design is the process of designing how software looks (UI — User Interface) and how it feels to use (UX — User Experience). Good UI makes an app visually appealing. Good UX makes it intuitive and easy to navigate. MLUE designs clean, modern interfaces that users enjoy using.",
        how: "We start with user research and wireframes to map out the user journey. Then we create visual designs with your brand colors and typography. We prototype the interactions, test with real users, and refine. The final designs are built to be responsive (working on desktop, tablet, and mobile).",
        general: "MLUE Technology offers professional UI/UX design — creating clean, intuitive, and responsive interfaces for web and mobile applications. We focus on user-centered design that makes your product easy and enjoyable to use."
      },
      branding: {
        define: "Branding is the process of creating a unique identity for your business — including your logo, colors, typography, tone, and visual style. It's how people recognize and remember your company. MLUE creates complete brand identity systems that make your business look professional, consistent, and trustworthy.",
        how: "We start by understanding your business, target audience, and values. Then we design your logo, select brand colors and fonts, create style guidelines, and produce materials like business cards, letterheads, and social media assets. The result is a cohesive visual identity you can use across all platforms.",
        general: "MLUE Technology creates professional brand identities — logos, color systems, typography, style guides, and marketing materials — giving your business a consistent, memorable, and trustworthy visual presence."
      },
      security: {
        define: "Software security means protecting applications, data, and systems from unauthorized access, theft, and damage. It includes encryption, secure authentication, input validation, and regular security audits. At MLUE, security is built into every layer of our software — from database encryption to API protection.",
        how: "We implement security at every level: encrypted data storage, HTTPS communication, JWT authentication, input sanitization to prevent injection attacks, rate limiting to stop abuse, role-based access control, and regular security reviews. We follow OWASP best practices to protect your application and your users' data.",
        general: "MLUE Technology builds security into every solution — implementing encryption, secure authentication, input validation, access control, and OWASP best practices to protect your data and your users."
      },
      scalability: {
        define: "Scalability is a system's ability to handle increasing amounts of work — more users, more data, more transactions — without slowing down or failing. MLUE designs systems with scalable architecture so your software grows smoothly with your business, without costly rebuilds.",
        how: "We achieve scalability through clean code architecture, efficient database queries, caching strategies, and stateless API design. As your load grows, the system can scale horizontally (adding more servers) without changing core code. We also optimize database indexes, use connection pooling, and implement load balancing.",
        general: "MLUE Technology builds scalable systems designed to grow with your business. Our architecture handles increasing traffic and data volume through optimization, caching, and clean design — no expensive rewrites needed."
      },
      about: {
        define: "MLUE Technology is a software development company based in Dar es Salaam, Tanzania, East Africa. We deliver modern, secure, and scalable technology solutions designed to empower businesses.\n\nOur services include:\n• POS (Point of Sale) Systems & Inventory Management\n• Secure API & Backend Development\n• Custom Software Development\n• System Integration & Workflow Automation\n• Graphics Design, Branding & UI/UX Design\n\nOur mission is to empower businesses with reliable, innovative technology that simplifies operations and accelerates growth.\n\nFor more information, contact us:\nEmail: mluetechnologytz@gmail.com\nWhatsApp: +255 752 804 154\nWebsite: www.mluetechnology.me",
        location: "MLUE Technology is located in Dar es Salaam, Tanzania, East Africa. We serve businesses locally and across the region. Reach us at mluetechnologytz@gmail.com or WhatsApp/Call +255 752 804 154/ +255 620 196 710 / +255 679 861 186.",
        general: "MLUE Technology is a software company based in Dar es Salaam, Tanzania. We build secure, scalable business solutions — including POS systems, API & backend development, custom software, system integration, workflow automation, and graphics design & branding.\n\nContact us for more info:\nEmail: mluetechnologytz@gmail.com\nWhatsApp: +255 752 804 154\nWebsite: www.mluetechnology.me"
      },
      mission: {
        define: "Our mission at MLUE Technology is to empower businesses with reliable, innovative, and secure technology solutions that simplify operations and accelerate growth. We aim to be more than just a software vendor — we want to be a true technology partner for our clients.",
        general: "MLUE Technology's mission: To empower businesses with reliable, innovative, and secure technology solutions that simplify operations and accelerate growth."
      },
      vision: {
        define: "Our vision is to become the most trusted technology partner for businesses across East Africa and beyond, delivering world-class digital solutions. We believe every business deserves access to modern, well-built technology.",
        general: "MLUE Technology's vision: To become the most trusted technology partner for businesses across East Africa and beyond, delivering world-class digital solutions."
      }
    },
    sw: {
      pos: {
        define: "Mfumo wa POS (Point of Sale) ni programu na vifaa ambavyo biashara hutumia kufanya miamala ya mauzo. Inashughulikia malipo, uzalishaji wa risiti, na kurekodi kila mauzo. MLUE Technology tunajenga mifumo ya kisasa ya POS ambayo pia inajumuisha ufuatiliaji wa hesabu, taarifa za mauzo, na usimamizi wa majukumu ya watumiaji — iliyoundwa kwa maduka, mikahawa, na biashara za huduma.",
        how: "Mfumo wetu wa POS unafanya kazi kwa kurekodi kila mauzo kwa wakati halisi: muuzaji anachagua bidhaa, mfumo unahesabu jumla na kodi, unashughulikia malipo, unazalisha risiti, na kusasisha hesabu yako moja kwa moja. Wasimamizi wanaweza kuona taarifa za mauzo na kufuatilia kiwango cha stoki — yote kutoka dashibodi moja.",
        general: "MLUE Technology inajenga mifumo ya kisasa ya POS inayoshughulikia mauzo, ufuatiliaji wa hesabu, ruhusa za watumiaji, na taarifa za wakati halisi. Mifumo yetu imejengwa kwa kuaminika, urahisi wa kutumia, na usalama."
      },
      inventory: {
        define: "Usimamizi wa hesabu ni mchakato wa kufuatilia bidhaa zako zote — unachokimiliki, kilichouzwa, na kinachohitaji kuagizwa tena. MLUE inajenga mifumo ya hesabu inayokupa uwezo wa kuona kiwango cha stoki kwa wakati halisi na kupokea arifa bidhaa zinapokaribia kuisha.",
        general: "MLUE Technology inajenga mifumo ya usimamizi wa hesabu inayofuatilia bidhaa kwa wakati halisi, kusasisha stoki kiotomatiki wakati wa mauzo, na kutoa taarifa za kina."
      },
      api: {
        define: "API (Application Programming Interface) ni seti ya sheria zinazohruhusu programu tofauti kuwasiliana. Kwa mfano, programu ya simu inapochukua data kutoka kwa seva, inatumia API. MLUE Technology inajenga API salama za RESTful zinazounganisha programu zako za wavuti, simu, na huduma za wahusika wengine na mifumo yako ya nyuma.",
        how: "API zetu zinafanya kazi kwa kutoa endpoints salama ambazo programu zako zinawasiliana nazo kutuma au kupokea data. Tunatekeleza uthibitishaji sahihi (JWT, OAuth), uthibitishaji wa data, na ushughulikiaji wa makosa. Programu yako inatuma ombi, API inalisindika, inawasiliana na database, na kurudisha jibu — yote kwa usalama na ufanisi.",
        general: "MLUE Technology inajenga API salama na mifumo ya backend. Huduma zetu zinajumuisha usanifu wa RESTful API, uthibitishaji (JWT, OAuth), uboreshaji wa database, na muunganisho wa wahusika wengine."
      },
      auth: {
        define: "Uthibitishaji (Authentication) ni kuthibitisha mtumiaji ni nani (kuingia kwa jina/nenosiri). Uidhinishaji (Authorization) ni kudhibiti mtumiaji anaweza kufikia nini (majukumu na ruhusa). Pamoja, zinahakikisha watu sahihi tu wanafika data sahihi. MLUE inajenga mifumo imara ya uthibitishaji kwa kutumia JWT na OAuth 2.0.",
        general: "MLUE Technology inatekeleza mifumo salama ya uthibitishaji na uidhinishaji kwa kutumia JWT, OAuth 2.0, udhibiti wa kufikia kulingana na majukumu, na uhifadhi salama wa nenosiri."
      },
      customSoftware: {
        define: "Utengenezaji wa programu maalum ni mchakato wa kubuni na kujenga programu mahususi kwa mahitaji ya biashara yako — badala ya kutumia bidhaa za jumla zilizopo. MLUE Technology inatengeneza programu zilizokusudiwa zinazofaa mtiririko wako halisi, kuunganisha na zana zako zilizopo, na kukua biashara yako inavyokua.",
        general: "MLUE Technology inajenga programu maalum zilizoundwa kwa biashara yako — kutoka zana za ndani na mifumo ya usimamizi hadi programu za wateja. Tunashughulikia kila kitu kutoka usanifu hadi utekelezaji."
      },
      integration: {
        define: "Muunganisho wa mifumo ni mchakato wa kuunganisha programu tofauti ili zifanye kazi pamoja na kushiriki data. Kwa mfano, kuunganisha POS yako na programu ya uhasibu. MLUE inashughulikia muunganisho ili zana zako zifanye kazi kama mfumo mmoja.",
        general: "MLUE Technology inaunganisha zana zako za biashara kupitia muunganisho wa mifumo — kuunganisha POS, uhasibu, malipo, na programu nyingine katika mtiririko mmoja."
      },
      automation: {
        define: "Otomatiki ya mtiririko wa kazi ni kutumia programu kufanya kazi za kurudia moja kwa moja — kama kutuma ankara, kusasisha rekodi, na kuzalisha taarifa. MLUE inajenga mifumo ya otomatiki inayookoa muda na kupunguza makosa.",
        general: "MLUE Technology inaotomatisha mtiririko wako wa biashara — kutoka uzalishaji wa ankara hadi arifa za stoki. Tunatambua vikwazo vya mwongozo na kujenga otomatiki ya kuaminika."
      },
      design: {
        define: "Usanifu wa UI/UX ni mchakato wa kubuni jinsi programu inavyoonekana (UI) na jinsi inavyohisi kutumia (UX). UI nzuri inafanya programu ivutie. UX nzuri inafanya iwe rahisi kutumia. MLUE inasanifu violesura safi na vya kisasa ambavyo watumiaji wanafurahia kutumia.",
        general: "MLUE Technology inatoa usanifu wa kitaalamu wa UI/UX — kuunda violesura safi, vinavyovutia, na vinavyofanya kazi kwenye vifaa vyote kwa programu za wavuti na simu."
      },
      branding: {
        define: "Branding ni mchakato wa kuunda utambulisho wa kipekee kwa biashara yako — ikiwa ni pamoja na nembo, rangi, fonti, na mtindo wa kuona. Ni jinsi watu wanavyokutambua na kukukumbuka. MLUE inaunda mifumo kamili ya utambulisho wa chapa inayofanya biashara yako ionekane ya kitaalamu na ya kuaminika.",
        general: "MLUE Technology inaunda utambulisho wa kitaalamu wa chapa — nembo, mifumo ya rangi, miongozo ya mtindo, na vifaa vya masoko — kukupa uwepo thabiti na wa kukumbukwa."
      },
      security: {
        define: "Usalama wa programu ni kulinda programu, data, na mifumo dhidi ya ufikiaji usioidhinishwa na uharibifu. Inajumuisha usimbaji fiche, uthibitishaji salama, na ukaguzi wa usalama. MLUE inajenga usalama katika kila tabaka la programu zetu.",
        general: "MLUE Technology inajenga usalama katika kila suluhisho — kutekeleza usimbaji fiche, uthibitishaji salama, udhibitishaji wa data, na mazoea bora ya OWASP kulinda data yako."
      },
      scalability: {
        define: "Scalability ni uwezo wa mfumo kushughulikia kiasi kinachokua cha kazi — watumiaji zaidi, data zaidi, miamala zaidi — bila kupungua kasi. MLUE inaunda mifumo yenye usanifu unaoweza kukua ili programu yako ikue kwa ulaini na biashara yako.",
        general: "MLUE Technology inajenga mifumo inayoweza kukua iliyoundwa kukua na biashara yako. Usanifu wetu unashughulikia trafiki na data zinazokua kupitia uboreshaji na usanifu safi."
      },
      about: {
        define: "MLUE Technology ni kampuni ya kutengeneza programu iliyoko Dar es Salaam, Tanzania, Afrika Mashariki. Tunatoa suluhisho za kisasa, salama, na zinazoweza kukua kwa biashara.\n\nHuduma zetu ni pamoja na:\n• Mifumo ya POS na Usimamizi wa Hesabu\n• Utengenezaji wa API Salama na Backend\n• Utengenezaji wa Programu Maalum\n• Muunganisho wa Mifumo na Otomatiki ya Kazi\n• Usanifu wa Picha, Branding na UI/UX\n\nDhamira yetu ni kuwezesha biashara kwa teknolojia ya kuaminika na bunifu inayosahilisha shughuli na kuharakisha ukuaji.\n\nKwa maelezo zaidi, wasiliana nasi:\nBarua pepe: gwamakamwakabuta@gmail.com\nWhatsApp: +255 752 804 154\nTovuti: www.mluetechnology.me",
        location: "MLUE Technology iko Dar es Salaam, Tanzania, Afrika Mashariki. Tunahudumia biashara ndani na nje ya nchi. Wasiliana nasi: gwamakamwakabuta@gmail.com au WhatsApp +255 752 804 154.",
        general: "MLUE Technology ni kampuni ya programu iliyoko Dar es Salaam, Tanzania. Tunatoa suluhisho salama za biashara — ikiwa ni POS, API na backend, programu maalum, muunganisho wa mifumo, otomatiki, na usanifu wa picha na branding.\n\nWasiliana nasi kwa maelezo zaidi:\nBarua pepe: gwamakamwakabuta@gmail.com\nWhatsApp: +255 752 804 154\nTovuti: www.mluetechnology.me"
      },
      mission: {
        define: "Dhamira yetu katika MLUE Technology ni kuwezesha biashara kwa suluhisho za teknolojia za kuaminika, bunifu, na salama zinazosahilisha shughuli na kuharakisha ukuaji.",
        general: "Dhamira ya MLUE Technology: Kuwezesha biashara kwa suluhisho za teknolojia za kuaminika, bunifu, na salama zinazosahilisha shughuli na kuharakisha ukuaji."
      },
      vision: {
        define: "Maono yetu ni kuwa mshirika wa teknolojia anayeaminika zaidi kwa biashara kote Afrika Mashariki na zaidi, kutoa suluhisho za kidijitali za kiwango cha dunia.",
        general: "Maono ya MLUE Technology: Kuwa mshirika wa teknolojia anayeaminika zaidi kwa biashara kote Afrika Mashariki na zaidi."
      }
    }
  };

  // ---- Standalone responses (not topic-based) ----
  const standalone = {
    en: {
      greeting: [
        "Hello! Welcome to MLUE Technology. How can I assist you today?'",
        "Hi there! Welcome to MLUE Technology. How can I help you today?"
      ],
      thanks: [
        "You're welcome! Feel free to ask more about MLUE Technology.",
        "Happy to help! If you have more questions about MLUE Technology, I'm here."
      ],
      goodbye: [
        "Goodbye! Thank you for your interest in MLUE Technology. Contact us at gwamakamwakabuta@gmail.com or WhatsApp +255 752 804 154 whenever you're ready.",
        "See you! Visit www.mluetechnology.me or reach out anytime. Have a great day!"
      ],
      contact: [
        "You can reach MLUE Technology at:\n\nEmail: mluetechnologytz@gmail.com\nWhatsApp: +255 752 804 154\nWebsite: www.mluetechnology.me\n\nWe'd love to discuss your project!",
        "Contact us anytime:\n\nEmail: mluetechnologytz@gmail.com\nWhatsApp: +255 752 804 154\nWebsite: www.mluetechnology.me"
      ],
      pricing: [
        "Pricing depends on the project scope, complexity, and timeline. We provide free consultations and custom quotes. Contact us at mluetechnologytz@gmail.com or WhatsApp +255 752 804 154 to discuss your project — no obligation.",
        "We offer competitive pricing tailored to your project requirements. Reach out for a free consultation: mluetechnologytz@gmail.com or WhatsApp +255 752 804 154."
      ],
      list: [
        "MLUE Technology offers these services:\n\n1. Business Systems — POS, inventory & sales management, user roles\n2. APIs & Backend — secure APIs, authentication, performance optimization\n3. Custom Software — tailored solutions, system integration, workflow automation\n4. Graphics Design & Branding — logos, UI/UX, marketing materials\n\nAsk about any of these for more details!",
      ],
      outOfScope: "Thank you for reaching out! Unfortunately, I'm not able to assist with that particular request. For further help, please don't hesitate to contact our team:\n\nEmail: mluetechnologytz@gmail.com\nWhatsApp: +255 752 804 154\nWebsite: www.mluetechnology.me\n\nOur team will be happy to assist you!"
    },
    sw: {
      greeting: [
        "Habari! Karibu MLUE Technology. Nikusaidie nini Leo?",
        "Mambo! Karibu MLUE Technology. Nikusaidie nini Leo?"
      ],
      thanks: [
        "Karibu! Uliza zaidi kuhusu huduma zetu — POS, API, programu maalum, usanifu, na zaidi.",
        "Furaha yangu kusaidia! Kama una maswali zaidi kuhusu MLUE Technology, niko hapa."
      ],
      goodbye: [
        "Kwaheri! Asante kwa kupendezwa na MLUE Technology. Wasiliana nasi wakati wowote: mluetechnologytz@gmail.com au WhatsApp +255 752 804 154.",
        "Tutaonana! Tembelea www.mluetechnology.me au wasiliana nasi wakati wowote. Siku njema!"
      ],
      contact: [
        "Wasiliana na MLUE Technology:\n\nBarua pepe: mluetechnologytz@gmail.com\nWhatsApp: +255 752 804 154\nTovuti: www.mluetechnology.me\n\nTungependa kujadili mradi wako!"
      ],
      pricing: [
        "Bei inategemea ukubwa wa mradi, utata, na ratiba. Tunatoa ushauri wa bure na makadirio maalum. Wasiliana nasi: mluetechnologytz@gmail.com au WhatsApp +255 752 804 154."
      ],
      list: [
        "MLUE Technology inatoa huduma zifuatazo:\n\n1. Mifumo ya Biashara — POS, usimamizi wa hesabu na mauzo\n2. API na Backend — API salama, uthibitishaji, uboreshaji\n3. Programu Maalum — suluhisho maalum, muunganisho, otomatiki\n4. Usanifu wa Picha na Branding — nembo, UI/UX, vifaa vya masoko\n\nUliza kuhusu yoyote kwa maelezo zaidi!"
      ],
      outOfScope: "Asante kwa kuwasiliana nasi! Kwa bahati mbaya, siwezi kusaidia na ombi hilo kwa sasa. Kwa msaada zaidi, tafadhali wasiliana nasi moja kwa moja:\n\nBarua pepe: mluetechnologytz@gmail.com\nWhatsApp: +255 752 804 154\nTovuti: www.mluetechnology.me\n\nTimu yetu itafurahi kukusaidia!"
    }
  };

  // ---- Topic matching with weighted scoring ----
  function findTopic(msg) {
    const m = msg.toLowerCase().trim();
    let bestTopic = null;
    let bestScore = 0;

    for (const topicName in topics) {
      let score = 0;
      const kw = topics[topicName].keywords;
      for (const keyword in kw) {
        if (m.includes(keyword)) {
          score += kw[keyword];
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestTopic = topicName;
      }
    }

    // Require a minimum score to avoid false matches
    return bestScore >= 4 ? bestTopic : null;
  }

  // ---- Build response from intent + topic ----
  function buildResponse(userMsg) {
    const lang = getLang();
    const intent = detectIntent(userMsg);
    const topic = findTopic(userMsg);

    // Handle standalone intents (no topic needed)
    if (["greeting", "thanks", "goodbye", "contact", "pricing"].includes(intent)) {
      const pool = standalone[lang]?.[intent] || standalone.en[intent];
      return pool[Math.floor(Math.random() * pool.length)];
    }

    if (intent === "list") {
      const pool = standalone[lang]?.list || standalone.en.list;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // If we found a topic, get the appropriate response
    if (topic) {
      const topicResponses = responses[lang]?.[topic] || responses.en[topic];
      if (topicResponses) {
        // Try to match the intent, fall back to general
        const intentMap = {
          define: "define",
          how: "how",
          why: "why",
          capability: "capability",
          general: "general",
          location: "location",
          list: "general"
        };
        const intentKey = intentMap[intent] || "general";
        return topicResponses[intentKey] || topicResponses.general || topicResponses.define;
      }
    }

    // No topic match — try AI, otherwise out-of-scope
    return null;
  }

  // ---- Hugging Face AI call ----
  const systemPrompt = `You are a helpful assistant for MLUE Technology, a software company in East Africa.
Services: POS Systems, Inventory Management, Secure APIs, Authentication, Custom Software, System Integration, Workflow Automation, Graphics Design, Branding, UI/UX Design.
Contact: Email mluetechnologytz@gmail.com, WhatsApp +255 752 804 154, Website www.mluetechnology.me
Mission: Empower businesses with reliable, innovative, secure tech solutions.
Vision: Most trusted technology partner in East Africa and beyond
Team: Eng.Gwamaka Mwakabuta, Eng.Stephen Chibwaye and Eng.David Mwakajonga.

Rules:
- Answer accurately and clearly about MLUE Technology, its services, and related tech concepts.
- Keep responses under 400 characters.
- If the question is off-topic, politely decline and suggest to contact a Mlue support team by email at mluetechnologytz@gmail.com or via WhatsApp at +255 752 804 154.
- If asked in Swahili, respond in Swahili.
- Be professional and concise.`;

  async function queryAI(userMsg) {
    if (!HF_TOKEN) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const res = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + HF_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMsg }
          ],
          max_tokens: 250,
          temperature: 0.5
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      if (!res.ok) return null;

      const data = await res.json();
      let reply = data.choices?.[0]?.message?.content || null;

      if (reply && reply.length > MAX_RESPONSE_LENGTH) {
        reply = reply.substring(0, MAX_RESPONSE_LENGTH).replace(/\s+\S*$/, "") + "...";
      }

      return reply || null;
    } catch (e) {
      clearTimeout(timeout);
      return null;
    }
  }

  // ---- Main response handler ----
  async function getResponse(userMsg) {
    // 1. Try knowledge base (instant, accurate, detailed)
    const kbReply = buildResponse(userMsg);
    if (kbReply) return kbReply;

    // 2. Try AI API for unmatched queries
    const aiReply = await queryAI(userMsg);
    if (aiReply) return aiReply;

    // 3. Fallback: out-of-scope
    const lang = getLang();
    return standalone[lang]?.outOfScope || standalone.en.outOfScope;
  }

  // ---- DOM Elements ----
  const chatToggle = document.getElementById("chatToggle");
  const chatWindow = document.getElementById("chatWindow");
  const chatClose = document.getElementById("chatClose");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");

  if (!chatToggle || !chatWindow) return;

  let isOpen = false;
  let hasGreeted = false;

  // ---- Toggle chat ----
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.classList.toggle("chatbot--open", isOpen);
    chatToggle.classList.toggle("chatbot-toggle--active", isOpen);

    if (isOpen && !hasGreeted) {
      hasGreeted = true;
      const lang = getLang();
      const pool = standalone[lang]?.greeting || standalone.en.greeting;
      appendMessage("bot", pool[Math.floor(Math.random() * pool.length)]);
    }

    if (isOpen) {
      setTimeout(() => chatInput.focus(), 300);
    } else {
      setTimeout(() => {
        if (!isOpen) {
          chatMessages.innerHTML = "";
          hasGreeted = false;
        }
      }, 300);
    }
  }

  chatToggle.addEventListener("click", toggleChat);
  chatClose.addEventListener("click", toggleChat);

  // ---- Append message to chat ----
  function appendMessage(sender, text) {
    const wrapper = document.createElement("div");
    wrapper.className = "chat-msg chat-msg--" + sender;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // ---- Typing indicator ----
  function showTyping() {
    const wrapper = document.createElement("div");
    wrapper.className = "chat-msg chat-msg--bot";
    wrapper.id = "chatTyping";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble chat-bubble--typing";
    bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById("chatTyping");
    if (el) el.remove();
  }

  // ---- Send message ----
  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = "";
    appendMessage("user", text);
    showTyping();

    chatInput.disabled = true;
    chatSend.disabled = true;

    try {
      const response = await getResponse(text);
      hideTyping();
      appendMessage("bot", response);
    } catch (err) {
      hideTyping();
      const lang = getLang();
      const errMsg = lang === "sw"
        ? "Samahani, nina tatizo la kujibu sasa hivi. Tafadhali jaribu tena baadaye."
        : "Sorry, I'm having trouble responding right now. Please try again later.";
      appendMessage("bot", errMsg);
    }

    chatInput.disabled = false;
    chatSend.disabled = false;
    chatInput.focus();
  }

  chatSend.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

})();
