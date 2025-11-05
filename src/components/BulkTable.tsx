import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Link as MuiLink } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { BulkUpload } from "../admin/business-management/mockBulkUploads";

interface BulkTableProps {
  bulks: BulkUpload[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const BulkTable: React.FC<BulkTableProps> = ({ bulks, onEdit, onDelete }) => (
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>CSV</TableCell>
          <TableCell>Business</TableCell>
          <TableCell>Timestamp</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {bulks.map((bulk) => (
          <TableRow key={bulk.id}>
            <TableCell>
              <MuiLink href={bulk.csvUrl} target="_blank" rel="noopener" underline="hover">
                {bulk.csvName}
              </MuiLink>
            </TableCell>
            <TableCell>{bulk.business}</TableCell>
            <TableCell>{new Date(bulk.timestamp).toLocaleString()}</TableCell>
            <TableCell align="right">
              <IconButton color="primary" onClick={() => onEdit(bulk.id)} size="small">
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => onDelete(bulk.id)} size="small">
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default BulkTable;
