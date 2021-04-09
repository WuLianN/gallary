import request from '../utils/request'

export function pictureList(pageNo, pageSize) {
  const params = { pageNo, pageSize }
  return request({
    url: 'pictures',
    method: 'get',
    params,
  })
}
