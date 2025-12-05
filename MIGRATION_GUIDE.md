# Database Migration Guide: Adding 'title' to User Table

The error `The column User.title does not exist` happens because the database schema hasn't been updated to match the new code. Follow these steps to fix it.

## Option 1: Run Migration Locally (Recommended)

If you have the project open in your terminal and `DATABASE_URL` is set in your `.env` file:

1.  **Open your terminal** in the project folder (`/Users/mac/CrowdFunding`).
2.  **Run the migration command:**
    ```bash
    npx prisma migrate dev --name add_user_title
    ```
3.  **Wait for success:** You should see "Your database is now in sync with your schema."
4.  **Regenerate Client:**
    ```bash
    npx prisma generate
    ```

## Option 2: Run on Vercel (Production)

If you are seeing this error on the live website (Vercel):

1.  Go to your **Vercel Dashboard**.
2.  Navigate to **Settings** -> **General**.
3.  Scroll to **Build & Development Settings**.
4.  Change the **Build Command** to:
    ```bash
    npx prisma migrate deploy && next build
    ```
5.  **Redeploy** your application.
    *   Go to **Deployments**.
    *   Click the three dots on the latest deployment -> **Redeploy**.

This will force Vercel to update the database schema before building the app.

---

## IMPORTANT: After Migration
Once the migration is successful, we need to **uncomment** the code I temporarily disabled.

In `src/app/api/auth/signup/route.ts`:

```typescript
// Uncomment this line:
title: title || null, 

// And this line in the select block:
title: true,
```
