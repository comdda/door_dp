import { Box, List, ListItem, ListProps, Typography } from '@material-ui/core';
import { FetchButton } from 'components/common/FetchButton';
import { KeepLatestState } from 'components/common/KeepLatestState';
import { useCourses } from 'hooks/door/useCourses';
import { useCoursePosts } from 'hooks/door/usePosts';
import { ICourse, IPostHead, PostVariant } from 'models/door';
import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { PostListItemRenderer } from './PostListItem';

export type PostListProps = ListProps & {
	posts: IPostHead[];
	empty?: React.ReactNode;
	itemRenderer?: (post: IPostHead) => React.ReactNode;
	threshold?: number;
	sortBy?: (postA: IPostHead, postB: IPostHead) => number;
};

export const PostList: React.FC<PostListProps> = props => {
	const {
		posts,
		empty,
		itemRenderer,
		threshold = 50,
		sortBy = (postA, postB) => new Date(postB.createdAt).valueOf() - new Date(postA.createdAt).valueOf(),
		...otherProps
	} = props;
	const [expanded, setExpanded] = useState(1);

	return (
		<List disablePadding {...otherProps}>
			{posts.length > 0 ? (
				<>
					{posts
						.sort(sortBy)
						.slice(0, threshold * expanded)
						.map(post =>
							itemRenderer !== undefined ? (
								itemRenderer(post)
							) : (
								<PostListItemRenderer key={`${post.variant}#${post.id}`} post={post} />
							),
						)}
					{threshold * expanded < posts.length && (
						<ListItem button onClick={() => setExpanded(expanded + 1)} style={{ display: 'flex', justifyContent: 'center' }}>
							<Typography variant="subtitle2" color="textSecondary">
								더보기
							</Typography>
						</ListItem>
					)}
				</>
			) : (
				<ListItem>{empty ?? <Typography color="textSecondary">목록이 비어있습니다</Typography>}</ListItem>
			)}
		</List>
	);
};

export type RoutePostListProps = RouteComponentProps<{ courseId: ICourse['id']; postVariant: PostVariant }>;

export const RoutePostList: React.FC<RoutePostListProps> = props => {
	const {
		match: {
			params: { courseId, postVariant: variant },
		},
	} = props;

	const { courseById } = useCourses();
	const { allPosts, fetchPosts, postsStateByVariant } = useCoursePosts(courseId);

	const course = courseById(courseId);
	const postsState = postsStateByVariant(variant);
	const posts = allPosts().filter(post => post.variant === variant);

	const triggerFetch = () => fetchPosts({ variant, ...course });

	return (
		<Box>
			<KeepLatestState state={postsState} onTriggerFetch={triggerFetch} />

			<FetchButton state={postsState} onFetch={triggerFetch} />

			<Box height="0.7rem" />

			<PostList posts={posts} />
		</Box>
	);
};
