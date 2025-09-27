Sally: Your Well-being Buddy
Sally is a clean, minimal, and calming chatbot designed to be a gentle, supportive, and accessible presence in your life. The user experience is prioritized, offering a distraction-free space for conversation and reflection.

What Sally Offers

A Gentle Experience: The interface is built with React and Vite, using plain CSS and design tokens to create a soothing visual aesthetic. It fully supports both light and dark themes and includes accessibility features like honoring the user's prefers-reduced-motion settings for the subtle aura and typing indicators.

Personal Connection: The API allows users to define their relationship with Sally (e.g., 'Brother', 'Wife'), influencing the personality and tone guided by the SYSTEM_GUIDELINES.md file.

Intelligent Backbone: The intelligence comes from OpenAI Chat Completions (configurable, defaults to gpt-4o-mini), securely accessed through a fast, modular FastAPI backend.

Smooth Communication: You can choose between instant replies (POST /chat) or a more conversational, real-time feel with Streaming (SSE) via POST /chat/stream.
