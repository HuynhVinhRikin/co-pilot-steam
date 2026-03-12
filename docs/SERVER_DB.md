# Server Express + Lưu DB

## Lưu giáo án vào PostgreSQL

Khi có `DATABASE_URL` trong `.env`, endpoint **POST /api/generate-plan** sẽ:

1. Sinh markdown (Gemini hoặc mock) như trước.
2. Tìm hoặc tạo **User** theo `userEmail` (body), nếu không gửi thì dùng user guest.
3. Tạo **LessonPlan** với `lessonName`, `step1`–`step5`, `finalMarkdown`, `subject`, `grade` (nếu gửi).
4. Trả về `{ markdown, lessonPlanId }` (có `lessonPlanId` khi lưu DB thành công).

## Cấu hình

1. **.env** (ở root project):

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   GEMINI_API_KEY=...   # tùy chọn (gợi ý + sinh giáo án)
   GROQ_API_KEY=...     # tùy chọn (dùng Grok khi không có Gemini)
   PORT=3001
   ```

2. **Prisma:**

   ```bash
   npm install @prisma/client
   npm install -D prisma
   npx prisma generate
   npx prisma migrate dev   # tạo bảng (cần PostgreSQL đang chạy)
   ```

3. Chạy server: `npm run server`.

## Body POST /api/generate-plan (đầy đủ)

- `lessonName` (bắt buộc)
- `step1` … `step5` (nội dung từng bước)
- `subject`, `grade` (tùy chọn, lưu vào LessonPlan)
- `userEmail` (tùy chọn; nếu không gửi thì dùng user guest)

Nếu không có `DATABASE_URL` hoặc Prisma chưa cài/ chưa generate, server vẫn chạy và vẫn trả về `{ markdown }` (không có `lessonPlanId`).
