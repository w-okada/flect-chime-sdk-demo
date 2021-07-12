import { makeStyles } from "@material-ui/core";
const lineSpacerHeihgt = 10
const toolbarHeight = 20
const drawerWidth = 240;
export const bufferHeight = 20

export const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        width:'100%',
        height:'100%',
        overflowX:'hidden',
        overflowY:'hidden',
    },

    ////////////////
    // ToolBar
    ////////////////
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        // transition: theme.transitions.create(['width', 'margin'], {
        //     easing: theme.transitions.easing.sharp,
        //     duration: theme.transitions.duration.leavingScreen,
        // }),
        height: toolbarHeight
    },
    toolbar: {
        height: toolbarHeight,
        display: "flex",
        justifyContent: "space-between"
    },
    toolbarInnnerBox: {
        height: toolbarHeight,
        display: "flex",
        justifyContent: "space-between"
    },

    menuSpacer: {
        width: toolbarHeight, height: toolbarHeight,
    },

    menuButton: {
        width: toolbarHeight, height: toolbarHeight,
    },

    menuButtonActive: {
        width: toolbarHeight, height: toolbarHeight,
        color: "#ee7777"
    },


    title: {
        flexGrow: 1,
        alignSelf:"center"
    },
    appBarSpacer: {
        height: toolbarHeight
    },

    ////////////////
    // SideBar
    ////////////////
    drawerPaper: {
        // marginLeft: drawerWidth,
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // width: theme.spacing(3),
        [theme.breakpoints.up('xs')]: {
            // width: theme.spacing(0),
            width: 0,
        },
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },



    ////////////////
    // Main
    ////////////////
    content: {
        flexGrow: 1,
        // width: `calc(100%-drawerWidth)`,
        // height: "100%",
        // height: `calc(100%-toolbarHeight)`,
        // width: 'auto',
        // height: 'auto',
        // overflow:'auto',
        overflow:'hidden',

    },

    ////////////////////
    // dialog
    ////////////////////
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    formControl: {
        margin: theme.spacing(1),
        width: '100%'
        // minWidth: 120,
    },
    lineSpacer:{
        height:lineSpacerHeihgt,
    },

    button:{
        width:100
    },
    buttonList:{
        display:"flex", 
        flexDirection:"column", 
        alignItems:"center"            
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
}));
