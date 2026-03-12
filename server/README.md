# Server – Cấu trúc sau tái cấu trúc

## Thư mục

```
server/
├── index.ts              # Bootstrap: Express, cors, json, mount api, errorHandler
├── config/
│   ├── env.ts            # Biến môi trường (port, geminiApiKey, databaseUrl)
│   └── constants.ts      # GUEST_EMAIL, STEP_NAMES, MOCK_SUGGESTIONS
├── api/
│   ├── index.ts          # Gộp routes: /api/suggestions, /api/generate-plan
│   ├── suggestions.routes.ts
│   └── generate-plan.routes.ts
├── middlewares/
│   └── errorHandler.ts   # Bắt lỗi toàn cục → response.error(503)
├── services/
│   ├── gemini.service.ts       # Gọi Gemini (suggestions, markdown)
│   ├── suggestions.service.ts  # Logic gợi ý (Gemini hoặc mock)
│   └── generate-plan.service.ts # Logic tạo markdown + lưu DB
├── repositories/
│   ├── user.repository.ts      # findOrCreateByEmail
│   └── lesson-plan.repository.ts # create
├── database/
│   └── index.ts          # getPrisma() – dynamic import lib/prisma
├── response/
│   └── index.ts          # success(res, data), error(res, code, message)
└── types/
    └── index.ts          # Request/Response body types, ApiSuccess, ApiError
```

## Luồng request

1. **Route** (`api/*.routes.ts`): Parse body → gọi **service** → `response.success(res, data)`.
2. **Service**: Business logic, gọi **Gemini** (gemini.service) hoặc **repository** (khi cần DB).
3. **Repository**: Thao tác Prisma (nhận `prisma` từ `getPrisma()` trong service).
4. **Response**: Format thống nhất `{ success: true, data }` hoặc `{ success: false, error: { code, message } }`.

## API response format

- Thành công: `{ success: true, data: T }`.
- Lỗi (errorHandler): `{ success: false, error: { code, message } }`, status 503.

UI đọc `data = res.json()` rồi dùng `data?.data ?? data` để tương thích cả format mới và cũ.
