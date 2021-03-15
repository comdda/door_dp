import { combineReducers } from 'redux';

import { reducer as userReducer } from './user';
import { reducer as termsReducer } from './terms';
import { reducer as coursesReducer } from './courses';
import { reducer as postsReducer } from './posts';
import { reducer as lecturesReducer } from './lectures';

import { actions as userActions } from './user';
import { actions as termsActions } from './terms';
import { actions as coursesActions } from './courses';
import { actions as postsActions } from './posts';
import { actions as lecturesActions } from './lectures';

import { selectors as coursesSelectors } from './courses';
import { selectors as postsSelectors } from './posts';
import { selectors as lecturesSelectors } from './lectures';

export const rootReducer = combineReducers({
	user: userReducer,
	terms: termsReducer,
	courses: coursesReducer,
	posts: postsReducer,
	lectures: lecturesReducer,
});

export const actions = {
	...userActions,
	...termsActions,
	...coursesActions,
	...postsActions,
	...lecturesActions,
};

export const selectors = {
	...coursesSelectors,
	...postsSelectors,
	...lecturesSelectors,
};
