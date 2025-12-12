import { Metadata } from 'next';
import { Suspense } from 'react';
import TriviaGame from '@/components/games/TriviaGame';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Spirit Trivia | CRAVBarrels',
  description: 'Test your spirits knowledge and earn proof points',
};

export default function TriviaPage({
  searchParams,
}: {
  searchParams: { category?: string; count?: string };
}) {
  const category = searchParams.category || 'all';
  const count = parseInt(searchParams.count || '10');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/games">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Spirit Trivia</h1>
        <p className="text-muted-foreground">
          {category === 'all' ? 'All Categories' : `Category: ${category}`} • {count} Questions
        </p>
      </div>

      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <TriviaGame category={category} questionCount={count} />
      </Suspense>
    </div>
  );
}
