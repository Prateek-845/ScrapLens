import ImageKit from "@imagekit/nodejs";

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL
});

const uploadFile = async (fileBuffer) => {
  try {
    const res = await client.files.upload({
      file: fileBuffer.toString("base64"),
      fileName: "scrap-" + Date.now(),
      folder: "ScrapLens"
    });
    return res;
  } catch (e) {
    console.error("ImageKit upload error:", e);
    throw new Error("File upload failed");
  }
};

export default uploadFile;
