/**
 * javari Barrels - Today in Spirits History API
 * 
 * GET /api/history/today - Get today's historical events
 * GET /api/history/date?month=MM&day=DD - Get events for specific date
 * GET /api/history/search?q=query - Search historical content
 */

import { NextRequest, NextResponse } from 'next/server';

// Curated spirits history events
const SPIRITS_HISTORY_EVENTS = [
  {
    date: '01-17',
    year: 1920,
    title: 'Prohibition Begins in America',
    description: 'The 18th Amendment takes effect at midnight, banning the manufacture, sale, and transportation of alcoholic beverages in the United States. The era of speakeasies and bootleggers begins.',
    category: 'prohibition',
    significance: 'landmark',
    image: '/images/history/prohibition-begins.jpg'
  },
  {
    date: '12-05',
    year: 1933,
    title: 'Prohibition Ends - 21st Amendment Ratified',
    description: 'Utah becomes the 36th state to ratify the 21st Amendment, officially ending Prohibition after 13 years. Americans can legally drink again.',
    category: 'prohibition',
    significance: 'landmark',
    image: '/images/history/prohibition-ends.jpg'
  },
  {
    date: '02-14',
    year: 1929,
    title: "St. Valentine's Day Massacre",
    description: "Seven members of Chicago's North Side Gang are executed in a warehouse, highlighting the violence of Prohibition-era organized crime and Al Capone's ruthless control.",
    category: 'prohibition',
    significance: 'major',
    image: '/images/history/valentines-massacre.jpg'
  },
  {
    date: '10-28',
    year: 1919,
    title: 'Volstead Act Passed',
    description: "Congress passes the National Prohibition Act over President Wilson's veto, providing the enforcement mechanism for the 18th Amendment.",
    category: 'law',
    significance: 'major'
  },
  {
    date: '06-17',
    year: 1931,
    title: 'Al Capone Indicted',
    description: "Al Capone is indicted on charges of income tax evasion. The charges would eventually lead to his imprisonment and the decline of his $60 million bootlegging empire.",
    category: 'prohibition',
    significance: 'major'
  },
  {
    date: '08-15',
    year: 1964,
    title: 'Bourbon Declared America\'s Native Spirit',
    description: 'Congress passes a resolution declaring bourbon whiskey to be "a distinctive product of the United States," protecting its name and production standards.',
    category: 'bourbon',
    significance: 'landmark'
  },
  {
    date: '03-04',
    year: 1791,
    title: 'Whiskey Tax Enacted',
    description: 'The first internal revenue tax in U.S. history is placed on distilled spirits, eventually leading to the Whiskey Rebellion in western Pennsylvania.',
    category: 'whiskey',
    significance: 'major'
  },
  {
    date: '07-16',
    year: 1794,
    title: 'Whiskey Rebellion Begins',
    description: 'Western Pennsylvania farmers violently resist federal whiskey taxes, leading President Washington to personally lead 13,000 militia troops to suppress the uprising.',
    category: 'whiskey',
    significance: 'major'
  },
  {
    date: '09-06',
    year: 1860,
    title: 'Jane Wallis Opens First Female-Owned Distillery',
    description: 'Jane Wallis takes over her late husband\'s distillery in Kentucky, becoming one of the first women to own and operate a bourbon distillery in America.',
    category: 'distillery',
    significance: 'moderate'
  },
  {
    date: '11-08',
    year: 1895,
    title: 'Bottled-in-Bond Act Signed',
    description: 'President Grover Cleveland signs the Bottled-in-Bond Act, establishing the first consumer protection law for whiskey and guaranteeing quality standards.',
    category: 'law',
    significance: 'major'
  },
  {
    date: '04-07',
    year: 1933,
    title: 'Beer and Wine Permitted Again',
    description: 'The Cullen-Harrison Act takes effect, allowing the sale of beer and wine with up to 3.2% alcohol, the first legal alcohol sales since Prohibition began.',
    category: 'prohibition',
    significance: 'major'
  },
  {
    date: '05-13',
    year: 1816,
    title: 'Jacob Beam Founds Beam Distillery',
    description: 'Jacob Beam officially establishes his distillery in Kentucky, beginning what would become one of the most famous bourbon dynasties in American history.',
    category: 'distillery',
    significance: 'major'
  },
  {
    date: '06-14',
    year: 1789,
    title: 'Bourbon County, Kentucky Established',
    description: 'Bourbon County is officially established from part of Fayette County, Kentucky. The region would give its name to America\'s most famous whiskey style.',
    category: 'bourbon',
    significance: 'moderate'
  },
  {
    date: '12-15',
    year: 1791,
    title: 'Bill of Rights Ratified',
    description: 'The Bill of Rights is ratified, though it would not protect citizens from the 18th Amendment\'s prohibition of alcohol 128 years later.',
    category: 'law',
    significance: 'moderate'
  },
  {
    date: '01-25',
    year: 1947,
    title: 'Al Capone Dies',
    description: 'Alphonse Gabriel Capone dies in Miami at age 48 from cardiac arrest. The former bootlegging kingpin had been released from prison in 1939 suffering from syphilis.',
    category: 'prohibition',
    significance: 'moderate'
  },
  {
    date: '09-18',
    year: 2018,
    title: 'Tariff Wars Impact Whiskey',
    description: 'European Union tariffs on American whiskey take effect, causing a 20% drop in bourbon exports and significant impact on Kentucky distilleries.',
    category: 'trade',
    significance: 'moderate'
  },
  {
    date: '03-17',
    year: 1762,
    title: 'St. Patrick\'s Day Parade NYC',
    description: 'The first St. Patrick\'s Day parade is held in New York City by Irish soldiers serving in the English military, establishing a tradition intimately connected with Irish whiskey.',
    category: 'culture',
    significance: 'moderate'
  },
  {
    date: '07-04',
    year: 1776,
    title: 'Independence Day & Colonial Rum',
    description: 'The Continental Congress votes to declare independence. Rum, the spirit of the American Revolution, flows freely as patriots celebrate the birth of a nation.',
    category: 'culture',
    significance: 'major'
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'today';
  const month = searchParams.get('month');
  const day = searchParams.get('day');
  const query = searchParams.get('q');

  try {
    switch (action) {
      case 'today': {
        const today = new Date();
        const todayMonth = (today.getMonth() + 1).toString().padStart(2, '0');
        const todayDay = today.getDate().toString().padStart(2, '0');
        const dateStr = `${todayMonth}-${todayDay}`;
        
        const events = SPIRITS_HISTORY_EVENTS.filter(e => e.date === dateStr);
        
        // If no events today, get a random significant event
        if (events.length === 0) {
          const majorEvents = SPIRITS_HISTORY_EVENTS.filter(
            e => e.significance === 'landmark' || e.significance === 'major'
          );
          const randomEvent = majorEvents[Math.floor(Math.random() * majorEvents.length)];
          
          return NextResponse.json({
            today: dateStr,
            events: [],
            featured: {
              ...randomEvent,
              note: 'No events on this day - featuring a landmark moment in spirits history'
            }
          });
        }
        
        return NextResponse.json({
          today: dateStr,
          events
        });
      }

      case 'date': {
        if (!month || !day) {
          return NextResponse.json(
            { error: 'Month and day parameters required' },
            { status: 400 }
          );
        }
        
        const dateStr = `${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const events = SPIRITS_HISTORY_EVENTS.filter(e => e.date === dateStr);
        
        return NextResponse.json({
          date: dateStr,
          events
        });
      }

      case 'month': {
        if (!month) {
          return NextResponse.json(
            { error: 'Month parameter required' },
            { status: 400 }
          );
        }
        
        const monthStr = month.padStart(2, '0');
        const events = SPIRITS_HISTORY_EVENTS.filter(
          e => e.date.startsWith(monthStr)
        );
        
        return NextResponse.json({
          month: monthStr,
          events: events.sort((a, b) => a.date.localeCompare(b.date))
        });
      }

      case 'search': {
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter required' },
            { status: 400 }
          );
        }
        
        const queryLower = query.toLowerCase();
        const events = SPIRITS_HISTORY_EVENTS.filter(e =>
          e.title.toLowerCase().includes(queryLower) ||
          e.description.toLowerCase().includes(queryLower) ||
          e.category.toLowerCase().includes(queryLower)
        );
        
        return NextResponse.json({
          query,
          results: events
        });
      }

      case 'category': {
        const category = searchParams.get('category');
        if (!category) {
          return NextResponse.json(
            { error: 'Category parameter required' },
            { status: 400 }
          );
        }
        
        const events = SPIRITS_HISTORY_EVENTS.filter(
          e => e.category === category.toLowerCase()
        );
        
        return NextResponse.json({
          category,
          events
        });
      }

      case 'all': {
        return NextResponse.json({
          total: SPIRITS_HISTORY_EVENTS.length,
          events: SPIRITS_HISTORY_EVENTS.sort((a, b) => {
            // Sort by date (month-day)
            return a.date.localeCompare(b.date);
          })
        });
      }

      case 'categories': {
        const categories = [...new Set(SPIRITS_HISTORY_EVENTS.map(e => e.category))];
        return NextResponse.json({ categories });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
