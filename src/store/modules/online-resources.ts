import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { persistedStorage } from 'store/modules/persisted-storage';
import { AsyncThunkTransform, ResetOnVersionChange } from './util';

import { IExternalLink } from 'models/online-resources';
import axios from 'axios';
import { reset } from './user';

const initialState: {
	externalLinks: IExternalLink[];
	splashTexts: string[];
} = {
	externalLinks: [],
	splashTexts: ['Door Desktop'],
};

const fetchExternalLinks = createAsyncThunk<IExternalLink[], void>(
	'online-resources/fetchExternalLinks',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get(
				'https://raw.githubusercontent.com/deu-door/door-desktop-online-resources/main/external-links.json',
			);

			const externalLinks: IExternalLink[] = response.data;

			return externalLinks;
		} catch (e) {
			// TODO: implement errors
			return rejectWithValue(e);
		}
	},
);

const fetchSplashTexts = createAsyncThunk<string[], void>('online-resources/fetchSplashTexts', async (_, { rejectWithValue }) => {
	try {
		const response = await axios.get('https://raw.githubusercontent.com/deu-door/door-desktop-online-resources/main/splash-texts.json');

		const splashTexts: string[] = response.data;

		return splashTexts;
	} catch (e) {
		return rejectWithValue(e);
	}
});

const onlineResourcesSlice = createSlice({
	name: 'online-resources',
	initialState,
	reducers: {},
	extraReducers: builder =>
		builder
			.addCase(reset, state => {
				Object.assign(state, initialState);
			})
			.addCase(fetchExternalLinks.fulfilled, (state, { payload: externalLinks }) => {
				state.externalLinks = externalLinks;
			})
			.addCase(fetchSplashTexts.fulfilled, (state, { payload: splashTexts }) => {
				state.splashTexts = splashTexts;
			}),
});

export const reducer = persistReducer(
	{
		key: 'online-resources',
		storage: persistedStorage,
		transforms: [AsyncThunkTransform],
		version: 1,
		migrate: ResetOnVersionChange,
	},
	onlineResourcesSlice.reducer,
) as typeof onlineResourcesSlice.reducer;

export const actions = {
	fetchExternalLinks,
	fetchSplashTexts,
};
