# Real-Time Collaborative Whiteboard App

A collaborative whiteboard application built with **Next.js 15+**, **Clerk**, **Prisma**, **Tailwind CSS**, and **PostgreSQL (Neon)**. Users can create, share, and edit whiteboards in real-time.

## Features

- User Authentication (via Clerk)
- Create, edit, delete whiteboards
- Share public whiteboard via link
- Status filter (Draft / Published)
- Real-time collaborative updates (using `useDebounce`)
- Responsive UI with Tailwind

## Technologies Used

- Next.js 15 (App Router)
- TypeScript
- Clerk Auth
- Prisma ORM
- PostgreSQL (Neon)
- Tailwind CSS


## Getting Started
Clone the repo

## Install dependencies
npm install

## Set up environment variables
DATABASE_URL=your_postgres_db_url
CLERK_SECRET_KEY=your_clerk_secret
CLERK_PUBLISHABLE_KEY=your_clerk_publishable
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable

then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Manrope](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
