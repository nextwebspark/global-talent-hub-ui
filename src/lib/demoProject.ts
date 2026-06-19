import { useAppStore } from '@/lib/store';
import { SAMPLE_RETAIL_COMPANIES } from '@/features/landing/fixtures/sampleData';

export const DEMO_PROJECT_ID = 'demo';

/** Load the sample retail globe into the workspace store (landing CTA + /demo/dashboard refresh). */
export function seedDemoProject(): void {
  const { setProject, loadFromAPI } = useAppStore.getState();
  setProject({
    id: DEMO_PROJECT_ID,
    name: 'Sample Retail Globe',
    search_string: 'Global retail companies',
    created_at: new Date(),
  });
  loadFromAPI(SAMPLE_RETAIL_COMPANIES, {}, null, {});
}
