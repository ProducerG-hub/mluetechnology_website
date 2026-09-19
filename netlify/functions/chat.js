const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
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

            IMPORTANT OUTPUT RULE:
            You MUST respond with valid JSON.

            Return ONLY one JSON object.
            Do NOT return Markdown.
            Do NOT return code fences.
            Do NOT return explanations outside the JSON object.

            The JSON object MUST have exactly these two fields:

            {
            "reply": "Your natural-language response to the user.",
            "leadStage": "NORMAL_CHAT"
            }

            The "leadStage" value MUST be exactly one of:

            - NORMAL_CHAT
            - LEAD_DETECTED
            - COLLECTING_NAME
            - COLLECTING_CONTACT
            - COLLECTING_REQUIREMENT
            - AWAITING_CONFIRMATION
            - COMPLETED

            Example:

            {
            "reply": "Thanks, David Frances. Could you please provide your phone number, WhatsApp number, or email address?",
            "leadStage": "COLLECTING_CONTACT"
            }

            Another example:

            {
            "reply": "Thanks for reaching out to MLUE Technology. How can we help you today?",
            "leadStage": "NORMAL_CHAT"
            }

            The JSON object MUST also contain a "lead" object.

            The "lead" object MUST have exactly these three fields:

            {
            "name": null,
            "contact": null,
            "requirement": null
            }

            Rules for lead data:

            1. "name"
            - Store the user's name when the user provides it.
            - Otherwise use null.

            2. "contact"
            - Store phone number, WhatsApp number, or email when provided.
            - Otherwise use null.

            3. "requirement"
            - Store the user's actual business/software/service requirement when clearly provided.
            - Otherwise use null.

            4. Never invent lead information.

            5. Preserve previously collected lead information from the conversation.

            6. If the user provides only one piece of information, update that field and keep the other fields unchanged.

            7. The lead object represents information collected from the user. Do not put assumptions into it.

            Example:

            {
            "reply": "Thanks John. What kind of software solution are you looking for?",
            "leadStage": "COLLECTING_REQUIREMENT",
            "lead": {
                "name": "David Frances",
                "contact": "+255712345678",
                "requirement": null
            }
            }

            Always generate the final answer in the requested JSON format.

            LEAD STAGE RULES:

            The leadStage represents the current state of the business conversation.

            NORMAL_CHAT:
            - Use when the conversation is general information, casual conversation, or the user has not shown clear business interest.

            LEAD_DETECTED:
            - Use when the user shows meaningful interest in MLUE Technology's services, projects, pricing, consultation, or asks for a solution for their business.
            - This stage indicates that a potential lead has been detected.
            - If the user has already provided useful lead information, preserve it.

            COLLECTING_NAME:
            - Use when a lead has been detected but the user's name is not yet known.
            - Ask naturally for the user's name when appropriate.

            COLLECTING_CONTACT:
            - Use when the user's name is known but contact information is not yet known.
            - Ask for a phone number, WhatsApp number, or email.

            COLLECTING_REQUIREMENT:
            - Use when the user's name and contact are known but their actual business requirement is not yet sufficiently clear.
            - Ask what they need help with.

            AWAITING_CONFIRMATION:
            - Use when name, contact, and requirement have been collected and the AI needs the user's confirmation before considering the lead complete.
            - Clearly summarize the collected information and ask for confirmation.

            COMPLETED:
            - Use only after the user confirms that the collected lead information is correct.
            - Do not mark a lead as COMPLETED merely because all three fields are present.

            STAGE TRANSITION RULES:

            1. Never move backward unnecessarily.
            2. Preserve all previously collected lead information.
            3. If the user provides information for multiple fields in one message, update all applicable fields.
            4. If the user corrects previously provided information, replace the old value with the corrected value.
            5. Do not invent missing information.
            6. Do not ask for information that the user has already provided.
            7. A user's question about MLUE services does not automatically mean the lead is ready for contact collection.
            8. Move naturally based on the conversation context.
            9. The latest user message and previous conversation history must both be considered.
            10. The leadStage must describe the state AFTER processing the latest user message.

            IMPORTANT:

            When determining leadStage, use the complete conversation history and the current lead data.
            The leadStage must represent what information is still needed next, not simply the content of the latest user message.
            `;
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

        const response = await fetch(DEEPSEEK_API_URL, {
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
                response_format:{
                    type:"json_object"
                }
            })
        });

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

        const rawContent = data?.choices?.[0]?.message?.content;

        if (!rawContent) {
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
            "COLLECTING_NAME",
            "COLLECTING_CONTACT",
            "COLLECTING_REQUIREMENT",
            "AWAITING_CONFIRMATION",
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

        return new Response(
            JSON.stringify({
                reply: aiResponse.reply,
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