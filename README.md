### Connections Clanker

A NYTimes Connections clone, in chatbot format. Basically, an excuse to take [ChatKit](https://developers.openai.com/api/docs/guides/chatkit/) and [Agent Builder](https://developers.openai.com/api/docs/guides/agent-builder/) for a spin and see how they work. Honestly, I don't really recommend, but it was fun anyway!

- Agent Builder is _very_ tedious and limting. It's only really good for the most basic of tasks.
  - No ability to reuse nodes
  - Cycles prohibited
  - Docs are very underwhelming and sparse
  - Common Expression Language (CEL) is incredibly limiting
  - Recommended Alternative: [n8n](https://n8n.io/)

- ChatKit is fine I guess. You can get up and running quickly with a chat interface, but...
  - Limited customization capabilities
  - High degree of vendor lock-in
  - Very unstable on mobile (dropped streaming connections that don't reconnect)
  - iFrames are yucky and lame
  - Recommended Alternative: [Vercel Chatbot template](https://chatbot.ai-sdk.dev/)

---

![Agent Builder Workflow](./public/agent-builder-workflow.png)
