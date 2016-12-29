const CHANGE_PAGE = '@@redux-pages/CHANGE_PAGE'

const changePage = (page, params) => ({
  type: CHANGE_PAGE,
  payload: {name: page, params}
})

module.exports = {
  CHANGE_PAGE,
  changePage
}
