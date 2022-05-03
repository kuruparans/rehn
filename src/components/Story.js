import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { dummyStory, getItem } from '../utils/helper'

import StoryInfo from '../components/StoryInfo'
import Comment from '../components/Comment'

const Story = () => {
    const [story, setStory] = useState([dummyStory])
    const { id } = useParams()

    useEffect(() => {
        const fetchData = async (storyID) => {
            const story = await getItem(storyID)
            setStory(story)
        }
      
        fetchData(id)
    }, [id])
  
    return (
      <>
        <div className="story">
          <StoryInfo storyID={story?.id} />
  
          <div className="comment-list">
            {story.kids?.map(kid => (
              <>
                <article className="comment-list-item">
                  <Comment comment={kid} key={kid} />
                </article>
              </>
            ))}
          </div>
        </div>
      </>
    )
}

export default Story