"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, MoreVertical } from "lucide-react";
import DataTable, { Column } from "@/components/data-table";
import InviteTeamMemberModal from "@/components/invite-team-member-modal";
import RemoveTeamMemberModal from "@/components/remove-team-member-modal";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { authActions } from "@/Redux/actions/auth";
import { deleteTeamMemberFailure, inviteTeamMemberFailure, updateTeamMemberFailure } from "@/Redux/reducers/auth";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  isCurrentUser?: boolean;
}

const UserPermissionsPage = () => {
  const dispatch = useAppDispatch();
  const { 
    teamMembers: teamMembersData, 
    isLoading, 
    inviteTeamMemberSuccess, 
    updateTeamMemberSuccess,
    deleteTeamMemberSuccess,
    userData 
  } = useAppSelector((state) => state.auth);
  const hasFetchedTeamMembers = useRef(false);
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ [key: string]: { top: number; right: number; position: "bottom" | "top" } }>({});
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Fetch team members on component mount
  useEffect(() => {
    if (!hasFetchedTeamMembers.current) {
      dispatch(authActions.getTeamMembersRequest());
      hasFetchedTeamMembers.current = true;
    }
  }, [dispatch]);

  // Refetch team members after successful invite and close modal
  useEffect(() => {
    if (inviteTeamMemberSuccess) {
      dispatch(authActions.getTeamMembersRequest());
      // Close modal - this will trigger form reset in the modal component
      setIsInviteModalOpen(false);
      setEditingMember(null);
      setModalMode("add");
      dispatch(inviteTeamMemberFailure(false));
      // Reset success flag - it will auto-reset on next request
    }
  }, [inviteTeamMemberSuccess, dispatch]);

  // Transform API data to TeamMember format
  const teamMembers: TeamMember[] = React.useMemo(() => {
    if (!teamMembersData || !Array.isArray(teamMembersData)) {
      return [];
    }
    
    const currentUserId = userData?.user?._id || userData?.user?.id;
    
    return teamMembersData.map((member: any) => {
      // Map role from API format to display format
      let displayRole = member.role || "Project Manager";
      if (member.role === "project_manager") {
        displayRole = "Project Manager";
      } else if (member.role === "admin") {
        displayRole = "Admin";
      }
      
      // Check if this is the current user
      const isCurrentUser = member.id === currentUserId || member._id === currentUserId;
      if (isCurrentUser) {
        displayRole = `${displayRole}(you)`;
      }
      
      return {
        id: member.id || member._id || "",
        name: member.name || "",
        email: member.email || "",
        role: displayRole,
        status: "Active" as const, // API doesn't provide status, defaulting to Active
        isCurrentUser,
      };
    });
  }, [teamMembersData, userData]);

  // Handle click outside to close dropdown and calculate position
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const dropdownRef = dropdownRefs.current[openDropdownId];
        const buttonRef = buttonRefs.current[openDropdownId];
        if (
          dropdownRef &&
          !dropdownRef.contains(event.target as Node) &&
          buttonRef &&
          !buttonRef.contains(event.target as Node)
        ) {
          setOpenDropdownId(null);
        }
      }
    };

    // Calculate dropdown position when it opens
    if (openDropdownId) {
      const buttonRef = buttonRefs.current[openDropdownId];
      if (buttonRef) {
        const rect = buttonRef.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 90; // Approximate height of dropdown (2 items)
        const dropdownWidth = 255;

        // Calculate right position (align to button's right edge)
        const rightPosition = viewportWidth - rect.right;

        // If not enough space below but enough space above, position above
        let position: "bottom" | "top";
        let topPosition: number;
        
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          position = "top";
          topPosition = rect.top - dropdownHeight - 4; // 4px gap
        } else {
          position = "bottom";
          topPosition = rect.bottom + 4; // 4px gap
        }

        setDropdownPosition((prev) => ({
          ...prev,
          [openDropdownId]: {
            top: topPosition,
            right: rightPosition,
            position,
          },
        }));
      }

      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  const handleEdit = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (member) {
      setEditingMember(member);
      setModalMode("edit");
      setIsInviteModalOpen(true);
    }
    setOpenDropdownId(null);
  };

  const handleRemove = (memberId: string) => {
    setRemovingMemberId(memberId);
    setIsRemoveModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleConfirmRemove = () => {
    if (removingMemberId) {
      // Dispatch delete team member action
      dispatch(authActions.deleteTeamMemberRequest(removingMemberId));
    }
  };

  // Close remove modal after successful delete and refetch team members
  useEffect(() => {
    if (deleteTeamMemberSuccess) {
      setIsRemoveModalOpen(false);
      setRemovingMemberId(null);
      // Refetch team members to update the listing (backup in case saga didn't call it)
      dispatch(authActions.getTeamMembersRequest());
      dispatch(deleteTeamMemberFailure(false));
    }
  }, [deleteTeamMemberSuccess, dispatch]);

  // Close edit modal after successful update and refetch team members
  useEffect(() => {
    if (updateTeamMemberSuccess) {
      setIsInviteModalOpen(false);
      setEditingMember(null);
      setModalMode("add");
      // Refetch team members to update the listing (backup in case saga didn't call it)
      dispatch(authActions.getTeamMembersRequest());
      dispatch(updateTeamMemberFailure(false));
    }
  }, [updateTeamMemberSuccess, dispatch]);

  // Define table columns
  const columns: Column<TeamMember>[] = [
    {
      key: "name",
      label: "Name",
      // sortable: true,
    },
    {
      key: "email",
      label: "Email",
      // sortable: true,
    },
    {
      key: "role",
      label: "Role",
      // sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span className="px-2 h-5 flex items-center justify-center border border-[#10B981] rounded-full">
          <span className="text-xs text-[#10B981] font-sf-pro">{value}</span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_, row) => {
        const isOpen = openDropdownId === row.id;
        const position = dropdownPosition[row.id];
        
        return (
          <div className="relative" ref={(el) => { dropdownRefs.current[row.id] = el; }}>
            <button
              ref={(el) => { buttonRefs.current[row.id] = el; }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownId(isOpen ? null : row.id);
              }}
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-primary" />
            </button>
            {isOpen && position && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setOpenDropdownId(null)}
                />
                <div
                  className="fixed z-[101] w-[255px] bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] overflow-hidden"
                  style={{
                    top: `${position.top}px`,
                    right: `${position.right}px`,
                  }}
                >
                  <div className="p-0.5 flex flex-col">
                    <button
                      onClick={() => handleEdit(row.id)}
                      className="w-full px-3 py-3 text-left text-body-copy text-primary font-sf-pro hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemove(row.id)}
                      className="w-full px-3 py-3 text-left text-body-copy text-[#EF4444] font-sf-pro hover:bg-gray-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Team Members Section */}
      <div className="flex flex-col px-4 sm:px-0 gap-4 sm:gap-6">
        {/* Team Members Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg sm:text-xl md:text-h4 text-primary font-poppins font-semibold">
            Team Members
          </h2>
          <button
            onClick={() => {
              setModalMode("add");
              setEditingMember(null);
              setIsInviteModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 sm:py-3 bg-[#0E1114] text-white rounded-lg hover:bg-black/80 transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-button font-poppins font-semibold">
              Invite User
            </span>
          </button>
        </div>

        {/* Table Container */}
        <div className="w-full sm:mx-0 sm:px-0">
          <DataTable columns={columns} data={teamMembers} />
        </div>
      </div>

      {/* Invite Team Member Modal */}
      <InviteTeamMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          if (!isLoading) {
            setIsInviteModalOpen(false);
            setEditingMember(null);
            setModalMode("add");
          }
        }}
        isLoading={isLoading && (modalMode === "add" || modalMode === "edit")}
        mode={modalMode}
        initialData={
          editingMember
            ? {
                email: editingMember.email,
                name: editingMember.name,
                role: editingMember.role.replace("(you)", "").trim(),
              }
            : null
        }
        onInvite={(data) => {
          // Map role from display format to API format
          let apiRole = data.role;
          if (data.role === "Admin") {
            apiRole = "Admin";
          } else if (data.role === "Project Manager") {
            apiRole = "project_manager";
          }
          
          dispatch(authActions.inviteTeamMemberRequest({
            email: data.email,
            name: data.name || "",
            role: apiRole,
          }));
        }}
        onUpdate={(data) => {
          if (editingMember) {
            // Map role from display format to API format
            let apiRole = data.role;
            if (data.role === "Admin") {
              apiRole = "Admin";
            } else if (data.role === "Project Manager") {
              apiRole = "project_manager";
            }
            
            dispatch(authActions.updateTeamMemberRequest(editingMember.id, {
              email: data.email,
              name: data.name || "",
              role: apiRole,
            }));
          }
        }}
      />

      {/* Remove Team Member Modal */}
      <RemoveTeamMemberModal
        isOpen={isRemoveModalOpen}
        onClose={() => {
          if (!isLoading) {
            setIsRemoveModalOpen(false);
            setRemovingMemberId(null);
          }
        }}
        onConfirm={handleConfirmRemove}
        isLoading={isLoading}
        memberName={
          removingMemberId
            ? teamMembers.find((m) => m.id === removingMemberId)?.name
            : undefined
        }
      />
    </>
  );
};

export default UserPermissionsPage;


