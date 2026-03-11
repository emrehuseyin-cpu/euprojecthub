# PostHog Analytics Setup Report

**Project:** EUProjectHub
**Date:** 2026-03-09
**PostHog Project ID:** 336048
**Region:** US (`https://us.i.posthog.com`)

---

## Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| SDK (`posthog-js`) | ✅ Installed | v1.359.1 |
| `CSPostHogProvider` | ✅ Active | Wraps app in `app/layout.tsx` |
| Reverse proxy | ✅ Configured | `/ingest/*` → `https://us.i.posthog.com/*` |
| Page view tracking | ✅ Active | Manual capture via `PostHogPageView` component |
| Exception capture | ✅ Active | `capture_exceptions: true` |
| User identification | ✅ Active | `posthog.identify()` on login |
| Env vars | ✅ Set | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |

---

## Tracked Events

| Event | File | Properties | Status |
|-------|------|------------|--------|
| `user_logged_in` | `app/login/page.tsx` | `email`, `name` | ✅ Added |
| `login_failed` | `app/login/page.tsx` | `error` | ✅ Added |
| `ai_mode_changed` | `app/ai-asistan/page.tsx` | `new_mode`, `previous_mode` | ✅ Added |
| `ai_chat_cleared` | `app/ai-asistan/page.tsx` | `mode` | ✅ Added |
| `project_viewed` | `app/projeler/[id]/page.tsx` | `project_id` | ✅ Added |
| `project_created` | `app/projeler/yeni/page.tsx` | — | Pre-existing |
| `contract_created` | `app/sozlesmeler/yeni/page.tsx` | — | Pre-existing |
| `participant_added` | `app/katilimcilar/yeni/page.tsx` | — | Pre-existing |
| `activity_created` | `app/faaliyetler/yeni/page.tsx` | — | Pre-existing |
| `partner_added` | `app/ortaklar/yeni/page.tsx` | — | Pre-existing |
| `budget_item_added` | `app/butce/yeni/page.tsx` | — | Pre-existing |
| `report_generated` | `app/raporlar/yeni/page.tsx` | — | Pre-existing |
| `feedback_submitted` | `app/components/FeedbackButton.tsx` | `type` | Pre-existing |
| `ai_message_sent` | `app/ai-asistan/page.tsx` | `mode` | Pre-existing |
| `$pageview` | `app/providers.tsx` | `$current_url` | Auto-captured |

---

## Files Modified

| File | Change |
|------|--------|
| `app/providers.tsx` | Updated `ui_host` to US region; added `capture_exceptions: true` |
| `next.config.ts` | Updated proxy destinations to US region; added `skipTrailingSlashRedirect: true` |
| `app/login/page.tsx` | Added `posthog.identify()` + `user_logged_in` / `login_failed` events |
| `app/ai-asistan/page.tsx` | Added `ai_mode_changed` and `ai_chat_cleared` events |
| `app/projeler/[id]/page.tsx` | Added `project_viewed` event on mount |
| `.env.local` | Set `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` |

---

## Dashboard

**Name:** Analytics basics
**URL:** https://us.posthog.com/project/336048/dashboard/1342897

### Insights

| # | Name | URL |
|---|------|-----|
| 1 | Login Success vs Failure | https://us.posthog.com/project/336048/insights/8OprHEoG |
| 2 | Content Creation Activity | https://us.posthog.com/project/336048/insights/4dWO386H |
| 3 | Project View to Creation Funnel | https://us.posthog.com/project/336048/insights/Q1mkwKX9 |
| 4 | AI Assistant Usage by Mode | https://us.posthog.com/project/336048/insights/poYx7zR1 |
| 5 | Feedback Submissions by Type | https://us.posthog.com/project/336048/insights/VQfpJ5Dx |
