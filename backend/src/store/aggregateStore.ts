import { StoredEvent } from "./eventStore";

export type TimeWindowAggregate = {
  projectId: string;
  eventName: string;
  windowStart: string;
  windowEnd: string;
  count: number;
};

const aggregateStore = new Map<string, TimeWindowAggregate>();

const WINDOW_MS = 60 * 1000;

function getMinuteWindow(dateString: string) {
  const date = new Date(dateString);

  const windowStartMs =
    Math.floor(date.getTime() / WINDOW_MS) * WINDOW_MS;

  const windowEndMs = windowStartMs + WINDOW_MS;

  return {
    windowStart: new Date(windowStartMs).toISOString(),
    windowEnd: new Date(windowEndMs).toISOString(),
  };
}

function getAggregateKey(
  projectId: string,
  eventName: string,
  windowStart: string
) {
  return `${projectId}:${eventName}:${windowStart}`;
}

export function recordEventAggregate(event: StoredEvent): TimeWindowAggregate {
  const { windowStart, windowEnd } = getMinuteWindow(event.timestamp);

  const key = getAggregateKey(
    event.projectId,
    event.eventName,
    windowStart
  );

  const existing = aggregateStore.get(key);

  if (existing) {
    existing.count += 1;
    aggregateStore.set(key, existing);
    return existing;
  }

  const aggregate: TimeWindowAggregate = {
    projectId: event.projectId,
    eventName: event.eventName,
    windowStart,
    windowEnd,
    count: 1,
  };

  aggregateStore.set(key, aggregate);

  return aggregate;
}

export function getAggregatesByProject(
  projectId: string
): TimeWindowAggregate[] {
  return Array.from(aggregateStore.values())
    .filter((item) => item.projectId === projectId)
    .sort((a, b) => {
      return (
        new Date(a.windowStart).getTime() -
        new Date(b.windowStart).getTime()
      );
    });
}

export function getAggregatesByProjectAndEventName(
  projectId: string,
  eventName: string
): TimeWindowAggregate[] {
  return getAggregatesByProject(projectId).filter(
    (item) => item.eventName === eventName
  );
}