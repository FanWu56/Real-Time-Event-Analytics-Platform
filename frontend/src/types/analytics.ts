export type Project = {
  id: string;
  name: string;
  createdAt: string;
};

export type ApiKey = {
  id: string;
  projectId: string;
  apiKey: string;
  createdAt: string;
};

export type AnalyticsSummary = {
  totalEvents: number;
  uniqueUsers: number;
  eventTypes: number;
  lastEventAt: string | null;
};

export type TopEvent = {
  eventName: string;
  count: number;
};

export type StoredEvent = {
  id: string;
  projectId: string;
  eventName: string;
  userId?: string;
  properties: Record<string, unknown>;
  timestamp: string;
  receivedAt: string;
};

export type TimeSeriesPoint = {
  eventName: string;
  windowStart: string;
  windowEnd: string;
  count: number;
};