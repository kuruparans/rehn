import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { dummyStory, getItem, setCommentHTML } from '../utils/helper'

const StoryInfo = ({storyID}) => {
    const [story, setStory] = useState([dummyStory])
  
    useEffect(() => {
      const fetchData = async () => {
        const story = await getItem(storyID)
        setStory(story)
      }
      fetchData()
    }, [storyID])
  
    return (
      <>
        <div className="story-info">
          <h1><a href={story?.url}>{story?.title}</a></h1>
          {story?.text !== '' &&
            <p dangerouslySetInnerHTML={setCommentHTML(story?.text)}></p>
          }
          <p className="story-info-footer"><em>{story?.score}</em> points | posted by <Link to={`/user/${story?.by}`}>{story?.by}</Link> | {story?.descendants} comments | <Link to={`/story/${storyID}`}>permalink</Link></p>
        </div>
      </>
    )
  }
  
  export default StoryInfo