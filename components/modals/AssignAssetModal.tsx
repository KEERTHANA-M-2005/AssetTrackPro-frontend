"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { assignmentsApi, assetsApi, employeesApi, type Asset, type Employee } from "@/lib/api"
import { Plus } from "lucide-react"

interface AssignAssetModalProps {
  onAssignmentCreated: () => void
}

export function AssignAssetModal({ onAssignmentCreated }: AssignAssetModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState<string>("")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    try {
      const [assetsData, employeesData] = await Promise.all([
        assetsApi.getAll(),
        employeesApi.getAll()
      ])
      // Filter only available assets
      setAssets(assetsData.filter(asset => asset.asset_status === "AVAILABLE"))
      setEmployees(employeesData)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast.error("Failed to load data")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssetId || !selectedEmployeeId) {
      toast.error("Please select both asset and employee")
      return
    }

    try {
      setLoading(true)
      await assignmentsApi.create({
        asset_id: parseInt(selectedAssetId),
        employee_id: parseInt(selectedEmployeeId)
      })
      toast.success("Asset assigned successfully")
      setSelectedAssetId("")
      setSelectedEmployeeId("")
      setOpen(false)
      onAssignmentCreated()
    } catch (error) {
      console.error("Failed to assign asset:", error)
      toast.error("Failed to assign asset")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Assign Asset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Asset to Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="asset">Select Asset</Label>
            <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an available asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.asset_id} value={asset.asset_id.toString()}>
                    {asset.asset_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="employee">Select Employee</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                    {employee.employee_name} ({employee.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Assign Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}