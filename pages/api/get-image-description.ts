import { NextApiRequest, NextApiResponse } from "next";
import Replicate from "replicate";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/clients/s3";
import shortid from 'shortid';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
    userAgent: `chefjeept/v1`,
});


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const image = req.body;
    const uniqueId = shortid.generate();
    const filename = `${uniqueId}-meme-photo.jpg`;

    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadImage = await s3Client.send(
        new PutObjectCommand({
            Bucket: process.env.S3_UPLOAD_BUCKET!,
            Key: filename,
            Body: buffer,
            ContentType: 'image/jpeg'
        })
    );

    const s3Url = `https://${process.env.S3_UPLOAD_BUCKET}.s3.amazonaws.com/${encodeURIComponent(filename)}`;

    try {

        const output = await replicate.run(
            "andreasjansson/blip-2:4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608",
            {
                input: {
                    image: s3Url,
                    question: "describe this photo in detail"
                }
            }
        );

        console.log(output);
        //delete the image since is not longer needed
        const deleteImage = new DeleteObjectCommand({
            Bucket: process.env.S3_UPLOAD_BUCKET!,
            Key: filename,
        })

        await s3Client.send(deleteImage);

        res.status(200).json(output);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error something is wrong with the call' });
    }
}

