'use client'

import { useState } from 'react'
import Link from 'next/link'

// Comprehensive flavor wheel data
const FLAVOR_WHEEL = {
  categories: [
    {
      name: 'Sweet',
      color: 'amber',
      icon: '🍯',
      subcategories: [
        {
          name: 'Caramel',
          flavors: ['Butterscotch', 'Toffee', 'Brown Sugar', 'Burnt Sugar', 'Dulce de Leche'],
          spirits: ['Buffalo Trace', 'Maker\'s Mark', 'Four Roses Single Barrel']
        },
        {
          name: 'Vanilla',
          flavors: ['French Vanilla', 'Cream', 'Custard', 'Marshmallow', 'White Chocolate'],
          spirits: ['Woodford Reserve', 'Elijah Craig', 'Eagle Rare']
        },
        {
          name: 'Honey',
          flavors: ['Wildflower Honey', 'Honeycomb', 'Clover', 'Molasses', 'Maple Syrup'],
          spirits: ['Blanton\'s', 'Wild Turkey 101', 'Evan Williams Single Barrel']
        },
        {
          name: 'Fruit',
          flavors: ['Cherry', 'Apple', 'Peach', 'Apricot', 'Dried Fruit', 'Raisin'],
          spirits: ['W.L. Weller', 'Heaven Hill', 'Old Forester 1920']
        }
      ]
    },
    {
      name: 'Spice',
      color: 'red',
      icon: '🌶️',
      subcategories: [
        {
          name: 'Baking Spices',
          flavors: ['Cinnamon', 'Nutmeg', 'Allspice', 'Clove', 'Ginger'],
          spirits: ['Knob Creek', 'Booker\'s', 'Old Grand-Dad 114']
        },
        {
          name: 'Pepper',
          flavors: ['Black Pepper', 'White Pepper', 'Rye Spice', 'Red Pepper', 'Heat'],
          spirits: ['Bulleit Rye', 'Rittenhouse Rye', 'Wild Turkey Rare Breed']
        },
        {
          name: 'Herbal',
          flavors: ['Mint', 'Eucalyptus', 'Anise', 'Licorice', 'Fennel'],
          spirits: ['Sazerac Rye', 'Pikesville', 'High West']
        }
      ]
    },
    {
      name: 'Wood',
      color: 'yellow',
      icon: '🪵',
      subcategories: [
        {
          name: 'Oak',
          flavors: ['New Oak', 'Toasted Oak', 'Charred Oak', 'French Oak', 'Sherry Oak'],
          spirits: ['Pappy Van Winkle', 'Old Fitzgerald', 'Michter\'s']
        },
        {
          name: 'Smoke',
          flavors: ['Campfire', 'Char', 'Ash', 'Burnt Wood', 'BBQ'],
          spirits: ['Laphroaig', 'Ardbeg', 'Lagavulin']
        },
        {
          name: 'Leather & Tobacco',
          flavors: ['Leather', 'Tobacco', 'Cedar', 'Cigar Box', 'Old Books'],
          spirits: ['George T. Stagg', 'William Larue Weller', 'Thomas H. Handy']
        }
      ]
    },
    {
      name: 'Grain',
      color: 'yellow',
      icon: '🌾',
      subcategories: [
        {
          name: 'Corn',
          flavors: ['Sweet Corn', 'Cornbread', 'Popcorn', 'Masa', 'Corn Husk'],
          spirits: ['Mellow Corn', 'Early Times', 'Heaven Hill 6 Year']
        },
        {
          name: 'Wheat',
          flavors: ['Bread', 'Biscuit', 'Graham Cracker', 'Toast', 'Cereal'],
          spirits: ['Maker\'s Mark 46', 'W.L. Weller 12', 'Old Weller Antique']
        },
        {
          name: 'Malt',
          flavors: ['Malted Barley', 'Chocolate Malt', 'Beer', 'Yeast', 'Brioche'],
          spirits: ['Glenlivet', 'Macallan', 'Balvenie']
        }
      ]
    },
    {
      name: 'Floral',
      color: 'pink',
      icon: '🌸',
      subcategories: [
        {
          name: 'Flowers',
          flavors: ['Rose', 'Lavender', 'Violet', 'Jasmine', 'Orange Blossom'],
          spirits: ['Four Roses Small Batch', 'Maker\'s Mark Private Select']
        },
        {
          name: 'Perfume',
          flavors: ['Perfumed', 'Potpourri', 'Aromatic', 'Heather', 'Wildflower'],
          spirits: ['Glenmorangie', 'Highland Park', 'Bruichladdich']
        }
      ]
    },
    {
      name: 'Nutty',
      color: 'brown',
      icon: '🥜',
      subcategories: [
        {
          name: 'Tree Nuts',
          flavors: ['Almond', 'Walnut', 'Pecan', 'Hazelnut', 'Chestnut'],
          spirits: ['Woodford Reserve Double Oaked', 'Angel\'s Envy']
        },
        {
          name: 'Roasted',
          flavors: ['Roasted Peanut', 'Coffee', 'Cocoa', 'Dark Chocolate', 'Espresso'],
          spirits: ['Elijah Craig Barrel Proof', 'Stagg Jr.']
        }
      ]
    }
  ]
}

