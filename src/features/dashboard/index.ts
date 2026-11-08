import { lazy } from 'react';

export { ProjectOverview } from './ProjectOverview';
export { ShiftRecords } from './ShiftRecords';

/** The chart library is large, so it downloads only when the chart is shown. */
export const ProgressChart = lazy(() => import('./ProgressChart').then((m) => ({ default: m.ProgressChart })));
