// Minimal shared types for the standalone client.
//
// In the source monorepo these lived in shared/schema.ts alongside Drizzle/Zod
// table definitions. The client only ever imports these three TYPES (type-only
// imports in 4 files), so we redeclare them here as plain TypeScript to avoid
// dragging drizzle-orm / pg / zod into the browser bundle.
//
// Consumed by:
//   src/features/search/useSearchStream.ts    (ActivityEvent)
//   src/features/universe/UniverseResults.tsx (ActivityEvent, InferredIntent)
//   src/lib/auth.tsx                           (UserProfile)
//   src/lib/store/types.ts                     (InferredIntent, ActivityEvent)

export interface InferredIntent {
  primarySectors: string[];
  adjacentSectors: string[];
  inferredSectors: string[];
  targetGeographies: string[];
  commercialRole: string;
  companySize?: string;
  revenueRange?: string;
  searchRationale: string;
  confidenceScore: number;
  keyInclusions: string[];
  keyExclusions: string[];
  refinementSummary?: string;
}

export interface ActivityEvent {
  id: string;
  type:
    | 'intent_extracted'
    | 'company_found'
    | 'company_enriched'
    | 'adjacent_sector_found'
    | 'executive_found'
    | 'search_complete'
    | 'no_results'
    | 'error'
    | 'status'
    | 'refinement_started';
  message: string;
  timestamp: Date;
  data?: any;
}

// Was `typeof userProfiles.$inferSelect` (Drizzle). Rewritten as a plain
// interface from the user_profiles table columns. `preferences` is jsonb
// (typed `unknown`); nullable text columns are `string | null`.
export interface UserProfile {
  userId: string;
  fullName: string | null;
  jobTitle: string | null;
  phone: string | null;
  avatarUrl: string | null;
  timezone: string | null;
  language: string | null;
  preferences: unknown;
  createdAt: Date;
  updatedAt: Date;
}
