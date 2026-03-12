# Cognitive Process – Backend & Integration Architecture

## 1. Brainstorming (5 approaches)

| # | Approach | Description | Trade-off |
|---|----------|-------------|------------|
| **A** | **Centralized Server State** | Server (session/DB) holds currentStep, stepTurnCount, chatHistory. Every client action POSTs → server updates and returns state. UI is reactive. | No race; single source of truth. Cons: latency on every action, need session store. |
| **B** | **Optimistic UI + Server Reconciliation** | Client holds state; each action sends payload to `/api/chat`; server validates, runs Gemini, returns result; client updates from response; errors trigger rollback/toast. | Fast UX, stateless API. Cons: double-click can double-call Gemini. |
| **C** | **Queue-based (Background Job)** | Client pushes "intent" to queue; worker runs Gemini, writes to DB/cache; client polls or SSE. | Decouples latency. Cons: more infra, polling/SSE complexity; overkill for MVP. |
| **D** | **Hybrid + Idempotency Keys** | Like B, but each request has client-generated idempotency key; server deduplicates (cache/DB). Double-clicks same key → one Gemini call. | Prevents duplicate processing; stateless. Cons: need key store (e.g. Redis or in-memory TTL). |
| **E** | **Strict FSM on Server** | Server stores step + turnCount (e.g. in LessonPlan/session row). `/api/chat` = state transition: load state, enforce max turns, call Gemini, persist, return. | No invalid state; audit trail; RAG-ready. Cons: DB read/write per turn. |

---

## 2. Filtering (Top 3 for Next.js App Router)

1. **B – Optimistic UI + Server Reconciliation**  
   Fits stateless Route Handlers, simple, good DX.

2. **D – Idempotency keys**  
   Prevents spam/double submit; still stateless Route Handlers.

3. **E – FSM on Server**  
   Enforces “max 2 follow-ups” and persists chat for RAG; aligns with LessonPlan model.

---

## 3. Selection (Best)

**E (FSM on server)** + **D (Idempotency)** + **B (Client reconciliation)**:

- **Draft/session:** When user starts, no DB row yet; chat is stateless until **Generate**. `/api/chat` receives `lessonName`, `currentStep`, `stepTurnCount`, `chatHistory`; server **enforces** in code: if `stepTurnCount >= 2` → force `isStepComplete = true`, return transition message, no extra Gemini call.
- **AI Gatekeeper:** One Gemini call per turn; prompt asks for **strict JSON** only. Response parsed with **regex** (extract first `{...}` or `[...]`) then **Zod**; on failure → safe default (e.g. `isStepComplete: false`, message “Xin lỗi, vui lòng thử lại.”, `suggestedOptions: []`).
- **Client:** Hook keeps `currentStep`, `stepTurnCount`, `chatHistory`; on send → POST `/api/chat`; from response: append to history, if `isStepComplete` then increment step and reset turn count; **debounce** + disable send while `isLoading` to avoid spam.
- **Idempotency:** Optional `idempotencyKey` in body; in-memory Map with 60s TTL; return cached response if key exists.
- **Generate:** After step 5 complete; POST `/api/generate` with full `lessonData` + `globalChatHistory`; create LessonPlan in DB, run Gemini for final markdown, save, return `finalMarkdown` and `lessonPlanId`.
- **Evaluate:** POST `/api/evaluate` with `lessonPlanId` and `rating`; update row; set `isGoodCase = (rating >= 4)` for RAG.

---

## 4. Devil's Advocate (Vulnerability check)

| Risk | Mitigation |
|------|------------|
| **Gemini returns non-JSON** (markdown, prose) | Regex to extract first `{...}` or `[...]`; Zod parse; fallback to safe default response. |
| **User spams Send** | Debounce in hook (e.g. 800ms); disable button when `isLoading`; optional idempotency key to dedupe on server. |
| **Prisma connection drops** | Singleton client; try/catch in routes; return 503 + retry hint; hook shows toast and allows retry. |
| **NextAuth session null** | `getServerSession()` in `/api/generate` and `/api/evaluate`; return 401 if null. `/api/chat` can stay unauthenticated for MVP (attach userId only at generate). |
| **Oversized payload** | Zod schema: limit `lessonName` length (e.g. 200), `chatHistory` max 50 messages; reject 400 if exceeded. |

---

## 5. Improvement (Concrete measures)

- **Zod:** All request bodies and Gemini response shape validated with Zod.
- **JSON sanitization:** Strip markdown code fences from model output; regex `/\{[\s\S]*\}|\[[\s\S]*\]/` then parse; then Zod.
- **Debounce + loading:** In `useCopilot`, `isLoading` disables submit; optional 400–800ms debounce on `handleSendMessage`.
- **Idempotency:** In-memory `Map<idempotencyKey, { response, timestamp }>` in chat route; 60s TTL; return cached if key exists.
- **Prisma:** Single `PrismaClient` instance in `lib/prisma`; catch errors in routes → 503.
- **Auth:** Generate and Evaluate require session; Chat can be anonymous until generate (userId set when creating LessonPlan).
