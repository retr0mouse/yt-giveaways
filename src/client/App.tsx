import { useState } from 'react';
import Confetti from 'react-confetti';
import { YoutubeApi } from './api/YoutubeApi';
import { DisplayedComment } from './types/DisplayedComment';

function App() {
  const [comment, setComment] = useState<DisplayedComment | null>();
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [party, setParty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getData(url: string) {
    setIsLoading(true);
    try {
      const pickedComment = await YoutubeApi.getRandomComment(url);
      if (!pickedComment) {
        console.error("No comment received from the API");
        setError("No comment received from the API");
      } else {
        setComment(pickedComment);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching data from the API:", error);
      setComment(null);
      setError("Error fetching data from the API");
    }
    setIsLoading(false);
    setParty(true);
  }

  return (
    <>
      <h1>Pick a winner</h1>
      <div className="input-container">
        <label className="url-label" htmlFor="url-input">YouTube video URL</label>
        <input className="url-input" type="text" placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" onKeyDown={(e) => (
          e.key === 'Enter' ? videoUrl ? getData(videoUrl) : null : null)} value={videoUrl} onChange={(input) => setVideoUrl(input.target.value)} />
        <button onClick={() =>
          videoUrl ? getData(videoUrl) : null
        }>
          Pick
        </button>
      </div>
      <p>{error}</p>
      <div>
        {
          isLoading ?
            <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
            :
            comment ?
              <>
                <Confetti
                  style={{ position: "fixed", top: 0, left: 0 }}
                  width={window.innerWidth}
                  height={window.innerHeight}
                  run={party}
                  onConfettiComplete={() => setParty(false)}
                  numberOfPieces={1000}
                  recycle={false}
                />
                <div className="comment-container">
                  <img className="pfp" src={comment.authorProfileImageUrl} alt="Profile picture" />
                  <div className="comment-data">
                    <div className="comment-user">
                      <p className="comment-username">{comment.username}</p>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                    <div className="comment-meta">
                      <p className="like-count"><img height="30rem" src="../public/thumb-up.svg" alt="Thumb up" /> {comment.likeCount}</p>
                      {/* <p className="rating">rating: {comment.viewerRating}</p> */}
                    </div>
                  </div>
                </div>
              </>
              :
              <p>The winner will appear here</p>
        }
      </div>
    </>
  )
}

export default App
