
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

const affirmations = [
    "Every mistake is a learning opportunity. Embrace the process.",
    "The secret to getting ahead is getting started.",
    "Your only limit is your mind. Believe in yourself.",
    "Today is a new day to learn something amazing.",
    "Focus on progress, not perfection.",
    "The expert in anything was once a beginner.",
    "Learning is a treasure that will follow its owner everywhere.",
    "You are capable of more than you know."
];

export function DailyAffirmation() {
    const [affirmation, setAffirmation] = useState('');

    useEffect(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        setAffirmation(affirmations[dayOfYear % affirmations.length]);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.01 }}
            className="w-full"
        >
            <Card className="overflow-hidden border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/20 to-transparent dark:from-amber-950/10 dark:to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Affirmation</CardTitle>
                    <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Lightbulb className="h-4.5 w-4.5 text-amber-500 fill-amber-500/10" />
                    </motion.div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-200">"{affirmation}"</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
