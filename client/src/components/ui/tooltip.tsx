/**
 * Neobrutalism Tooltip component
 */
import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-50 px-4 py-3 bg-card text-card-foreground border-2 border-border rounded-md shadow-brutal-md transform -translate-x-1/2",
            className
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

interface TooltipCardProps {
  header: string;
  items: string[];
}

export function TooltipCard({ header, items }: TooltipCardProps) {
  return (
    <div className="min-w-[200px]">
      <div className="font-bold text-sm border-b-2 border-border pb-2 mb-2">
        {header}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No items</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={index} className="text-sm">
              • {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
