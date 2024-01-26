import express, { Request, Response } from 'express';
import cors from 'cors';

const BASE_URL = 'https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet';
const API_KEY = 'AIzaSyCPEDr5QVi6rbthmGTmqowctbm7-kfe4IY'
const app = express();
const port = 3000;
app.use(cors());



app.get('/api/getComments', async (req: Request, res: Response) => {
    const videoUrl = req.query.videoUrl as string;
    const formattedUrl = videoUrl.substring(1, videoUrl.length - 1);
    try {
        const allComments = await fetchComments(formattedUrl);
        res.send(allComments);
    } catch (error: any) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

async function fetchComments(videoUrl: string, pageToken?: string): Promise<any[]> {
    const videoId = videoUrl.split("?v=")[1];
    console.log(`Video ID: ${videoUrl}`);
    if (!videoId) throw new Error("The provided URL is invalid. It should be a YouTube video URL.");

    const url = `${BASE_URL}&videoId=${videoId}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    console.log(`Fetch URL: ${url}`);
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Failed to fetch comments: ${response.statusText}`);
    const commentThread = await response.json() as CommentThread;
    const comments = commentThread.items.map(item => convertItemToComment(item));

    if (commentThread.nextPageToken) {
        const nextPageComments = await fetchComments(videoUrl, commentThread.nextPageToken);
        return comments.concat(nextPageComments);
    }

    return comments;
}

function convertItemToComment(item: Item) {
    return {
        username: item.snippet.topLevelComment.snippet.authorDisplayName,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        viewerRating: item.snippet.topLevelComment.snippet.viewerRating,
        likeCount: item.snippet.topLevelComment.snippet.likeCount
    };
}

app.listen(port, () => {
    return "kek";
});

interface CommentThread {
    kind: string;
    etag: string;
    nextPageToken: string;
    pageInfo: PageInfo;
    items: Item[];
}

interface Item {
    kind: string;
    etag: string;
    id: string;
    snippet: ItemSnippet;
}

interface ItemSnippet {
    channelId: string;
    videoId: string;
    topLevelComment: TopLevelComment;
    canReply: boolean;
    totalReplyCount: number;
    isPublic: boolean;
}

interface TopLevelComment {
    kind: string;
    etag: string;
    id: string;
    snippet: TopLevelCommentSnippet;
}

interface TopLevelCommentSnippet {
    channelId: string;
    videoId: string;
    textDisplay: string;
    textOriginal: string;
    authorDisplayName: string;
    authorProfileImageUrl: string;
    authorChannelUrl: string;
    authorChannelId: AuthorChannelId;
    canRate: boolean;
    viewerRating: string;
    likeCount: number;
    publishedAt: string;
    updatedAt: string;
}

interface AuthorChannelId {
    value: string;
}

interface PageInfo {
    totalResults: number;
    resultsPerPage: number;
}