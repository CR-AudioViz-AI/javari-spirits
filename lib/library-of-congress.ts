/**
 * Javari Barrels - Library of Congress & Chronicling America Integration
 * 
 * Provides historical content, newspaper archives, photos, and documents
 * for museum mode and "Today in Spirits History"
 * 
 * https://www.loc.gov/apis/
 * https://chroniclingamerica.loc.gov/
 */

export interface LOCSearchResult {
  id: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  subjects: string[];
  url: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  type: 'newspaper' | 'photo' | 'document' | 'audio' | 'video' | 'map' | 'other';
  source: string;
  rights?: string;
}

export interface NewspaperPage {
  id: string;
  title: string;
  date: string;
  edition?: string;
  city?: string;
  state?: string;
  pageNumber?: string;
  url: string;
  pdfUrl?: string;
  jp2Url?: string;
  ocrText?: string;
  thumbnailUrl: string;
}

// Prohibition-era search queries
export const PROHIBITION_SEARCH_TERMS = [
  'prohibition raid',
  'bootlegger arrested',
  'speakeasy closed',
  'rum runner',
  'moonshine still',
  'Volstead Act violation',
  'Al Capone alcohol',
  'temperance movement',
  'whiskey smuggling',
  'federal agents alcohol',
  'prohibition enforcement',
  '18th amendment',
  '21st amendment',
  'dry law',
  'liquor seizure'
];

// Spirit history search terms
export const SPIRIT_HISTORY_TERMS = [
  'bourbon whiskey history',
  'scotch whisky distillery',
  'rum Caribbean',
  'gin London',
  'tequila Mexico',
  'cognac France',
  'vodka Russia',
  'sake Japan',
  'distillery fire',
  'whiskey rebellion',
  'rum trade',
  'brandy California'
];

const LOC_BASE_URL = 'https://www.loc.gov';
const CHRONICLING_AMERICA_BASE = 'https://chroniclingamerica.loc.gov';

/**
 * Search Library of Congress collections
 */
export async function searchLOC(
  query: string,
  options: {
    limit?: number;
    page?: number;
    format?: string[];
    dateRange?: { start: string; end: string };
  } = {}
): Promise<LOCSearchResult[]> {
  const { limit = 25, page = 1, format, dateRange } = options;
  
  const params = new URLSearchParams({
    q: query,
    fo: 'json',
    c: limit.toString(),
    sp: page.toString()
  });
  
  if (format?.length) {
    params.set('fa', format.map(f => `original_format:${f}`).join('|'));
  }
  
  if (dateRange) {
    params.set('dates', `${dateRange.start}/${dateRange.end}`);
  }

  const response = await fetch(`${LOC_BASE_URL}/search/?${params}`, {
    headers: {
      'User-Agent': 'Javari Spirits/1.0 (https://javarispirits.com)'
    }
  });

  if (!response.ok) {
    throw new Error(`LOC search failed: ${response.status}`);
  }

  const data = await response.json();
  
  return (data.results || []).map(parseLocResult);
}

/**
 * Parse LOC search result
 */
