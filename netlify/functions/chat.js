const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-v4-flash";

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
                    "Content-Type": "application/json"
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
                        "Content-Type": "application/json"
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
                        "Content-Type": "application/json"
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
                temperature: 0.3
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

        const reply = data?.choices?.[0]?.message?.content;

        if (!reply) {
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

        return new Response(
            JSON.stringify({
                reply
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
                    "Content-Type": "application/json"
                }
            }
        );
    }
};