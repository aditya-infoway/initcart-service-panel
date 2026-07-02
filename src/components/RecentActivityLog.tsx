import { type FC } from "react"
import DataTable from "./common/DataTable"

type Props = {
  className?: string
}

const RecentActivityLog: FC<Props> = ({ className = "" }) => {
  // sample activity data
  const activityLogs = [
    {
      id: 1,
      inquiryId: "INQ-1021",
      date: "09 Oct 2025",
      action: "Completed Service",
      status: "Completed",
    },
    {
      id: 2,
      inquiryId: "INQ-1018",
      date: "08 Oct 2025",
      action: "Follow-up Scheduled",
      status: "Pending",
    },
    {
      id: 3,
      inquiryId: "INQ-1009",
      date: "07 Oct 2025",
      action: "New Inquiry",
      status: "Active",
    },
     {
      id: 24,
      inquiryId: "INQ-1018",
      date: "08 Oct 2025",
      action: "Follow-up Scheduled",
      status: "Pending",
    },
    {
      id: 5,
      inquiryId: "INQ-1009",
      date: "07 Oct 2025",
      action: "New Inquiry",
      status: "Active",
    },
  ]

  // optional event handlers (can connect later)
  // const handleAdd = () => {
  //   console.log("Add new activity log")
  // }
  // const handleEdit = (item: any) => {
  //   console.log("Edit:", item)
  // }
  // const handleDelete = (item: any) => {
  //   console.log("Delete:", item)
  // }

  return (
    <div className={`w-full ${className}`}>
      <DataTable
        title="Recent Activity Log"
        data={activityLogs}
        columns={[
          {
            key: "inquiryId",
            label: "Inquiry ID",
            render: (item) => (
              <div className="font-semibold text-[16px] text-gray-900 dark:text-gray-100">
                {item.inquiryId}
              </div>
            ),
          },
          { key: "date", label: "Date" },
          {
            key: "action",
            label: "Action",
            render: (item) => (
              <div className="text-[15px] text-gray-700 dark:text-gray-300">
                {item.action}
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <span
                className={`text-sm font-semibold ${
                  item.status === "Completed"
                    ? "text-green-700"
                    : item.status === "Pending"
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`}
              >
                {item.status}
              </span>
            ),
          },
        ]}
        // onAdd={handleAdd}
        // onEdit={handleEdit}
        // onDelete={handleDelete}
        // addButtonLabel="Add Log Entry"
      />
    </div>
  )
}

export { RecentActivityLog }