function parseLocResult(item: any): LOCSearchResult {
  const getType = (formats: string[] = []): LOCSearchResult['type'] => {
    const formatStr = formats.join(' ').toLowerCase();
    if (formatStr.includes('newspaper')) return 'newspaper';
    if (formatStr.includes('photo') || formatStr.includes('image')) return 'photo';
    if (formatStr.includes('audio')) return 'audio';
    if (formatStr.includes('video') || formatStr.includes('film')) return 'video';
    if (formatStr.includes('map')) return 'map';
    if (formatStr.includes('document') || formatStr.includes('manuscript')) return 'document';
    return 'other';
  };

  return {
    id: item.id || item.url,
    title: item.title || 'Untitled',
    description: item.description?.join(' ') || item.notes?.join(' '),
    date: item.date,
    location: item.location?.join(', '),
    subjects: item.subject || [],
    url: item.url || item.id,
    imageUrl: item.image_url?.[0],
    thumbnailUrl: item.image_url?.[0]?.replace(/\/(full|pct:\d+)\//, '/!200,200/'),
    type: getType(item.original_format),
    source: 'Library of Congress',
    rights: item.rights
  };
}

/**
 * Search Chronicling America historic newspapers
 */
export async function searchNewspapers(
  query: string,
  options: {
    state?: string;
    dateStart?: string;  // YYYY-MM-DD
    dateEnd?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{
  items: NewspaperPage[];
  totalItems: number;
  pages: number;
}> {
  const { state, dateStart, dateEnd, page = 1, pageSize = 20 } = options;
  
  const params = new URLSearchParams({
    andtext: query,
    format: 'json',
    page: page.toString()
  });
  
  if (state) params.set('state', state);
  if (dateStart) params.set('date1', dateStart.replace(/-/g, ''));
  if (dateEnd) params.set('date2', dateEnd.replace(/-/g, ''));

  const response = await fetch(
    `${CHRONICLING_AMERICA_BASE}/search/pages/results/?${params}`,
    {
      headers: {
        'User-Agent': 'Javari Spirits/1.0 (https://javarispirits.com)'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Chronicling America search failed: ${response.status}`);
  }

  const data = await response.json();
  
  const items = (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    edition: item.edition,
    city: item.city,
    state: item.state,
    pageNumber: item.sequence?.toString(),
    url: item.url,
    pdfUrl: item.pdf,
    jp2Url: item.jp2,
    ocrText: item.ocr_eng,
    thumbnailUrl: item.url?.replace('.json', '/thumbnail.jpg')
  }));

  return {
    items,
    totalItems: data.totalItems || 0,
    pages: Math.ceil((data.totalItems || 0) / pageSize)
  };
}

/**
 * Get newspaper page details
 */
export async function getNewspaperPage(pageUrl: string): Promise<NewspaperPage | null> {
  const response = await fetch(`${pageUrl}.json`, {
    headers: {
      'User-Agent': 'Javari Spirits/1.0 (https://javarispirits.com)'
    }
  });

  if (!response.ok) return null;

  const data = await response.json();
  
  return {
    id: data.url,
    title: data.title?.title || data.title,
    date: data.issue?.date_issued,
    city: data.title?.place_of_publication,
    state: data.title?.state,
    pageNumber: data.sequence?.toString(),
    url: data.url,
    pdfUrl: data.pdf,
    jp2Url: data.jp2,
    ocrText: data.ocr,
    thumbnailUrl: `${data.url}/thumbnail.jpg`
  };
}

/**
 * Search for Prohibition-era content
 */
export async function searchProhibitionContent(
  options: {
    page?: number;
    state?: string;
  } = {}
): Promise<{
  items: NewspaperPage[];
  totalItems: number;
}> {
  // Search for Prohibition-era newspapers (1920-1933)
  const result = await searchNewspapers(
    PROHIBITION_SEARCH_TERMS.slice(0, 5).join(' OR '),
    {
      dateStart: '1920-01-01',
      dateEnd: '1933-12-31',
      page: options.page,
      state: options.state
    }
  );
  
  return result;
}

/**
 * Get "Today in History" content for spirits
 */
export async function getTodayInHistory(
  month: number,
  day: number
): Promise<LOCSearchResult[]> {
  // Search for historical events on this date
  const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  const queries = [
    `prohibition ${dateStr}`,
    `whiskey ${dateStr}`,
    `distillery ${dateStr}`,
    `temperance ${dateStr}`
  ];
  
  const results: LOCSearchResult[] = [];
  
  for (const query of queries) {
    try {
      const items = await searchLOC(query, { limit: 5 });
      results.push(...items);
    } catch (error) {
      console.error(`Failed to search: ${query}`, error);
    }
  }
  
  // Deduplicate
  const seen = new Set<string>();
  return results.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

/**
 * Historical events data (curated list for "Today in Spirits History")
 */
export const SPIRITS_HISTORY_EVENTS = [
  {
    date: '01-17',
    year: 1920,
    title: 'Prohibition Begins in America',
    description: 'The 18th Amendment takes effect at midnight, banning the manufacture, sale, and transportation of alcoholic beverages in the United States.',
    category: 'prohibition',
    significance: 'major'
  },
  {
    date: '12-05',
    year: 1933,
    title: 'Prohibition Ends - 21st Amendment Ratified',
    description: 'Utah becomes the 36th state to ratify the 21st Amendment, officially ending Prohibition after 13 years.',
    category: 'prohibition',
    significance: 'major'
  },
  {
    date: '02-14',
    year: 1929,
    title: "St. Valentine's Day Massacre",
    description: "Seven members of Chicago's North Side Gang are executed, highlighting the violence of Prohibition-era organized crime.",
    category: 'prohibition',
    significance: 'major'
  },
  {
    date: '10-28',
    year: 1919,
    title: 'Volstead Act Passed',
    description: 'Congress passes the National Prohibition Act over President Wilson\'s veto, providing enforcement for the 18th Amendment.',
    category: 'law',
    significance: 'major'
  },
  {
    date: '06-17',
    year: 1931,
    title: 'Al Capone Indicted',
    description: 'Al Capone is indicted on charges of income tax evasion, eventually leading to his imprisonment and the decline of his bootlegging empire.',
    category: 'prohibition',
    significance: 'major'
  },
  {
    date: '09-18',
    year: 1850,
    title: 'First Bourbon Shipped in Barrels',
    description: 'Kentucky distillers begin widespread practice of shipping bourbon in charred oak barrels, contributing to its distinctive flavor.',
    category: 'bourbon',
    significance: 'moderate'
  },
  {
    date: '03-04',
    year: 1791,
    title: 'Whiskey Tax Enacted',
    description: 'The first internal revenue tax in U.S. history is placed on distilled spirits, eventually leading to the Whiskey Rebellion.',
    category: 'whiskey',
    significance: 'major'
  },
  {
    date: '07-16',
    year: 1794,
    title: 'Whiskey Rebellion Begins',
    description: 'Western Pennsylvania farmers violently resist federal whiskey taxes, leading President Washington to send militia.',
    category: 'whiskey',
    significance: 'major'
  },
  {
    date: '05-23',
    year: 1934,
    title: 'Bonnie and Clyde Killed',
    description: 'The famous outlaws, who rose to prominence during Prohibition, are killed in a police ambush in Louisiana.',
    category: 'prohibition',
    significance: 'moderate'
  },
  {
    date: '08-15',
    year: 1964,
    title: 'Bourbon Declared American Spirit',
    description: 'Congress declares bourbon whiskey to be a "distinctive product of the United States."',
    category: 'bourbon',
    significance: 'major'
  }
];

/**
 * Get curated history event for today
 */
export function getTodaysCuratedEvent(): typeof SPIRITS_HISTORY_EVENTS[0] | null {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const dateStr = `${month}-${day}`;
  
  return SPIRITS_HISTORY_EVENTS.find(e => e.date === dateStr) || null;
}

/**
 * Get all events for a specific month
 */
export function getEventsForMonth(month: number): typeof SPIRITS_HISTORY_EVENTS {
  const monthStr = month.toString().padStart(2, '0');
  return SPIRITS_HISTORY_EVENTS.filter(e => e.date.startsWith(monthStr));
}
