chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "retrieveImageLinks") {
        const imageElements = document.querySelectorAll('img');
        const imageLinks = [];
        imageElements.forEach(img => {
            imageLinks.push(img.src);
        });
        sendResponse({ links: imageLinks });
    } else if (request.action === "retrieveVideoLinks") {
        const videoElements = document.querySelectorAll('video');
        const videoLinks = [];
        videoElements.forEach(video => {
            const source = video.querySelector('source');
            if (source) {
                videoLinks.push(source.src);
            }
        });
        sendResponse({ links: videoLinks });
    }
    return true;
});