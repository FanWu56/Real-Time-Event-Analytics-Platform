import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  fetchProjectApiKeys,
} from "../api/projects";
import {
  fetchRecentEvents,
  fetchSummary,
  fetchTimeSeries,
  fetchTopEvents,
} from "../api/analytics";
import {
  AnalyticsSummary,
  ApiKey,
  Project,
  StoredEvent,
  TimeSeriesPoint,
  TopEvent,
} from "../types/analytics";

type DashboardPageProps = {
  project: Project;
  onBack: () => void;
};

type LiveEventPayload = {
  projectId: string;
  event: StoredEvent;
};

function formatDateTime(value: string | null) {
  if (!value) return "None";
  return new Date(value).toLocaleString();
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardPage({ project, onBack }: DashboardPageProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<StoredEvent[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [liveEvents, setLiveEvents] = useState<StoredEvent[]>([]);
  const [socketStatus, setSocketStatus] = useState("Disconnected");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [summaryData, topEventsData, recentEventsData, timeSeriesData, keysData] =
        await Promise.all([
          fetchSummary(project.id),
          fetchTopEvents(project.id),
          fetchRecentEvents(project.id),
          fetchTimeSeries(project.id),
          fetchProjectApiKeys(project.id),
        ]);

      setSummary(summaryData);
      setTopEvents(topEventsData);
      setRecentEvents(recentEventsData);
      setTimeSeries(timeSeriesData);
      setApiKeys(keysData);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const socket: Socket = io(import.meta.env.VITE_API_BASE_URL);

    socket.on("connect", () => {
      setSocketStatus("Connected");
      socket.emit("join_project", project.id);
    });

    socket.on("disconnect", () => {
      setSocketStatus("Disconnected");
    });

    socket.on("new_event", (payload: LiveEventPayload) => {
      setLiveEvents((current) => [payload.event, ...current].slice(0, 20));
      loadDashboard();
    });

    return () => {
      socket.emit("leave_project", project.id);
      socket.disconnect();
    };
  }, [project.id, loadDashboard]);

  const chartData = useMemo(() => {
    const grouped = new Map<string, { time: string; count: number }>();

    for (const point of timeSeries) {
      const existing = grouped.get(point.windowStart);

      if (existing) {
        existing.count += point.count;
      } else {
        grouped.set(point.windowStart, {
          time: formatTime(point.windowStart),
          count: point.count,
        });
      }
    }

    return Array.from(grouped.values());
  }, [timeSeries]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="secondary-button" onClick={onBack}>
            ← Back to Projects
          </button>

          <div className="dashboard-title">
            <p className="eyebrow">Dashboard</p>
            <h1>{project.name}</h1>
            <p className="muted">{project.id}</p>
          </div>
        </div>

        <div className="status-pill">
          Live: <strong>{socketStatus}</strong>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {isLoading && <p className="muted">Loading dashboard...</p>}

      <div className="summary-grid">
        <div className="stat-card">
          <span>Total Events</span>
          <strong>{summary?.totalEvents ?? 0}</strong>
        </div>

        <div className="stat-card">
          <span>Unique Users</span>
          <strong>{summary?.uniqueUsers ?? 0}</strong>
        </div>

        <div className="stat-card">
          <span>Event Types</span>
          <strong>{summary?.eventTypes ?? 0}</strong>
        </div>

        <div className="stat-card">
          <span>Last Event</span>
          <strong className="small-stat">
            {formatDateTime(summary?.lastEventAt ?? null)}
          </strong>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <h2>API Keys</h2>
          <span>{apiKeys.length} keys</span>
        </div>

        {apiKeys.length === 0 ? (
          <p className="muted">No API keys found.</p>
        ) : (
          <div className="key-list">
            {apiKeys.map((key) => (
              <code key={key.id}>{key.apiKey}</code>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="section-header">
            <h2>Events Over Time</h2>
            <span>{chartData.length} points</span>
          </div>

          {chartData.length === 0 ? (
            <p className="muted">No time series data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="section-header">
            <h2>Top Events</h2>
            <span>{topEvents.length}</span>
          </div>

          {topEvents.length === 0 ? (
            <p className="muted">No events yet.</p>
          ) : (
            <div className="top-list">
              {topEvents.map((event) => (
                <div className="top-item" key={event.eventName}>
                  <span>{event.eventName}</span>
                  <strong>{event.count}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="section-header">
            <h2>Recent Events</h2>
            <span>{recentEvents.length}</span>
          </div>

          <EventList events={recentEvents} emptyText="No recent events." />
        </div>

        <div className="card live-card">
          <div className="section-header">
            <h2>Live Events</h2>
            <span>{liveEvents.length}</span>
          </div>

          <EventList events={liveEvents} emptyText="Waiting for live events..." />
        </div>
      </div>
    </div>
  );
}

function EventList({
  events,
  emptyText,
}: {
  events: StoredEvent[];
  emptyText: string;
}) {
  if (events.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  return (
    <div className="event-list">
      {events.map((event) => (
        <div className="event-item" key={event.id}>
          <div>
            <strong>{event.eventName}</strong>
            <p>
              user: {event.userId ?? "anonymous"} ·{" "}
              {formatDateTime(event.receivedAt)}
            </p>
          </div>

          <code>{JSON.stringify(event.properties)}</code>
        </div>
      ))}
    </div>
  );
}