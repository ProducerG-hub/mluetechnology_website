const DEEPSEEK_API_URL = "https://api.deepseek.com/beta/chat/completions";
const DEEPSEEK_MODEL = "deepseek-flash";

import { mlueSystemInstructions as MLUE_SYSTEM_INSTRUCTIONS,mlueKnowledge } from "./mlue-knowledge.js";
export default async (req) => {
    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({
                error: "Method not allowed"
            }),
            {
                status: 405,
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            }
        );
    }

    try {
        const body = await req.json();

        const {
            userText,
            chatLanguage,
            history = []
        } = body;

        if (!userText || typeof userText !== "string") {
            return new Response(
                JSON.stringify({
                    error: "userText is required"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                }
            );
        }

        const apiKey = process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            console.error("DEEPSEEK_API_KEY is not configured.");

            return new Response(
                JSON.stringify({
                    error: "AI service is not configured"
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                }
            );
        }

        const safeHistory = Array.isArray(history)
            ? history
                .filter(
                    message =>
                        message &&
                        ["user", "assistant"].includes(message.role) &&
                        typeof message.content === "string"
                )
                .slice(-20)
            : [];

        const systemMessage = `
            ${MLUE_SYSTEM_INSTRUCTIONS}

            MLUE KNOWLEDGE:
            ${JSON.stringify(mlueKnowledge, null, 2)}

            Preferred language:
            ${chatLanguage || "en"}

            IMPORTANT OUTPUT RULE

You MUST output valid json.

The word "json" is intentional: your entire response must be one valid json object.

Return ONLY one JSON object.

Do NOT return Markdown.
Do NOT return code fences.
Do NOT return explanations outside the JSON object.
Do NOT return blank content.
Do NOT return only spaces or blank lines.
The response must begin with "{" and end with "}".

The JSON object MUST contain exactly these three fields:

The JSON object MUST contain exactly these three fields:

{
  "reply": "Your natural-language response to the visitor.",
  "leadStage": "NORMAL_CHAT",
  "lead": {
    "name": null,
    "contact": null,
    "requirement": null
  }
}

Rules:

- "reply" contains only the visible response to the visitor.
- "leadStage" describes the current state of the business conversation.
- "lead" contains only information explicitly provided by the visitor.
- Never invent lead information.
- Preserve lead information already established in the conversation.
- Keep missing lead fields as null.
The consultation marker must be appended to "reply" only when a genuine consultation handoff has been reached.

The marker is an internal signal for the website application and must never be explained to or intentionally shown to the visitor.

            IMPORTANT:

            CONVERSATION MEMORY

Treat the conversation history as active context.

Before asking any question:
- inspect what the visitor has already said,
- identify what is already known,
- identify what is still unresolved.

Never ask the visitor to repeat information already provided.

Do not ask a reworded version of a question that has already been answered.

DISCOVERY DISCIPLINE

Ask only one meaningful discovery question at a time.

Prefer an open question that allows the visitor to explain their situation.

Do not present a long checklist of questions.

Do not ask about technical implementation details unless they are relevant
to the current conversation.

Only ask for information when knowing the answer would materially improve
the solution direction or next step.

CONSULTATION_READY:

- Use only when the visitor's core business need is sufficiently understood
  and the conversation has reached a genuine consultation handoff.

- The reply MUST contain [MLUE_CONSULTATION_READY] as its final content.

- Do not ask another discovery question at this stage.

- The visitor should be told that the next step is consultation with the MLUE team.

- Do not mark a conversation CONSULTATION_READY merely because the visitor
  has expressed interest in MLUE services.

- Important unresolved items may still be identified, but they should be
  items that can appropriately be confirmed during the consultation.

REQUIREMENT DISCIPLINE

A business problem is not automatically a software feature.

A desired outcome is not automatically a technical requirement.

A possible solution is not an agreed requirement.

Use these distinctions:

CURRENT PROCESS
What the visitor does today.

PROBLEM
What is difficult, inefficient, risky, or unclear today.

DESIRED OUTCOME
What the visitor wants to achieve.

REQUIREMENT
What the visitor explicitly says the system should support.

POSSIBLE SOLUTION
A direction MLUE could consider based on the conversation.

Never convert an assumption into a requirement.

ASSUMPTION CONTROL

Never describe a problem, feature, workflow, or business outcome as
something the visitor currently has unless the visitor explicitly stated it.

Do not assume the visitor has:
- expiry tracking needs
- supplier management needs
- customer records needs
- profit reporting needs
- branch management needs
- specific workflow problems
- specific operational failures

unless the visitor confirms them.

When giving examples of possible needs or features, clearly label them as
examples or possibilities.

Do not say a proposed feature "will solve" a problem that the visitor has
not explicitly described.

Prefer:
- "Some pharmacies may also need..."
- "One possible consideration is..."
- "Would you also need..."
- "That could be explored during the consultation."

Do not prefer:
- "You need..."
- "This solves..."
- "Your main problem is..."
- "You are struggling with..."
unless the visitor explicitly stated that information.

CONSULTATION HANDOFF

When enough information has been gathered:

1. Briefly summarize the visitor's situation.
2. Reflect the confirmed problem.
3. Reflect the explicit desired outcome.
4. Connect it to the relevant MLUE capability.
5. Describe a possible solution direction without presenting it as final.
6. Mention important unresolved items if necessary.
7. State that the next step is consultation with the MLUE team.
8. Append [MLUE_CONSULTATION_READY] as the final content.

Use the marker only when the core business need is sufficiently understood.

Do not continue asking questions once a consultation handoff is clearly appropriate.

Never expose the marker to the visitor.

DISCOVERY:

- Use when the visitor has expressed a real business or project requirement
  and the conversation should focus on understanding the problem before
  collecting formal contact information.

- Use this stage for requirement discovery, including understanding the
  current process, pain points, desired outcome, users, branches, locations,
  constraints, and important requirements when relevant.

- Ask only ONE useful discovery question at a time.

- Do not ask for the user's name or contact details merely because the
  conversation has entered DISCOVERY.

- Do not repeat information already provided by the visitor.

- Move to the appropriate lead-collection stage only when the conversation
  naturally requires that information.



            CONSULTATIVE BEHAVIOR

Do not try to sell MLUE services before understanding the visitor's situation.

Do not force every conversation toward a consultation.

A consultation should emerge naturally when the visitor has a meaningful
business problem, project idea, or technology requirement.

The goal is to help the visitor understand their problem and possible
technology direction, not merely to promote MLUE.`;

                const messages = [
                    {
                        role: "system",
                        content: systemMessage
                    },

                    ...safeHistory,
                    {
                        role: "user",
                        content: userText.trim()
                    }
                ];

                        console.log("CHAT FUNCTION: about to call DeepSeek");

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            console.error(
                "CHAT FUNCTION: DeepSeek request timed out after 20 seconds"
            );
            controller.abort();
        }, 20000);

        let response;

        try {
            response = await fetch(DEEPSEEK_API_URL, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": `Bearer ${apiKey}`
                },

                body: JSON.stringify({
    model: DEEPSEEK_MODEL,
    messages,
    stream: false,
    temperature: 0.3,
    max_tokens: 1000,

    thinking: {
        type: "disabled"
    },

    tools: [
        {
            type: "function",
            function: {
                name: "mlue_chat_response",

                description:
                    "Return the MLUE chatbot response and structured lead information.",

                strict: true,

                parameters: {
                    type: "object",

                    properties: {
                        reply: {
                            type: "string"
                        },

                        leadStage: {
                            type: "string",

                            enum: [
                                "NORMAL_CHAT",
                                "LEAD_DETECTED",
                                "DISCOVERY",
                                "COLLECTING_NAME",
                                "COLLECTING_CONTACT",
                                "COLLECTING_REQUIREMENT",
                                "AWAITING_CONFIRMATION",
                                "CONSULTATION_READY",
                                "COMPLETED"
                            ]
                        },

                        lead: {
                            type: "object",

                            properties: {
                                name: {
                                    anyOf: [
                                        { type: "string" },
                                        { type: "null" }
                                    ]
                                },

                                contact: {
                                    anyOf: [
                                        { type: "string" },
                                        { type: "null" }
                                    ]
                                },

                                requirement: {
                                    anyOf: [
                                        { type: "string" },
                                        { type: "null" }
                                    ]
                                }
                            },

                            required: [
                                "name",
                                "contact",
                                "requirement"
                            ],

                            additionalProperties: false
                        }
                    },

                    required: [
                        "reply",
                        "leadStage",
                        "lead"
                    ],

                    additionalProperties: false
                }
            }
        }
    ],

    tool_choice: {
        type: "function",
        function: {
            name: "mlue_chat_response"
        }
    }
}),

                signal: controller.signal
            });
        } catch (error) {
            console.error("CHAT FUNCTION: DeepSeek fetch failed:", error);

            return new Response(
                JSON.stringify({
                    error: "AI service request failed"
                }),
                {
                    status: 502,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                }
            );
        } finally {
            clearTimeout(timeout);
        }

        console.log(
            "CHAT FUNCTION: DeepSeek responded with status:",
            response.status
        );


        const data = await response.json();

        if (!response.ok) {
    console.error("DeepSeek API error:", data);

    return new Response(
        JSON.stringify({
            error: "AI service request failed"
        }),
        {
            status: 502,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }
    );
}

