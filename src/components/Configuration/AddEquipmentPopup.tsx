import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Box, Button, IconButton, MenuItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

interface Props { open: boolean; onClose: () => void; }
interface Department {
  id: number;
  name: string;
  is_active: boolean;
}


const AddEquipmentPopup: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [equipmentName, setEquipmentName] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState<number | "">("");


  useEffect(() => {
    const clinic = localStorage.getItem("clinic");
    if (!clinic) return;
  
    const parsed = JSON.parse(clinic);
    setDepartments(parsed.department || []);
  }, []);
  

  const handleAdd = () => {
    if (!equipmentName || !departmentId) {
      alert("Please enter all fields");
      return;
    }
    
    localStorage.setItem("equipmentName", equipmentName);
    localStorage.setItem("departmentId", String(departmentId));    
    localStorage.setItem("equipmentName", equipmentName);
    localStorage.setItem("department", department);
    onClose();
    navigate("/configuration/equipment/add-parameter");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { "& .MuiDialogTitle-root + .MuiDialogContent-root": { pt: "6px" }, borderRadius: "12px" } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Add Equipment's
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Equipment Name" fullWidth variant="outlined" size="small" value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} InputLabelProps={{ shrink: true }}
          sx={{"& .MuiInputLabel-root": { color: "#5F646F !important" }, "& .MuiInputLabel-root.Mui-focused": { color: "#5F646F !important" }, "& .MuiOutlinedInput-root": {"& fieldset": { borderColor: "#CFD1D4" }, "&:hover fieldset": { borderColor: "#CFD1D4" }, "&.Mui-focused fieldset": { borderColor: "#CFD1D4" }}, "& .MuiInputBase-input": { color: "#5F646F" }}}/>

        <TextField
          label="Department"
          select
          fullWidth
          size="small"
          variant="outlined"
          value={departmentId}
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            setDepartmentId(selectedId);
          
            const selectedDept = departments.find(d => d.id === selectedId);
            setDepartment(selectedDept?.name || "");
          }}
          InputLabelProps={{ shrink: true }}
          sx={{
            "& .MuiInputLabel-root": { color: "#5F646F !important" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#CFD1D4" },
              "&:hover fieldset": { borderColor: "#CFD1D4" },
              "&.Mui-focused fieldset": { borderColor: "#CFD1D4" },
            },
          }}
        >
          {departments
            .filter((d) => d.is_active)
            .map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
        </TextField>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
          <Button variant="outlined" onClick={onClose} sx={{ color: "#505050", width: "100px", borderRadius: "10px", borderColor: "#505050", "&:hover": { borderColor: "#505050", backgroundColor: "white" }, textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} sx={{ width: "100px", borderRadius: "10px", background: "#383838", textTransform: "none", "&:hover": { background: "#2f2f2f" } }}>Add</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentPopup;