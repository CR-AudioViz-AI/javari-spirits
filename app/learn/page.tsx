import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Clock, Award, BookOpen, Play, Lock, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Learn | Javari Spirits Academy',
  description: 'Master the art of spirits with our comprehensive courses',
};

const courses = [
  {
    id: 'intro-spirits',
    title: 'Introduction to Spirits',
    description: 'Learn the fundamentals of distilled spirits',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    duration: 30,
    lessons: 4,
    proofReward: 50,
    isPremium: false,
    progress: 0,
  },
  {
    id: 'whiskey-101',
    title: 'Whiskey 101',
    description: 'Explore bourbon, scotch, rye, and more',
    category: 'Whiskey',
    difficulty: 'Beginner',
    duration: 45,
    lessons: 4,
    proofReward: 75,
    isPremium: false,
    progress: 0,
  },
  {
    id: 'bourbon-deep-dive',
    title: 'Bourbon Deep Dive',
    description: 'Master America\'s native spirit',
    category: 'Whiskey',
    difficulty: 'Intermediate',
    duration: 60,
    lessons: 4,
    proofReward: 100,
    isPremium: false,
    progress: 0,
  },
  {
    id: 'scotch-mastery',
    title: 'Scotch Mastery',
    description: 'Journey through Scotland\'s whisky regions',
    category: 'Whiskey',
    difficulty: 'Intermediate',
    duration: 75,
    lessons: 5,
    proofReward: 125,
    isPremium: true,
    progress: 0,
  },
  {
    id: 'tequila-mezcal',
    title: 'Tequila & Mezcal',
    description: 'Discover the agave spirits of Mexico',
    category: 'Agave',
    difficulty: 'Intermediate',
    duration: 45,
    lessons: 4,
    proofReward: 100,
    isPremium: false,
    progress: 0,
  },
  {
    id: 'cocktail-fundamentals',
    title: 'Cocktail Fundamentals',
    description: 'Essential techniques for home bartending',
    category: 'Cocktails',
    difficulty: 'Beginner',
    duration: 45,
    lessons: 4,
    proofReward: 75,
    isPremium: false,
    progress: 0,
  },
];

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-500',
  Intermediate: 'bg-yellow-500',
  Advanced: 'bg-red-500',
};

export default function LearnPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <GraduationCap className="h-10 w-10 text-amber-600" />
          <h1 className="text-4xl font-bold">Javari Spirits Academy</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master the art of spirits with expert-led courses and earn proof points
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <div className="text-2xl font-bold">60+</div>
            <div className="text-sm text-muted-foreground">Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">40+</div>
            <div className="text-sm text-muted-foreground">Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Certificates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">4.9</div>
            <div className="text-sm text-muted-foreground">Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses */}
      <h2 className="text-2xl font-bold mb-6">Available Courses</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge variant="outline">{course.category}</Badge>
                {course.isPremium && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                    <Lock className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-2">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration} min
                </span>
                <span>{course.lessons} lessons</span>
                <Badge className={difficultyColors[course.difficulty]}>
                  {course.difficulty}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-600 font-medium">
                  +{course.proofReward} proof
                </span>
                <Link href={`/learn/${course.id}`}>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    <Play className="h-4 w-4 mr-1" /> Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
