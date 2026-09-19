import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const MLUE_EMAIL = "mluetechnologytz@gmail.com";

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
            name,
            contact,
            requirement
        } = body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof contact !== "string" ||
            !contact.trim() ||
            typeof requirement !== "string" ||
            !requirement.trim()
        ) {
            return new Response(
                JSON.stringify({
                    error: "Complete lead information is required"
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                }
            );
        }

        if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not configured.");

            return new Response(
                JSON.stringify({
                    error: "Email service is not configured"
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                }
            );
        }

        const { data, error } = await resend.emails.send({
            from: "MLUE TECHNOLOGY <onboarding@resend.dev>",
            to: [MLUE_EMAIL],
            subject: `New Chatbot Lead - ${name.trim()}`,
            html: `
                <h2>New Lead from MLUE TECHNOLOGY Chatbot</h2>

                <p><strong>Name:</strong> ${name.trim()}</p>

                <p><strong>Contact:</strong> ${contact.trim()}</p>

                <p><strong>Requirement:</strong></p>
                <p>${requirement.trim()}</p>

                <hr>

                <p>
                    This lead was submitted through the MLUE Technology
                    website chatbot.
                </p>
            `
        });

        if (error) {
            console.error("Resend error:", error);

            return new Response(
                JSON.stringify({
                    error: "Failed to send lead email"
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
                success: true,
                message: "Lead submitted successfully",
                emailId: data?.id || null
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            }
        );

    } catch (error) {
        console.error("Lead function error:", error);

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