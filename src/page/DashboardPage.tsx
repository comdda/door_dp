import { Typography, CssBaseline, Card, createStyles, makeStyles, CardContent } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store/modules';
import { CourseState } from 'store/modules/courses';
import { UserState } from 'store/modules/user';

const useStyles = makeStyles(theme => createStyles({
	details: {
		display: 'flex',
		flexDirection: 'column'
	}
}));

export const NumberCard: React.FC<{ title: string, number: number }> = props => {
	const { title, number } = props;
	const classes = useStyles();

	return (
		<Card>
			<div className={classes.details}>
				<CardContent>
					<Typography variant="h4">{title}</Typography>
				</CardContent>
			</div>
			<CardContent>
				<Typography variant="h1">{number}</Typography>
			</CardContent>
		</Card>
	);
}

export const DashboardPage: React.FC = props => {
	const { user, courses } = useSelector<RootState, { user: UserState, courses: CourseState }>(state => ({
		user: state.user,
		courses: state.courses
	}));

	return (
		<div>
			<CssBaseline />
			<Typography component="h1" variant="h3">Hello User {user.profile?.name}</Typography>
		</div>
	);
};
