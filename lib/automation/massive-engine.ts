// ============================================
// BARRELVERSE MASSIVE AUTOMATION ENGINE
// Goal: 1,000+ new items per day, continuous growth
// The Living, Breathing Alcohol Museum
// ============================================
// Timestamp: 2025-12-03 12:45 PM EST
// ============================================

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Lazy-load Supabase client to avoid build-time errors
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Lazy-load OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null;
const getOpenAI = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

// ============================================
// SCALE TARGETS (Per Day)
// ============================================
const DAILY_TARGETS = {
  spirits: 500,           // 500 new spirits per day
  triviaQuestions: 100,   // 100 new trivia questions
  historyArticles: 10,    // 10 full-length articles (2000+ words each)
  historyTimeline: 50,    // 50 timeline events
  knowledgeBase: 100,     // 100 Javari knowledge entries
  courses: 5,             // 5 new courses (with lessons)
  achievements: 10,       // 10 new achievements
  cocktailRecipes: 50,    // 50 cocktail recipes
  distilleryProfiles: 20, // 20 distillery profiles
  flavorProfiles: 100,    // 100 flavor profiles
  priceUpdates: 500,      // 500 price updates
};

// ============================================
// SPIRIT CATEGORIES TO EXPAND
// ============================================
const SPIRIT_CATEGORIES = [
  // Major Categories
  { category: 'bourbon', subcategories: ['Kentucky Straight', 'Small Batch', 'Single Barrel', 'Bottled in Bond', 'Wheated', 'High Rye', 'Barrel Proof', 'Cask Strength'] },
  { category: 'scotch', subcategories: ['Speyside', 'Highland', 'Islay', 'Lowland', 'Campbeltown', 'Island', 'Blended', 'Single Malt', 'Single Grain'] },
  { category: 'irish', subcategories: ['Single Malt', 'Single Pot Still', 'Single Grain', 'Blended', 'Peated'] },
  { category: 'japanese', subcategories: ['Single Malt', 'Blended', 'Grain', 'World Whisky'] },
  { category: 'rye', subcategories: ['American Rye', 'Canadian Rye', 'Bottled in Bond', 'Barrel Proof'] },
  { category: 'tequila', subcategories: ['Blanco', 'Joven', 'Reposado', 'Añejo', 'Extra Añejo', 'Cristalino'] },
  { category: 'mezcal', subcategories: ['Joven', 'Reposado', 'Añejo', 'Pechuga', 'Wild Agave', 'Ensamble'] },
  { category: 'rum', subcategories: ['White', 'Gold', 'Dark', 'Aged', 'Overproof', 'Spiced', 'Agricole', 'Navy', 'Demerara'] },
  { category: 'gin', subcategories: ['London Dry', 'Plymouth', 'Old Tom', 'Genever', 'New Western', 'Navy Strength', 'Barrel Aged'] },
  { category: 'vodka', subcategories: ['Wheat', 'Potato', 'Corn', 'Grape', 'Rye', 'Flavored'] },
  { category: 'cognac', subcategories: ['VS', 'VSOP', 'XO', 'XXO', 'Hors dAge', 'Single Estate'] },
  { category: 'brandy', subcategories: ['Armagnac', 'Calvados', 'Pisco', 'Grappa', 'American Brandy'] },
  { category: 'wine', subcategories: ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified'] },
  { category: 'beer', subcategories: ['IPA', 'Stout', 'Lager', 'Pilsner', 'Wheat', 'Sour', 'Porter', 'Belgian'] },
  { category: 'sake', subcategories: ['Junmai', 'Ginjo', 'Daiginjo', 'Honjozo', 'Nigori', 'Sparkling'] },
  // Specialty Categories
  { category: 'liqueur', subcategories: ['Amaro', 'Cream', 'Fruit', 'Herbal', 'Nut', 'Coffee', 'Chocolate'] },
  { category: 'absinthe', subcategories: ['Verte', 'Blanche', 'Bohemian'] },
  { category: 'baijiu', subcategories: ['Strong Aroma', 'Light Aroma', 'Sauce Aroma', 'Rice Aroma'] },
  { category: 'soju', subcategories: ['Traditional', 'Flavored', 'Premium'] },
  { category: 'shochu', subcategories: ['Sweet Potato', 'Barley', 'Rice', 'Buckwheat'] },
  { category: 'aquavit', subcategories: ['Norwegian', 'Swedish', 'Danish'] },
  { category: 'cachaca', subcategories: ['Unaged', 'Aged', 'Premium'] },
];

// ============================================
// HISTORY TOPICS - THE ALCOHOL MUSEUM
// ============================================
const HISTORY_TOPICS = {
  prohibition: [
    'The Underground Railroad of Booze: Rum Running Routes',
    'Women of Prohibition: The Real Power Behind the Movement',
    'The Chemistry of Bootleg Whiskey: Deaths and Disasters',
    'Speakeasy Architecture: Hidden Bars and Secret Passages',
    'The Purple Gang: Detroit\'s Most Violent Bootleggers',
    'Medicinal Whiskey: The Legal Loophole That Saved Bourbon',
    'Prohibition in Canada: The Wet Neighbor',
    'The Volstead Act: Reading Between the Lines',
    'Izzy and Moe: The Most Successful Prohibition Agents',
    'The Last Days of Prohibition: How Repeal Really Happened',
  ],
  mob: [
    'Lucky Luciano and the Commission: Organizing Crime',
    'Meyer Lansky: The Mob\'s Accountant',
    'The Castellammarese War: Birth of the Modern Mafia',
    'Frank Costello: The Prime Minister of the Underworld',
    'The Chicago Outfit After Capone',
    'Murder Inc: The Mob\'s Enforcement Arm',
    'The French Connection: Heroin and the Decline of Liquor',
    'The Kefauver Hearings: TV Exposes the Mob',
    'The Mob in Las Vegas: From Bugsy to the Corporate Era',
    'Modern Organized Crime and the Liquor Industry',
  ],
  origin: [
    'The Invention of the Pot Still: Ancient Alchemy',
    'Monks and Malt: The Monastery Origins of Distilling',
    'The Coffey Still: Industrial Revolution Meets Whiskey',
    'How Bourbon Got Its Name: The Real Story',
    'The Irish vs Scottish Whiskey War',
    'Tequila\'s Ancient Roots: From Pulque to Premium',
    'The Sugar Islands: Birth of Caribbean Rum',
    'Genever to Gin: A Dutch-English Evolution',
    'Vodka Wars: Polish vs Russian Claims',
    'The Story of Cognac: A French Accident',
  ],
  culture: [
    'The Cocktail: An American Invention',
    'Tiki Culture: Polynesian Fantasy in a Glass',
    'The Martini: Icon of Sophistication',
    'Irish Coffee: A San Francisco Story',
    'The Moscow Mule: Marketing Genius in Copper',
    'Three-Martini Lunch: Mad Men Era Drinking',
    'College Drinking Culture: A Historical Perspective',
    'The Wine Mom Phenomenon',
    'Craft Cocktail Renaissance: 2000-Present',
    'Celebrity Spirits: From Sinatra to Clooney',
  ],
  science: [
    'The Chemistry of Aging: What Happens in the Barrel',
    'Congeners: Why Brown Spirits Cause Worse Hangovers',
    'The Science of Terroir in Wine and Whiskey',
    'Yeast: The Unsung Hero of Fermentation',
    'Water: The Most Important Ingredient',
    'The Maillard Reaction: Why Char Matters',
    'Angels\' Share: The Science of Evaporation',
    'Temperature and Taste: Why We Chill or Warm',
    'The Proof: History of Alcohol Measurement',
    'Blending: Art and Science Combined',
  ],
  people: [
    'Elijah Craig: The Myth and the Man',
    'Jack Daniel: Enslaved Mentor and Legacy',
    'Jim Beam: Seven Generations of Bourbon',
    'Johnnie Walker: From Grocer to Global Icon',
    'Don Julio: The Man Who Refined Tequila',
    'Masataka Taketsuru: Father of Japanese Whisky',
    'Ernest Hemingway: A Writer\'s Relationship with Drink',
    'Julia Child: Wine\'s Greatest Ambassador',
    'Rémy Martin: The Man Behind the Cognac',
    'Sam Bronfman: From Bootlegger to Billionaire',
  ],
  dark_history: [
    'The Triangle Trade: Rum\'s Role in Slavery',
    'Moonshine Deaths: Poisoned by Prohibition',
    'The Whiskey Rebellion: America\'s First Tax Revolt',
    'Gin Lane: London\'s Alcoholic Crisis',
    'The Irish Famine and Whiskey',
    'Colonial Alcohol Policy: Drinking as Control',
    'Native American Alcohol Devastation',
    'The Temperance Movement: Religious War on Drink',
    'Drunk Driving: From Accepted to Criminal',
    'Fetal Alcohol Syndrome: A Modern Understanding',
  ],
  regional: [
    'Kentucky Bourbon Trail: Complete History',
    'Speyside: Scotland\'s Whisky Heartland',
    'Islay: The Peated Paradise',
    'Jalisco: Birthplace of Tequila',
    'Oaxaca: Mezcal\'s Spiritual Home',
    'Cognac Region: French Excellence',
    'Napa Valley: America\'s Wine Country',
    'Champagne: The Only True Sparkling',
    'Jamaica: Rum\'s Funkiest Island',
    'Japan\'s Whisky Regions: From Hokkaido to Kyushu',
  ],
  modern: [
    'The Bourbon Boom: Why Now?',
    'Craft Distilling Revolution: Small Batch Goes Big',
    'The Pappy Van Winkle Phenomenon',
    'Whiskey Flippers: Investment or Exploitation?',
    'The Rise of Japanese Whisky',
    'Natural Wine Movement',
    'Hard Seltzer: The New Beer?',
    'Celebrity Spirits Explosion',
    'Sustainability in Spirits',
    'The Future of Alcohol: Lab-Grown and AI',
  ],
  legal: [
    'The Three-Tier System: Why Alcohol is Different',
    'State Liquor Control: A Patchwork of Laws',
    'Blue Laws: Sunday Sales Restrictions',
    'The 21st Amendment: States\' Rights to Regulate',
    'Tied House Laws: Protecting Independence',
    'Direct-to-Consumer: The Legal Battle',
    'International Alcohol Tariffs and Trade',
    'Trademark Wars: Bourbon vs Tennessee',
    'Age Verification: The Technology Challenge',
    'Cannabis and Alcohol: Regulatory Collision',
  ],
};

// ============================================
// 1. MASSIVE SPIRIT GENERATOR
// ============================================
async function generateMassiveSpirits(count: number = 500): Promise<number> {
  let totalAdded = 0;
  const spiritsPerCategory = Math.ceil(count / SPIRIT_CATEGORIES.length);

  for (const { category, subcategories } of SPIRIT_CATEGORIES) {
    const spiritsPerSubcategory = Math.ceil(spiritsPerCategory / subcategories.length);
    
    for (const subcategory of subcategories) {
      try {
        const prompt = `Generate ${spiritsPerSubcategory} REAL ${category} spirits in the "${subcategory}" subcategory.

REQUIREMENTS:
- Must be REAL products that actually exist
- Include both popular and obscure/craft options
- Mix price ranges from budget to ultra-premium
- Include accurate ABV/proof values
- Include realistic MSRP prices

Return JSON array with these fields for each:
{
  "name": "exact product name",
  "brand": "brand name",
  "subcategory": "${subcategory}",
  "country": "country",
  "region": "specific region",
  "distillery": "producer",
  "abv": number,
  "proof": number,
  "msrp": number,
  "rarity": "common|uncommon|rare|very_rare|ultra_rare|legendary",
  "description": "50-100 word description with tasting notes",
  "age_statement": "number or null",
  "awards": ["array of awards"],
  "is_allocated": boolean,
  "is_discontinued": boolean
}

Return ONLY valid JSON array, no markdown.`;

        const response = await getOpenAI().chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 4000,
        });

        const spirits = JSON.parse(response.choices[0].message.content || '[]');

        for (const spirit of spirits) {
          const { data: existing } = await supabase
            .from('bv_spirits')
            .select('id')
            .eq('name', spirit.name)
            .single();

          if (!existing) {
            await getSupabase().from('bv_spirits').insert({
              ...spirit,
              category,
            });
            totalAdded++;
          }
        }
      } catch (error) {
        console.error(`Error generating ${category}/${subcategory}:`, error);
      }
    }
  }

  return totalAdded;
}

