"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/progress-bar";
import BackButton from "@/components/back-button";
import Input from "@/components/input";
import Select from "@/components/select";
import { Plus, Send, Lightbulb, Loader2 } from "lucide-react";
import { setOnboardingApiSuccess } from "@/Redux/reducers/auth";
import { useAppSelector } from "@/Redux/hooks";
import { RootState } from "@/Redux/store";
import { useDispatch } from "react-redux";
import authActions from "@/Redux/actions/auth";
interface TeamMember {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const OnboardingStep6 = () => {
  const router = useRouter();
  const { onboardingApiSuccess, onboardingApiLoading } = useAppSelector((state: RootState) => state.auth);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      email: "",
      firstName: "",
      lastName: "",
      role: "",
    },
  ]);
  const dispatch = useDispatch();
  const handleAddTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      {
        email: "",
        firstName: "",
        lastName: "",
        role: "",
      },
    ]);
  };

  const handleTeamMemberChange = (
    index: number,
    field: keyof TeamMember,
    value: string,
  ) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const handleContinue = () => {
    // Collect all onboarding data and format as FormData
    const formData = new FormData();
    // 11. teamMembers (Text: JSON array)
    // Filter out empty team members
    const validTeamMembers = teamMembers.filter(
      (member) => member.email && member.firstName && member.lastName && member.role
    );
    formData.append("teamMembers", JSON.stringify(validTeamMembers));
    formData.append("step", "6");
    // Send FormData to API
    dispatch(authActions.onboardingApiRequest(formData));
  };

  useEffect(() => {
    if (onboardingApiSuccess) {
      router.push("/onboarding/step-7");
      dispatch(setOnboardingApiSuccess(false));
    }
  }, [onboardingApiSuccess]);

  const handleSkip = () => {
    // Skip to next step
    router.push("/onboarding/step-7");
  };

  const roleOptions = [
    { value: "owner", label: "Owner" },
    { value: "project-manager", label: "Project Manager" },
    { value: "accountant", label: "Accountant" },
    { value: "admin", label: "Admin" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-[672px] flex flex-col gap-8 sm:gap-[50px] px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-11 pb-6 sm:pb-8 rounded-xl sm:rounded-2xl border border-custom bg-white-custom shadow-md-custom">
        {/* Container */}
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-4 sm:gap-8">
            <BackButton href="/onboarding/step-5" />
            <h2 className="text-label text-primary">Company Setup</h2>
          </div>

          {/* Progress and Content Container */}
          <div className="w-full flex flex-col gap-6 sm:gap-8 md:gap-11">
            {/* Progress Bar */}
            <ProgressBar currentStep={6} totalSteps={7} />

            {/* Content Container */}
            <div className="w-full flex flex-col gap-8">
              {/* Title Section */}
              <div className="w-full flex flex-col gap-0.5">
                <h1 className="text-h3 text-primary">
                  Invite Your Team to Worklighter
                </h1>
                <p className="text-body-copy text-primary">
                  Add team members who will review & approve documents
                </p>
              </div>

              {/* Team Member Forms */}
              <div className="w-full flex flex-col gap-4">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="w-full flex flex-col gap-4 p-4 pb-5 border border-custom rounded-xl"
                  >
                    {/* Team Member Label */}
                    <div className="w-full px-0.5">
                      <h3 className="text-label text-primary">
                        Team Member {index + 1}
                      </h3>
                    </div>

                    {/* Email Address */}
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@company.com"
                      value={member.email}
                      onChange={(e) =>
                        handleTeamMemberChange(index, "email", e.target.value)
                      }
                      labelStyle="supporting"
                      inputStyle="body-copy"
                    />

                    {/* First Name and Last Name */}
                    <div className="w-full flex flex-col sm:flex-row gap-4">
                      <Input
                        label="First Name"
                        type="text"
                        placeholder="John"
                        value={member.firstName}
                        onChange={(e) =>
                          handleTeamMemberChange(
                            index,
                            "firstName",
                            e.target.value,
                          )
                        }
                        labelStyle="supporting"
                        inputStyle="body-copy"
                        className="flex-1"
                      />
                      <Input
                        label="Last Name"
                        type="text"
                        placeholder="Smith"
                        value={member.lastName}
                        onChange={(e) =>
                          handleTeamMemberChange(
                            index,
                            "lastName",
                            e.target.value,
                          )
                        }
                        labelStyle="supporting"
                        inputStyle="body-copy"
                        className="flex-1"
                      />
                    </div>

                    {/* Role */}
                    <Select
                      label="Role"
                      placeholder="Select role"
                      value={member.role}
                      onChange={(e) =>
                        handleTeamMemberChange(index, "role", e.target.value)
                      }
                      options={roleOptions}
                      labelStyle="supporting"
                    />
                  </div>
                ))}

                {/* Add Another Team Member Button */}
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-lg border border-radio-inactive bg-transparent hover:bg-gray-50 transition-colors text-button text-dark cursor-pointer"
                >
                  <Plus className="w-5 h-5 text-primary" />
                  <span>Add another team member</span>
                </button>

                {/* Alerts */}
                <div className="w-full flex flex-col gap-2 p-3 pl-4 rounded-lg border border-yellow bg-yellow-light">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-supporting text-primary">
                      Invitations will be sent once you complete setup
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-supporting text-primary">
                      You can always add more team members later from Settings →
                      Team
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleSkip}
              disabled={onboardingApiLoading}
              className="flex-1 flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg border border-radio-inactive bg-transparent hover:bg-black/80 group hover:text-white transition-colors text-button text-dark cursor-pointer"
            >
              Skip for Now
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={onboardingApiLoading}
              className="flex-1 flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer"
            >
              {onboardingApiLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep6;

