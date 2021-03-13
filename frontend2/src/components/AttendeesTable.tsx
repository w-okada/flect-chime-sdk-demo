import React, { useMemo } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { AttendeeState } from '../providers/MeetingStateProvider';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            height: '100%',
        },
        container: {
            maxHeight: `calc(100% - 10px)`,
        },
        paper: {
            width: '100%',
            marginBottom: theme.spacing(2),
        },
        table: {
            //   minWidth: 750,
            width: 20
        },
        visuallyHidden: {
            border: 0,
            clip: 'rect(0 0 0 0)',
            height: 1,
            margin: -1,
            overflow: 'hidden',
            padding: 0,
            position: 'absolute',
            top: 20,
            width: 1,
        },
    }),
);



type Order = 'asc' | 'desc';

const descendingComparator = <T extends {}>(a: T, b: T, orderBy: keyof T) => {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (a: { [key in Key]: number | string | boolean | HTMLVideoElement | null }, b: { [key in Key]: number | string | boolean | HTMLVideoElement | null }) => number {
    if(order === 'desc'){
        return (a, b) => descendingComparator(a, b, orderBy)
    }else{
        return (a, b) => -descendingComparator(a, b, orderBy)
    }
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}


interface HeadCell {
    disablePadding: boolean;
    id: keyof AttendeeState;
    label: string;
    numeric: boolean;
}

const headCells: HeadCell[] = [
    { id: 'name', numeric: false, disablePadding: true, label: 'userName' },
    { id: 'muted', numeric: false, disablePadding: true, label: 'mute' },
];

interface EnhancedTableProps {
    onRequestSort: (property: keyof AttendeeState) => void;
    order: Order;
    orderBy: string;
}

const EnhancedTableHead = (props: EnhancedTableProps) => {
    const classes = useStyles();
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property: keyof AttendeeState) => {
        return (event: React.MouseEvent<unknown>) => { onRequestSort(property); }
    };

    const header = useMemo(() => {
        return (
            <TableHead>
                <TableRow>
                    {headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align={headCell.numeric ? 'right' : 'left'}
                            padding={headCell.disablePadding ? 'none' : 'default'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <span className={classes.visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </span>
                                ) : null}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }, [orderBy, order, createSortHandler])

    return <>{header}</>;
}



type Props = {
    attendees: { [attendeeId: string]: AttendeeState }
};

export const AttendeesTable = ({ attendees }: Props) => {
    const classes = useStyles();
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof AttendeeState>('name');
    const [selected, setSelected] = React.useState<string[]>([]);
    const [rowsPerPage, setRowsPerPage] = React.useState(400);



    const isSelected = (name: string) => selected.indexOf(name) !== -1;

    const handleRequestSort = useMemo(()=>{
        return (property: keyof AttendeeState) => {
            const isAsc = orderBy === property && order === 'asc'; // orderBy keeps the current selection. If change selection, the order is desc.
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);
        }
    },[orderBy, order]);

    const handleClick = useMemo( ()=>{
        return (event: React.MouseEvent<unknown>, name: string) => {
            const selectedIndex = selected.indexOf(name);
            let newSelected: string[] = [];

            if (selectedIndex === -1) {
                newSelected = newSelected.concat(selected, name);
            } else if (selectedIndex === 0) {
                newSelected = newSelected.concat(selected.slice(1));
            } else if (selectedIndex === selected.length - 1) {
                newSelected = newSelected.concat(selected.slice(0, -1));
            } else if (selectedIndex > 0) {
                newSelected = newSelected.concat(
                    selected.slice(0, selectedIndex),
                    selected.slice(selectedIndex + 1),
                );
            }
            setSelected(newSelected);
        }
    }, [selected]);



    const table = useMemo(()=>{
        return(
            <TableContainer className={classes.container}>
                <Table stickyHeader className={classes.table} size='small'>
                    <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                    <TableBody>
                        {stableSort(Object.values(attendees), getComparator(order, orderBy))
                            .slice(0, rowsPerPage)
                            .map((row, index) => {
                                const isItemSelected = isSelected(row.name);
                                const labelId = `enhanced-table-checkbox-${index}`;
                                return (
                                    <TableRow
                                        hover
                                        onClick={(event) => handleClick(event, row.name)}
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={row.attendeeId}
                                        selected={isItemSelected}
                                    >
                                        <TableCell component="th" id={labelId} scope="row" padding="none">
                                            {row.name.length > 10 ?
                                                row.name.substring(0, 10) + "... "
                                                :
                                                row.name
                                            }
                                        </TableCell>
                                        <TableCell component="th" id={labelId} scope="row" padding="none">
                                            {row.muted}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
        )        
    },[attendees, order, orderBy, selected])

    return (
        <div className={classes.root}>
            {table}
        </div>
    );
}