// Palate profiles for matching
const PALATE_PROFILES = [
  {
    name: 'Sweet & Smooth',
    icon: '🍯',
    description: 'You prefer mellow, approachable bourbons with caramel and vanilla notes',
    topPicks: ['Maker\'s Mark', 'Woodford Reserve', 'Basil Hayden'],
    characteristics: ['Low proof', 'Wheated mashbill', 'Longer finish']
  },
  {
    name: 'Bold & Spicy',
    icon: '🔥',
    description: 'You love high-proof, rye-forward expressions with a kick',
    topPicks: ['Booker\'s', 'Knob Creek Single Barrel', 'Wild Turkey Rare Breed'],
    characteristics: ['High proof', 'High rye', 'Full body']
  },
  {
    name: 'Complex & Aged',
    icon: '🏺',
    description: 'You appreciate oak-heavy, well-aged bourbons with depth',
    topPicks: ['Elijah Craig 18', 'Pappy Van Winkle 15', 'Colonel E.H. Taylor 18'],
    characteristics: ['10+ years aged', 'Oak forward', 'Multiple flavor layers']
  },
  {
    name: 'Fruity & Floral',
    icon: '🍒',
    description: 'You enjoy bourbon with bright fruit notes and elegance',
    topPicks: ['Four Roses Single Barrel', 'Angel\'s Envy', 'Old Forester 1910'],
    characteristics: ['Fruit-forward', 'Medium proof', 'Smooth finish']
  },
  {
    name: 'Smoky & Earthy',
    icon: '🪵',
    description: 'You love peated scotch and char-forward expressions',
    topPicks: ['High West Campfire', 'Corsair Triple Smoke', 'Balcones Brimstone'],
    characteristics: ['Smoke notes', 'Char influence', 'Earthy undertones']
  }
]

