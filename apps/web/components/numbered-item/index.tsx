import React from "react";

interface NumberedItemProps {
  number?: string | number;
  text: string;
  icon?: React.ReactNode;
  className?: string;
}

const NumberedItem: React.FC<NumberedItemProps> = ({
  number,
  text,
  icon,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {number !== undefined ? (
        <div
          className={`flex items-center justify-center w-[18px] h-[18px] rounded-3xl border border-primary flex-shrink-0 ${number === 1 ? "bg-number-circle" : ""}`}
        >
          <span className="text-small text-primary">{number}</span>
        </div>
      ) : icon ? (
        <div className="flex-shrink-0">{icon}</div>
      ) : null}
      <span className="text-body-copy text-dark flex-1">{text}</span>
    </div>
  );
};

export default NumberedItem;
