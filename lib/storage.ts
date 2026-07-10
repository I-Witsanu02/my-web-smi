export interface ObjectStoragePointer {
  bucket: "xrays" | "roi-crops" | "heatmaps" | "reports";
  key: string;
  contentType: string;
}

export const storageBuckets = {
  xrays: "bone-age-xrays",
  "roi-crops": "bone-age-roi-crops",
  heatmaps: "bone-age-xai-heatmaps",
  reports: "bone-age-reports"
} as const;

export function buildStorageKey(caseId: string, artifact: string) {
  return `cases/${caseId}/${artifact}`;
}
