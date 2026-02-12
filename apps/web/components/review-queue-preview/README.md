# ReviewQueuePreview Component

## Description
A document preview component that displays PDF or image files from review queue items.

## Features
- Shows document preview (PDF via iframe, images via img tag)
- Empty state when no item is selected
- Bounding box toggle button (for future PDF.js implementation)
- Displays filename and document type
- Handles multiple file types gracefully

## Props
```typescript
interface ReviewQueuePreviewProps {
  item?: ReviewQueueItem | null;
}
```

## Usage
```tsx
import ReviewQueuePreview from "@/components/review-queue-preview";

<ReviewQueuePreview item={selectedItem} />
```

## Supported File Types
- PDF: Displayed via iframe (simple implementation, PDF.js integration planned)
- Images: JPG, JPEG, PNG, GIF, WEBP
- Other: Shows "Preview not available" message with download link

## Future Enhancements
- PDF.js integration for better PDF rendering
- Bounding box visualization for extracted fields
- Zoom and pan controls
- Page navigation for multi-page documents