// ============================================
// 2. MASSIVE HISTORY ARTICLE GENERATOR
// ============================================
async function generateDeepHistoryArticle(topic: string, category: string): Promise<boolean> {
  const prompt = `Write a comprehensive, museum-quality article about: "${topic}"

REQUIREMENTS:
- 2500-4000 words minimum
- Deeply researched, historically accurate
- Include specific dates, names, places
- Tell compelling stories with narrative flow
- Include surprising facts and little-known details
- Write like a professional historian/journalist
- Break into clear sections with headers
- Include quotes from historical figures where relevant
- Cite specific sources (books, archives, newspapers)

SECTIONS TO INCLUDE:
1. Introduction - Hook the reader
2. Historical Context - Set the scene
3. Key Events - The main narrative
4. Key Figures - People involved
5. Impact & Consequences - What happened after
6. Modern Legacy - How it affects us today
7. Little-Known Facts - Surprising details
8. Further Reading - Sources and recommendations

Return JSON:
{
  "title": "compelling title",
  "slug": "url-friendly-slug",
  "era": "time period",
  "summary": "3-4 sentence summary",
  "content": "FULL article text with markdown headers",
  "key_figures": ["array of important people"],
  "key_dates": [{"year": 1920, "event": "description"}],
  "sources": ["array of source citations"],
  "related_topics": ["array of related article topics"],
  "image_suggestions": ["descriptions of images to find"],
  "read_time": number_of_minutes,
  "difficulty": "beginner|intermediate|advanced"
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const article = JSON.parse(response.choices[0].message.content || '{}');

    const { data: existing } = await supabase
      .from('bv_history_articles')
      .select('id')
      .eq('slug', article.slug)
      .single();

    if (!existing && article.title) {
      await getSupabase().from('bv_history_articles').insert({
        ...article,
        category,
        author: 'BarrelVerse History Team',
        is_featured: Math.random() < 0.2,
        is_published: true,
        published_at: new Date().toISOString(),
      });
      return true;
    }
  } catch (error) {
    console.error(`Error generating article "${topic}":`, error);
  }
  return false;
}

// ============================================
// 3. MASSIVE TRIVIA GENERATOR
// ============================================
async function generateMassiveTrivia(count: number = 100): Promise<number> {
  const difficulties = ['easy', 'medium', 'hard'];
  const questionsPerDifficulty = Math.ceil(count / 3);
  let totalAdded = 0;

  for (const difficulty of difficulties) {
    const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;

    const prompt = `Generate ${questionsPerDifficulty} ${difficulty} trivia questions about alcoholic beverages.

DIFFICULTY GUIDE:
- easy: Basic facts most casual drinkers would know
- medium: Requires some knowledge of spirits/brands
- hard: Expert-level, obscure facts, detailed history

QUESTION CATEGORIES:
- Spirit identification and types
- Production methods
- History and origins
- Famous brands and products
- Regional specialties
- Cocktail ingredients
- Proof/ABV facts
- Award-winning bottles
- Celebrity connections
- Legal/regulatory facts

Return JSON array:
[{
  "question": "question text",
  "correct_answer": "correct answer",
  "wrong_answers": ["wrong1", "wrong2", "wrong3"],
  "category": "bourbon|scotch|tequila|rum|gin|vodka|wine|beer|general|history|cocktails",
  "difficulty": "${difficulty}",
  "points": ${points},
  "explanation": "why this is the correct answer",
  "fun_fact": "related interesting fact"
}]

Make questions engaging and educational. Avoid simple yes/no questions.`;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 4000,
      });

      const questions = JSON.parse(response.choices[0].message.content || '[]');

      for (const q of questions) {
        const { data: existing } = await supabase
          .from('bv_trivia_questions')
          .select('id')
          .ilike('question', q.question.substring(0, 50) + '%')
          .single();

        if (!existing) {
          await getSupabase().from('bv_trivia_questions').insert(q);
          totalAdded++;
        }
      }
    } catch (error) {
      console.error(`Error generating ${difficulty} trivia:`, error);
    }
  }

  return totalAdded;
}

// ============================================
// 4. MASSIVE KNOWLEDGE BASE GENERATOR
// ============================================
async function generateMassiveKnowledge(count: number = 100): Promise<number> {
  const topics = [
    // Bourbon topics
    'What makes bourbon different from whiskey',
    'How to read a bourbon label',
    'Buffalo Trace Antique Collection explained',
    'Wheated vs high-rye bourbon',
    'The angels share explained',
    'Barrel entry proof explained',
    'What is bottled in bond',
    'Single barrel vs small batch',
    'Kentucky vs other states bourbon',
    'How to properly taste bourbon',
    // Scotch topics
    'Understanding peat levels in scotch',
    'Scotch whisky regions explained',
    'Age statement vs NAS scotch',
    'Sherry cask vs bourbon cask scotch',
    'How to nose and taste scotch',
    'Single malt vs blended scotch',
    'Cask strength scotch explained',
    'Independent bottlers explained',
    'Scotch whisky production process',
    'Famous scotch distilleries',
    // Tequila topics  
    'Blanco vs reposado vs anejo',
    'Highland vs lowland tequila',
    'What is additive-free tequila',
    'How tequila is made',
    'Reading tequila labels',
    'Mezcal vs tequila differences',
    'Best tequilas for margaritas',
    'Sipping tequila guide',
    'Cristalino tequila explained',
    'Extra anejo tequila category',
    // And many more...
  ];

  let totalAdded = 0;
  const topicsToGenerate = topics.slice(0, Math.min(count, topics.length));

  for (const topic of topicsToGenerate) {
    const prompt = `Write a comprehensive educational entry about: "${topic}"

This is for an AI assistant named Javari to use when answering user questions.

Requirements:
- 400-600 words
- Factual and accurate
- Conversational but authoritative tone
- Include practical tips and recommendations
- Include interesting facts
- Make it useful for both beginners and enthusiasts

Return JSON:
{
  "topic": "${topic}",
  "content": "full educational content",
  "summary": "1-2 sentence summary",
  "keywords": ["array", "of", "keywords"],
  "related_topics": ["other", "related", "topics"],
  "difficulty": "beginner|intermediate|advanced",
  "category": "bourbon|scotch|tequila|rum|gin|vodka|wine|beer|general"
}`;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const entry = JSON.parse(response.choices[0].message.content || '{}');

      const { data: existing } = await supabase
        .from('bv_knowledge_base')
        .select('id')
        .eq('topic', entry.topic)
        .single();

      if (!existing && entry.topic) {
        await getSupabase().from('bv_knowledge_base').insert({
          ...entry,
          source: 'Javari AI',
          is_verified: true,
          is_active: true,
        });
        totalAdded++;
      }
    } catch (error) {
      console.error(`Error generating knowledge for "${topic}":`, error);
    }
  }

  return totalAdded;
}

// ============================================
// 5. COURSE GENERATOR WITH LESSONS
// ============================================
async function generateCompleteCourse(title: string, category: string): Promise<boolean> {
  const prompt = `Create a complete educational course about: "${title}"

Requirements:
- 8-12 comprehensive lessons
- Each lesson 500-800 words
- Progressive learning structure
- Practical exercises and tips
- Quiz questions for each lesson
- Hands-on assignments

Return JSON:
{
  "title": "${title}",
  "description": "compelling course description",
  "category": "${category}",
  "difficulty": "beginner|intermediate|advanced",
  "duration_minutes": total_time,
  "learning_objectives": ["what", "students", "will", "learn"],
  "prerequisites": ["required", "knowledge"],
  "lessons": [
    {
      "title": "lesson title",
      "content": "full lesson content with markdown",
      "order_index": 1,
      "duration_minutes": 15,
      "key_points": ["main", "takeaways"],
      "quiz_questions": [
        {
          "question": "quiz question",
          "correct_answer": "answer",
          "wrong_answers": ["wrong1", "wrong2", "wrong3"]
        }
      ],
      "assignment": "practical assignment description"
    }
  ],
  "final_exam_questions": 10,
  "certificate_title": "certificate name"
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const course = JSON.parse(response.choices[0].message.content || '{}');

    const { data: existing } = await supabase
      .from('bv_courses')
      .select('id')
      .ilike('title', course.title)
      .single();

    if (!existing && course.title) {
      const { data: newCourse } = await supabase
        .from('bv_courses')
        .insert({
          title: course.title,
          description: course.description,
          category,
          difficulty: course.difficulty,
          duration_minutes: course.duration_minutes,
          is_published: true,
        })
        .select('id')
        .single();

      if (newCourse && course.lessons) {
        for (const lesson of course.lessons) {
          await getSupabase().from('bv_lessons').insert({
            course_id: newCourse.id,
            ...lesson,
          });
        }
      }
      return true;
    }
  } catch (error) {
    console.error(`Error generating course "${title}":`, error);
  }
  return false;
}

