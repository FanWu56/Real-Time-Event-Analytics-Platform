import { apiClient } from "./client";
import {
  AnalyticsSummary,
  StoredEvent,
  TimeSeriesPoint,
  TopEvent,
} from "../types/analytics";

export async function fetchSummary(
  projectId: string
): Promise<AnalyticsSummary> {
  const response = await apiClient.get(
    `/api/projects/${projectId}/analytics/summary`
  );

  return response.data.summary;
}

export async function fetchTopEvents(
  projectId: string
): Promise<TopEvent[]> {
  const response = await apiClient.get(
    `/api/projects/${projectId}/analytics/top-events`
  );

  return response.data.events;
}

export async function fetchRecentEvents(
  projectId: string
): Promise<StoredEvent[]> {
  const response = await apiClient.get(
    `/api/projects/${projectId}/analytics/recent-events`
  );

  return response.data.events;
}

export async function fetchTimeSeries(
  projectId: string
): Promise<TimeSeriesPoint[]> {
  const response = await apiClient.get(
    `/api/projects/${projectId}/analytics/timeseries`
  );

  return response.data.points;
}