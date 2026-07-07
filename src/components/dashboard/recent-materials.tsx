
'use client';

import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BookPlus, Eye } from 'lucide-react';
import Link from 'next/link';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import React from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'motion/react';

const SourceCard = ({ source, index }: { source: any, index: number }) => {
    const [formattedDate, setFormattedDate] = React.useState('');

    React.useEffect(() => {
        if (source.uploadDate) {
            setFormattedDate(new Date(source.uploadDate).toLocaleDateString());
        }
    }, [source.uploadDate]);


    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="flex flex-col h-full"
        >
            <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 border border-slate-200/50 dark:border-slate-800/50 bg-card overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-b from-indigo-50/10 to-transparent dark:from-indigo-950/5">
                <CardTitle className="truncate text-base font-bold tracking-tight">{source.title}</CardTitle>
                <CardDescription className="text-xs">
                    {formattedDate ? `Created on ${formattedDate}` : <Skeleton className="h-3 w-20" />}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pt-2">
                <p className="text-sm text-muted-foreground line-clamp-3 break-words leading-relaxed">
                    {source.extractedText}
                </p>
              </CardContent>
              <CardFooter className="pt-3 border-t border-border/30 bg-muted/5">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                    <Button asChild variant="secondary" size="sm" className="w-full active:scale-95 transition-transform">
                        <Link href={`/materials/${source.id}`} className="flex items-center justify-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Source
                        </Link>
                    </Button>
                </motion.div>
              </CardFooter>
            </Card>
        </motion.div>
    )
}

export function AllSources() {
  const { user } = useUser();
  const firestore = useFirestore();
  const emptyDashboardImage = PlaceHolderImages.find((img) => img.id === 'dashboard-empty');

  const sourcesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'studyMaterials'), orderBy('uploadDate', 'desc'));
  }, [firestore, user]);

  const { data: sources, isLoading: isLoadingSources } = useCollection(sourcesQuery);


  if (isLoadingSources) {
    return (
        <div>
            <h3 className="text-xl font-bold tracking-tight mb-4">Your Study Sources</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                    <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
                ))}
            </div>
      </div>
    )
  }


  if (!sources || sources.length === 0) {
    return (
      <div className="text-center rounded-lg border-2 border-dashed border-muted bg-card p-12 flex flex-col items-center">
         {emptyDashboardImage && <Image src={emptyDashboardImage.imageUrl} alt="Empty dashboard" width={200} height={200} className="mb-4 rounded-md" data-ai-hint={emptyDashboardImage.imageHint} />}
        <h3 className="text-2xl font-bold tracking-tight">No sources yet</h3>
        <p className="mb-4 text-muted-foreground">
          Get started by creating your first study source.
        </p>
        <Button asChild>
          <Link href="/materials/create">
            <BookPlus className="mr-2 h-4 w-4" />
            Create New Source
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
        <h3 className="text-xl font-bold tracking-tight mb-4">Your Study Sources</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source, index) => (
            <SourceCard key={source.id} source={source} index={index} />
        ))}
        </div>
    </div>
  );
}
