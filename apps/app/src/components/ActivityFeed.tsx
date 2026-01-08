"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { ActivityCard } from "./ActivityCard";
import Link from "next/link";

export function ActivityFeed() {
  const { status, activities } = useWebSocket();

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Connection Error";
    }
  };

  const resultsHint =
    activities.length === 0
      ? ""
      : `Showing ${activities.length} recent ${
          activities.length === 1 ? "activity" : "activities"
        }`;

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SeaPay Webhooks</p>
          <h1>Webhook Activity Feed</h1>
          <p className="lede">
            Real-time blockchain transaction events from ETH Sepolia
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/receive"
            style={{
              color: 'var(--color-blue-600)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Filtered Monitor →
          </Link>
          <div className="hero-badge">
            <span className="pulse" />
            <span>{getStatusText()}</span>
          </div>
        </div>
      </header>

      <section className="panel">
        <div className="status" role="status" aria-live="polite">
          <div className="status-row">
            <span className="status-label">Status</span>
            <span>{getStatusText()}</span>
          </div>
          <div className="status-row">
            <span className="status-label">Activities</span>
            <span>{activities.length}</span>
          </div>
          <div className="status-row">
            <span className="status-label">Network</span>
            <span>ETH Sepolia</span>
          </div>
        </div>

        {status === "disconnected" && (
          <div className="status status-warning" role="status" aria-live="polite">
            <div className="status-row">
              <span className="status-label">Notice</span>
              <span>Connecting to webhook server...</span>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="status status-error" role="status" aria-live="polite">
            <div className="status-row">
              <span className="status-label">Error</span>
              <span>
                Failed to connect to webhook server. Make sure the server is
                running on port 3001.
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="results">
        <div className="results-header">
          <h2>Activity</h2>
          {resultsHint ? <p className="muted">{resultsHint}</p> : null}
        </div>
        <div className="results-list">
          {activities.length === 0 ? (
            <div className="tx-card empty-state">
              <h3>No activities yet</h3>
              <p className="muted">Waiting for webhook events to arrive...</p>
              {status === "connected" && (
                <p className="muted small">
                  Send a POST request to http://localhost:3001/webhook to test
                </p>
              )}
            </div>
          ) : (
            activities.map((activity, index) => (
              <ActivityCard
                key={`${activity.hash}-${index}`}
                activity={activity}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