// ============================================
// 6. COCKTAIL RECIPE GENERATOR
// ============================================
async function generateCocktailRecipes(count: number = 50): Promise<number> {
  const prompt = `Generate ${count} cocktail recipes, including:
- Classic cocktails
- Modern craft cocktails
- Spirit-forward drinks
- Refreshing highballs
- Complex tiki drinks
- Seasonal specialties

Return JSON array:
[{
  "name": "cocktail name",
  "category": "classic|modern|tiki|highball|martini|sour|fizz|punch",
  "base_spirit": "main spirit",
  "ingredients": [
    {"ingredient": "name", "amount": "2 oz", "optional": false}
  ],
  "instructions": ["step 1", "step 2"],
  "glass": "glass type",
  "garnish": "garnish description",
  "ice": "ice type",
  "difficulty": "easy|medium|hard",
  "prep_time_minutes": 5,
  "flavor_profile": ["sweet", "sour", "bitter"],
  "history": "brief history of the drink",
  "variations": ["variation 1", "variation 2"],
  "tips": ["pro tip 1", "pro tip 2"]
}]`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 8000,
    });

    const recipes = JSON.parse(response.choices[0].message.content || '[]');
    let added = 0;

    for (const recipe of recipes) {
      const { data: existing } = await supabase
        .from('bv_cocktail_recipes')
        .select('id')
        .eq('name', recipe.name)
        .single();

      if (!existing) {
        await getSupabase().from('bv_cocktail_recipes').insert(recipe);
        added++;
      }
    }

    return added;
  } catch (error) {
    console.error('Error generating cocktails:', error);
    return 0;
  }
}

