'use client';

import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookOpen, FileInput, TestTube, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { motion } from 'motion/react';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const featureExtractionImage = PlaceHolderImages.find((img) => img.id === 'feature-extraction');
  const featureGuideImage = PlaceHolderImages.find((img) => img.id === 'feature-guide');
  const featureAssessmentImage = PlaceHolderImages.find((img) => img.id === 'feature-assessment');

  const features = [
    {
      icon: <FileInput className="size-8 text-indigo-600 dark:text-indigo-400" />,
      title: 'Content Extraction',
      description: 'Effortlessly extract text from documents, images, and websites to build your study library.',
      image: featureExtractionImage
    },
    {
      icon: <BookOpen className="size-8 text-purple-600 dark:text-purple-400" />,
      title: 'AI Study Guides',
      description: 'Automatically generate comprehensive study guides from your materials, focusing on key concepts.',
      image: featureGuideImage
    },
    {
      icon: <TestTube className="size-8 text-pink-600 dark:text-pink-400" />,
      title: 'AI Assessments',
      description: 'Create customized tests with various question types to challenge your knowledge and retention.',
      image: featureAssessmentImage
    },
    {
      icon: <TrendingUp className="size-8 text-emerald-600 dark:text-emerald-400" />,
      title: 'Performance Tracking',
      description: 'Get detailed feedback on your test results and track your learning progress over time.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
       {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover -z-20"
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-background/90 dark:bg-background/95 -z-10" />

      <SiteHeader />
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col justify-center items-center text-center space-y-6 max-w-4xl mx-auto"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                >
                  ✨ AI-Powered Active Recall & Study Partner
                </motion.div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-100 dark:to-white">
                  Unlock Your Learning Potential with Cognify
                </h1>
                <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl/relaxed lg:text-2xl/relaxed leading-relaxed font-normal">
                  Your personal study partner. Transform documents, web links, and handwritten notes into comprehensive study guides and smart quizzes instantly.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row pt-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg" className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20">
                    <NextLink href="/signup">Get Started for Free</NextLink>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-full font-semibold">
                    <NextLink href="/login">Sign In</NextLink>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
        
        <section id="features" className="w-full py-16 md:py-24 bg-white dark:bg-slate-900/40 border-y border-slate-200/40 dark:border-slate-800/40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-3">
                <div className="inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-slate-600 dark:text-slate-400">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Learn Smarter, Not Harder</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground md:text-lg">
                  Cognify provides a suite of powerful tools designed to optimize retention, track focus, and accelerate your mastery.
                </p>
              </div>
            </div>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants} className="h-full">
                  <Card className="h-full bg-card hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden border border-slate-200/60 dark:border-slate-800/60">
                    <CardHeader className="flex flex-col items-center text-center pb-3">
                      <div className="mb-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg font-bold tracking-tight">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-sm text-muted-foreground leading-relaxed pt-1">
                      {feature.description}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-100">
                Ready to Revolutionize Your Studies?
              </h2>
              <p className="mx-auto max-w-xl text-muted-foreground md:text-lg leading-relaxed">
                Join thousands of active learners using Cognify to generate personalized assessments and study materials.
              </p>
              <div className="mx-auto w-full max-w-sm pt-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button asChild size="lg" className="w-full h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20">
                    <NextLink href="/signup">Join Cognify Now</NextLink>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center w-full h-24 border-t border-slate-200/30 dark:border-slate-800/30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">&copy; 2024 Cognify. All rights reserved.</p>
      </footer>
    </div>
  );
}
