Sally: Your Well-being Buddy
Sally is a clean, minimal, and calming chatbot designed to be a gentle, supportive, and accessible presence in your life. The user experience is prioritized, offering a distraction-free space for conversation and reflection.

<<<<<<< HEAD
## Overview

Sally is a sentiment-aware AI companion designed to provide emotional support and well-being assistance through empathetic conversation. Built with a focus on accessibility, calm aesthetics, and thoughtful interaction design, Sally adapts its conversational tone based on the relationship context you choose (Brother, Sister, Husband, Wife, Girlfriend, or Boyfriend) while maintaining healthy boundaries and a supportive, non-clinical approach.

The application features a clean, minimal interface with React + Vite frontend and a modular FastAPI backend that integrates with OpenAI's Chat Completions API. The experience prioritizes gentle, supportive interactions with careful attention to design tokens, motion sensitivity, and accessibility standards.

## Key Features

### Relationship-Aware Conversations
Sally adapts its conversational style based on your selected relationship context:
- **Brother**: Steady, protective support with a "I've got your back" tone
- **Sister**: Gentle, nurturing encouragement with "I'm by your side" warmth
- **Husband/Wife**: Partner-like warmth and teamwork approach
- **Girlfriend/Boyfriend**: Affectionate, caring reassurance

All interactions maintain healthy boundaries and avoid dependency-creating language, focusing on reflective listening over prescriptive advice.

### Session Management
- **Multiple Sessions**: Create and manage separate conversation threads
- **Session History**: All conversations are preserved in browser localStorage
- **Session Naming**: Personalize session titles for easy identification
- **Session Switching**: Seamlessly switch between different conversation contexts
- **Auto-persistence**: Conversations are automatically saved locally

### Personalization
- **Name Preferences**: Choose how Sally addresses you (first name, full name, or custom nickname)
- **Visual Auras**: Three aura variants (calm, default, vivid) for personalized ambiance
- **Theme Support**: Light and dark mode with carefully balanced design tokens
- **Profile Management**: Set and update your preferences at any time

### Real-time Streaming
- **Streaming Mode**: Optional token-by-token response streaming for natural conversation flow
- **Non-streaming Mode**: Standard request-response for simpler deployments
- **Typing Indicators**: Visual feedback while Sally is thinking
- **Motion Sensitivity**: Respects `prefers-reduced-motion` settings

### Technical Highlights
- **Modular Architecture**: Clean separation between frontend, backend, and API services
- **Error Handling**: Comprehensive error messages with actionable guidance
- **Connection Testing**: Built-in health check for backend connectivity
- **Accessibility**: WCAG AA contrast compliance, full keyboard support, ARIA live regions
- **Performance**: Lightweight bundle, optimized assets, lazy loading ready
=======
What Sally Offers
>>>>>>> f23a5fea4d5516b2917f9613f562f3a19be5c485

A Gentle Experience: The interface is built with React and Vite, using plain CSS and design tokens to create a soothing visual aesthetic. It fully supports both light and dark themes and includes accessibility features like honoring the user's prefers-reduced-motion settings for the subtle aura and typing indicators.

Personal Connection: The API allows users to define their relationship with Sally (e.g., 'Brother', 'Wife'), influencing the personality and tone guided by the SYSTEM_GUIDELINES.md file.

Intelligent Backbone: The intelligence comes from OpenAI Chat Completions (configurable, defaults to gpt-4o-mini), securely accessed through a fast, modular FastAPI backend.

Smooth Communication: You can choose between instant replies (POST /chat) or a more conversational, real-time feel with Streaming (SSE) via POST /chat/stream.
