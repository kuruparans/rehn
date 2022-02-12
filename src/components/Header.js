import { Link } from 'react-router-dom'

const Header = () => {
    return (
      <>
        <header>
          <nav>
            <ul>
              <li><Link to="/best"><img src="https://news.ycombinator.com/y18.gif" className="nav-logo" /></Link></li>
              <li><Link to="/"><strong>Hacker News</strong></Link></li>
              <li><Link to="/newest">new</Link></li>
              <li><Link to="/newcomments">comments</Link></li>
              <li><Link to="/ask">ask</Link></li>
              <li><Link to="/show">show</Link></li>
            </ul>
          </nav>
        </header>
      </>
    )
}

export default Header