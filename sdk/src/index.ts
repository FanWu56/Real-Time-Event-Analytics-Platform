export type AnalyticsConfig = {
  apiKey: string;
  endpoint?: string;
  autoTrackPageViews?: boolean;
  debug?: boolean;
};

export type EventProperties = Record<string, unknown>;

type QueuedEvent = {
  eventName: string;
  properties: EventProperties;
  userId?: string;
  timestamp: string;
};

class AnalyticsSDK {
  private apiKey: string | null = null;
  private endpoint = "http://localhost:4000/api/events";
  private userId: string | undefined;
  private debug = false;
  private queue: QueuedEvent[] = [];
  private isReady = false;

  init(config: AnalyticsConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint ?? this.endpoint;
    this.debug = config.debug ?? false;
    this.isReady = true;

    if (config.autoTrackPageViews ?? true) {
      this.trackPageView();
    }

    this.flushQueue();

    this.log("Analytics SDK initialized");
  }

  identify(userId: string) {
    this.userId = userId;
    this.log("User identified", { userId });
  }

  track(eventName: string, properties: EventProperties = {}) {
    const event: QueuedEvent = {
      eventName,
      properties,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    };

    if (!this.isReady || !this.apiKey) {
      this.queue.push(event);
      this.log("Event queued", event);
      return;
    }

    void this.sendEvent(event);
  }

  trackPageView(properties: EventProperties = {}) {
    const pageProperties = {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || null,
      ...properties,
    };

    this.track("page_view", pageProperties);
  }

  trackButtonClick(buttonId: string, properties: EventProperties = {}) {
    this.track("button_click", {
      buttonId,
      ...properties,
    });
  }

  enableAutoClickTracking(attributeName = "data-analytics-event") {
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const element = target.closest(`[${attributeName}]`) as HTMLElement | null;

      if (!element) return;

      const eventName = element.getAttribute(attributeName);

      if (!eventName) return;

      this.track(eventName, {
        text: element.innerText,
        tagName: element.tagName,
        id: element.id || null,
        className: element.className || null,
      });
    });

    this.log("Auto click tracking enabled");
  }

  private async sendEvent(event: QueuedEvent) {
    if (!this.apiKey) {
      this.queue.push(event);
      return;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const body = await response.text();
        this.log("Failed to send event", {
          status: response.status,
          body,
          event,
        });
        return;
      }

      this.log("Event sent", event);
    } catch (error) {
      this.queue.push(event);
      this.log("Network error. Event queued again.", {
        error,
        event,
      });
    }
  }

  private flushQueue() {
    const events = [...this.queue];
    this.queue = [];

    for (const event of events) {
      void this.sendEvent(event);
    }
  }

  private log(message: string, data?: unknown) {
    if (!this.debug) return;

    console.log(`[Analytics SDK] ${message}`, data ?? "");
  }
}

export const analytics = new AnalyticsSDK();
export default analytics;