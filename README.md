# Hivon Automations - Blogging Platform

A basic, feature-rich blogging platform built with Next.js, Supabase, and integrated with the Google Gen AI API for automated post summaries.

## 🚀 Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Integration**: Google Generative AI (`gemini-2.5-flash`)
- **Styling**: Vanilla CSS with custom design system variables for dynamic, rich aesthetics.
- **Deployment Strategy**: Netlify / Vercel compatible

## 🛠️ Project Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd hivon-blog
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Configuration**:
   - Create a new project on [Supabase](https://supabase.com).
   - Go to the SQL Editor and execute the contents of the `database-schema.sql` file provided in the repository root. This will set up the `Users`, `Posts`, and `Comments` tables, as well as the necessary Row Level Security (RLS) policies and Auth trigger.

4. **Environment Variables**:
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   GOOGLE_AI_API_KEY=your-google-api-key
   ```

5. **Run Locally**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## 🌍 Deployment Steps

1. **Push to GitHub**: Commit all changes and push your repository to GitHub.
2. **Deploy Platform**:
   - Go to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
   - Import your GitHub repository.
3. **Configure Environment Variables**:
   - During the import process, add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GOOGLE_AI_API_KEY` to the environment variables section of your deployment provider.
4. **Deploy**: Click Deploy and wait for the build to pass.

---

## 📝 Submission Explanation

### 1. AI Tools
**Tool Used**: Antigravity (Advanced Agentic AI Coding Assistant).
**Why Selected**: It provides powerful context-awareness, allows for entirely autonomous end-to-end multi-file generation, ensures strict adherence to required frameworks without hallucinating unrequested libraries (like TailwindCSS in this case where Vanilla CSS was strongly requested), and runs commands smoothly to validate dependencies.
**How it Helped**: Reduced boilerplate setup time drastically by automatically scaffolding the Next.js standard pages, managing repetitive database schemas and interactions securely (Next.js server-side API routes), generating a robust rich-aesthetic stylesheet, and configuring Google Gemini integration seamlessly.

### 2. Feature Logic
- **Authentication Flow**: Enabled via Supabase Auth. The client triggers email/password signups or sign-ins. Upon user creation, a PostgreSQL trigger automatically adds a mirror record to our custom `Users` role table defaults to "Viewer".
- **Role-Based Access**: The app distinguishes between Author, Viewer, and Admin. This is enforced at the database level by Supabase RLS policies (e.g., preventing a Viewer from `INSERT`ing into the `Posts` table) and on the API Route level in NextJS checking the `role` column inside the `Users` table before making the AI generation call.
- **Post Creation Logic**: The user interacts with the Next.js client form which sends a secure JSON payload to the Next.js API `/api/posts`.
- **AI Summary Generation Flow**: To protect the `GOOGLE_AI_API_KEY`, the generation strictly occurs over the server-side API Route. During post creation, it takes the post body, requests Gemini for a strict 200-word summary, waits for the result, and inserts everything directly into the `Posts` Supabase table. 

### 3. Cost Optimization
**Token Reduction Strategies & Generating Summary Only Once**: 
The platform securely hooks the Gemini API request directly *inside* the single post-creation pipeline (`/api/posts/route.js`).
This means the API fires precisely **once** upon post initialization. 
**Storing Summaries**:
Rather than extracting AI summaries client-side on-demand continuously (which would incur compounding API request costs and rate-limits), the API pushes the generated text directly to the `summary` column of the `Posts` table. When users visit the blog, they query the Supabase cache for standard text rather than pinging Google's LLM, virtually eliminating repeated API charges.

### 4. Development Understanding
**A Bug Encountered & Resolution**: 
During Next.js setup with `npm`, there was an issue initializing due to the package folder naming convention not allowing capital letters (I initially named it `Hivon_Blog`). This failed the creation script. I solved it by adopting a standard lowercase kebab-case layout (`hivon-blog`), running a clean `npm install`, and enforcing robust dependency resolution manually to overcome Windows-specific Node lock conflicts.
**Key Architectural Decisions**:
1. **Server vs. Client Data Hydration**: Opted for Supabase JS initialized in client components linked directly to Server routes handling sensitive tasks.
2. **Vanilla CSS Standard**: Avoided bloated utility-class libraries and instead architected a cohesive `--variable`-driven global stylesheet enabling fluid dark mode, rich components, card aesthetics, and subtle modern animations for maximum user engagement.
3. **Database Trigger Pattern**: Using a PostgreSQL trigger (`on_auth_user_created`) to synchronize auth sessions perfectly with the `Users` public data table to manage hierarchical RBAC (Role Based Access Control) natively.
