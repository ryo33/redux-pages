const initialState = [
  {
    title: "Post0",
    text: "零"
  },
  {
    title: "Post1",
    text: "壱"
  },
  {
    title: "Post2",
    text: "弐"
  },
  {
    title: "Post3",
    text: "参"
  }
];

const posts = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export const postsSelector = state => state.posts;

export const reducers = {
  posts
};
