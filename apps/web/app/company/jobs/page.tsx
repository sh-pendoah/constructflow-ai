'use client';

import AddJobModal from '@/components/add-job-modal';
import DataTable, { Column } from '@/components/data-table';
import EditJobModal from '@/components/edit-job-modal';
import Pagination from '@/components/pagination';
import companyActions from '@/Redux/actions/company';
import { useAppDispatch, useAppSelector } from '@/Redux/hooks';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Job {
  id: string;
  jobName: string;
  jobNumber: string;
  status: 'Active' | 'Inactive';
  jobAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  invoiceRecipients?: string[];
  invoiceCcRecipients?: string[];
  includeInvoiceSubmitter?: boolean;
  dailyLogRecipients?: string[];
  dailyLogCcRecipients?: string[];
  includeDailyLogSubmitter?: boolean;
}

const JobsPage = () => {
  const dispatch = useAppDispatch();
  const {
    jobs: jobsData,
    jobsStatistics,
    isLoading,
    getJobsError,
  } = useAppSelector((state) => state.company);
  const hasFetchedJobs = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemsPerPage = 15;

  // Fetch jobs with current filters
  const fetchJobs = (status?: string, searchText?: string) => {
    const params: { status?: string; searchText?: string } = {};
    if (status && status !== 'All') {
      params.status = status.toLowerCase();
    } else {
      params.status = 'all';
    }
    if (searchText) {
      params.searchText = searchText;
    }
    dispatch(companyActions.getJobsRequest(params));
  };

  // Fetch jobs on component mount
  useEffect(() => {
    if (!hasFetchedJobs.current) {
      fetchJobs(filterStatus, searchQuery);
      hasFetchedJobs.current = true;
    }
  }, [dispatch]);

  // Debounced search effect
  useEffect(() => {
    if (hasFetchedJobs.current) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        fetchJobs(filterStatus, searchQuery);
        setCurrentPage(1); // Reset to first page on search
      }, 500); // 500ms debounce
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch jobs when filter changes
  useEffect(() => {
    if (hasFetchedJobs.current) {
      fetchJobs(filterStatus, searchQuery);
      setCurrentPage(1); // Reset to first page on filter change
    }
  }, [filterStatus]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  // Transform API data to Job format
  const allJobs: Job[] = useMemo(() => {
    if (!jobsData || !Array.isArray(jobsData)) {
      return [];
    }

    return jobsData.map((job: any) => ({
      id: job._id || '',
      jobName: job.jobName || '',
      jobNumber: job.jobNumber || '',
      status: job.status === 'active' ? 'Active' : 'Inactive',
      jobAddress: job.jobAddress || '',
      city: job.city || '',
      state: job.state || '',
      zipCode: job.zipCode || '',
      invoiceRecipients: job.invoiceRecipients || [],
      invoiceCcRecipients: job.invoiceCcRecipients || [],
      includeInvoiceSubmitter: job.includeInvoiceSubmitter ?? true,
      dailyLogRecipients: job.dailyLogRecipients || [],
      dailyLogCcRecipients: job.dailyLogCcRecipients || [],
      includeDailyLogSubmitter: job.includeDailyLogSubmitter ?? true,
    }));
  }, [jobsData]);

  // Calculate pagination (API returns filtered results, so use allJobs directly)
  const totalPages = Math.ceil(allJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = allJobs.slice(startIndex, startIndex + itemsPerPage);

  // Calculate summary stats from API or fallback to calculated values
  const totalJobs = jobsStatistics?.totalJobs ?? allJobs.length;
  const activeJobs =
    jobsStatistics?.activeJobs ??
    allJobs.filter((j) => j.status === 'Active').length;
  const inactiveJobs =
    jobsStatistics?.inactiveJobs ??
    allJobs.filter((j) => j.status === 'Inactive').length;

  // Define table columns
  const columns: Column<Job>[] = [
    {
      key: 'jobName',
      label: 'Job Name',
      // sortable: true,
    },
    {
      key: 'jobNumber',
      label: 'Job #',
      // sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const isActive = value === 'Active';
        return (
          <span
            className={`px-2 py-1 h-6 flex items-center justify-center rounded-full border ${
              isActive
                ? 'bg-white border-[#10B981] text-[#10B981]'
                : 'bg-white border-[#EF4444] text-[#EF4444]'
            }`}
          >
            <span className="text-xs font-sf-pro">{value}</span>
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_, row) => (
        <button
          onClick={() => handleEdit(row.id)}
          className="px-2 py-3 text-body-copy text-primary font-poppins font-semibold hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
        >
          Edit
        </button>
      ),
    },
  ];

  const handleEdit = (jobId: string) => {
    const job = allJobs.find((j) => j.id === jobId);
    if (job) {
      setEditingJob(job);
      setIsEditJobModalOpen(true);
    }
  };

  // Show loading state
  if (isLoading && !jobsData) {
    return (
      <div className="w-full px-4 sm:px-0">
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-[#6F7A85] font-sf-pro">Loading jobs...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (getJobsError && !jobsData) {
    return (
      <div className="w-full px-4 sm:px-0">
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-[#EF4444] font-sf-pro">{getJobsError}</p>
        </div>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterSelect = (status: string) => {
    const statusValue = status === 'All' ? 'all' : status.toLowerCase();
    setFilterStatus(statusValue);
    setIsFilterDropdownOpen(false);
    // fetchJobs will be called by useEffect when filterStatus changes
  };

  const filterOptions = ['All', 'Active', 'Inactive'];

  // Get display value for filter
  const getFilterDisplayValue = () => {
    if (filterStatus === 'all') return 'All';
    return filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1);
  };

  return (
    <div className="w-full px-4 sm:px-0">
      {/* Subheader Container */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg sm:text-xl md:text-h4 text-primary font-poppins font-semibold">
            Job Management
          </h2>
          <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
            Manage construction jobs and document routing
          </p>
        </div>
        <button
          onClick={() => setIsAddJobModalOpen(true)}
          className="h-11 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-[#0E1114] text-white rounded-lg hover:bg-black/80 transition-colors font-poppins font-semibold text-sm sm:text-button whitespace-nowrap w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add Job</span>
        </button>
      </div>

      {/* Job Summary Container */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
        <div className="flex flex-col items-center gap-0.5 p-4 bg-white border border-[#DEE0E3] rounded-lg shadow-md">
          <h3 className="text-h3 text-primary font-poppins font-semibold h-[39px] flex items-center justify-center">
            {totalJobs}
          </h3>
          <p className="text-sm sm:text-label text-primary font-sf-pro">
            Total Jobs
          </p>
        </div>
        <div className="flex flex-col items-center gap-0.5 p-4 bg-white border border-[#DEE0E3] rounded-lg shadow-md">
          <h3 className="text-h3 text-[#10B981] font-poppins font-semibold h-[39px] flex items-center justify-center">
            {activeJobs}
          </h3>
          <p className="text-sm sm:text-label text-primary font-sf-pro">
            Active Jobs
          </p>
        </div>
        <div className="flex flex-col items-center gap-0.5 p-4 bg-white border border-[#DEE0E3] rounded-lg shadow-md">
          <h3 className="text-h3 text-[#EF4444] font-poppins font-semibold h-[39px] flex items-center justify-center">
            {inactiveJobs}
          </h3>
          <p className="text-sm sm:text-label text-primary font-sf-pro">
            Inactive Jobs
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex flex-col bg-white border border-[#DEE0E3] rounded-lg overflow-hidden">
        {/* Search Container */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 sm:p-5 border-b border-[#DEE0E3]">
          <div className="flex-1 max-w-[373px] relative">
            <div className="flex items-center w-full px-3 py-2 sm:py-4 h-11 sm:h-13 rounded-lg border border-[#DEE0E3] bg-white">
              <input
                type="text"
                placeholder="Search Jobs"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="flex-1  text-sm sm:text-body-copy text-primary placeholder:text-placeholder outline-none bg-transparent font-sf-pro"
              />
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 ml-2" />
            </div>
          </div>
          <div className="relative">
            <button
              ref={filterButtonRef}
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="h-11 sm:h-[50px] cursor-pointer flex items-center justify-center gap-2 px-4 py-2 sm:py-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-gray-50 transition-colors font-poppins font-semibold text-sm sm:text-button whitespace-nowrap"
            >
              <span>{getFilterDisplayValue()}</span>
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Filter Dropdown */}
            {isFilterDropdownOpen && (
              <div
                ref={filterDropdownRef}
                className="absolute top-full right-0 mt-2 w-[143px] bg-white border border-[#DEE0E3] rounded-lg shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] z-50 overflow-hidden"
              >
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterSelect(option)}
                    className={`w-full px-4 py-3 text-left text-sm sm:text-body-copy font-sf-pro transition-colors ${
                      filterStatus === option
                        ? 'bg-gray-50 text-primary font-medium'
                        : 'text-primary hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        {isLoading && !jobsData ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-[#6F7A85] font-sf-pro">
              Loading jobs...
            </p>
          </div>
        ) : allJobs.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-[#6F7A85] font-sf-pro">No jobs found</p>
          </div>
        ) : (
          <>
            {isLoading && jobsData && (
              <div className="flex items-center justify-center p-2 bg-blue-50 border-b border-blue-200">
                <p className="text-xs text-blue-600 font-sf-pro">
                  Refreshing jobs...
                </p>
              </div>
            )}
            <DataTable columns={columns} data={paginatedJobs} />
          </>
        )}

        {/* Pagination */}
        {allJobs.length > 0 && !isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allJobs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            itemName="jobs"
          />
        )}
      </div>

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        onSubmit={(data) => {
          if (data?.success) {
            // Job created successfully, jobs list will be refetched by saga
            setIsAddJobModalOpen(false);
            dispatch(companyActions.getJobsRequest());
          }
        }}
      />

      {/* Edit Job Modal */}
      <EditJobModal
        isOpen={isEditJobModalOpen}
        onClose={() => {
          setIsEditJobModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={(data) => {
          if (data?.success) {
            // Job updated successfully, refetch with current filters
            setIsEditJobModalOpen(false);
            setEditingJob(null);
            fetchJobs(filterStatus, searchQuery);
          }
        }}
        jobData={
          editingJob
            ? {
                id: editingJob.id,
                jobName: editingJob.jobName,
                jobNumber: editingJob.jobNumber,
                status: editingJob.status,
                jobAddress: editingJob.jobAddress,
                city: editingJob.city,
                state: editingJob.state,
                zipCode: editingJob.zipCode,
                emailConfig: {
                  invoices: {
                    includeSubmitter:
                      editingJob.includeInvoiceSubmitter ?? true,
                    recipients: editingJob.invoiceRecipients || [],
                    cc: editingJob.invoiceCcRecipients || [],
                  },
                  dailyLogs: {
                    includeSubmitter:
                      editingJob.includeDailyLogSubmitter ?? true,
                    recipients: editingJob.dailyLogRecipients || [],
                    cc: editingJob.dailyLogCcRecipients || [],
                  },
                },
              }
            : null
        }
      />
    </div>
  );
};

export default JobsPage;
