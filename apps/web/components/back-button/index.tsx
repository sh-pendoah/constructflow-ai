import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  href,
  onClick,
  className = "",
}) => {
  const buttonClass =
    "flex items-center justify-center gap-2 p-3 border border-radio-inactive rounded-lg bg-white-custom hover:bg-primary-hover group transition-colors cursor-pointer";

  const content = (
    <>
      <ArrowLeft className="w-5 h-5 text-primary group-hover:text-white" />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${buttonClass} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${buttonClass} ${className}`}
    >
      {content}
    </button>
  );
};

export default BackButton;
