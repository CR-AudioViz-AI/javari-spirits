'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Clock, Award, Lock, CheckCircle,
  Play, BookOpen, Star, Trophy, ChevronRight,
  Filter, Search, Flame, Target
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  proof_reward: number;
  is_premium: boolean;
  is_active: boolean;
  lessons: Lesson[];
  image_url?: string;
  badge_reward?: string;
  sort_order: number;
}

interface Lesson {
  title: string;
  content: string;
  quiz?: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface UserProgress {
  courseId: string;
  completedLessons: number[];
  quizScore?: number;
  completed: boolean;
}

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const categoryIcons: Record<string, React.ReactNode> = {
  whiskey: '🥃',
  bourbon: '🌽',
  scotch: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  tequila: '🌵',
  rum: '🏴‍☠️',
  cocktails: '🍸',
  collecting: '📦',
  production: '🏭',
  world: '🌍',
  advanced: '🎓'
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map());
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bv_courses')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
    setLoading(false);
  };

  const filteredCourses = courses.filter(c => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || c.difficulty === selectedDifficulty;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const categories = [...new Set(courses.map(c => c.category))];

  const startCourse = (course: Course) => {
    setSelectedCourse(course);
    setCurrentLesson(0);
    setShowQuiz(false);
    setQuizAnswers([]);
  };

  const nextLesson = () => {
    if (!selectedCourse) return;
    
    if (currentLesson < (selectedCourse.lessons?.length || 0) - 1) {
      setCurrentLesson(prev => prev + 1);
    } else {
      // Course complete
      setShowQuiz(true);
    }
  };

  const completeCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Award proof points
        await supabase.rpc('add_proof_points', {
          p_user_id: user.id,
          p_points: selectedCourse.proof_reward,
          p_reason: `Completed course: ${selectedCourse.title}`
        });
      }
    } catch (error) {
      console.error('Error completing course:', error);
    }
    
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-b border-blue-900/50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm mb-4">
              <GraduationCap className="w-4 h-4" />
              Javari Spirits Academy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Spirit Education Center
            </h1>
            <p className="text-xl text-blue-200/80 max-w-2xl mx-auto">
              Master the art of spirits with {courses.length} courses covering everything from basics to expert-level knowledge
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
            {[
              { icon: <BookOpen className="w-5 h-5" />, value: courses.length, label: 'Courses' },
              { icon: <Clock className="w-5 h-5" />, value: Math.round(courses.reduce((a, c) => a + (c.duration_minutes || 0), 0) / 60), label: 'Hours' },
              { icon: <Award className="w-5 h-5" />, value: courses.reduce((a, c) => a + (c.proof_reward || 0), 0), label: 'Proof Available' },
              { icon: <Trophy className="w-5 h-5" />, value: courses.filter(c => c.badge_reward).length, label: 'Badges' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg text-blue-400 mb-2">
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!selectedCourse ? (
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Learning Paths */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🎯 Learning Paths</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Whiskey Fundamentals', courses: 5, color: 'from-amber-500 to-orange-500' },
                { name: 'Cocktail Mastery', courses: 4, color: 'from-purple-500 to-pink-500' },
                { name: 'Collector\'s Journey', courses: 3, color: 'from-green-500 to-teal-500' }
              ].map((path, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-gradient-to-r ${path.color} p-0.5 rounded-xl cursor-pointer`}
                >
                  <div className="bg-gray-900 rounded-xl p-4 h-full">
                    <h3 className="font-bold text-white">{path.name}</h3>
                    <p className="text-gray-400 text-sm">{path.courses} courses</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                  <div className="h-32 bg-gray-700 rounded-lg mb-4" />
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-700 rounded w-full" />
                </div>
              ))
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No courses found</p>
              </div>
            ) : (
              filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => startCourse(course)}
                  className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-blue-500 transition"
                >
                  {/* Course Image/Icon */}
                  <div className="h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-6xl">
                    {categoryIcons[course.category] || '📚'}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded border ${difficultyColors[course.difficulty]}`}>
                        {course.difficulty}
                      </span>
                      {course.is_premium && (
                        <span className="flex items-center gap-1 text-yellow-400 text-xs">
                          <Star className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition">
                      {course.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {course.lessons?.length || 0} lessons
                        </span>
                      </div>
                      <span className="text-blue-400 font-medium">+{course.proof_reward} 🎖️</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </main>
      ) : (
        /* Course View */
        <main className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedCourse(null)}
            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
          >
            ← Back to Courses
          </button>

          {!showQuiz ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 rounded-xl overflow-hidden"
            >
              {/* Course Header */}
              <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-xs px-2 py-1 rounded border ${difficultyColors[selectedCourse.difficulty]}`}>
                      {selectedCourse.difficulty}
                    </span>
                    <h1 className="text-2xl font-bold text-white mt-2">{selectedCourse.title}</h1>
                    <p className="text-gray-400 mt-1">{selectedCourse.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-bold text-2xl">+{selectedCourse.proof_reward}</p>
                    <p className="text-gray-400 text-sm">Proof Reward</p>
                  </div>
                </div>
                
                {/* Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Lesson {currentLesson + 1} of {selectedCourse.lessons?.length || 0}</span>
                    <span>{Math.round(((currentLesson + 1) / (selectedCourse.lessons?.length || 1)) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${((currentLesson + 1) / (selectedCourse.lessons?.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="p-6">
                {selectedCourse.lessons && selectedCourse.lessons[currentLesson] && (
                  <>
                    <h2 className="text-xl font-bold text-white mb-4">
                      {selectedCourse.lessons[currentLesson].title}
                    </h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {selectedCourse.lessons[currentLesson].content}
                      </p>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setCurrentLesson(prev => Math.max(0, prev - 1))}
                    disabled={currentLesson === 0}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextLesson}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
                  >
                    {currentLesson < (selectedCourse.lessons?.length || 0) - 1 ? (
                      <>Next Lesson <ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <>Complete Course <CheckCircle className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Course Complete */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-green-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Course Complete!</h2>
              <p className="text-gray-400 mb-6">
                Congratulations on completing "{selectedCourse.title}"
              </p>
              
              <div className="bg-gray-700/50 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-400 mb-2">You earned</p>
                <p className="text-4xl font-bold text-blue-400">+{selectedCourse.proof_reward} 🎖️</p>
                <p className="text-gray-500 mt-1">Proof Points</p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Browse Courses
                </button>
                <button
                  onClick={completeCourse}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Claim Reward
                </button>
              </div>
            </motion.div>
          )}
        </main>
      )}
    </div>
  );
}
