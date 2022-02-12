import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { dummyStory, getItem, timeAgo, setCommentHTML} from '../utils/helper'

const Comment = ({comment, nestLimit=0}) => {
    const [commentData, setComment] = useState([dummyStory])
  
    const fetchComment = async (commentID) => {
      const comment = await getItem(commentID)
      setComment(comment)
    }
  
    useEffect(() => {
      fetchComment(comment)
    }, [])
  
    // TODO: add nestLimit
    
    return (
      <>
        <article className="comment" key={commentData.id}>
          <a name={`#${commentData.id}`}></a>
          <Link to={`#${commentData.id}`} className="comment-border-link">
              <span className="sr-only">Jump to comment-1</span>
          </Link>
          <span className="comment-header"><h4><Link to={`/user/${commentData.by}`}>{commentData.by}</Link></h4> |
          &nbsp;{timeAgo(commentData.time)} ago</span>
          <p dangerouslySetInnerHTML={setCommentHTML(commentData.text)}></p>
          {commentData.kids?.map(kid => (
            <Comment comment={kid} key={kid} />
          ))}
        </article>
      </>
    )
}

export default Comment