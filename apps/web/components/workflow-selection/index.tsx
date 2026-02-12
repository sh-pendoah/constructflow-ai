import React from "react";
import Checkbox from "@/components/checkbox";
import Alert from "@/components/alert";

interface WorkflowSelectionProps {
  selectedWorkflows: string[];
  onWorkflowChange: (workflow: string, checked: boolean) => void;
}

const WorkflowSelection: React.FC<WorkflowSelectionProps> = ({
  selectedWorkflows,
  onWorkflowChange,
}) => {
  const workflows = [
    { id: "invoices", label: "Invoices & Bills (Required)" },
    { id: "dailyLogs", label: "Daily Logs & Field Reports (Required)" },
    { id: "compliance", label: "Compliance Documents (COI, WC) (Required)" },
  ];

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Title Section */}
      <div className="w-full flex flex-col gap-0.5">
        <h1 className="text-h3 text-primary">Which Workflows Need Gmail?</h1>
        <p className="text-body-copy text-primary">
          Select which document types you want to track.
        </p>
      </div>

      {/* Required Workflows Section */}
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-h6 text-dark">Required Workflows</h2>
        <div className="w-full flex flex-col gap-3">
          {workflows.map((workflow) => (
            <Checkbox
              key={workflow.id}
              checked={selectedWorkflows.includes(workflow.id)}
              onChange={(checked) => onWorkflowChange(workflow.id, checked)}
              label={workflow.label}
            />
          ))}
        </div>
      </div>

      {/* Recommendation Alert */}
      {/* <Alert
        heading="Recommendation"
        bodyText="You can use the same Gmail for multiple workflows or different Gmail accounts for each"
        variant="tip"
        showIcon={true}
      /> */}
    </div>
  );
};

export default WorkflowSelection;
