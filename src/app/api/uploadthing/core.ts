import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    // This endpoint is for the Sermon Banner
    imageUploader: f({ image: { maxFileSize: "4MB" } })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata);
            return { url: file.url };
        }),

    // This endpoint is for the Sermon Video Clip
    videoUploader: f({ video: { maxFileSize: "32MB" } })
        .onUploadComplete(async ({ metadata, file }) => {
            return { url: file.url };
        }),

    mediaGalleryUploader: f({
        image: { maxFileSize: "8MB", maxFileCount: 20 },
        video: { maxFileSize: "64MB", maxFileCount: 5 },
    }).onUploadComplete(async ({ file }) => {
            return { url: file.url, type: file.type };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;