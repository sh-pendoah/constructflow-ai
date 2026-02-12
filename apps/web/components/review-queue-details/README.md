# ReviewQueueDetails Component

## Description
A details panel component that displays extracted data, exceptions, suggested actions, and provides approve/reject functionality.

## Features
- Shows AI confidence score with visual indicator
- Displays extracted data fields with confidence scores
- Highlights fields with confidence < 0.7 in yellow
- Lists exceptions with severity badges (high/medium/low)
- Shows suggested actions from AI
- Editable fields for making corrections
- Approve button with Y keyboard shortcut
- Reject button with N keyboard shortcut
- Save corrections functionality
- Toast notifications for success/error states

## Props
```typescript
interface ReviewQueueDetailsProps {
  item?: ReviewQueueItem | null;
  onUpdate?: () => void;
}
```

## Usage
```tsx
import ReviewQueueDetails from "@/components/review-queue-details";

<ReviewQueueDetails
  item={selectedItem}
  onUpdate={() => refreshQueue()}
/>
```

## API Endpoints
- `POST /api/review-queue/:id/approve` - Approve a document
- `POST /api/review-queue/:id/reject` - Reject a document
- `POST /api/review-queue/:id/corrections` - Save field corrections

## Keyboard Shortcuts
- `Y` - Approve the document
- `N` - Reject the document

## API Integration
Uses axios with Bearer token from localStorage. All API calls include proper error handling and loading states.