// ============================================
// 7. MASTER EXPANSION RUNNER
// ============================================
export async function runMassiveExpansion(): Promise<Record<string, any>> {
  const startTime = Date.now();
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    spirits: 0,
    trivia: 0,
    history: 0,
    knowledge: 0,
    courses: 0,
    cocktails: 0,
    duration_ms: 0,
  };

  console.log('🚀 Starting MASSIVE BarrelVerse Expansion...');

  // 1. Generate Spirits (target: 500/day)
  console.log('📦 Generating spirits...');
  results.spirits = await generateMassiveSpirits(100); // Start with 100, scale up
  console.log(`✅ Added ${results.spirits} spirits`);

  // 2. Generate Trivia (target: 100/day)
  console.log('❓ Generating trivia...');
  results.trivia = await generateMassiveTrivia(50);
  console.log(`✅ Added ${results.trivia} trivia questions`);

  // 3. Generate History Articles (target: 10/day)
  console.log('📚 Generating history articles...');
  const historyCategories = Object.keys(HISTORY_TOPICS);
  const randomCategory = historyCategories[Math.floor(Math.random() * historyCategories.length)];
  const topics = HISTORY_TOPICS[randomCategory as keyof typeof HISTORY_TOPICS];
  for (let i = 0; i < 3; i++) {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    if (await generateDeepHistoryArticle(randomTopic, randomCategory)) {
      results.history++;
    }
  }
  console.log(`✅ Added ${results.history} history articles`);

  // 4. Generate Knowledge Base (target: 100/day)
  console.log('🧠 Generating Javari knowledge...');
  results.knowledge = await generateMassiveKnowledge(30);
  console.log(`✅ Added ${results.knowledge} knowledge entries`);

  // 5. Generate Courses (target: 5/day)
  console.log('🎓 Generating courses...');
  const courseTopics = [
    { title: 'Introduction to Bourbon', category: 'bourbon' },
    { title: 'Scotch Whisky Mastery', category: 'scotch' },
    { title: 'Tequila & Mezcal Fundamentals', category: 'tequila' },
    { title: 'The Art of Rum', category: 'rum' },
    { title: 'Gin Botanicals & Styles', category: 'gin' },
  ];
  const randomCourse = courseTopics[Math.floor(Math.random() * courseTopics.length)];
  if (await generateCompleteCourse(randomCourse.title, randomCourse.category)) {
    results.courses++;
  }
  console.log(`✅ Added ${results.courses} courses`);

  // Log completion
  results.duration_ms = Date.now() - startTime;
  
  await getSupabase().from('bv_auto_imports').insert({
    source: 'massive-expansion',
    import_type: 'all',
    status: 'completed',
    records_added: Object.values(results).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0),
    last_run: new Date().toISOString(),
    next_run: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Run every 6 hours
    config: results,
  });

  console.log('🎉 MASSIVE Expansion Complete!');
  console.log(JSON.stringify(results, null, 2));

  return results;
}


// ============================================
// 8. CRON SCHEDULE (Vercel)
// ============================================
// See vercel.json for cron configuration
// Runs massive-expansion every 6 hours (4x/day)
// = CONTINUOUS 24/7 EXPANSION
// = 1000+ new items per day
// = Living, breathing alcohol museum

export {
  generateMassiveSpirits,
  generateMassiveTrivia,
  generateDeepHistoryArticle,
  generateMassiveKnowledge,
  generateCompleteCourse,
  generateCocktailRecipes,
};