const message = data?.choices?.[0]?.message;

console.dir(message, { depth: null });

console.log(
    "TOOL CALLS:",
    message?.tool_calls
);

const toolCall = message?.tool_calls?.[0];

if (
    !toolCall ||
    toolCall.type !== "function" ||
    toolCall.function?.name !== "mlue_chat_response"
) {
    console.error(
        "DeepSeek did not return the expected MLUE tool call:",
        message
    );

    return new Response(
        JSON.stringify({
            error: "AI returned an unexpected response"
        }),
        {
            status: 502,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }
    );
}

const rawContent = toolCall.function.arguments;

if (
    !rawContent ||
    typeof rawContent !== "string" ||
    !rawContent.trim()
) {
    console.error(
        "DeepSeek returned empty tool arguments:",
        message
    );

    return new Response(
        JSON.stringify({
            error: "AI returned an empty response"
        }),
        {
            status: 502,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }
    );
}

if (!rawContent || typeof rawContent !== "string" || !rawContent.trim()) {
    console.error("DeepSeek returned no message:", data);

    return new Response(
        JSON.stringify({
            error: "AI returned an empty response"
        }),
        {
            status: 502,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }
    );
}

let aiResponse;

try {
    aiResponse = JSON.parse(rawContent);
} catch (error) {
    console.error("DeepSeek returned invalid JSON:", rawContent);

    return new Response(
        JSON.stringify({
            error: "AI returned an invalid response"
        }),
        {
            status: 502,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }
    );
}

