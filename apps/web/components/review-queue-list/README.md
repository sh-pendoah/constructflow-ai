# ReviewQueueList Component

## Description
A list component that displays review queue items with filtering, searching, and keyboard navigation.

## Features
- Fetches items from `/api/review-queue`
- Filter by document type, status, and priority
- Search by fileName, invoiceNumber, or vendor
- Keyboard navigation (Arrow Up/Down, Tab to cycle)
- Priority badges with color coding:
  - Urgent: Red
  - High: Orange
  - Normal: Blue
  - Low: Gray
- Low confidence indicator (< 0.7)
- Exception count display
- Highlights selected item

## Props
```typescript
interface ReviewQueueListProps {
  selectedItemId?: string;
  onSelectItem: (item: ReviewQueueItem) => void;
}
```

## Usage
```tsx
import ReviewQueueList from "@/components/review-queue-list";

<ReviewQueueList
  selectedItemId={selectedId}
  onSelectItem={(item) => setSelectedItem(item)}
/>
```

## API Integration
Uses axios with Bearer token from localStorage. API base URL from `process.env.NEXT_PUBLIC_API_BASE_URL` or defaults to `http://localhost:3000`.
