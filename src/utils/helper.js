import axios from 'axios'

const apiURL = 'https://hacker-news.firebaseio.com/v0/'

const dummyStory = {
  "by": "abc",
  "descendants": 0,
  "id": 999999,
  "score": 1,
  "time": 1644003922,
  "title": "Loading",
  "type": "story",
  "url": "#",
  "kids": []
}

const getItem = (itemID) => {
    const request = axios.get(`${apiURL}item/${itemID}.json`)
    return request.then(response => response.data)
}
  
  
const setCommentHTML = (commentHTML) => {
    // TODO: sanitize HTML w/ DOMpurify?
    return {__html: commentHTML}
}
  
const timeAgo = (unixTimestamp) => {
    // TODO: add hours/days ago if larger
    const msMinute = 60*1000
    const timePosted = new Date(unixTimestamp * 1000)
    const timeNow = new Date()
    const timeDifference = timeNow - timePosted
    return Math.floor(timeDifference / msMinute) + ' minutes'
}

export {
    apiURL, dummyStory, getItem, timeAgo, setCommentHTML
}