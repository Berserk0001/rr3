"use strict";
import sharp from 'sharp';
import { redirect } from './redirect.js';

export async function compressImg(request, reply, imgStream) {
    const { webp, grayscale, quality, originSize } = request.params;
    const imgFormat = webp ? 'webp' : 'jpeg';

    try {
        // Create the sharp instance and start the pipeline with the image stream
        const sharpInstance = sharp()
            .grayscale(grayscale)
            .toFormat(imgFormat, {
                quality,
                progressive: true,
                optimizeScans: true,
                chromaSubsampling: '4:4:4'
            });

        // Pipe the image stream into sharp
        imgStream.pipe(sharpInstance);

        // Convert to buffer and get info
        const { data, info } = await sharpInstance.toBuffer({ resolveWithObject: true });

        // Send response with appropriate headers
        reply
            .header('content-type', 'image/' + format);
            .header('content-length', info.size);
            .header('x-original-size', request.params.originSize);
            .header('x-bytes-saved', request.params.originSize - info.size);
            .code(200)
            .send(data);
    } catch (error) {
        return redirect(request, reply);
    }
}
