import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { dummyStory, getItem, timeAgo, setCommentHTML} from '../utils/helper'

const Comment = ({comment, nestLimit=0}) => {
    const [commentData, setComment] = useState([dummyStory])
  
    const fetchComment = async (commentID) => {
      const comment = await getItem(commentID)
      console.log(comment)
      setComment(comment)
    }
  
    useEffect(() => {
      fetchComment(comment)
    }, [comment])
  
    // TODO: add nestLimit

    if (commentData.dead)
      return (<></>)
    
    return (
      <>
        <article className="comment" key={commentData.id}>
          <a name={`${commentData.id}`}></a>
          <Link to={`#${commentData.id}`} className="comment-border-link">
              <span className="sr-only">Jump to comment-1</span>
          </Link>
          <div className="comment-header"><h4><Link to={`/user/${commentData.by}`}>{commentData.by}</Link></h4> |
          &nbsp;{timeAgo(commentData.time)} ago</div>
          <p dangerouslySetInnerHTML={setCommentHTML(commentData.text)}></p>
          {commentData.kids?.map(kid => (
            <Comment comment={kid} key={kid} />
          ))}
        </article>
      </>
    )
}

export default Comment