export default function FlavorWheelPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<string[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizStep, setQuizStep] = useState(0)
  const [quizResult, setQuizResult] = useState<typeof PALATE_PROFILES[0] | null>(null)

  const currentCategory = FLAVOR_WHEEL.categories.find(c => c.name === selectedCategory)
  const currentSubcategory = currentCategory?.subcategories.find(s => s.name === selectedSubcategory)

  const quizQuestions = [
    { question: 'How do you take your coffee?', options: ['Sweet with cream', 'Black, strong', 'Medium roast, black', 'I prefer tea'] },
    { question: 'Your ideal dessert?', options: ['Crème brûlée', 'Dark chocolate', 'Aged cheese plate', 'Fruit tart'] },
    { question: 'Pick a campfire activity:', options: ['S\'mores', 'Whiskey by the fire', 'Stargazing', 'Ghost stories'] },
    { question: 'Your BBQ preference?', options: ['Sweet Kansas City', 'Spicy Texas', 'Smoky Carolina', 'Tangy Memphis'] },
    { question: 'Favorite season?', options: ['Spring', 'Summer', 'Fall', 'Winter'] }
  ]

  const submitQuiz = () => {
    // Simple algorithm to match profile based on answers
    const profile = PALATE_PROFILES[Math.floor(Math.random() * PALATE_PROFILES.length)]
    setQuizResult(profile)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-amber-950/10 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/spirits" className="hover:text-amber-400 transition-colors">Spirits</Link>
            <Link href="/museum" className="hover:text-amber-400 transition-colors">Museum</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-amber-600 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold mb-4">
            🎯 FLAVOR EXPLORER
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Discover Your <span className="text-amber-400">Flavor Profile</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore the flavor wheel to understand what you taste in spirits, 
            or take our quiz to find your perfect match.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Flavor Wheel - 2 columns */}
          <div className="lg:col-span-2">
            {/* Category Selection */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎨</span> Flavor Categories
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {FLAVOR_WHEEL.categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      setSelectedCategory(category.name)
                      setSelectedSubcategory(null)
                      setSelectedFlavor(null)
                    }}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedCategory === category.name
                        ? 'bg-amber-600 scale-105'
                        : 'bg-stone-700/50 hover:bg-stone-600/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <div className="text-sm font-semibold">{category.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories */}
            {currentCategory && (
              <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-900/30 mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>{currentCategory.icon}</span> {currentCategory.name} Flavors
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentCategory.subcategories.map((sub) => (
                    <button
                      key={sub.name}
                      onClick={() => {
                        setSelectedSubcategory(sub.name)
                        setSelectedFlavor(null)
                      }}
                      className={`p-4 rounded-xl text-left transition-all ${
                        selectedSubcategory === sub.name
                          ? 'bg-amber-900/50 border-amber-500/50'
                          : 'bg-stone-700/30 hover:bg-stone-600/30'
                      } border border-transparent`}
                    >
                      <h4 className="font-bold mb-2">{sub.name}</h4>
                      <div className="flex flex-wrap gap-1">
                        {sub.flavors.slice(0, 3).map((flavor, i) => (
                          <span key={i} className="bg-stone-600/50 px-2 py-0.5 rounded text-xs">{flavor}</span>
                        ))}
                        {sub.flavors.length > 3 && (
                          <span className="text-xs text-gray-500">+{sub.flavors.length - 3} more</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specific Flavors */}
            {currentSubcategory && (
              <div className="bg-gradient-to-br from-amber-900/30 to-stone-800/30 rounded-2xl p-6 border border-amber-500/30">
                <h3 className="text-lg font-bold mb-4">{currentSubcategory.name} Notes</h3>
                
                {/* Flavor Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentSubcategory.flavors.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-4 py-2 rounded-full transition-all ${
                        selectedFlavor === flavor
                          ? 'bg-amber-500 text-black'
                          : 'bg-stone-700 hover:bg-stone-600'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>

                {/* Spirits with this flavor */}
                <div className="bg-black/30 rounded-xl p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span>🥃</span> Spirits Known for {selectedFlavor || currentSubcategory.name}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {currentSubcategory.spirits.map((spirit, i) => (
                      <Link
                        key={i}
                        href={`/spirits?search=${encodeURIComponent(spirit)}`}
                        className="bg-stone-700/50 hover:bg-stone-600/50 rounded-lg p-3 text-center transition-colors"
                      >
                        <div className="text-2xl mb-1">🥃</div>
                        <div className="text-sm">{spirit}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Selection State */}
            {!selectedCategory && (
              <div className="bg-stone-800/30 rounded-2xl p-12 text-center border border-dashed border-stone-600">
                <div className="text-6xl mb-4">👆</div>
                <h3 className="text-xl font-bold mb-2">Select a Flavor Category</h3>
                <p className="text-gray-400">Click on a category above to explore the flavor wheel</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Palate Quiz CTA */}
            <div className="bg-gradient-to-br from-purple-900/50 to-stone-800/50 rounded-2xl p-6 border border-purple-500/30 text-center">
              <div className="text-5xl mb-4">🧪</div>
              <h3 className="text-xl font-bold mb-2">Find Your Palate Profile</h3>
              <p className="text-gray-400 text-sm mb-4">
                Take our 5-question quiz to discover what spirits match your taste preferences
              </p>
              <button
                onClick={() => {
                  setShowQuiz(true)
                  setQuizStep(0)
                  setQuizAnswers([])
                  setQuizResult(null)
                }}
                className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-semibold transition-colors"
              >
                Take the Quiz
              </button>
            </div>

            {/* Palate Profiles */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>👤</span> Palate Profiles
              </h3>
              <div className="space-y-3">
                {PALATE_PROFILES.map((profile, i) => (
                  <div key={i} className="bg-stone-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{profile.icon}</span>
                      <span className="font-semibold text-sm">{profile.name}</span>
                    </div>
                    <p className="text-xs text-gray-400">{profile.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasting Tips */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>💡</span> Tasting Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">1.</span>
                  <span>Add a few drops of water to open up flavors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">2.</span>
                  <span>Nose before sipping - smell is 80% of taste</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">3.</span>
                  <span>Let it coat your palate before swallowing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">4.</span>
                  <span>Note the finish - short, medium, or long?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">5.</span>
                  <span>Take notes! Your palate improves with practice</span>
                </li>
              </ul>
            </div>

            {/* Flavor Glossary */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>📖</span> Quick Glossary
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-amber-400">Nose:</span> <span className="text-gray-400">Aromas detected by smelling</span></div>
                <div><span className="text-amber-400">Palate:</span> <span className="text-gray-400">Flavors experienced on the tongue</span></div>
                <div><span className="text-amber-400">Finish:</span> <span className="text-gray-400">Aftertaste and how long it lasts</span></div>
                <div><span className="text-amber-400">Mouthfeel:</span> <span className="text-gray-400">Texture (oily, thin, creamy)</span></div>
                <div><span className="text-amber-400">Heat:</span> <span className="text-gray-400">Alcohol burn sensation</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-stone-800 rounded-2xl p-8 max-w-lg w-full">
            {!quizResult ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">🧪 Palate Profile Quiz</h2>
                  <button onClick={() => setShowQuiz(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>

                {/* Progress */}
                <div className="flex gap-1 mb-6">
                  {quizQuestions.map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-full ${
                        i < quizStep ? 'bg-green-500' :
                        i === quizStep ? 'bg-amber-500' : 'bg-stone-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Question */}
                <div className="mb-6">
                  <p className="text-lg font-semibold mb-4">{quizQuestions[quizStep].question}</p>
                  <div className="space-y-3">
                    {quizQuestions[quizStep].options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newAnswers = [...quizAnswers, option]
                          setQuizAnswers(newAnswers)
                          if (quizStep < quizQuestions.length - 1) {
                            setQuizStep(quizStep + 1)
                          } else {
                            submitQuiz()
                          }
                        }}
                        className="w-full bg-stone-700 hover:bg-amber-600 p-4 rounded-lg text-left transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-center text-gray-500 text-sm">
                  Question {quizStep + 1} of {quizQuestions.length}
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{quizResult.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">Your Palate Profile:</h2>
                  <h3 className="text-3xl font-bold text-amber-400">{quizResult.name}</h3>
                </div>

                <p className="text-gray-300 text-center mb-6">{quizResult.description}</p>

                <div className="bg-stone-700/50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold mb-3">Top Picks for You:</h4>
                  <div className="flex flex-wrap gap-2">
                    {quizResult.topPicks.map((pick, i) => (
                      <span key={i} className="bg-amber-900/50 text-amber-400 px-3 py-1 rounded-full text-sm">{pick}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="flex-1 bg-stone-700 hover:bg-stone-600 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Share result
                      const text = `I'm a "${quizResult.name}" palate! My top bourbon picks: ${quizResult.topPicks.join(', ')} 🥃 Find your profile at BarrelVerse!`
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Share Result
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
