
import { DisplayedComment } from "../types/DisplayedComment";

const API_KEY = 'AIzaSyCPEDr5QVi6rbthmGTmqowctbm7-kfe4IY'
const BASE_URL = 'https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet';

export class YoutubeApi {
    static async getRandomComment(videoUrl: string): Promise<DisplayedComment> {
        try {
            let allComments = [] as DisplayedComment[];
            const videoId = videoUrl.split("?v=")[1];
            if (!videoId) throw new Error("The provided URL is invalid. It should be a YouTube video URL.");

            allComments = await this.fetchComments(videoId);

            return allComments[Math.floor(Math.random() * allComments.length)];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    static async fetchComments(videoId: string, pageToken?: string): Promise<DisplayedComment[]> {
        const url = `${BASE_URL}&videoId=${videoId}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch comments: ${response.statusText}`);
        }

        let currentThread = await response.json() as CommentThread;
        let allComments = currentThread.items.map(item => convertItemToComment(item));

        if (currentThread.nextPageToken) {
            allComments = allComments.concat(await this.fetchComments(videoId, currentThread.nextPageToken));
        }

        return allComments;
    }
}



function convertItemToComment(item: Item) {
    return {
        username: item.snippet.topLevelComment.snippet.authorDisplayName,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        viewerRating: item.snippet.topLevelComment.snippet.viewerRating,
        likeCount: item.snippet.topLevelComment.snippet.likeCount
    } as DisplayedComment;
}

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