# Backend & Hook Integration (Next.js 14)

## Required dependencies

In your Next.js 14 project:

```bash
npm i @google/generative-ai @prisma/client next-auth zod
npm i -D prisma
npx prisma init
```

## Environment

- `DATABASE_URL` – PostgreSQL connection string (for Prisma).
- `GEMINI_API_KEY` – Google Gemini API key (optional; chat/generate fallbacks if missing).
- NextAuth: configure `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and your providers (e.g. Google).

## Files to add/copy

- `prisma/schema.prisma` – Replace or merge with your schema, then run `npx prisma migrate dev`.
- `lib/prisma.ts` – Prisma singleton.
- `lib/auth.ts` – Session helper; wire to your NextAuth (e.g. `export async function getSession() { return await auth(); }`).
- `lib/chat-schemas.ts` – Zod schemas and JSON extraction for chat.
- `lib/gemini-chat.ts` – AI Gatekeeper (Gemini) for `/api/chat`.
- `app/api/chat/route.ts` – POST `/api/chat`.
- `app/api/generate/route.ts` – POST `/api/generate` (requires auth).
- `app/api/evaluate/route.ts` – POST `/api/evaluate` (requires auth).
- `hooks/useCopilot.ts` – React hook for the existing UI.

## NextAuth v5

Ensure you have `app/api/auth/[...nextauth]/route.ts` (or equivalent) and export `authOptions` (or use the v5 `auth()` API). Update `lib/auth.ts` so `getSession()` uses your auth (e.g. `return await auth();`).

## Using the hook in your UI

Replace local state in your Co-pilot page with `useCopilot`:

```tsx
import { useCopilot } from "@/hooks/useCopilot";

const CoPilotPage = () => {
  const {
    currentStep,
    stepTurnCount,
    lessonData,
    chatHistory,
    suggestions,
    isLoading,
    isGenerating,
    finalMarkdown,
    lessonPlanId,
    setLessonData,
    handleStart,
    handleSendMessage,
    handleGenerateLesson,
    handleEvaluate,
    handleReset,
  } = useCopilot({
    apiBase: "", // or your API base URL
    onError: (msg) => toast.error(msg),
  });

  // Use these in your existing StepForm, ChatInterface, FinalResult, etc.
  // e.g. <StepForm onStart={handleStart} />
  // e.g. <ChatInterface ... onAnswer={handleSendMessage} suggestions={suggestions} />
  // e.g. <FinalResult markdown={finalMarkdown} onGenerate={handleGenerateLesson} ... />
};
```

## API contract summary

| Route | Auth | Body | Response |
|-------|------|------|----------|
| POST /api/chat | No | `lessonName`, `currentStep`, `stepTurnCount`, `chatHistory`, optional `idempotencyKey` | `isStepComplete`, `aiResponse`, `suggestedOptions[3]` |
| POST /api/generate | Yes | `lessonData`, `globalChatHistory` | `finalMarkdown`, `lessonPlanId` |
| POST /api/evaluate | Yes | `lessonPlanId`, `rating` (1–5) | `success`, `isGoodCase` |