const allowedLeadStages = [
    "NORMAL_CHAT",
    "LEAD_DETECTED",
    "DISCOVERY",
    "COLLECTING_NAME",
    "COLLECTING_CONTACT",
    "COLLECTING_REQUIREMENT",
    "AWAITING_CONFIRMATION",
    "CONSULTATION_READY",
    "COMPLETED"
];

function isValidLead(lead) {
    return (
        lead &&
        typeof lead === "object" &&
        (lead.name === null || typeof lead.name === "string") &&
        (lead.contact === null || typeof lead.contact === "string") &&
        (lead.requirement === null || typeof lead.requirement === "string")
    );
}

console.error("DEEPSEEK RAW CONTENT:", rawContent);
console.error("DEEPSEEK PARSED RESPONSE:", aiResponse);
console.error("DEEPSEEK LEAD STAGE:", aiResponse?.leadStage);
console.error("DEEPSEEK LEAD:", aiResponse?.lead);

if (
    !aiResponse ||
    typeof aiResponse.reply !== "string" ||
    !aiResponse.reply.trim() ||
    !allowedLeadStages.includes(aiResponse.leadStage) ||
    !isValidLead(aiResponse.lead)
) {
    console.error("Invalid AI response structure:", aiResponse);

    return new Response(
        JSON.stringify({
            error: "AI returned an invalid response structure"
        }),
        {
            status: 502,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }
    );
}

const consultationReady =
    aiResponse.reply.includes("[MLUE_CONSULTATION_READY]");

const cleanReply = aiResponse.reply
    .replace("[MLUE_CONSULTATION_READY]", "")
    .trim();

return new Response(
    JSON.stringify({
        reply: cleanReply,
        consultationReady,
        leadStage: aiResponse.leadStage,
        lead: aiResponse.lead
    }),
    {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }
);


    } catch (error) {
        console.error("Chat function error:", error);

        return new Response(
            JSON.stringify({
                error: "Internal server error"
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            }
        );
    }
};
