import {createUploadthing, type FileRouter} from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    // This endpoint is for the Sermon Banner
    imageUploader: f({image: {maxFileSize: "4MB"}})
        // FIX 1: Removed unused 'metadata' parameter
        .onUploadComplete(async ({file}) => {
            console.log("Upload complete for file:", file.name);
            // FIX 2: Swapped file.url for file.appUrl
            return {url: file.url};
        }),

    // This endpoint is for the Sermon Video Clip
    videoUploader: f({video: {maxFileSize: "32MB"}})
        .onUploadComplete(async ({file}) => {
            return {url: file.url};
        }),

    mediaGalleryUploader: f({
        image: {maxFileSize: "8MB", maxFileCount: 20},
        video: {maxFileSize: "64MB", maxFileCount: 5},
    }).onUploadComplete(async ({file}) => {
        return {url: file.url, type: file.type};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;