const langData = {
    "en_US": {
        "download.tiktok.success": "{title}\n\n\n @{author}",
        "download.tiktok.error": "Failed to download TikTok video",
        "download.facebook.success": "{title}",
        "download.facebook.error": "Failed to download Facebook video",
        "download.youtube.success": "{title}",
        "download.youtube.error": "Failed to download YouTube video. (No direct download API provided)",
        "download.instagram.success": "{title}",
        "download.instagram.error": "Failed to download Instagram video"
    },
    "vi_VN": {
        "download.tiktok.success": "Tải TikTok thành công\nTiêu đề: {title}\nTác giả: {author}",
        "download.tiktok.error": "Không thể tải video TikTok",
        "download.facebook.success": "Tải Facebook thành công\nTiêu đề: {title}",
        "download.facebook.error": "Không thể tải video Facebook",
        "download.youtube.success": "Tải YouTube thành công\nTiêu đề: {title}",
        "download.youtube.error": "Không thể tải video YouTube. (Không có API tải trực tiếp được cung cấp)",
        "download.instagram.success": "Tải Instagram thành công\nTiêu đề: {title}",
        "download.instagram.error": "Không thể tải video Instagram"
    }
};

import axios from 'axios';

async function downloadYouTube(url) {
    console.error("Attempted to download YouTube video, but no dynamic API provided.");
    return {
        success: false
    };
}

async function downloadFacebook(url) {
    try {
        const encodedUrl = encodeURIComponent(url);
        const response = await axios.get(`https://api-aryan-xyz.vercel.app/fbdl?url=${encodedUrl}&apikey=ArYAN`);

        if (!response.data || !response.data.videoUrl) {
            throw new Error("Invalid Facebook API response or missing video URL.");
        }

        const videoResponse = await axios({
            method: 'get',
            url: response.data.videoUrl,
            responseType: 'stream'
        });

        return {
            success: true,
            data: {
                stream: videoResponse.data,
                title: response.data.title || "Facebook Video"
            }
        };
    } catch (error) {
        console.error("Facebook download error:", error);
        return {
            success: false
        };
    }
}

async function downloadTikTok(url) {
    try {
        const encodedUrl = encodeURIComponent(url);
        const response = await axios.get(`https://api-aryan-xyz.vercel.app/tikdl?url=${encodedUrl}&apikey=ArYAN`);

        if (!response.data || !response.data.url) {
            throw new Error("Invalid TikTok API response or missing video URL.");
        }

        const videoResponse = await axios({
            method: 'get',
            url: response.data.url,
            responseType: 'stream'
        });

        return {
            success: true,
            data: {
                stream: videoResponse.data,
                title: response.data.title,
                author: response.data.author
            }
        };
    } catch (error) {
        console.error("TikTok download error:", error);
        return {
            success: false
        };
    }
}

async function downloadInstagram(url) {
    try {
        const encodedUrl = encodeURIComponent(url);
        const response = await axios.get(`https://api-aryan-xyz.vercel.app/igdl?url=${encodedUrl}&apikey=ArYAN`);

        if (!response.data || !response.data.result || !response.data.result.video_url) {
            throw new Error("Invalid Instagram API response or missing video URL.");
        }

        const videoResponse = await axios({
            method: 'get',
            url: response.data.result.video_url,
            responseType: 'stream'
        });

        return {
            success: true,
            data: {
                stream: videoResponse.data,
                title: response.data.result.title || "Instagram Video"
            }
        };
    } catch (error) {
        console.error("Instagram download error:", error);
        return {
            success: false
        };
    }
}

function isTikTokUrl(url) {
    const tiktokRegex = /^(https?:\/\/)?(www|vm|vt\.)?(tiktok\.com)\/[^\s]+$/;
    return tiktokRegex.test(url);
}

function isFacebookUrl(url) {
    const facebookRegex = /^(https?:\/\/)?(m|mtouch|www\.)?(facebook\.com|fb\.watch|fb\.com)\/[^\s]+$/;
    return facebookRegex.test(url);
}

function isYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$/;
    return youtubeRegex.test(url);
}

function isInstagramUrl(url) {
    const instagramRegex = /^(https?:\/\/)?(www\.)?(instagram\.com)\/[^\s]+$/;
    return instagramRegex.test(url);
}

async function onCall({ message, getLang, data }) {
    const inputText = message.body;

    if (message.senderID === global.botID) {
        return;
    }

    let url = null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = inputText.match(urlRegex);

    if (matches && matches.length > 0) {
        url = matches[0];
    }

    if (!url) {
        return;
    }

    let result = null;
    let successKey = null;
    let errorKey = null;
    let title = null;
    let stream = null;
    let author = null;

    if (isTikTokUrl(url)) {
        message.react("⏳");
        result = await downloadTikTok(url);
        successKey = "download.tiktok.success";
        errorKey = "download.tiktok.error";
        if (result.success) {
            title = result.data.title;
            author = result.data.author?.nickname;
            stream = result.data.stream;
        }
    } else if (isFacebookUrl(url)) {
        message.react("⏳");
        result = await downloadFacebook(url);
        successKey = "download.facebook.success";
        errorKey = "download.facebook.error";
        if (result.success) {
            title = result.data.title;
            stream = result.data.stream;
        }
    } else if (isInstagramUrl(url)) {
        message.react("⏳");
        result = await downloadInstagram(url);
        successKey = "download.instagram.success";
        errorKey = "download.instagram.error";
        if (result.success) {
            title = result.data.title;
            stream = result.data.stream;
        }
    } else if (isYouTubeUrl(url)) {
        message.react("⏳");
        result = await downloadYouTube(url);
        successKey = "download.youtube.success";
        errorKey = "download.youtube.error";
        if (result.success) {
            title = result.data.title;
            stream = result.data.stream;
        }
    } else {
        return;
    }

    if (result && result.success && stream) {
        try {
            await message.reply({
                body: getLang(successKey, { title: title, author: author }),
                attachment: stream
            });
            message.react("✅");
        } catch (error) {
            console.error("Error sending message with attachment:", error);
            message.react("❌");
            await message.reply(getLang(errorKey));
        }
    } else if (result && !result.success) {
        message.react("❌");
        await message.reply(getLang(errorKey));
    }

    return;
}

export default {
    langData,
    onCall
};
