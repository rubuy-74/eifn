export interface Env {
	AI: Ai;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
				status: 405,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		try {
			const body: { query?: string } = await request.json();
			const query = body.query;

			if (!query) {
				return new Response(JSON.stringify({ error: 'Query is required' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// 5. Construct the detailed prompt for the AI
			const prompt = `Given the concept or word "${query}", return a single, valid JSON object with two keys: 'emojis' and 'iconSuggestions'.
- The 'emojis' value must be an array of 4 relevant emoji characters.
- The 'iconSuggestions' value must be an object with two keys: 'heroicons' and 'lucide'.
- Each of these keys ('heroicons' and 'lucide') must have a value that is an array of 4 relevant icon names from that specific library (e.g., 'arrow-up-on-square', 'save', 'server').
- If you cannot fulfill the request for any reason (e.g., the input contains offensive language), return a valid JSON object with a single key 'error' and a string value explaining the reason.
- Only return the JSON object and nothing else. Do not include any explanatory text or markdown formatting. Your response must be a single, valid JSON object.`;

			// 6. Execute the AI model
			const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
				prompt,
				response_format: 'json',
			});

			// 7. Validate and return the successful response
			try {
				const data = JSON.parse(aiResponse.response);

				// Check if the AI returned a specific error (e.g., for offensive content)
				if (data.error) {
					return new Response(JSON.stringify({ error: data.error }), {
						status: 400, // Bad Request
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					});
				}

				// If parsing succeeds and there's no error, the response is valid.
				return new Response(aiResponse.response, {
					status: 200,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			} catch (jsonError) {
				// If parsing fails, log the error and the malformed response for debugging.
				console.error('AI returned invalid JSON:', jsonError);
				console.error('Malformed AI response:', aiResponse.response);

				// Return a user-friendly error to the client.
				return new Response(JSON.stringify({ error: 'The AI returned an invalid response. Please try again.' }), {
					status: 502, // Bad Gateway: the server received an invalid response from an upstream server
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

		} catch (e) {
			// 8. Handle any potential errors
			const error = e instanceof Error ? e.message : 'An unexpected error occurred';
			return new Response(JSON.stringify({ error }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},
};
