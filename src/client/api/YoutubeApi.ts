import { DisplayedComment } from "../types/DisplayedComment";

const BACKEND_URL = "http://localhost:3000";

export class YoutubeApi {
    static async getRandomComment(videoUrl: string): Promise<DisplayedComment> {
        try {
            const allCommentsResponse = await fetch(`${BACKEND_URL}/api/getComments?videoUrl=${videoUrl}`);
            if (!allCommentsResponse.ok) throw new Error(`Failed to fetch comments: ${allCommentsResponse.statusText}`);
            const allComments = await allCommentsResponse.json();
            if (!allComments || allComments.length === 0) {
                throw new Error("No comments were found for this video.");
            }
            return allComments[Math.floor(Math.random() * allComments.length)];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
