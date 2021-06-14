import React, { useMemo } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { AttendeeState } from '../../../../providers/helper/ChimeClient';
import { useAppState } from '../../../../providers/AppStateProvider';
import { useStyles } from './css';
import { IconButton, Tooltip } from '@material-ui/core';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

// type Order = 'asc' | 'desc';

// const descendingComparator = <T extends {}>(a: T, b: T, orderBy: keyof T) => {
//     if (b[orderBy] < a[orderBy]) {
//         return -1;
//     }
//     if (b[orderBy] > a[orderBy]) {
//         return 1;
//     }
//     return 0;
// }

// function getComparator<Key extends keyof any>(
//     order: Order,
//     orderBy: Key,
// ): (a: { [key in Key]: number | string | boolean | HTMLVideoElement | null }, b: { [key in Key]: number | string | boolean | HTMLVideoElement | null }) => number {
//     if(order === 'desc'){
//         return (a, b) => descendingComparator(a, b, orderBy)
//     }else{
//         return (a, b) => -descendingComparator(a, b, orderBy)
//     }
// }

// function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
//     const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
//     stabilizedThis.sort((a, b) => {
//       const order = comparator(a[0], b[0]);
//       if (order !== 0) return order;
//       return a[1] - b[1];
//     });
//     return stabilizedThis.map((el) => el[0]);
// }


// interface HeadCell {
//     disablePadding: boolean;
//     id: keyof AttendeeState;
//     label: string;
//     numeric: boolean;
// }

// const headCells: HeadCell[] = [
//     { id: 'name', numeric: false, disablePadding: true, label: 'userName' },
//     { id: 'muted', numeric: false, disablePadding: true, label: 'mute' },
// ];

// interface EnhancedTableProps {
//     onRequestSort: (property: keyof AttendeeState) => void;
//     order: Order;
//     orderBy: string;
// }

// const EnhancedTableHead = (props: EnhancedTableProps) => {
//     const classes = useStyles();
//     const { order, orderBy, onRequestSort } = props;
//     const createSortHandler = (property: keyof AttendeeState) => {
//         return (event: React.MouseEvent<unknown>) => { onRequestSort(property); }
//     };

//     const header = useMemo(() => {
//         return (
//             <TableHead>
//                 <TableRow>
//                     {headCells.map((headCell) => (
//                         <TableCell
//                             key={headCell.id}
//                             align={headCell.numeric ? 'right' : 'left'}
//                             padding={headCell.disablePadding ? 'none' : 'default'}
//                             sortDirection={orderBy === headCell.id ? order : false}
//                         >
//                             <TableSortLabel
//                                 active={orderBy === headCell.id}
//                                 direction={orderBy === headCell.id ? order : 'asc'}
//                                 onClick={createSortHandler(headCell.id)}
//                             >
//                                 {headCell.label}
//                                 {orderBy === headCell.id ? (
//                                     <span className={classes.visuallyHidden}>
//                                         {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
//                                     </span>
//                                 ) : null}
//                             </TableSortLabel>
//                         </TableCell>
//                     ))}
//                 </TableRow>
//             </TableHead>
//         )
//     }, [orderBy, order, createSortHandler]) // eslint-disable-line

//     return <>{header}</>;
// }



// export const AttendeesTable_old = () => {

//     const classes = useStyles();
//     const {attendees} = useAppState()
//     const [order, setOrder] = React.useState<Order>('asc');
//     const [orderBy, setOrderBy] = React.useState<keyof AttendeeState>('name');
//     const [rowsPerPage] = React.useState(400);

//     const handleRequestSort = (property: keyof AttendeeState)=>{
//         if(orderBy === property){
//             setOrder(order === 'asc' ? 'desc' : 'asc');
//         }else{
//             setOrderBy(property)
//         }
//     }


//     const table = useMemo(()=>{
//         return(
//             <TableContainer className={classes.container}>
//                 <Table stickyHeader className={classes.table} size='small'>
//                     <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
//                     <TableBody>
//                         {stableSort(Object.values(attendees), getComparator(order, orderBy))
//                             .slice(0, rowsPerPage)
//                             .map((row, index) => {
//                                 const labelId = `enhanced-table-checkbox-${index}`;
//                                 return (
//                                     <TableRow
//                                         hover
//                                         role="checkbox"
//                                         tabIndex={-1}
//                                         key={row.attendeeId}
//                                     >
//                                         <TableCell component="th" id={labelId} scope="row" padding="none">
//                                             {row.name.length > 10 ?
//                                                 row.name.substring(0, 10) + "... "
//                                                 :
//                                                 row.name
//                                             }
//                                         </TableCell>
//                                         <TableCell component="th" id={labelId} scope="row" padding="none">
//                                             {row.muted}
//                                         </TableCell>
//                                     </TableRow>
//                                 );
//                             })}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         )        
//     },[attendees, order, orderBy]) // eslint-disable-line

//     return (
//         <div className={classes.root}>
//             {table}
//         </div>
//     );
// }


type VideoState = "ENABLED" | "PAUSED" | "NOT_SHARE"

export const AttendeesTable = () => {
    const classes = useStyles()

    const {attendees, videoTileStates, setPauseVideo} = useAppState()

    const targetIds   = Object.values(videoTileStates).reduce<string>((ids,cur)=>{return `${ids}_${cur.boundAttendeeId}`},"")
    const targetNames = Object.values(attendees).reduce<string>((names,cur)=>{return `${names}_${cur.name}`},"")
    const targetVideoStates:VideoState[] = Object.values(attendees).map(x=>{
        if(!videoTileStates[x.attendeeId]){
            return "NOT_SHARE"
        }
        if(x.isVideoPaused){
            return "PAUSED"
        }else{
            return "ENABLED"
        }
    })

    const targetVideoStatesString = targetVideoStates.reduce<string>((states, cur)=>{return `${states}_${cur}`}, "")

    const audienceList = useMemo(()=>{        
        const l = Object.values(attendees).map((x, index)=>{
            let videoStateComp 
            switch(targetVideoStates[index]){
                case "ENABLED":
                    videoStateComp = (
                        <Tooltip title={`click to pause`}>
                            <IconButton style={{width: "20px", height:"20px"}} onClick={ ()=>{setPauseVideo(x.attendeeId, true)} } >
                                <VideocamIcon></VideocamIcon>
                            </IconButton>
                        </Tooltip>
                    )
                    break
                case "PAUSED":
                    videoStateComp = (
                        <Tooltip title={`click to play`}>
                            <IconButton style={{width: "20px", height:"20px"}} onClick={ ()=>{setPauseVideo(x.attendeeId, false)} } >
                                <VideocamOffIcon  ></VideocamOffIcon>
                            </IconButton>
                        </Tooltip>
                    )
                    break
                case "NOT_SHARE":
                    videoStateComp = <></>
                    break
            }

            return(
                <>
                    <div style={{display:"flex", flexDirection:"row"}}>
                        <Tooltip title={`${x.attendeeId}`}>
                            <div>
                                {x.name} 
                            </div>
                        </Tooltip>
                            <div>
                                {videoStateComp}
                            </div>
                    </div>
                </>
            )
        })

        return(
            <div style={{display:"flex", flexDirection:"column"}}>
                {l}
            </div>
        )
    },[targetIds, targetNames, targetVideoStatesString])

    return(
        <> 
            <div style={{marginLeft:"15pt"}}>
                {audienceList}
            </div>
        </>
    )
}

