/**
 * Javari Barrels - Spirit Image Pipeline
 * 
 * Multi-source image acquisition system that fetches REAL bottle images
 * from Wikidata, Wikimedia Commons, Openverse, and user submissions.
 * 
 * Priority Order:
 * 1. Official/Partner images (licensed)
 * 2. Wikidata/Wikimedia Commons (CC/Public Domain)
 * 3. Openverse (CC-licensed)
 * 4. User submissions (moderated)
 * 5. Category fallback (last resort)
 */

import { adminDb } from '@/lib/supabase/admin';
// Types
export interface SpiritImage {
  id?: string;
  spirit_id: string;
  url: string;
  thumbnail_url?: string;
  source: 'official' | 'wikimedia' | 'openverse' | 'user' | 'partner' | 'generic';
  license: 'cc0' | 'cc-by' | 'cc-by-sa' | 'cc-by-nc' | 'proprietary' | 'user-submitted';
  attribution_required: boolean;
  attribution_text: string | null;
  source_url: string;
  width?: number;
  height?: number;
  format?: string;
  status: 'approved' | 'pending' | 'rejected';
  is_primary: boolean;
}

export interface ImageSearchResult {
  url: string;
  thumbnail_url?: string;
  source: string;
  license: string;
  attribution: string;
  source_url: string;
  width?: number;
  height?: number;
}

// Configuration
const OPENVERSE_API_KEY = process.env.OPENVERSE_API_KEY || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Main Image Pipeline Class
 */
export class SpiritImagePipeline {
  private supabase: any;

