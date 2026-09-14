# CWIT - ClearWave Digital Agency Website

A modern, responsive website for ClearWave, a digital agency based in Dubai. Built with Next.js 16, featuring smooth animations, beautiful UI components, and optimized performance.

## 🚀 Features

- **Modern Tech Stack**: Next.js 16 with React 19 and TypeScript
- **Beautiful Animations**: GSAP-powered smooth animations and transitions
- **Responsive Design**: Tailwind CSS 4 for modern, mobile-first design
- **Multiple Pages**: Home, About Us, Contact Us, Digital Experience Studio, Our Work, and Work Details
- **Component-Based Architecture**: Reusable UI components and sections
- **Performance Optimized**: Next.js App Router for optimal performance

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cwit-website
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

## 🏃 Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

The page will automatically reload when you make changes to the code.

## 📁 Project Structure

```
cwit/
├── app/
│   ├── about-us/          # About Us page
│   ├── animations/        # Animation utilities
│   ├── assets/            # Images and videos
│   ├── components/
│   │   ├── sections/      # Page sections (Hero, Showcase, etc.)
│   │   └── ui/            # Reusable UI components
│   ├── contact-us/        # Contact Us page
│   ├── digital-experience-studio/  # Digital Experience Studio page
│   ├── hooks/             # Custom React hooks
│   ├── our-work/          # Our Work page
│   ├── work-details/      # Work Details page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── public/                # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🎨 Key Components

### Sections
- **Hero**: Main hero section with animations
- **Showcase**: Portfolio showcase section
- **Studios**: Studio services section
- **GenAI**: Generative AI section
- **OurWork**: Work portfolio section
- **OurClients**: Client testimonials
- **Blogs**: Blog posts section
- **Accordion**: FAQ/Accordion component
- **Footer**: Site footer

### UI Components
- **Header**: Navigation header
- **ContactForm**: Contact form component
- **Carousel**: Image/content carousel
- **TextSection**: Text content sections
- **BackgroundImageSection**: Background image sections
- **CallToActionButton**: CTA button component

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.0.1
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.x
- **Animations**: [GSAP](https://greensock.com/gsap/) 3.13.0
- **Language**: TypeScript

## 📝 Development

### Adding New Pages

Create a new directory in `app/` with a `page.tsx` file:

```typescript
export default function NewPage() {
  return <div>New Page Content</div>;
}
```

### Adding New Components

Add reusable components in `app/components/ui/` or section-specific components in `app/components/sections/`.

### Styling

This project uses Tailwind CSS. Modify `app/globals.css` for global styles or use Tailwind utility classes directly in components.

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and configure the build settings

For more deployment options, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 📄 License

This project is private and proprietary.

## 👥 Contact

For questions or support, please contact the development team.

---

Built with ❤️ using Next.js
