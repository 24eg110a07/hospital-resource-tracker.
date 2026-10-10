// Describes each resource module: API path, table columns and form fields.
const duty = [["on_duty", "On duty"], ["off_duty", "Off duty"]];
export const CONFIGS = {
  beds: { title: "Beds", singular: "bed", columns: ["bed_number", "ward", "bed_type", "status"],
    fields: [["bed_number", "Bed number"], ["ward", "Ward"], ["bed_type", "Type", [["ICU", "ICU"], ["General", "General"], ["Emergency", "Emergency"]]],
      ["status", "Status", [["available", "Available"], ["occupied", "Occupied"], ["reserved", "Reserved"], ["maintenance", "Maintenance"]]]] },
  doctors: { title: "Doctors", singular: "doctor", columns: ["name", "specialization", "department", "schedule", "status"],
    fields: [["name", "Name"], ["specialization", "Specialization"], ["department", "Department"], ["schedule", "Duty schedule"], ["status", "Status", duty]] },
  staff: { title: "Staff", singular: "staff member", columns: ["name", "role", "department", "shift", "status"],
    fields: [["name", "Name"], ["role", "Role"], ["department", "Department"], ["shift", "Shift"], ["status", "Status", duty]] },
  equipment: { title: "Equipment", singular: "equipment", columns: ["name", "department", "quantity", "status"],
    fields: [["name", "Name"], ["department", "Department"], ["quantity", "Quantity", null, "number"],
      ["status", "Status", [["available", "Available"], ["in_use", "In use"], ["maintenance", "Maintenance"]]]] },
};
export const label = (v) => String(v).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
