"use client";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Bug, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-destructive/5 to-destructive/10 dark:from-background dark:via-background dark:to-destructive/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Animated Error Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 2, -2, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="mx-auto w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-destructive/20 to-destructive/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-destructive/20"
            >
              <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 text-destructive" />
            </motion.div>

            {/* Pulsing rings */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full border-2 border-destructive/30"
            />
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.05, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute inset-0 rounded-full border border-destructive/20"
            />
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                We encountered an unexpected error. Don't worry, our team has
                been notified and we're working on a fix.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === "development" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mb-6"
                >
                  <details className="text-left bg-muted/50 rounded-lg p-4 border border-border/50">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      Error Details (Development)
                    </summary>
                    <div className="mt-3 text-xs font-mono text-destructive bg-destructive/5 p-3 rounded border border-destructive/20 overflow-auto">
                      <div className="font-semibold mb-1">Error:</div>
                      <div className="mb-2">{error.message}</div>
                      {error.digest && (
                        <>
                          <div className="font-semibold mb-1">Digest:</div>
                          <div>{error.digest}</div>
                        </>
                      )}
                    </div>
                  </details>
                </motion.div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={reset}
                size="lg"
                className="group bg-destructive hover:bg-destructive/90 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2 transition-transform group-hover:rotate-180" />
                Try Again
              </Button>

              <Button asChild variant="outline" size="lg" className="group">
                <a href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Go Home
                </a>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => window.history.back()}
                className="group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Go Back
              </Button>
            </motion.div>

            {/* Additional Help */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 pt-6 border-t border-border/50"
            >
              <p className="text-sm text-muted-foreground mb-4">
                If this problem persists, please contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-xs text-muted-foreground">
                <span>Error ID: {error.digest || "Unknown"}</span>
                <span className="hidden sm:inline">•</span>
                <span>Time: {new Date().toLocaleString()}</span>
              </div>
            </motion.div>
          </Card>
        </motion.div>

        {/* Floating Error Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-destructive/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.1, 0.6, 0.1],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Background Glow Effect */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-destructive/10 rounded-full blur-3xl -z-10"
        />
      </div>
    </div>
  );
}
