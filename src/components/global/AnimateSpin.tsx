export default function Loading() {
  return (
    <div
      className="flex items-center justify-center h-170 w-full p-8"
      role="status"
      aria-label="Loading"
    >
      <svg
        className="h-10 w-10 animate-spin text-ink"
        viewBox="0 0 50 50"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="25" cy="4" r="2" opacity="0.08" />
        <circle cx="35.5" cy="6.8" r="2.5" opacity="0.16" />
        <circle cx="43.2" cy="14.5" r="3" opacity="0.24" />
        <circle cx="46" cy="25" r="3.5" opacity="0.32" />
        <circle cx="43.2" cy="35.5" r="4" opacity="0.48" />
        <circle cx="35.5" cy="43.2" r="4.5" opacity="0.64" />
        <circle cx="25" cy="46" r="5" opacity="0.8" />
        <circle cx="14.5" cy="43.2" r="4.5" opacity="0.9" />
        <circle cx="6.8" cy="35.5" r="4" opacity="1" />
        <circle cx="4" cy="25" r="3.5" opacity="0.9" />
        <circle cx="6.8" cy="14.5" r="3" opacity="0.7" />
        <circle cx="14.5" cy="6.8" r="2.5" opacity="0.4" />
      </svg>

      <span className="sr-only">Loading...</span>
    </div>
  );
}