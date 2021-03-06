import { IAttachment, ICourse, ITeamProjectPost, ITeamProjectPostHead, PostVariant } from 'models/door';
import moment from 'moment';
import { Response, UnauthorizedError } from 'services/response';
import { driver, parse, parseInformaticTableElement, parseSubmission, parseTableElement } from '../util';

export async function getTeamProjectPost(
	params: Pick<ITeamProjectPost, 'courseId' | 'id'> & Partial<ITeamProjectPost>,
): Promise<Response<ITeamProjectPost>> {
	const { courseId, id } = params;

	const document = parse((await driver.get(`/LMS/LectureRoom/CourseTeamProjectStudentDetail?CourseNo=${courseId}&ProjectNo=${id}`)).data);

	const descriptionTable = document.querySelector('#sub_content2 > div.form_table_b > table');
	const submissionTable = document.querySelector('#CourseLeture > div.form_table_s > table');
	const form = document.querySelector('#CourseLeture');

	if (!(descriptionTable instanceof HTMLTableElement && submissionTable instanceof HTMLTableElement && form instanceof HTMLFormElement))
		throw new UnauthorizedError('팀 프로젝트 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const description = parseInformaticTableElement(descriptionTable);

	const attachments: IAttachment[] = [];

	description['첨부파일'].element.querySelectorAll('a').forEach(fileElement => {
		const attachment: IAttachment = {
			title: fileElement.innerText.trim(),
			link: fileElement.getAttribute('href') || '',
		};

		if (attachment.link) attachments.push(attachment);
	});

	const from = moment(description['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();
	const to = moment(description['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();

	// 제출 관련 정보 파싱
	const submission = parseSubmission(submissionTable);

	return {
		data: {
			variant: PostVariant.teamProject,

			id,
			courseId,

			type: description['제출방식'].text,
			title: description['제목']?.text ?? description['주제']?.text ?? '제목이 없습니다',
			contents: description['내용']?.element.innerHTML ?? description['수업내용']?.element.innerHTML ?? '',

			createdAt: from,
			duration: { from, to },

			attachments,

			submitted: submission.contents.length > 0 || submission.attachments.length > 0,
			submission,

			partial: false,
		},
	};
}

export async function getTeamProjectPosts(params: Pick<ICourse, 'id'> & Partial<ICourse>): Promise<Response<ITeamProjectPostHead[]>> {
	const { id: courseId } = params;

	const teamProjectsDocument = parse((await driver.get(`/LMS/LectureRoom/CourseTeamProjectStudentList/${courseId}`)).data);
	const activitiesDocument = parse((await driver.get(`/LMS/LectureRoom/CourseOutputs/${courseId}`)).data);

	const teamProjectTable = teamProjectsDocument.querySelector('#sub_content2 > div:nth-child(4) > table');
	const activitiesTable = activitiesDocument.querySelector('#sub_content2 > div > table');

	if (!(teamProjectTable instanceof HTMLTableElement) || !(activitiesTable instanceof HTMLTableElement))
		throw new UnauthorizedError('팀 프로젝트 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const teamProjectPosts: ITeamProjectPostHead[] = parseTableElement(teamProjectTable)
		// filter for 등록된 팀프로젝트가 없습니다
		.filter(row => /\d+/.test(row['No'].text))
		.map(row => {
			const from = moment(row['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();
			const to = moment(row['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();

			return {
				variant: PostVariant.teamProject,

				id: row['팀프로젝트 제목'].url?.match(/ProjectNo=(\d+)/)?.[1] || '',
				courseId: courseId,

				title: row['팀프로젝트 제목'].text,
				type: row['제출방식'].text,

				createdAt: from,
				duration: { from, to },

				submitted: row['제출 여부'].text === '제출',

				partial: true,
			};
		})
		.filter(teamProjectPost => teamProjectPost.id !== '');

	// 수업활동일지 게시판에 팀 프로젝트 게시물이 있음. 이해가 어려운 부분
	const teamProjectPostsInActivities: ITeamProjectPostHead[] = parseTableElement(activitiesTable)
		// filter for 등록된 게시물이 없습니다
		.filter(row => /\d+/.test(row['No'].text))
		.map(row => {
			const from = moment(row['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();
			const to = moment(row['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();

			return {
				variant: PostVariant.teamProject,

				id: row['주제'].url?.match(/ProjectNo=(\d+)/)?.[1] || '',
				courseId: courseId,

				title: row['주제'].text,
				type: row['제출방식'].text,

				createdAt: from,
				duration: { from, to },

				partial: true,
			};
		})
		.filter(teamProjectPost => teamProjectPost.id !== '');

	return {
		// Ascending order to descending order
		data: teamProjectPosts.concat(teamProjectPostsInActivities),
	};
}
