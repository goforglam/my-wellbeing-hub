# My Wellbeing Hub

Build a new private personal web app called "Work & Wellbeing".

IMPORTANT PROJECT BOUNDARY:
- This is a NEW standalone project. Do not modify, reuse, remix, or depend on the existing Career Command Front, Career Compass Pro, or Job Match Master projects.
- Do not touch their GitHub repositories or databases.
- The app should be designed so it can later be connected to its own dedicated GitHub repository and dedicated Supabase project.
- Treat this as a personal, privacy-sensitive wellbeing application.

PRODUCT VISION:
Create a calm, premium personal operating system that helps one person track daily workload, work patterns, emotions, recovery, and wellbeing, with an optional fertility-supportive wellbeing layer. It must NOT make medical claims, diagnose conditions, or imply that thoughts, emotions, foods, or behaviors cause pregnancy. It should identify observed patterns and present them as correlations, not causation.

MVP SCREENS:
1. Today
- Very fast daily check-in designed to take 1–2 minutes.
- Mood 1–10
- Energy 1–10
- Stress 1–10
- Mental load 1–10
- Perceived workload 1–10
- Working hours
- Meeting hours
- Deep-work hours
- Sleep duration
- Sleep quality 1–10
- Movement/exercise indicator
- Emotions multi-select with examples: calm, focused, motivated, energised, happy, frustrated, anxious, overwhelmed, drained, proud, excited, low.
- Short free-text reflection.
- What gave me energy?
- What drained me?
- What do I need tomorrow?
- Daily intention.
2. Dashboard
- Today summary.
- 7-day and 30-day trends.
- Mood, energy, stress, workload, mental load.
- Workload vs mood.
- Workload vs stress.
- Sleep vs energy.
- Meeting load vs mental load.
- Work hours vs perceived workload.
3. Work
- Simple daily/weekly work log.
- Meetings, deep work, admin, urgent/unplanned work, tasks completed, tasks carried over.
4. Wellbeing
- Recovery
- Nourishment
- Movement
- Sleep
- Relaxation
- Connection / relationship wellbeing
- Feeling supported
- A gentle fertility-supportive wellbeing section focused on controllable wellbeing habits, never fertility promises or optimization pressure.
5. Emotions
- Emotional history and trends.
6. Weekly Review
- Weekly averages.
- High/low days.
- Reflection prompts.
- Observed patterns, carefully worded as correlations.
7. Insights
- Personal trends and pattern detection from the user's own data.
- Examples: "Your higher-workload days have also tended to have higher stress."
- Never present correlations as medical or causal conclusions.
8. Settings
- Profile
- Privacy
- Export/delete data placeholders
- Units/preferences.

UX:
- Mobile-first but excellent desktop experience.
- Extremely low friction.
- Warm, calm, elegant visual language rather than clinical or corporate.
- Clear cards, subtle charts, friendly microcopy.
- Avoid gamification, guilt, streaks, or judgment.
- Make the daily check-in the central action.
- Use accessible components and keyboard-friendly controls.
- Include empty states and realistic sample/demo data only when clearly marked as demo.

DATA MODEL:
Design a clean relational model suitable for Supabase:
- profiles
- daily_checkins
- work_logs
- emotions
- wellbeing_logs
- weekly_reflections
- user_preferences
All user-owned records must have user_id and timestamps/date fields.
Prepare the code for Supabase Auth and PostgreSQL integration, but do not create or connect to an unrelated existing database.

SECURITY:
- Plan for Supabase Auth.
- Every user-owned table must be protected by Row Level Security.
- Never expose service-role keys.
- Use publishable/anon client configuration only in the frontend.
- Keep personal wellbeing data private by default.

TECH:
- Use Lovable's standard modern TypeScript stack.
- Tailwind + shadcn/ui.
- Use a charting library appropriate for responsive trend charts.
- Keep components modular and maintainable.
- Do not over-engineer the MVP.

FIRST DELIVERABLE:
Build the complete frontend experience with realistic demo data and local state where backend connection is not yet available. Establish the database schema/interfaces cleanly so Supabase can be connected next. Make the Today dashboard feel polished and immediately usable.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b89e0070-eeda-4c40-94d0-cf1ddc6e04af).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