  constructor() {
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      this.supabase = adminDb();
    }
  }

  /**
   * Fetch images for a spirit from all available sources
   */
  async fetchImagesForSpirit(
    spiritName: string,
    brand?: string,
    spiritType?: string
  ): Promise<ImageSearchResult[]> {
    const results: ImageSearchResult[] = [];

    // Try each source in priority order
    try {
      // 1. Wikidata/Wikimedia Commons (highest quality, proper licensing)
      const wikimediaImages = await this.searchWikimedia(spiritName, brand);
      results.push(...wikimediaImages);
    } catch (error) {
      console.error('Wikimedia search failed:', error);
    }

    try {
      // 2. Openverse (CC-licensed media)
      const openverseImages = await this.searchOpenverse(spiritName, brand);
      results.push(...openverseImages);
    } catch (error) {
      console.error('Openverse search failed:', error);
    }

    // Deduplicate by URL
    const uniqueResults = this.deduplicateResults(results);

    return uniqueResults;
  }

  /**
   * Search Wikidata for spirit images using SPARQL
   */
  async searchWikidata(spiritName: string): Promise<ImageSearchResult[]> {
    const sparqlQuery = `
      SELECT ?item ?itemLabel ?image WHERE {
        {
          ?item rdfs:label "${spiritName}"@en .
        } UNION {
          ?item skos:altLabel "${spiritName}"@en .
        }
        ?item wdt:P18 ?image .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
      }
      LIMIT 10
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Javari Spirits/1.0 (https://javarispirits.com; contact@craudiovizai.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Wikidata query failed: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results.bindings.map((item: any) => ({
      url: item.image.value,
      source: 'wikimedia',
      license: 'cc0', // Wikimedia Commons default
      attribution: `Image from Wikimedia Commons - ${item.itemLabel?.value || spiritName}`,
      source_url: item.item.value
    }));
  }

  /**
   * Search Wikimedia Commons directly
   */
  async searchWikimedia(spiritName: string, brand?: string): Promise<ImageSearchResult[]> {
    const searchTerms = brand ? `${brand} ${spiritName}` : spiritName;
    
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: `${searchTerms} bottle`,
      srnamespace: '6', // File namespace
      srlimit: '20',
      format: 'json',
      origin: '*'
    });

    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params}`,
      {
        headers: {
          'User-Agent': 'Javari Spirits/1.0 (https://javarispirits.com; contact@craudiovizai.com)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Wikimedia search failed: ${response.status}`);
    }

    const data = await response.json();
    const results: ImageSearchResult[] = [];

    // For each file found, get the image URL
    for (const item of data.query?.search || []) {
      try {
        const imageInfo = await this.getWikimediaImageInfo(item.title);
        if (imageInfo) {
          results.push(imageInfo);
        }
      } catch (error) {
        console.error(`Failed to get image info for ${item.title}:`, error);
      }
    }

    return results;
  }

  /**
   * Get image info from Wikimedia Commons
   */
  async getWikimediaImageInfo(fileTitle: string): Promise<ImageSearchResult | null> {
    const params = new URLSearchParams({
      action: 'query',
      titles: fileTitle,
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      format: 'json',
      origin: '*'
    });

    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params}`,
      {
        headers: {
          'User-Agent': 'Javari Spirits/1.0 (https://javarispirits.com; contact@craudiovizai.com)'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0] as any;

    if (!page?.imageinfo?.[0]) {
      return null;
    }

    const info = page.imageinfo[0];
    const meta = info.extmetadata || {};

    // Determine license
    let license: string = 'cc0';
    const licenseShort = meta.LicenseShortName?.value?.toLowerCase() || '';
    if (licenseShort.includes('cc-by-sa')) {
      license = 'cc-by-sa';
    } else if (licenseShort.includes('cc-by')) {
      license = 'cc-by';
    } else if (licenseShort.includes('public domain') || licenseShort.includes('cc0')) {
      license = 'cc0';
    }

    return {
      url: info.url,
      thumbnail_url: info.thumburl,
      source: 'wikimedia',
      license,
      attribution: meta.Artist?.value || meta.Credit?.value || 'Wikimedia Commons',
      source_url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`,
      width: info.width,
      height: info.height
    };
  }

  /**
   * Search Openverse for CC-licensed images
   */
  async searchOpenverse(spiritName: string, brand?: string): Promise<ImageSearchResult[]> {
    const searchTerms = brand ? `${brand} ${spiritName} bottle` : `${spiritName} bottle whiskey`;
    
    const params = new URLSearchParams({
      q: searchTerms,
      license: 'cc0,by,by-sa', // Only truly free licenses
      mature: 'false',
      page_size: '20'
    });

    const headers: Record<string, string> = {
      'User-Agent': 'Javari Spirits/1.0'
    };

    if (OPENVERSE_API_KEY) {
      headers['Authorization'] = `Bearer ${OPENVERSE_API_KEY}`;
    }

    const response = await fetch(
      `https://api.openverse.org/v1/images/?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Openverse search failed: ${response.status}`);
    }

    const data = await response.json();

    return (data.results || []).map((item: any) => ({
      url: item.url,
      thumbnail_url: item.thumbnail,
      source: 'openverse',
      license: item.license || 'cc-by',
      attribution: item.attribution || item.creator || 'Unknown',
      source_url: item.foreign_landing_url || item.url,
      width: item.width,
      height: item.height
    }));
  }

  /**
   * Save image to database
   */
  async saveImageToDatabase(spiritId: string, image: ImageSearchResult, isPrimary: boolean = false): Promise<SpiritImage | null> {
    if (!this.supabase) {
      console.error('Supabase not initialized');
      return null;
    }

    const imageRecord: Partial<SpiritImage> = {
      spirit_id: spiritId,
      url: image.url,
      thumbnail_url: image.thumbnail_url,
      source: image.source as any,
      license: image.license as any,
      attribution_required: image.license !== 'cc0',
      attribution_text: image.attribution,
      source_url: image.source_url,
      width: image.width,
      height: image.height,
      status: 'approved', // Auto-approve from trusted sources
      is_primary: isPrimary
    };

    const { data, error } = await this.supabase
      .from('spirit_images')
      .insert(imageRecord)
      .select()
      .single();

    if (error) {
      console.error('Failed to save image:', error);
      return null;
    }

    return data;
  }

  /**
   * Fetch and save images for a spirit
   */
  async populateImagesForSpirit(
    spiritId: string,
    spiritName: string,
    brand?: string,
    spiritType?: string
  ): Promise<{ success: boolean; imagesFound: number; imagesSaved: number }> {
    const images = await this.fetchImagesForSpirit(spiritName, brand, spiritType);
    
    let imagesSaved = 0;

    for (let i = 0; i < images.length && i < 5; i++) {
      const saved = await this.saveImageToDatabase(spiritId, images[i], i === 0);
      if (saved) {
        imagesSaved++;
      }
    }

    return {
      success: imagesSaved > 0,
      imagesFound: images.length,
      imagesSaved
    };
  }

  /**
   * Batch process spirits without images
   */
  async batchPopulateImages(limit: number = 100): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    // Get spirits without primary images
    const { data: spirits, error } = await this.supabase
      .from('spirits')
      .select('id, name, brand, spirit_type')
      .is('primary_image_id', null)
      .limit(limit);

    if (error) {
      throw error;
    }

    let successful = 0;
    let failed = 0;

    for (const spirit of spirits || []) {
      try {
        const result = await this.populateImagesForSpirit(
          spirit.id,
          spirit.name,
          spirit.brand,
          spirit.spirit_type
        );

        if (result.success) {
          successful++;
        } else {
          failed++;
        }

        // Rate limiting - be nice to APIs
        await this.sleep(1000);
      } catch (error) {
        console.error(`Failed to process spirit ${spirit.id}:`, error);
        failed++;
      }
    }

    return {
      processed: spirits?.length || 0,
      successful,
      failed
    };
  }

  /**
   * Deduplicate results by URL
   */
  private deduplicateResults(results: ImageSearchResult[]): ImageSearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      if (seen.has(result.url)) {
        return false;
      }
      seen.add(result.url);
      return true;
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const imagePipeline = new SpiritImagePipeline();

// Export convenience functions
export async function fetchSpiritImages(
  spiritName: string,
  brand?: string,
  spiritType?: string
): Promise<ImageSearchResult[]> {
  return imagePipeline.fetchImagesForSpirit(spiritName, brand, spiritType);
}

export async function populateSpiritImages(
  spiritId: string,
  spiritName: string,
  brand?: string,
  spiritType?: string
) {
  return imagePipeline.populateImagesForSpirit(spiritId, spiritName, brand, spiritType);
}

export async function batchPopulateImages(limit?: number) {
  return imagePipeline.batchPopulateImages(limit);
}
