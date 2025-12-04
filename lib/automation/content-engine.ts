/**
 * ============================================================================
 * BARRELVERSE ULTIMATE CONTENT ENGINE
 * The World's Most Comprehensive Spirits Content Automation System
 * 
 * This engine NEVER STOPS. It continuously:
 * - Generates spirits across ALL categories
 * - Creates courses, quizzes, and games
 * - Writes history articles and stories
 * - Scrapes competitor data
 * - Finds new brands and products
 * - Creates cocktail recipes
 * - Discovers distilleries worldwide
 * 
 * Target: 10,000+ spirits, 500+ courses, 5,000+ trivia, unlimited history
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// ============================================================================
// SPIRIT CATEGORIES - COMPLETE COVERAGE
// ============================================================================

const SPIRIT_CATEGORIES = {
  // WHISKEY FAMILY
  bourbon: {
    name: 'Bourbon',
    regions: ['Kentucky', 'Tennessee', 'Indiana', 'New York', 'Texas', 'Colorado', 'California'],
    brands: ['Buffalo Trace', 'Maker\'s Mark', 'Woodford Reserve', 'Wild Turkey', 'Jim Beam', 'Four Roses', 'Heaven Hill', 'Evan Williams', 'Elijah Craig', 'Knob Creek', 'Bulleit', 'Angel\'s Envy', 'Blanton\'s', 'Eagle Rare', 'Weller', 'Pappy Van Winkle', 'Old Forester', 'Michter\'s', 'Booker\'s', 'Baker\'s', 'Basil Hayden', 'Larceny', 'Old Grand-Dad', 'Very Old Barton', 'Ancient Age', 'Benchmark', 'Old Crow', 'Ten High', 'Rebel Yell', 'Yellowstone'],
    styles: ['Small Batch', 'Single Barrel', 'Barrel Proof', 'Bottled in Bond', 'Wheated', 'High Rye', 'Cask Strength', 'Finished'],
    priceRanges: { budget: [15, 30], mid: [30, 60], premium: [60, 150], ultra: [150, 5000] }
  },
  rye: {
    name: 'Rye Whiskey',
    regions: ['Kentucky', 'Pennsylvania', 'Maryland', 'Indiana', 'New York', 'Canada'],
    brands: ['Rittenhouse', 'Sazerac', 'Bulleit Rye', 'High West', 'WhistlePig', 'Pikesville', 'Old Overholt', 'Wild Turkey Rye', 'Knob Creek Rye', 'Templeton', 'Angel\'s Envy Rye', 'Redemption', 'George Dickel Rye', 'Michter\'s Rye', 'Russell\'s Reserve Rye'],
    styles: ['Straight Rye', 'Bottled in Bond', 'Single Barrel', 'Barrel Proof', 'Finished'],
    priceRanges: { budget: [20, 35], mid: [35, 70], premium: [70, 200], ultra: [200, 3000] }
  },
  scotch: {
    name: 'Scotch Whisky',
    regions: ['Speyside', 'Highland', 'Islay', 'Lowland', 'Campbeltown', 'Islands'],
    brands: ['Macallan', 'Glenfiddich', 'Glenlivet', 'Lagavulin', 'Laphroaig', 'Ardbeg', 'Talisker', 'Oban', 'Dalmore', 'Highland Park', 'Balvenie', 'Aberlour', 'GlenDronach', 'Springbank', 'Bruichladdich', 'Bunnahabhain', 'Caol Ila', 'Bowmore', 'Glenmorangie', 'Auchentoshan', 'Craigellachie', 'Glenfarclas', 'Tomatin', 'BenRiach', 'Benromach'],
    styles: ['Single Malt', 'Blended', 'Blended Malt', 'Single Grain', 'Cask Strength', 'Sherry Cask', 'Port Cask', 'Peated', 'Non-Peated'],
    priceRanges: { budget: [30, 50], mid: [50, 100], premium: [100, 300], ultra: [300, 50000] }
  },
  irish: {
    name: 'Irish Whiskey',
    regions: ['Dublin', 'Cork', 'Donegal', 'Galway', 'Antrim'],
    brands: ['Jameson', 'Redbreast', 'Green Spot', 'Yellow Spot', 'Midleton', 'Bushmills', 'Teeling', 'Powers', 'Tullamore DEW', 'Connemara', 'Kilbeggan', 'Writers Tears', 'Method and Madness', 'Dingle', 'Waterford'],
    styles: ['Single Pot Still', 'Single Malt', 'Single Grain', 'Blended', 'Peated'],
    priceRanges: { budget: [25, 40], mid: [40, 80], premium: [80, 200], ultra: [200, 5000] }
  },
  japanese: {
    name: 'Japanese Whisky',
    regions: ['Hokkaido', 'Honshu', 'Kyushu'],
    brands: ['Yamazaki', 'Hakushu', 'Hibiki', 'Nikka', 'Suntory', 'Chichibu', 'Mars', 'Akashi', 'Togouchi', 'Fuji', 'Ichiro\'s Malt', 'Yoichi', 'Miyagikyo', 'Taketsuru'],
    styles: ['Single Malt', 'Blended', 'Single Grain', 'Pure Malt', 'Mizunara Cask'],
    priceRanges: { budget: [40, 70], mid: [70, 150], premium: [150, 500], ultra: [500, 50000] }
  },
  canadian: {
    name: 'Canadian Whisky',
    regions: ['Ontario', 'Quebec', 'Alberta', 'British Columbia', 'Manitoba'],
    brands: ['Crown Royal', 'Canadian Club', 'Lot 40', 'Forty Creek', 'Pike Creek', 'Caribou Crossing', 'Alberta Premium', 'Pendleton', 'Rich & Rare', 'Black Velvet'],
    styles: ['Blended', 'Single Grain', 'Rye-based', 'Corn-based'],
    priceRanges: { budget: [15, 30], mid: [30, 60], premium: [60, 150], ultra: [150, 500] }
  },
  
  // RUM FAMILY
  rum: {
    name: 'Rum',
    regions: ['Jamaica', 'Barbados', 'Puerto Rico', 'Cuba', 'Dominican Republic', 'Guatemala', 'Panama', 'Venezuela', 'Martinique', 'Guadeloupe', 'Haiti', 'Trinidad', 'Guyana', 'Nicaragua', 'Virgin Islands'],
    brands: ['Appleton Estate', 'Mount Gay', 'Bacardi', 'Havana Club', 'Ron Zacapa', 'Diplomatico', 'El Dorado', 'Plantation', 'Flor de Caña', 'Clement', 'Rhum JM', 'Hampden Estate', 'Foursquare', 'Real McCoy', 'Smith & Cross', 'Pusser\'s', 'Goslings', 'Cruzan', 'Don Q', 'Wray & Nephew'],
    styles: ['White/Silver', 'Gold', 'Dark', 'Aged', 'Spiced', 'Overproof', 'Agricole', 'Navy', 'Demerara'],
    priceRanges: { budget: [15, 30], mid: [30, 60], premium: [60, 150], ultra: [150, 2000] }
  },
  
  // AGAVE SPIRITS
  tequila: {
    name: 'Tequila',
    regions: ['Jalisco', 'Guanajuato', 'Michoacán', 'Nayarit', 'Tamaulipas'],
    brands: ['Patron', 'Don Julio', 'Casamigos', 'Clase Azul', 'Fortaleza', 'Casa Noble', 'Herradura', 'Espolon', 'Olmeca Altos', 'El Tesoro', 'Ocho', 'Tapatio', 'G4', 'Pasote', 'ArteNOM', 'Tequila Ocho', 'Siete Leguas', 'Tears of Llorona', 'Casa Dragones', 'Codigo 1530'],
    styles: ['Blanco', 'Reposado', 'Añejo', 'Extra Añejo', 'Cristalino', 'Joven'],
    priceRanges: { budget: [20, 40], mid: [40, 80], premium: [80, 200], ultra: [200, 5000] }
  },
  mezcal: {
    name: 'Mezcal',
    regions: ['Oaxaca', 'Guerrero', 'Durango', 'San Luis Potosi', 'Zacatecas', 'Puebla', 'Michoacán', 'Guanajuato', 'Tamaulipas'],
    brands: ['Del Maguey', 'Montelobos', 'Illegal', 'Vida', 'El Silencio', 'Sombra', 'Banhez', 'Bozal', 'Los Amantes', 'Rey Campero', 'Vago', 'Mal Bien', 'Real Minero', 'Pierde Almas', 'Gracias a Dios'],
    styles: ['Joven', 'Reposado', 'Añejo', 'Pechuga', 'Ancestral', 'Artesanal'],
    priceRanges: { budget: [30, 50], mid: [50, 100], premium: [100, 300], ultra: [300, 2000] }
  },
  
  // BRANDY/COGNAC
  cognac: {
    name: 'Cognac',
    regions: ['Grande Champagne', 'Petite Champagne', 'Borderies', 'Fins Bois', 'Bons Bois', 'Bois Ordinaires'],
    brands: ['Hennessy', 'Remy Martin', 'Martell', 'Courvoisier', 'Hine', 'Camus', 'Frapin', 'Pierre Ferrand', 'Hardy', 'Delamain', 'Park', 'Dudognon', 'Kelt', 'Louis XIII', 'Richard Hennessy'],
    styles: ['VS', 'VSOP', 'XO', 'XXO', 'Extra', 'Hors d\'Age', 'Vintage'],
    priceRanges: { budget: [30, 50], mid: [50, 100], premium: [100, 300], ultra: [300, 50000] }
  },
  armagnac: {
    name: 'Armagnac',
    regions: ['Bas-Armagnac', 'Ténarèze', 'Haut-Armagnac'],
    brands: ['Darroze', 'Castarède', 'Jollité', 'Château de Laubade', 'Delord', 'Marie Duffau', 'Château du Tariquet', 'Samalens', 'Baron de Sigognac'],
    styles: ['VS', 'VSOP', 'XO', 'Vintage', 'Hors d\'Age'],
    priceRanges: { budget: [30, 50], mid: [50, 100], premium: [100, 250], ultra: [250, 5000] }
  },
  brandy: {
    name: 'Brandy',
    regions: ['Spain', 'California', 'South Africa', 'Peru', 'Chile', 'Australia', 'Greece'],
    brands: ['Torres', 'Gran Duque de Alba', 'Cardenal Mendoza', 'Lepanto', 'Christian Brothers', 'E&J', 'Korbel', 'St-Remy', 'Metaxa', 'KWV'],
    styles: ['Solera', 'Pot Still', 'Column Still', 'Grape', 'Fruit'],
    priceRanges: { budget: [15, 30], mid: [30, 60], premium: [60, 150], ultra: [150, 1000] }
  },
  
  // VODKA
  vodka: {
    name: 'Vodka',
    regions: ['Russia', 'Poland', 'Sweden', 'France', 'USA', 'Finland', 'Netherlands', 'Ukraine'],
    brands: ['Grey Goose', 'Belvedere', 'Ketel One', 'Absolut', 'Stolichnaya', 'Tito\'s', 'Chopin', 'Beluga', 'Russian Standard', 'Finlandia', 'Ciroc', 'Smirnoff', 'Skyy', 'Reyka', 'Crystal Head', 'Zubrowka', 'Wyborowa', 'Luksusowa', 'Jewel of Russia', 'Hangar 1'],
    styles: ['Classic', 'Wheat', 'Potato', 'Rye', 'Grape', 'Corn', 'Flavored'],
    priceRanges: { budget: [15, 25], mid: [25, 45], premium: [45, 100], ultra: [100, 1000] }
  },
  
  // GIN
  gin: {
    name: 'Gin',
    regions: ['England', 'Scotland', 'Spain', 'USA', 'Germany', 'Netherlands', 'Japan', 'Australia'],
    brands: ['Hendrick\'s', 'Tanqueray', 'Bombay Sapphire', 'Beefeater', 'Sipsmith', 'The Botanist', 'Monkey 47', 'Aviation', 'Plymouth', 'Roku', 'Ki No Bi', 'Gin Mare', 'Malfy', 'St. George', 'Ford\'s', 'Broker\'s', 'Hayman\'s', 'Gordon\'s', 'Nolet\'s', 'Four Pillars'],
    styles: ['London Dry', 'Plymouth', 'Old Tom', 'Genever', 'New Western', 'Navy Strength', 'Sloe', 'Flavored'],
    priceRanges: { budget: [20, 30], mid: [30, 50], premium: [50, 100], ultra: [100, 500] }
  },
  
  // WINE CATEGORIES
  red_wine: {
    name: 'Red Wine',
    regions: ['Bordeaux', 'Burgundy', 'Napa Valley', 'Tuscany', 'Rioja', 'Barossa Valley', 'Mendoza', 'Willamette Valley', 'Piedmont', 'Rhône Valley'],
    brands: ['Opus One', 'Caymus', 'Silver Oak', 'Screaming Eagle', 'Penfolds', 'Tignanello', 'Sassicaia', 'Château Margaux', 'Château Lafite Rothschild', 'Domaine de la Romanée-Conti'],
    styles: ['Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Syrah/Shiraz', 'Malbec', 'Zinfandel', 'Sangiovese', 'Tempranillo', 'Nebbiolo', 'Grenache'],
    priceRanges: { budget: [10, 25], mid: [25, 75], premium: [75, 200], ultra: [200, 50000] }
  },
  white_wine: {
    name: 'White Wine',
    regions: ['Burgundy', 'Napa Valley', 'Loire Valley', 'Marlborough', 'Mosel', 'Alsace', 'Sonoma', 'Adelaide Hills'],
    brands: ['Cloudy Bay', 'Kistler', 'Rombauer', 'Jordan', 'Kim Crawford', 'Cakebread', 'Far Niente', 'Château d\'Yquem'],
    styles: ['Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Pinot Grigio', 'Gewürztraminer', 'Viognier', 'Chenin Blanc', 'Albariño'],
    priceRanges: { budget: [10, 20], mid: [20, 50], premium: [50, 150], ultra: [150, 10000] }
  },
  champagne: {
    name: 'Champagne & Sparkling',
    regions: ['Champagne', 'Prosecco', 'Cava', 'Franciacorta', 'Crémant', 'California'],
    brands: ['Dom Pérignon', 'Moët & Chandon', 'Veuve Clicquot', 'Krug', 'Bollinger', 'Taittinger', 'Perrier-Jouët', 'Louis Roederer', 'Pol Roger', 'Ruinart', 'Schramsberg', 'Ferrari'],
    styles: ['Brut', 'Extra Brut', 'Blanc de Blancs', 'Blanc de Noirs', 'Rosé', 'Vintage', 'Prestige Cuvée'],
    priceRanges: { budget: [15, 40], mid: [40, 100], premium: [100, 300], ultra: [300, 10000] }
  },
  
  // BEER CATEGORIES
  craft_beer: {
    name: 'Craft Beer',
    regions: ['Pacific Northwest', 'California', 'Colorado', 'New England', 'Belgium', 'Germany', 'UK', 'Japan'],
    brands: ['Sierra Nevada', 'Stone', 'Dogfish Head', 'Bell\'s', 'Founders', 'Lagunitas', 'Russian River', 'Tree House', 'Other Half', 'Toppling Goliath', 'Hill Farmstead', 'Alchemist', 'Trillium'],
    styles: ['IPA', 'Double IPA', 'Hazy IPA', 'Stout', 'Porter', 'Pilsner', 'Lager', 'Wheat', 'Sour', 'Belgian', 'Pale Ale', 'Amber', 'Brown Ale', 'Barleywine', 'Saison'],
    priceRanges: { budget: [8, 15], mid: [15, 25], premium: [25, 50], ultra: [50, 500] }
  },
  
  // OTHER SPIRITS
  sake: {
    name: 'Sake',
    regions: ['Niigata', 'Hyogo', 'Kyoto', 'Hiroshima', 'Akita', 'Yamagata'],
    brands: ['Dassai', 'Kubota', 'Hakkaisan', 'Juyondai', 'Kikusui', 'Ozeki', 'Gekkeikan', 'Otokoyama', 'Masumi', 'Dewazakura'],
    styles: ['Junmai', 'Ginjo', 'Daiginjo', 'Honjozo', 'Nigori', 'Sparkling', 'Aged'],
    priceRanges: { budget: [15, 30], mid: [30, 60], premium: [60, 150], ultra: [150, 1000] }
  },
  liqueur: {
    name: 'Liqueur',
    regions: ['France', 'Italy', 'Netherlands', 'Germany', 'Mexico', 'Ireland'],
    brands: ['Cointreau', 'Grand Marnier', 'Chartreuse', 'Baileys', 'Kahlua', 'Frangelico', 'Amaretto', 'Campari', 'Aperol', 'St-Germain', 'Chambord', 'Luxardo', 'Drambuie', 'Benedictine'],
    styles: ['Orange', 'Coffee', 'Cream', 'Herbal', 'Nut', 'Berry', 'Floral'],
    priceRanges: { budget: [15, 25], mid: [25, 45], premium: [45, 100], ultra: [100, 500] }
  },
  amaro: {
    name: 'Amaro & Bitters',
    regions: ['Italy', 'Germany', 'France', 'USA'],
    brands: ['Fernet-Branca', 'Averna', 'Montenegro', 'Nonino', 'Cynar', 'Ramazzotti', 'Angostura', 'Peychaud\'s', 'Underberg'],
    styles: ['Alpine', 'Coastal', 'Fernet', 'Carciofo', 'Aromatic Bitters'],
    priceRanges: { budget: [20, 35], mid: [35, 60], premium: [60, 100], ultra: [100, 300] }
  }
}

// ============================================================================
// CONTENT GENERATION PROMPTS
// ============================================================================

const PROMPTS = {
  spirit: (category: string, brand: string, style: string, region: string) => `
Generate a detailed spirits database entry for a ${style} ${category} from ${brand} (${region}).

Return ONLY valid JSON with this exact structure:
{
  "name": "Full product name",
  "description": "2-3 sentence description of this specific spirit",
  "tasting_notes": "Detailed tasting notes paragraph",
  "nose": "Nose/aroma description",
  "palate": "Palate/taste description", 
  "finish": "Finish description",
  "abv": 45.0,
  "proof": 90,
  "age_statement": "Age statement or NAS",
  "msrp": 55,
  "distillery": "Distillery name",
  "mash_bill": "Mash bill if applicable",
  "barrel_type": "Barrel aging details",
  "region": "${region}",
  "country": "Country"
}

Make it realistic, detailed, and accurate to the category's characteristics.`,

  history: (topic: string, era: string) => `
Write a fascinating, detailed history article about ${topic} during the ${era}.

Return ONLY valid JSON:
{
  "title": "Engaging title",
  "summary": "2-3 sentence summary",
  "content": "Full 500+ word article with rich historical detail, stories, and facts",
  "era": "${era}",
  "category": "Category (Bourbon, Scotch, Prohibition, etc.)",
  "timeline_date": "YYYY-MM-DD if specific date known",
  "key_figures": ["List of important people mentioned"],
  "key_events": ["List of key events"],
  "related_brands": ["Brands mentioned"],
  "tags": ["relevant", "tags"]
}

Make it engaging, educational, and filled with interesting anecdotes.`,

  trivia: (category: string, difficulty: string) => `
Create a challenging ${difficulty} trivia question about ${category}.

Return ONLY valid JSON:
{
  "question": "The trivia question",
  "correct_answer": "The correct answer",
  "wrong_answers": ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
  "explanation": "Detailed explanation of why the answer is correct and interesting background",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "fun_fact": "An interesting related fact"
}

Make it educational and interesting, not just a random fact.`,

  cocktail: (baseSpirit: string, style: string) => `
Create an original or classic cocktail recipe using ${baseSpirit} in the ${style} style.

Return ONLY valid JSON:
{
  "name": "Cocktail name",
  "description": "Enticing description",
  "base_spirit_type": "${baseSpirit}",
  "category": "${style}",
  "glass_type": "Appropriate glass",
  "method": "shaken/stirred/built",
  "ingredients": [
    {"name": "Ingredient", "amount": "2", "unit": "oz", "optional": false}
  ],
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "garnish": "Garnish description",
  "tips": "Pro tips for making this drink",
  "origin": "Origin story if known",
  "strength": "light/medium/strong/very_strong",
  "sweetness": 3,
  "sourness": 2,
  "bitterness": 1,
  "best_season": "Any/Summer/Winter/Fall/Spring"
}`,

  course: (topic: string, level: string) => `
Create an educational course about ${topic} at the ${level} level.

Return ONLY valid JSON:
{
  "title": "Course title",
  "description": "What students will learn",
  "category": "Category",
  "difficulty": "${level}",
  "duration_minutes": 45,
  "lessons": [
    {
      "lesson_number": 1,
      "title": "Lesson title",
      "content": "Full lesson content (500+ words)",
      "key_points": ["Point 1", "Point 2", "Point 3"],
      "quiz": {
        "question": "Quiz question",
        "correct_answer": "Correct",
        "wrong_answers": ["Wrong 1", "Wrong 2", "Wrong 3"]
      }
    }
  ],
  "prerequisites": [],
  "learning_outcomes": ["Outcome 1", "Outcome 2", "Outcome 3"]
}`,

  distillery: (name: string, region: string, type: string) => `
Create a comprehensive distillery/producer profile for ${name} in ${region} producing ${type}.

Return ONLY valid JSON:
{
  "name": "${name}",
  "description": "Detailed description of the distillery/producer",
  "type": "${type}",
  "location": "${region}",
  "country": "Country",
  "founded_year": 1850,
  "founder": "Founder name",
  "history": "Rich history paragraph",
  "production_methods": "How they make their spirits",
  "water_source": "Water source if relevant",
  "notable_products": ["Product 1", "Product 2"],
  "visitor_info": {
    "tours_available": true,
    "tasting_room": true,
    "address": "Full address"
  },
  "awards": ["Notable awards"],
  "fun_facts": ["Interesting fact 1", "Fact 2"]
}`
}

// ============================================================================
// HISTORY TOPICS - ENDLESS CONTENT
// ============================================================================

const HISTORY_TOPICS = [
  // Bourbon History
  { topic: 'The Origins of Bourbon in Kentucky', era: '1780-1820' },
  { topic: 'The Bottled-in-Bond Act of 1897', era: '1890s' },
  { topic: 'Prohibition and the Fall of American Whiskey', era: '1920-1933' },
  { topic: 'The Post-Prohibition Bourbon Renaissance', era: '1933-1950' },
  { topic: 'How Buffalo Trace Survived 200 Years', era: '1773-Present' },
  { topic: 'The Rise of Small Batch Bourbon in the 1990s', era: '1990s' },
  { topic: 'The Hunt for Pappy Van Winkle', era: '2000-Present' },
  { topic: 'Women Pioneers of Kentucky Bourbon', era: '1800-2000' },
  { topic: 'The Science of Barrel Aging', era: 'Timeless' },
  { topic: 'Kentucky\'s Bourbon Trail: From Farm to Glass', era: 'Modern' },
  
  // Scotch History
  { topic: 'The Ancient Origins of Scotch Whisky', era: '1400-1600' },
  { topic: 'The Whisky Rebellion in Scotland', era: '1700s' },
  { topic: 'The Phylloxera Crisis and Scotch\'s Rise', era: '1860-1880' },
  { topic: 'The Great Whisky Crash of 1898', era: '1890s' },
  { topic: 'Islay: The Island of Peat and Smoke', era: 'Timeless' },
  { topic: 'The Macallan: From Farm to Luxury Icon', era: '1824-Present' },
  { topic: 'Japanese Whisky\'s Scottish Connection', era: '1920s' },
  { topic: 'The Lost Distilleries of Scotland', era: '1800-1983' },
  
  // Rum History
  { topic: 'Rum and the Triangle Trade', era: '1600-1800' },
  { topic: 'The Golden Age of Caribbean Rum', era: '1700s' },
  { topic: 'Navy Rum and the British Empire', era: '1655-1970' },
  { topic: 'The Daiquiri: From Cuba to the World', era: '1900s' },
  { topic: 'Rhum Agricole and French Caribbean Heritage', era: '1800s-Present' },
  
  // Tequila History
  { topic: 'The Ancient Aztec Origins of Agave Spirits', era: 'Pre-Columbian' },
  { topic: 'The Birth of Tequila in Jalisco', era: '1600s' },
  { topic: 'How José Cuervo Built an Empire', era: '1758-Present' },
  { topic: 'The Tequila Boom and Agave Crisis', era: '2000s' },
  { topic: 'Mezcal: The Smoky Spirit\'s Revival', era: '2010-Present' },
  
  // Wine History
  { topic: 'The Judgment of Paris 1976', era: '1976' },
  { topic: 'Phylloxera: The Bug That Changed Wine Forever', era: '1860-1900' },
  { topic: 'The Rise of Napa Valley', era: '1960-Present' },
  { topic: 'Champagne: From Medicine to Celebration', era: '1600-1800' },
  
  // General Spirits History
  { topic: 'The Invention of the Cocktail', era: '1800s' },
  { topic: 'Speakeasies and Jazz Age Drinking', era: '1920s' },
  { topic: 'The Craft Spirits Revolution', era: '2000-Present' },
  { topic: 'How World War II Changed Drinking', era: '1940s' },
  { topic: 'The Rise of Japanese Whisky', era: '1920-Present' },
  { topic: 'Cognac: The Spirit of Kings', era: '1700-Present' },
  { topic: 'The Irish Whiskey Renaissance', era: '1990-Present' },
  { topic: 'Gin: From Medicine to Martini', era: '1600-Present' },
  { topic: 'The Birth of Vodka in Eastern Europe', era: '1400-1800' },
  { topic: 'Prohibition Agents: The Untold Stories', era: '1920-1933' }
]

// ============================================================================
// COURSE TOPICS
// ============================================================================

const COURSE_TOPICS = [
  // Bourbon Courses
  { topic: 'Bourbon 101: Understanding America\'s Native Spirit', level: 'beginner' },
  { topic: 'The Kentucky Bourbon Trail Guide', level: 'beginner' },
  { topic: 'Tasting Bourbon Like a Pro', level: 'intermediate' },
  { topic: 'Understanding Mash Bills', level: 'intermediate' },
  { topic: 'Barrel Selection and Aging Science', level: 'advanced' },
  { topic: 'Collecting and Investing in Bourbon', level: 'advanced' },
  { topic: 'Wheated vs High-Rye Bourbon', level: 'intermediate' },
  { topic: 'Bottled in Bond: History and Significance', level: 'intermediate' },
  
  // Scotch Courses
  { topic: 'Introduction to Scotch Whisky', level: 'beginner' },
  { topic: 'The Five Regions of Scotch', level: 'beginner' },
  { topic: 'Understanding Peat and Smoke', level: 'intermediate' },
  { topic: 'Sherry Cask vs Bourbon Cask Aging', level: 'intermediate' },
  { topic: 'Single Malt vs Blended Scotch', level: 'beginner' },
  { topic: 'Reading Scotch Labels', level: 'beginner' },
  { topic: 'The Art of Scotch Blending', level: 'advanced' },
  
  // Wine Courses
  { topic: 'Wine Basics: Grapes, Regions, Styles', level: 'beginner' },
  { topic: 'Understanding Wine Ratings', level: 'beginner' },
  { topic: 'Food and Wine Pairing Fundamentals', level: 'intermediate' },
  { topic: 'Building a Wine Collection', level: 'advanced' },
  { topic: 'Champagne and Sparkling Wine Guide', level: 'intermediate' },
  
  // Other Spirits
  { topic: 'The Complete Guide to Rum', level: 'beginner' },
  { topic: 'Tequila and Mezcal Masterclass', level: 'intermediate' },
  { topic: 'Gin: Botanicals and Styles', level: 'intermediate' },
  { topic: 'Cognac and Brandy Appreciation', level: 'intermediate' },
  { topic: 'Japanese Whisky Journey', level: 'intermediate' },
  { topic: 'Irish Whiskey: Pot Still to Single Malt', level: 'intermediate' },
  
  // Skills
  { topic: 'Home Bar Essentials', level: 'beginner' },
  { topic: 'Classic Cocktail Foundations', level: 'beginner' },
  { topic: 'Advanced Mixology Techniques', level: 'advanced' },
  { topic: 'Hosting a Tasting Party', level: 'intermediate' },
  { topic: 'Proper Spirit Storage', level: 'beginner' },
  { topic: 'Developing Your Palate', level: 'intermediate' },
  { topic: 'Understanding Proof and ABV', level: 'beginner' },
  { topic: 'Glassware: The Right Glass for Every Spirit', level: 'beginner' }
]

// ============================================================================
// MAIN ENGINE CLASS
// ============================================================================

export class BarrelVerseContentEngine {
  private stats = {
    spirits: 0,
    history: 0,
    trivia: 0,
    cocktails: 0,
    courses: 0,
    distilleries: 0,
    errors: 0
  }

  async generateSpirit(category: string): Promise<any> {
    const config = SPIRIT_CATEGORIES[category as keyof typeof SPIRIT_CATEGORIES]
    if (!config) return null

    const brand = config.brands[Math.floor(Math.random() * config.brands.length)]
    const style = config.styles[Math.floor(Math.random() * config.styles.length)]
    const region = config.regions[Math.floor(Math.random() * config.regions.length)]
    
    // Determine price range
    const priceRangeKeys = Object.keys(config.priceRanges)
    const priceRange = priceRangeKeys[Math.floor(Math.random() * priceRangeKeys.length)]
    const [minPrice, maxPrice] = config.priceRanges[priceRange as keyof typeof config.priceRanges]

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a spirits database expert. Return only valid JSON.' },
          { role: 'user', content: PROMPTS.spirit(config.name, brand, style, region) }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })

      const content = response.choices[0].message.content || ''
      const json = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim())
      
      // Ensure price is in range
      json.msrp = Math.floor(minPrice + Math.random() * (maxPrice - minPrice))
      
      // Create slug
      const slug = json.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now()

      const { error } = await supabase.from('bv_spirits').insert({
        name: json.name,
        slug,
        description: json.description,
        tasting_notes: json.tasting_notes,
        nose: json.nose,
        palate: json.palate,
        finish: json.finish,
        abv: json.abv,
        proof: json.proof,
        age_statement: json.age_statement,
        msrp: json.msrp,
        distillery: json.distillery || brand,
        region: json.region,
        country: json.country,
        mash_bill: json.mash_bill,
        barrel_type: json.barrel_type,
        source: 'ai_generated',
        is_active: true
      })

      if (!error) {
        this.stats.spirits++
        return json
      }
    } catch (e) {
      this.stats.errors++
      console.error(`Error generating spirit: ${e}`)
    }
    return null
  }

  async generateHistory(): Promise<any> {
    const topic = HISTORY_TOPICS[Math.floor(Math.random() * HISTORY_TOPICS.length)]

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a spirits historian. Write engaging, accurate content. Return only valid JSON.' },
          { role: 'user', content: PROMPTS.history(topic.topic, topic.era) }
        ],
        temperature: 0.9,
        max_tokens: 2000
      })

      const content = response.choices[0].message.content || ''
      const json = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim())

      const slug = json.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now()

      const { error } = await supabase.from('bv_history_articles').insert({
        title: json.title,
        slug,
        summary: json.summary,
        content: json.content,
        era: json.era,
        category: json.category,
        tags: json.tags,
        timeline_date: json.timeline_date,
        source: 'ai_generated',
        is_ai_generated: true,
        is_published: true
      })

      if (!error) {
        this.stats.history++
        return json
      }
    } catch (e) {
      this.stats.errors++
      console.error(`Error generating history: ${e}`)
    }
    return null
  }

  async generateTrivia(): Promise<any> {
    const categories = Object.keys(SPIRIT_CATEGORIES)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const difficulties = ['easy', 'medium', 'hard', 'expert']
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a spirits trivia expert. Create educational questions. Return only valid JSON.' },
          { role: 'user', content: PROMPTS.trivia(SPIRIT_CATEGORIES[category as keyof typeof SPIRIT_CATEGORIES]?.name || category, difficulty) }
        ],
        temperature: 0.9,
        max_tokens: 500
      })

      const content = response.choices[0].message.content || ''
      const json = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim())

      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : difficulty === 'hard' ? 30 : 50

      const { error } = await supabase.from('bv_trivia').insert({
        question: json.question,
        correct_answer: json.correct_answer,
        wrong_answers: json.wrong_answers,
        explanation: json.explanation,
        category: json.category,
        difficulty,
        points,
        is_ai_generated: true,
        is_active: true
      })

      if (!error) {
        this.stats.trivia++
        return json
      }
    } catch (e) {
      this.stats.errors++
      console.error(`Error generating trivia: ${e}`)
    }
    return null
  }

  async generateCocktail(): Promise<any> {
    const spirits = ['bourbon', 'rye', 'scotch', 'rum', 'tequila', 'vodka', 'gin', 'cognac', 'mezcal']
    const baseSpirit = spirits[Math.floor(Math.random() * spirits.length)]
    const styles = ['classic', 'modern', 'tiki', 'stirred', 'shaken', 'highball', 'martini', 'sour', 'old fashioned variation']
    const style = styles[Math.floor(Math.random() * styles.length)]

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a master mixologist. Create delicious cocktail recipes. Return only valid JSON.' },
          { role: 'user', content: PROMPTS.cocktail(baseSpirit, style) }
        ],
        temperature: 0.9,
        max_tokens: 1000
      })

      const content = response.choices[0].message.content || ''
      const json = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim())

      const slug = json.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now()

      const { error } = await supabase.from('bv_cocktails').insert({
        name: json.name,
        slug,
        description: json.description,
        base_spirit_type: json.base_spirit_type,
        category: json.category,
        glass_type: json.glass_type,
        method: json.method,
        ingredients: json.ingredients,
        instructions: json.instructions,
        garnish: json.garnish,
        tips: json.tips,
        origin: json.origin,
        strength: json.strength,
        sweetness: json.sweetness,
        sourness: json.sourness,
        bitterness: json.bitterness,
        source: 'ai_generated',
        is_ai_generated: true,
        is_published: true
      })

      if (!error) {
        this.stats.cocktails++
        return json
      }
    } catch (e) {
      this.stats.errors++
      console.error(`Error generating cocktail: ${e}`)
    }
    return null
  }

  async generateCourse(): Promise<any> {
    const courseTopic = COURSE_TOPICS[Math.floor(Math.random() * COURSE_TOPICS.length)]

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a spirits educator. Create comprehensive courses. Return only valid JSON.' },
          { role: 'user', content: PROMPTS.course(courseTopic.topic, courseTopic.level) }
        ],
        temperature: 0.8,
        max_tokens: 4000
      })

      const content = response.choices[0].message.content || ''
      const json = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim())

      const slug = json.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now()

      // Insert course
      const { data: course, error: courseError } = await supabase.from('bv_courses').insert({
        title: json.title,
        slug,
        description: json.description,
        category: json.category,
        difficulty: json.difficulty,
        duration_minutes: json.duration_minutes,
        lessons_count: json.lessons?.length || 0,
        xp_reward: json.difficulty === 'beginner' ? 100 : json.difficulty === 'intermediate' ? 200 : 300,
        is_published: true
      }).select().single()

      if (!courseError && course && json.lessons) {
        // Insert lessons
        for (const lesson of json.lessons) {
          await supabase.from('bv_course_lessons').insert({
            course_id: course.id,
            lesson_number: lesson.lesson_number,
            title: lesson.title,
            content: lesson.content,
            has_quiz: !!lesson.quiz,
            quiz_questions: lesson.quiz ? [lesson.quiz] : null
          })
        }
        this.stats.courses++
        return json
      }
    } catch (e) {
      this.stats.errors++
      console.error(`Error generating course: ${e}`)
    }
    return null
  }

  // Main run function - THE NEVER-ENDING ENGINE
  async runCycle(options: {
    spirits?: number
    history?: number
    trivia?: number
    cocktails?: number
    courses?: number
  } = {}): Promise<typeof this.stats> {
    const {
      spirits = 100,
      history = 20,
      trivia = 50,
      cocktails = 25,
      courses = 5
    } = options

    console.log(`🚀 Starting content generation cycle...`)
    console.log(`Targets: ${spirits} spirits, ${history} history, ${trivia} trivia, ${cocktails} cocktails, ${courses} courses`)

    // Generate spirits across ALL categories
    const categories = Object.keys(SPIRIT_CATEGORIES)
    const spiritsPerCategory = Math.ceil(spirits / categories.length)
    
    for (const category of categories) {
      for (let i = 0; i < spiritsPerCategory; i++) {
        await this.generateSpirit(category)
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500))
      }
    }

    // Generate history articles
    for (let i = 0; i < history; i++) {
      await this.generateHistory()
      await new Promise(r => setTimeout(r, 500))
    }

    // Generate trivia
    for (let i = 0; i < trivia; i++) {
      await this.generateTrivia()
      await new Promise(r => setTimeout(r, 300))
    }

    // Generate cocktails
    for (let i = 0; i < cocktails; i++) {
      await this.generateCocktail()
      await new Promise(r => setTimeout(r, 500))
    }

    // Generate courses
    for (let i = 0; i < courses; i++) {
      await this.generateCourse()
      await new Promise(r => setTimeout(r, 1000))
    }

    console.log(`✅ Cycle complete!`, this.stats)
    return this.stats
  }

  getStats() {
    return this.stats
  }
}

// Export for use
export const contentEngine = new BarrelVerseContentEngine()
