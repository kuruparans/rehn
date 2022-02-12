import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { dummyStory, getItem, timeAgo, apiURL, setCommentHTML } from '../utils/helper'

import StoryInfo from '../components/StoryInfo'


const NewCommentList = () => {
    const [comments, setComments] = useState([dummyStory])
  
    const getMaxItemID = () => {
      const request = axios.get(apiURL + 'maxitem.json')
      return request.then(response => response.data)
    }
    const getNewestStories = () => {
      const request = axios.get(apiURL + 'newstories.json')
      return request.then(response => response.data)
    }
    const getParentStory = async (id) => {
        const currentItem = await getItem(id)
        if (currentItem.type === 'story')
          return currentItem
        else
          return getParentStory(currentItem.parent)
    }  
  
    const fetchData = async () => {
      const maxItemID = await getMaxItemID()
      const newestStories = await getNewestStories()
      let currentItemID = maxItemID
      let comments = []
      let commentsPerPage = 10
      while (comments.length <= commentsPerPage) {
        if (!(currentItemID in newestStories)) {
          const currentItem = await getItem(currentItemID)
          if (currentItem.type === 'comment') {
            const parentStory = await getParentStory(currentItem.id)
            currentItem.parentStory = parentStory
            currentItem.timeAgo = timeAgo(currentItem.time)
            comments.push(currentItem)
          }
        }
        currentItemID--
      }
      setComments(comments)
    }
  
    useEffect(() => {
      fetchData()
    }, [])
  
    return (
      <>
        {comments.map(comment => (
          <>
          <div className="story-list">
            <article className="story-list-item" key={comment?.id}>
            <span className="comment-header"><h4><Link to={`/user/${comment?.by}`}>{comment?.by}</Link> |
              &nbsp;{comment?.timeAgo} ago | 
              &nbsp;<Link to={`/story/${comment?.parentStory?.id}#${comment?.parent}`}>parent</Link> | 
              &nbsp;<Link to={`/story/${comment?.parentStory?.id}#${comment?.id}`}>context</Link> | 
              on : <Link to={`/story/${comment?.parentStory?.id}`}>{comment?.parentStory?.title}</Link></h4></span>
              <p dangerouslySetInnerHTML={setCommentHTML(comment?.text)}></p>
            </article>
          </div>
          </>
        ))}
      </>
    )
}

export default NewCommentList