import { CourseSubordinated } from '../course/course';
import { Notable } from '../notable';
import { Authored, IPost } from './post';

/**
 * @description 공지사항 목록을 받아왔을 때 알 수 없는 정보를 뺀 인터페이스
 */
export type IReferencePostHead = Omit<IReferencePost, 'contents' | 'attachments'>;

/**
 * @description 공지사항 정보를 담은 인터페이스
 *
 * @url http://door.deu.ac.kr/BBS/Board/Detail/CourseNotice/{notice.id}?cNo={course.id}
 */
export interface IReferencePost extends IPost, Authored, Notable, CourseSubordinated {
	/**
	 * @description 공지사항의 작성자
	 */
	author: string;
	/**
	 * @description 공지사항을 작성한 시간
	 */
	createdAt: string;
	/**
	 * @description 조회수
	 */
	views: number;
	/**
	 * @description 내용
	 */
	contents: string;
}
