
'use client';

import React from 'react';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BookCopy, CheckCircle, TrendingUp, BarChart as BarChartIcon } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { motion } from 'motion/react';

const chartConfig = {
    score: {
        label: 'Score',
        color: 'hsl(var(--primary))',
    },
};

export function ProgressOverview() {
    const { user } = useUser();
    const firestore = useFirestore();

    const sourcesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'users', user.uid, 'studyMaterials'));
    }, [firestore, user]);

    const testResultsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'users', user.uid, 'testResults'), orderBy('completionDate', 'desc'));
    }, [firestore, user]);

    const { data: sources, isLoading: isLoadingSources } = useCollection(sourcesQuery);
    const { data: testResults, isLoading: isLoadingResults } = useCollection(testResultsQuery);

    const chartData = React.useMemo(() => {
        if (!testResults) return [];
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
        
        const data = last7Days.map(day => {
            const dayString = format(day, 'MMM d');
            const scoresOnDay = testResults.filter(tr => format(new Date(tr.completionDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
            const averageScore = scoresOnDay.length > 0 ? scoresOnDay.reduce((acc, curr) => acc + curr.score, 0) / scoresOnDay.length : 0;
            return { date: dayString, score: Math.round(averageScore) };
        });

        // Ensure there is at least one non-zero score to make the chart visible
        const hasScores = data.some(d => d.score > 0);
        if (!hasScores && testResults.length > 0) {
            // If no scores in the last 7 days, show the most recent score
            const mostRecentTest = testResults[0];
            return [{
                date: format(new Date(mostRecentTest.completionDate), 'MMM d'),
                score: Math.round(mostRecentTest.score)
            }];
        }

        return data;
    }, [testResults]);

    const averageScore = React.useMemo(() => {
        if (!testResults || testResults.length === 0) return 0;
        const total = testResults.reduce((acc, curr) => acc + curr.score, 0);
        return Math.round(total / testResults.length);
    }, [testResults]);


    if (isLoadingSources || isLoadingResults) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
            </div>
        )
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: (custom: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: custom * 0.1, duration: 0.4, ease: "easeOut" }
        })
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                whileHover={{ y: -4, scale: 1.02 }}
                className="w-full"
            >
                <Card className="h-full bg-gradient-to-br from-indigo-50/10 to-transparent dark:from-indigo-950/5 dark:to-transparent border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">{averageScore}%</div>
                        <p className="text-xs text-muted-foreground">Across all tests taken</p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                whileHover={{ y: -4, scale: 1.02 }}
                className="w-full"
            >
                <Card className="h-full bg-gradient-to-br from-purple-50/10 to-transparent dark:from-purple-950/5 dark:to-transparent border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sources Created</CardTitle>
                        <BookCopy className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">{sources?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Total study materials</p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                whileHover={{ y: -4, scale: 1.02 }}
                className="w-full"
            >
                <Card className="h-full bg-gradient-to-br from-pink-50/10 to-transparent dark:from-pink-950/5 dark:to-transparent border-l-4 border-l-pink-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
                        <CheckCircle className="h-4 w-4 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight">{testResults?.length || 0}</div>
                         <p className="text-xs text-muted-foreground">Assessments completed</p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                whileHover={{ y: -4, scale: 1.02 }}
                className="w-full lg:col-span-2 xl:col-span-1"
            >
                <Card className="h-full bg-gradient-to-br from-emerald-50/10 to-transparent dark:from-emerald-950/5 dark:to-transparent border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Performance</CardTitle>
                        <BarChartIcon className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="pb-0">
                        {chartData.length > 0 && chartData.some(d => d.score > 0) ? (
                            <ChartContainer config={chartConfig} className="h-[100px] w-full">
                               <AreaChart accessibilityLayer data={chartData}>
                                    <defs>
                                        <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-score)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-score)"
                                            stopOpacity={0.1}
                                        />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                    <ChartTooltipContent />
                                    <Area type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} fill="url(#fillScore)" />
                                </AreaChart>
                            </ChartContainer>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-[100px] text-center">
                                <p className="text-sm text-muted-foreground">Take a test to see your progress.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
