import React from "react";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    showValue?: boolean;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    size = "md",
    showValue = false,
    interactive = false,
    onRatingChange,
    className,
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    const handleStarClick = (starRating: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(starRating);
        }
    };

    const handleStarHover = (starRating: number) => {
        if (interactive) {
            setHoverRating(starRating);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = interactive ? hoverRating || rating : rating;

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <div className="flex items-center" onMouseLeave={handleMouseLeave}>
                {Array.from({ length: maxRating }, (_, index) => {
                    const starRating = index + 1;
                    const isFilled = starRating <= displayRating;
                    const isHalfFilled =
                        starRating - 0.5 <= displayRating &&
                        displayRating < starRating;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "relative",
                                interactive &&
                                    "cursor-pointer hover:scale-110 transition-transform"
                            )}
                            onClick={() => handleStarClick(starRating)}
                            onMouseEnter={() => handleStarHover(starRating)}
                        >
                            <StarIcon
                                className={cn(
                                    sizeClasses[size],
                                    "transition-colors",
                                    isFilled
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-transparent text-gray-300"
                                )}
                            />
                            {isHalfFilled && (
                                <StarIcon
                                    className={cn(
                                        sizeClasses[size],
                                        "absolute top-0 left-0 fill-yellow-400 text-yellow-400 transition-colors"
                                    )}
                                    style={{
                                        clipPath: "inset(0 50% 0 0)",
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {showValue && (
                <span className="text-sm text-gray-600 ml-1">
                    ({rating.toFixed(1)})
                </span>
            )}
        </div>
    );
};

export default StarRating;
