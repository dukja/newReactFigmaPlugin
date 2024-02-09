import React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
function createData(name, fat , protein) {
  return { name, fat , protein };
}
const rows = [
  createData('Stack', '-', 'div'),
  createData('컴포넌트명-{id 구분자}', 'Button-{id 메뉴}', '사양서'),
  createData('Grid {xs 숫자}', 'Grid {xs 12} {md 12} {lg 12} {xl 12}','각각 총합 12'),
  createData('Grid {container}',  '-', '-'),
  createData('th {colspan 숫자}',  'th {colspan 2} {rowspan 2}', '-'),
  createData('td {colspan 숫자}',  'td {colspan 2} {rowspan 2}', '-'),
  createData('Image-Stack',  '-', '-'),
];

export default function Convention (){
    return(
        <TableContainer>
        <Table sx={{ minWidth: 400 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Nodes</TableCell>
              <TableCell align="right">Sample</TableCell>
              <TableCell align="right">Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.protein}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
}

