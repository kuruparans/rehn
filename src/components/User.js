import axios from 'axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { dummyStory, getItem, apiURL } from '../utils/helper'

import Comment from '../components/Comment'
import StoryInfo from '../components/StoryInfo'

const User = () => {
  const dummyUser = {
    "about" : "This is a test",
    "created" : 1173923446,
    "delay" : 0,
    "id" : "jl",
    "karma" : 0,
    "submitted" : []
  }  
  const { username } = useParams()
  const [user, setUser] = useState([dummyUser])
  const [submissions, setSubmissions] = useState([dummyStory])

  const getUser = () => {
    const request = axios.get(`${apiURL}/user/${username}.json`)
    return request.then(response => response.data)
  }

  useEffect(() => {
    const fetchData = async () => {
      const user = await getUser()
      setUser(user)
      const submissionPromises = user.submitted.map(submittedID => getItem(submittedID))
      const submissions = await Promise.all(submissionPromises)
      setSubmissions(submissions)
    }
    fetchData()
  }, [])

  return (
    <>
      <div className="user-profile">
        <h2>{user.id}</h2>
        <p>EST: {Date(user.created * 1000)}</p>
        <p>Karma Points: {user.karma}</p>

        <h3>Submissions ({submissions?.filter(submission => submission.type === 'story').length})</h3>
        {submissions?.filter(submission => submission.type === 'story' && !submission.dead && !submission.deleted).map(submission => (
          <>
            <StoryInfo storyID={submission.id} />
          </>
        ))}

        <h3>Comments ({submissions?.filter(submission => submission.type === 'comment').length})</h3>
        {submissions?.filter(submission => submission.type === 'comment' && !submission.dead && !submission.deleted).map(comment => (
          <>
            <Comment comment={comment.id} nestLimit="2" />
            {/* TODO: User profile comment list should have permalinks/context links */}
          </>
        ))}
      </div>
    </>
  )
}

export default User