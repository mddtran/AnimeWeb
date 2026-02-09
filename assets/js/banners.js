const ytVideoID = "1Y3Q1xNktU8";

window.banners = [

    // Featured YouTube Video Banner
    {
        type: "watch",
        id: "banner_top_1",
        fid: `https://youtu.be/${ytVideoID}`,
        img: `https://img.youtube.com/vi/${ytVideoID}/maxresdefault.jpg`,
        title: "Zibai: As Drifting Wayside Dust",
        desc: "Character Teaser"
    },
    {
        type: "watch",
        id: "banner_top_2",
        fid: `https://youtu.be/ysdtX8kRTuQ`,
        img: `https://img.youtube.com/vi/ysdtX8kRTuQ/maxresdefault.jpg`,
        title: "LiSA - Shine in the Cruel Night",
        desc: "Kimetsu no Yaiba Infinity Castle” Theme song "
    },

// --- [BANNER YOUTUBE PLAYLIST] ---
/*    {
        type: "watch",
        id: "banner_yt_playlist", // ID banner (đặt tên gì cũng được miễn không trùng)
        
        // Copy nguyên đường link có chứa "&list=..."
        fid: "https://www.youtube.com/watch?v=d0P-_vLpGak&list=PLi6W-vKg80QWUr7AzcR56cHBp_9JHTFem",
        
        // Lấy ảnh thumbnail của video đầu tiên
        img: "https://img.youtube.com/vi/d0P-_vLpGak/maxresdefault.jpg",
        
        title: "Featured Playlist: HIDDEN LAB",
        desc: "Nghe trọn bộ Mixset của Hoaprox."
    },
*/

    // Featured Anime Series
    {
        type: "anime",
        id: "424efb6c94e16ec644554475c1ad126b",
        img: "https://d1i01wkzwiao45.cloudfront.net/wp-content/uploads/2020/10/D4DJ_OP_screenshot_10.jpg",
        title: "Featured: D4DJ First Mix",
        desc: "Don't miss the rhythm! Watch the latest episodes now."
    },

    // System Notification
    {
        type: "notification",
        content: "Một vài bộ anime dùng Youtube đang bị lỗi ! / <a href=\"https://eli.takahashidatto.cloud/\" target=\"_blank\">Streaming Music</a>",
        style: "info"
    }
];