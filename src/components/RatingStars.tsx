"use client";

interface RatingStarsProps {
  value: number | null;
  onRate?: (rating: number) => void;
  disabled?: boolean;
}

export default function RatingStars({ value, onRate, disabled }: RatingStarsProps) {
  const stars = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap gap-0.5" role="group" aria-label="Rating out of 10">
      {stars.map((n) => {
        const filled = value !== null && n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled || !onRate}
            onClick={() => onRate?.(n)}
            title={`Rate ${n}/10`}
            className={`h-5 w-5 text-lg leading-none transition ${
              filled ? "text-spice" : "text-dune/30"
            } ${onRate && !disabled ? "cursor-pointer hover:text-spice/70" : "cursor-default"}`}
          >
            ★
          </button>
        );
      })}
      <span className="ml-2 text-xs text-dune">{value ? `${value}/10` : "Not rated"}</span>
    </div>
  );
}
