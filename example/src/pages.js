import { createPages } from 'redux-pages';

const int = (str) => parseInt(str, 10);

export const pages = createPages();

export const rootPage = pages.addPage('/', 'root');
export const postsPage = pages.addPage('/posts', 'posts');
export const postPage = pages.addChildPage(postsPage, '/:id', 'post', {id: int});
export const delayPage = pages.addPage('/delay/:msec', 'delay', {msec: int});
export const errorPage = pages.addPage('/*', 'error');
