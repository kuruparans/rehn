import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { dummyStory, getItem, timeAgo, apiURL } from '../utils/helper'

import StoryInfo from '../components/StoryInfo'


const StoryList = ({type}) => {
    const [stories, setStories] = useState([dummyStory])
  
    const getStories = (type) => {
      let jsonFile = ''
      if (!type)
        jsonFile = 'topstories.json'
      else
        jsonFile = `${type}stories.json`
      
      const request = axios.get(apiURL + jsonFile)
      return request.then(response => response.data)
    }
    
    const getStoryDetails = (stories) => {
      const requests = stories.map(story => axios.get(`${apiURL}item/${story}.json`))
      axios.all(requests).then(axios.spread((...responses) => {
        setStories(responses.map(response => response.data))
      }))
    }
  
    useEffect(() => {
      getStories(type)
      .then(stories => {
        getStoryDetails(stories.slice(0, 10))
      })
      }, [type])
  
    const getWebsiteName = (url) => {
      let a = document.createElement('a')
      a.setAttribute('href', url)
      let hostName = a.hostname
      if (hostName.startsWith('www.'))
        return hostName.substring(4)
      else
        return hostName
    }
  
    return (
      <div className="story-list">
        {stories.map(story => (
          <article className="story-list-item" key={story.id}>
            <h3><Link to={`/story/${story.id}`}>{story.title}</Link></h3> 
            <span className="story-link">
              ({!story.url
                ? <span><Link to={`/story/${story.id}`}>self.hn</Link></span>
                : <a href={`${story.url}`}>{getWebsiteName(story.url)}</a>
              })
              </span>
            <p><em>{story.score}</em> points |
            posted by <Link to={`/user/${story.by}`}>{story.by}</Link> |
            &nbsp;{timeAgo(story.time)} ago |
            &nbsp;<Link to={`/story/${story.id}`}>{story.descendants} comments</Link></p>
          </article>
        ))}
      </div>
    )
}

export default StoryList