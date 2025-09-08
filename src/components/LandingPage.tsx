import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Shield,
  Zap,
  CreditCard,
  BarChart3,
  Users,
  Lock,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Smartphone,
  Globe,
  Award,
  Clock,
  Target,
  Play,
  ChevronRight,
  Banknote,
  ShieldCheck,
  Rocket,
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export default function LandingPage({
  onNavigate,
}: LandingPageProps) {
  const features = [
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Your funds are protected with military-grade encryption and multi-factor authentication.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Experience instant transfers and real-time balance updates with our modern infrastructure.",
    },
    {
      icon: CreditCard,
      title: "Smart Banking",
      description: "AI-powered insights help you make better financial decisions and track your spending.",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Bank anywhere in the world with our international network and multi-currency support.",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set financial goals, track progress, and get personalized tips to achieve your dreams.",
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Recognized by leading financial institutions for innovation and customer satisfaction.",
    },
  ];

  const stats = [
    { label: "Active Users", value: "5L+", icon: Users },
    {
      label: "Monthly Transactions",
      value: "20L+",
      icon: BarChart3,
    },
    { label: "Secured Assets", value: "₹1000Cr+", icon: Lock },
  ];

  const benefits = [
    "Zero Hidden Fees",
    "Instant Account Opening",
    "24/7 Customer Support",
    "Mobile & Web Access",
    "FDIC Insured",
    "Biometric Security",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/10">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-accent font-bold text-lg">
                W
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">
                WTF Bank
              </h1>
              <p className="text-xs text-muted-foreground">
                Where's The Funds?
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <Button
              variant="ghost"
              onClick={() => onNavigate("customer-login")}
              className="hover:bg-secondary transition-colors"
            >
              Customer Login
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("admin-login")}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Admin Portal
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
                Banking
                <span className="text-accent"> Reimagined</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Experience the future of digital banking with
                WTF Bank. Where transparency meets innovation,
                and your financial goals become reality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() =>
                    onNavigate("customer-register")
                  }
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl transition-all hover:shadow-lg hover:scale-105"
                >
                  Get Started Today
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate("customer-login")}
                  className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground px-8 py-3 rounded-xl transition-all hover:shadow-lg"
                >
                  Sign In
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-3xl"></div>
              <Card className="relative p-8 backdrop-blur-sm border-accent/20 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Banking Dashboard
                    </h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    Secure • Fast • Reliable
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Security
                      </div>
                      <div className="font-semibold text-green-600">
                        256-bit
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Uptime
                      </div>
                      <div className="font-semibold text-green-600">
                        99.9%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Support
                      </div>
                      <div className="font-semibold text-green-600">
                        24/7
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <stat.icon className="w-12 h-12 text-accent mx-auto mb-4" />
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">
                    {stat.label}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">
              Why Choose WTF Bank?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're not just another bank. We're your financial
              partner in the digital age.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-all hover:scale-105 border-accent/20">
                  <feature.icon className="w-12 h-12 text-accent mb-6" />
                  <h3 className="text-xl font-bold text-primary mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <h2 className="text-4xl font-bold text-primary-foreground mb-6">
              Ready to Transform Your Banking?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Join thousands of satisfied customers who've
              already made the switch.
            </p>
            <Button
              size="lg"
              onClick={() => onNavigate("customer-register")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-12 py-4 text-lg rounded-xl transition-all hover:shadow-lg hover:scale-105"
            >
              Open Your Account Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-secondary/50 border-t">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 WTF Bank. All rights reserved LOL
          </p>
        </div>
      </footer>
    </div>
  );
}