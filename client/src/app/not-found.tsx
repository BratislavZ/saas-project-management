"use client";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Home, RefreshCw, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-main-50/30 to-main-100/50 dark:from-background dark:via-background dark:to-card/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <h1 className="text-[12rem] md:text-[16rem] font-bold text-transparent bg-gradient-to-r from-primary via-main-400 to-primary bg-clip-text leading-none select-none">
              404
            </h1>
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute -top-8 -right-8 md:-top-12 md:-right-12"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-primary to-main-400 rounded-full opacity-20 blur-xl"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="p-8 md:p-12 backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                The page you're looking for seems to have wandered off into the
                digital void. Don't worry, it happens to the best of us!
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button asChild size="lg" className="group">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Go Home
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="group">
                <Link href="/search" className="flex items-center gap-2">
                  <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Search
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => window.location.reload()}
                className="group"
              >
                <RefreshCw className="w-4 h-4 mr-2 transition-transform group-hover:rotate-180" />
                Try Again
              </Button>
            </motion.div>

            {/* Go Back Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 pt-6 border-t border-border/50"
            >
              <Button
                variant="link"
                onClick={() => window.history.back()}
                className="text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Go back to previous page
              </Button>
            </motion.div>
          </Card>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
