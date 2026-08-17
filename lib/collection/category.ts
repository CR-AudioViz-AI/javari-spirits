// lib/collection/category.ts — map whatever a human or an API said into a slug
//
// user_bottles.category is a FOREIGN KEY to spirit_categories.slug, not free
// text. A barcode database returns "Whiskies & Spirits > Bourbon", a person
// types "bourbon whiskey", and both must land on 'bourbon' or the insert fails
// with a constraint violation that means nothing to the user.
//
// AN UNRECOGNISED CATEGORY MUST NEVER FAIL AN ADD. Losing a bottle because the
// software could not classify it is the wrong trade every single time — the
// collector knows what it is, and a null category is a small gap they can fix
// later. This returns null rather than guessing wrong or throwing.
//
// The order of the checks matters: bourbon before whiskey, mezcal before
// tequila, cognac before brandy. Every one of those pairs would otherwise
// resolve to the broader category and quietly mislabel the bottle.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026

/** Slugs, in the order they must be tested. Specific before general. */
const RULES: [string, RegExp][] = [
  ['bourbon', /\bbourbon\b/i],
  ['rye', /\brye\b/i],
  ['scotch', /\bscotch\b|\bislay\b|\bspeyside\b|\bhighland\b|\bsingle malt\b/i],
  ['irish', /\birish\b/i],
  ['japanese', /\bjapanese\b|\bnikka\b|\byamazaki\b|\bhakushu\b/i],
  ['canadian', /\bcanadian\b/i],
  ['mezcal', /\bmezcal\b|\bmescal\b/i],
  ['tequila', /\btequila\b|\bagave\b|\banejo\b|\bañejo\b|\breposado\b|\bblanco\b/i],
  ['cognac', /\bcognac\b|\bhennessy\b|\bremy\b|\bcourvoisier\b/i],
  ['brandy', /\bbrandy\b|\barmagnac\b|\bpisco\b|\bcalvados\b/i],
  ['rum', /\brum\b|\brhum\b|\bcacha[çc]a\b/i],
  ['gin', /\bgin\b/i],
  ['vodka', /\bvodka\b/i],
  ['liqueur', /\bliqueur\b|\bamaro\b|\bvermouth\b|\bschnapps\b|\bcordial\b/i],
  ['sake', /\bsake\b|\bjunmai\b|\bginjo\b/i],
  ['wine', /\bwine\b|\bcabernet\b|\bchardonnay\b|\bmerlot\b|\bpinot\b|\briesling\b/i],
  ['beer', /\bbeer\b|\bale\b|\blager\b|\bstout\b|\bipa\b|\bpilsner\b/i],
  // Last: anything still calling itself whisky with no more specific match.
  ['whiskey', /\bwhisk(e)?y\b/i],
]

const SLUGS = new Set(RULES.map(r => r[0]))

/**
 * Resolve free text to a valid slug, or null. Checks the name as well as the
 * category, because "Eagle Rare 10 Year Bourbon" carries the answer even when
 * the category field arrived empty.
 */
export function toCategorySlug(category?: string | null, name?: string | null): string | null {
  const raw = `${category ?? ''} ${name ?? ''}`.trim()
  if (!raw) return null
  // An exact slug was passed straight through — accept it without pattern work.
  const direct = (category ?? '').trim().toLowerCase()
  if (SLUGS.has(direct)) return direct
  for (const [slug, re] of RULES) {
    if (re.test(raw)) return slug
  }
  // Deliberately null rather than a guess. A wrong category is worse than none:
  // it puts the bottle on the wrong shelf and nobody notices.
  return null
}
