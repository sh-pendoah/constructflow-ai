import React from "react";
import StepBadge from "@/components/step-badge";
import NumberedItem from "@/components/numbered-item";
import Alert from "@/components/alert";
import OutlineButton from "@/components/outline-button";
import { ArrowRight, MailCheck } from "lucide-react";

const GmailInstructions = () => {
  return (
    <div className="w-full flex flex-col gap-8">
      {/* Title Section */}
      <div className="w-full flex flex-col gap-0.5">
        <h1 className="text-h3 text-primary">
          Setting Up Gmail for docflow-360
        </h1>
        <p className="text-body-copy text-primary">
          Quick 3-step guide to connect your existing emails.
        </p>
      </div>

      {/* What You'll Need */}
      <div className="w-full flex flex-col gap-5 p-4 rounded-xl border border-yellow bg-yellow-light">
        <h2 className="text-h6 text-dark">What you'll need</h2>
        <div className="w-full flex flex-col gap-3">
          <NumberedItem
            icon={<ArrowRight className="w-5 h-5 text-icon-secondary" />}
            text="Access to your IT team or email admin"
          />
          <NumberedItem
            icon={<ArrowRight className="w-5 h-5 text-icon-secondary" />}
            text="15-30 minutes for setup"
          />
          <NumberedItem
            icon={<ArrowRight className="w-5 h-5 text-icon-secondary" />}
            text="Your existing email addresses"
          />
        </div>
      </div>

      {/* Step 1 */}
      <div className="w-full flex flex-col gap-5 p-5 rounded-2xl border border-custom bg-white-custom">
        <div className="w-full flex flex-col gap-1">
          <StepBadge stepNumber="1" />
          <h2 className="text-h6 text-dark">Create Gmail Account(s)</h2>
          <p className="text-body-copy text-primary">
            Have your IT team create new Gmail account(s)
          </p>
        </div>

        {/* Option A */}
        <div className="w-full flex flex-col gap-3">
          <h3 className="text-h6 text-dark">
            Option A: One Gmail for everything
          </h3>
          <NumberedItem
            icon={<ArrowRight className="w-5 h-5 text-primary" />}
            text="docflow-360-docs@yourcompany.com"
          />
        </div>

        {/* Option B */}
        <div className="w-full flex flex-col gap-3">
          <h3 className="text-h6 text-dark">
            Option B: Separate Gmail per workflow
          </h3>
          <div className="w-full flex flex-col gap-3">
            <NumberedItem
              icon={<ArrowRight className="w-5 h-5 text-primary" />}
              text="docflow-360-invoices@yourcompany.com"
            />
            <NumberedItem
              icon={<ArrowRight className="w-5 h-5 text-primary" />}
              text="docflow-360-logs@yourcompany.com"
            />
            <NumberedItem
              icon={<ArrowRight className="w-5 h-5 text-primary" />}
              text="docflow-360-compliance@yourcompany.com"
            />
          </div>
        </div>

        {/* Tip Alert */}
        <Alert
          heading="Tip"
          bodyText="You can use Google Workspace (your-domain.com) or free Gmail accounts (@gmail.com)"
          variant="tip"
          showIcon={true}
        />
      </div>

      {/* Step 2 */}
      <div className="w-full flex flex-col gap-5 p-5 rounded-2xl border border-custom bg-white-custom">
        <div className="w-full flex flex-col gap-1">
          <StepBadge stepNumber="2" />
          <h2 className="text-h6 text-dark">Set Up Email Forwarding</h2>
          <p className="text-body-copy text-primary">
            Forward your current emails to the new Gmail account(s)
          </p>
        </div>

        {/* For Outlook/Office 365 */}
        <div className="w-full flex flex-col md:flex-row gap-5">
          <div className="flex-1 flex flex-col gap-3 border-r-0 md:border-r border-custom pr-0 md:pr-5">
            <h3 className="text-h6 text-dark">For Outlook/Office 365</h3>
            <div className="w-full flex flex-col gap-3">
              <NumberedItem
                number={1}
                text="Go to Outlook Settings → Mail → Forwarding"
              />
              <NumberedItem
                number={2}
                text="Enable forwarding to: docflow-360-docs@yourcompany.com"
              />
              <NumberedItem
                number={3}
                text='Check "Keep a copy of forwarded messages"'
              />
              <NumberedItem number={4} text="Save changes" />
            </div>
          </div>

          {/* For Exchange (IT Admin) */}
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-h6 text-dark">For Exchange (IT Admin)</h3>
            <div className="w-full flex flex-col gap-3">
              <NumberedItem number={1} text="Open Exchange Admin Center" />
              <NumberedItem number={2} text="Go to Recipients → Mailboxes" />
              <NumberedItem
                number={3}
                text="Select mailbox → Mail flow settings"
              />
              <NumberedItem number={4} text="Add forwarding to Gmail address" />
            </div>
          </div>
        </div>

        {/* PDF Download Button */}
        <OutlineButton label="Get IT Setup Guide (PDF)" showIcon={true} />
      </div>

      {/* Step 3 */}
      <div className="w-full flex flex-col gap-5 p-5 rounded-2xl border border-custom bg-white-custom">
        <div className="w-full flex flex-col gap-1">
          <StepBadge stepNumber="3" />
          <h2 className="text-h6 text-dark">Connect in docflow-360</h2>
          <p className="text-body-copy text-primary">
            Once forwarding is active, click below to connect your Gmail
            account(s)
          </p>
        </div>
      </div>

      {/* Example Flow */}
      <div className="w-full flex flex-col gap-2 p-5 rounded-2xl border border-green bg-green-light shadow-medium">
        <h2 className="text-h6 text-dark">Example Flow</h2>
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex flex-col gap-1">
            <p className="text-body-copy text-dark h-5">
              Current email: invoices@company.com (Outlook)
            </p>
            <p className="text-supporting text-primary h-5">
              ↓ Forward all emails to ↓
            </p>
          </div>
          <div className="w-full flex flex-col gap-1">
            <p className="text-body-copy text-dark h-5">
              New Gmail: docflow-360-invoices@company.com
            </p>
            <p className="text-supporting text-primary h-5">
              ↓ Connect with Google ↓
            </p>
          </div>
          <NumberedItem
            icon={<MailCheck className="w-5 h-5 text-primary" />}
            text="docflow-360 monitors Gmail account"
          />
        </div>
      </div>
    </div>
  );
};

export default GmailInstructions;

