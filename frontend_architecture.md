# Frontend Architecture – OptiAsset

## Role: IT Administrator (Full access)

Page: /dashboard
Component: <Sidebar /> – Navigation menu
Component: <TopNavbar /> – Shows logged-in user
Component: <StatCards /> – Total assets, assigned assets
Component: <RecentAssignmentsTable /> – Latest asset activity

Page: /assets
Component: <Sidebar />
Component: <AssetTable /> – Displays all assets
Component: <SearchBar /> – Search assets
Component: <AddAssetModal /> – Add new asset form

Page: /employees
Component: <Sidebar />
Component: <EmployeeTable /> – List employees
Component: <AddEmployeeModal /> – Add employee form

Page: /assignments
Component: <Sidebar />
Component: <AssignmentTable /> – Asset allocation history
Component: <AssignAssetModal /> – Assign asset to employee

---

## Role: Standard Employee

Page: /my-assets
Component: <TopNavbar />
Component: <MyAssetList /> – List of assigned assets
Component: <ReportIssueButton /> – Report asset problem

Page: /report-issue
Component: <TopNavbar />
Component: <IssueReportForm /> – Submit issue