import React from "react";
import RadioCard from "@/components/radio-card";
import Alert from "@/components/alert";

interface GmailAccountSelectionProps {
  gmailAccountType: string;
  onGmailAccountTypeChange: (value: string) => void;
}

const GmailAccountSelection: React.FC<GmailAccountSelectionProps> = ({
  gmailAccountType,
  onGmailAccountTypeChange,
}) => {
  return (
    <div className="w-full flex flex-col gap-8">
      {/* Title Section */}
      <div className="w-full flex flex-col gap-0.5">
        <h1 className="text-h3 text-primary">How Many Gmail Accounts?</h1>
        <p className="text-body-copy text-primary">
          Choose how you want to organize your documents.
        </p>
      </div>

      {/* Options */}
      <div className="w-full flex flex-col gap-3">
        <RadioCard
          label="One Gmail for all documents"
          supportingText="Connect 1 Gmail - we'll auto-classify everything"
          value="one"
          selected={gmailAccountType === "one"}
          onChange={onGmailAccountTypeChange}
        />
        <RadioCard
          label="Separate Gmail per workflow"
          supportingText="Connect multiple Gmail accounts for different document types"
          value="multiple"
          selected={gmailAccountType === "multiple"}
          onChange={onGmailAccountTypeChange}
        />
      </div>

      {/* Recommendation Alert */}
      <Alert
        heading="Recommendation"
        bodyText={`Choose "One Gmail" if you're just starting - it's simpler and we'll handle classification automatically.`}
        variant="tip"
        showIcon={true}
      />
    </div>
  );
};

export default GmailAccountSelection;
