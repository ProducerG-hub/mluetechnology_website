const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-v4-flash";
const RESEND_API_URL = "https://api.resend.com/emails";

const SUMMARY_INSTRUCTIONS = `
You are an internal MLUE Technology consultation-summary assistant.

Your task is to summarize a conversation between the MLUE AI assistant and a
potential client.


Use ONLY information explicitly stated by the client or clearly established
during the conversation.

Do not invent:
- requirements
- features
- prices
- integrations
- technologies
- business facts
- project scope
- timelines

Separate confirmed client information from possible solution ideas.

Return ONLY valid JSON with this structure:

{
  "business": "",
  "project": "",
  "currentProcess": "",
  "mainProblem": "",
  "desiredOutcome": "",
  "requirements": [],
  "locations": "",
  "usersOrBranches": "",
  "constraints": [],
  "possibleSolutionDirection": "",
  "unconfirmedItems": [],
  "nextStep": ""
}

  REQUIREMENT EXTRACTION:
- Include every explicit requirement or operational capability that the client says the system should support.
- Preserve explicit requirements even when the same information also appears in the client's current workflow or problem description.
- Do not omit a requirement simply because it is mentioned earlier under currentProcess.
- If the client explicitly says the system should track, manage, record, display, automate, or support a specific business activity, include that activity under requirements.
- A workflow described only as something the client currently does is NOT automatically a system requirement. Keep it under currentProcess unless the client clearly indicates that the system should support or manage it.
- Do not infer technical features from a business problem and label them as requirements.
- Do not convert possible solution ideas into confirmed requirements.
- Requirements may be business-level capabilities; they do not need to be technical specifications.

SECTION DISTINCTION:
- currentProcess = what the client does today.
- mainProblem = the difficulty or business pain caused by the current situation.
- desiredOutcome = what the client explicitly wants to achieve.
- requirements = capabilities or business activities the client explicitly expects the system to support.
- possibleSolutionDirection = a possible way MLUE could address the need; this is not a confirmed feature list.
- unconfirmedItems = important details that still require clarification before the solution is finalized.

LANGUAGE PRESERVATION:
- Understand requirements regardless of whether the conversation is in English, Swahili, or a mixture of both.
- Preserve the client's meaning when extracting requirements and desired outcomes.
- Do not drop or simplify an explicit requirement because it was expressed in Swahili.
- The summary may remain in the language used by the client unless the application specifies otherwise.

Rules:
- If information is not available, use an empty string or empty array.
- Keep each field concise.
- "requirements" must contain only requirements explicitly stated by the client.
- "possibleSolutionDirection" may contain an inferred direction, but clearly
  treat it as a possible direction rather than an agreed feature set.
- "unconfirmedItems" should contain important items that were mentioned as
  possibilities or that require confirmation.
- "nextStep" should describe the appropriate next action based on the
  conversation, usually further consultation with MLUE.
  - desiredOutcome must contain the business result the client explicitly wants to achieve. Do not invent outcomes or convert possible solution features into desired outcomes.
`;

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

        const body = await req.json();
        const { history = [] } = body;

        if (!Array.isArray(history) || history.length === 0) {
            return new Response(
                JSON.stringify({
                    error: "Conversation history is required"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const safeHistory = history
            .filter(
                message =>
                    message &&
                    ["user", "assistant"].includes(message.role) &&
                    typeof message.content === "string"
            )
            .slice(-40);

        if (safeHistory.length === 0) {
            return new Response(
                JSON.stringify({
                    error: "No valid conversation messages provided"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

                const messages = [
            {
                role: "system",
                content: SUMMARY_INSTRUCTIONS
            },
            ...safeHistory,
            {
                role: "user",
                content:
                    "Create the consultation summary from the conversation above. Return JSON only."
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
                temperature: 0.2
            })
        });

        const responseText = await response.text();

        let data = {};

        try {
            data = responseText
                ? JSON.parse(responseText)
                : {};
        } catch (parseError) {
            console.error(
                "DeepSeek returned invalid JSON:",
                responseText
            );

            return new Response(
                JSON.stringify({
                    error: "Invalid response from AI service"
                }),
                {
                    status: 502,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        if (!response.ok) {
            console.error(
                "DeepSeek summary error:",
                data
            );

            return new Response(
                JSON.stringify({
                    error: "Summary generation failed"
                }),
                {
                    status: 502,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }


    

        const rawSummary = data?.choices?.[0]?.message?.content;

        if (!rawSummary) {
            console.error("DeepSeek returned no summary:", data);

            return new Response(
                JSON.stringify({
                    error: "AI returned an empty summary"
                }),
                {
                    status: 502,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        let summary;

        try {
            summary = JSON.parse(rawSummary);
        } catch (parseError) {
            console.error("Summary JSON parsing failed:", rawSummary);

            return new Response(
                JSON.stringify({
                    error: "AI returned invalid summary format"
                }),
                {
                    status: 502,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

                const resendApiKey = process.env.RESEND_API_KEY;
        const consultationEmail =
            process.env.MLUE_CONSULTATION_EMAIL;

        if (!resendApiKey) {
            console.error("RESEND_API_KEY is not configured.");

            return new Response(
                JSON.stringify({
                    error: "Email service is not configured"
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        if (!consultationEmail) {
            console.error(
                "MLUE_CONSULTATION_EMAIL is not configured."
            );

            return new Response(
                JSON.stringify({
                    error: "Consultation email is not configured"
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const escapeHtml = (value) =>
            String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        const listToHtml = (items = []) => {
            if (!Array.isArray(items) || items.length === 0) {
                return "<p>None specified.</p>";
            }

            return `
                <ul>
                    ${items
                        .map(
                            item =>
                                `<li>${escapeHtml(item)}</li>`
                        )
                        .join("")}
                </ul>
            `;
        };

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>New MLUE AI Consultation</h2>

                <h3>Client Summary</h3>

                <p>
                    <strong>Business:</strong>
                    ${escapeHtml(summary.business || "Not specified")}
                </p>

                <p>
                    <strong>Project:</strong>
                    ${escapeHtml(summary.project || "Not specified")}
                </p>

                <p>
                    <strong>Current Process:</strong>
                    ${escapeHtml(summary.currentProcess || "Not specified")}
                </p>

                <p>
                    <strong>Main Problem:</strong>
                    ${escapeHtml(summary.mainProblem || "Not specified")}
                </p>

                <p><strong>Desired Outcome:</strong> ${escapeHtml(summary.desiredOutcome || "Not specified")}</p>

                <p>
                    <strong>Locations:</strong>
                    ${escapeHtml(summary.locations || "Not specified")}
                </p>

                <p>
                    <strong>Users / Branches:</strong>
                    ${escapeHtml(
                        summary.usersOrBranches || "Not specified"
                    )}
                </p>

                <h3>Requirements</h3>
                ${listToHtml(summary.requirements)}

                <h3>Constraints</h3>
                ${listToHtml(summary.constraints)}

                <h3>Possible Solution Direction</h3>
                <p>
                    ${escapeHtml(
                        summary.possibleSolutionDirection ||
                        "Not specified"
                    )}
                </p>

                <h3>Unconfirmed Items</h3>
                ${listToHtml(summary.unconfirmedItems)}

                <h3>Next Step</h3>
                <p>
                    ${escapeHtml(summary.nextStep || "Not specified")}
                </p>

                <hr>

                <p>
                    <strong>Source:</strong>
                    MLUE AI Assistant
                </p>
            </div>
        `;

        const emailResponse = await fetch(
            RESEND_API_URL,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: "onboarding@resend.dev",
                    to: [consultationEmail],
                    subject:
                        `New MLUE AI Consultation — ${
                            summary.business ||
                            "Potential Client"
                        }`,
                    html: emailHtml
                })
            }
        );

        const emailData = await emailResponse.json();

        if (!emailResponse.ok) {
            console.error(
                "Resend consultation email error:",
                emailData
            );

            return new Response(
                JSON.stringify({
                    error: "Consultation email could not be sent"
                }),
                {
                    status: 502,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

                return new Response(
            JSON.stringify({
                success: true,
                summary,
                emailSent: true,
                emailId: emailData.id
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            }
        );
    } catch (error) {
        console.error("Consultation function error:", error);

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