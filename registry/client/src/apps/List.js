import React, { Children, Fragment, cloneElement, memo } from 'react';
import BookIcon from '@material-ui/icons/Book';
import { useMediaQuery, makeStyles } from '@material-ui/core';
import {
    BulkDeleteButton,
    Datagrid,
    EditButton,
    List,
    SimpleList,
    TextField,
    ChipField,
} from 'react-admin'; // eslint-disable-line import/no-unresolved

export const PostIcon = BookIcon;


const useStyles = makeStyles(theme => ({
    title: {
        maxWidth: '20em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    hiddenOnSmallScreens: {
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
    publishedAt: { fontStyle: 'italic' },
}));

const PostListBulkActions = memo(props => (
    <Fragment>
        <BulkDeleteButton {...props} />
    </Fragment>
));

const usePostListActionToolbarStyles = makeStyles({
    toolbar: {
        alignItems: 'center',
        display: 'flex',
        marginTop: -1,
        marginBottom: -1,
    },
});

const PostListActionToolbar = ({ children, ...props }) => {
    const classes = usePostListActionToolbarStyles();
    return (
        <div className={classes.toolbar}>
            {Children.map(children, button => cloneElement(button, props))}
        </div>
    );
};

const rowClick = (id, basePath, record) => {
    return 'edit';
};

const Pagination = () => (<div/>);

const PostList = props => {
    const classes = useStyles();
    const isSmall = useMediaQuery(theme => theme.breakpoints.down('sm'));
    return (
        <List
            {...props}
            bulkActionButtons={<PostListBulkActions />}
            sort={{ field: 'published_at', order: 'DESC' }}
            exporter={false}
            pagination={<Pagination/>}
        >
            {isSmall ? (
                <SimpleList
                    primaryText={record => record.name}
                    secondaryText={record => record.kind}
                />
            ) : (
                <Datagrid rowClick={rowClick} optimized>
                    <TextField source="name" />
                    <TextField source="kind" cellClassName={classes.title} />
                    <ChipField source="configSelector" emptyText=""/>
                    <PostListActionToolbar>
                        <EditButton />
                    </PostListActionToolbar>
                </Datagrid>
            )}
        </List>
    );
};

export default PostList;