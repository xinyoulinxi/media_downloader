// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM 内容已加载，开始查询当前活动标签页');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('查询到的当前活动标签页:', tab);

  // 获取图片
  console.log('开始在标签页中注入脚本以获取图片');
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getImagesFromPage
  }, (injectionResults) => {
    console.log('脚本注入完成，获取注入结果');
    const imagesDiv = document.getElementById('images');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const imageCount = document.getElementById('imageCount');
    if (injectionResults && injectionResults[0].result) {
      let images = injectionResults[0].result;
      console.log('从页面获取到的图片链接数量:', images.length);
      // Remove duplicate image URLs
      images = [...new Set(images)];
      console.log('去重后图片链接数量:', images.length);
      imageCount.textContent = images.length;
      images.forEach(src => {
        console.log('开始处理图片链接:', src);
        const container = document.createElement('div');
        container.className = 'image-container';

        const img = document.createElement('img');
        img.src = src;
        img.addEventListener('click', () => {
          console.log('用户点击图片，开始下载图片:', src);
          // Download individual image on click
          handleImageDownload(src);
        });

        const info = document.createElement('div');
        info.className = 'image-info';
        const linkElement = document.createElement('span');
        linkElement.className = 'copy-link';
        linkElement.textContent = '复制链接';
        linkElement.addEventListener('click', () => {
          console.log('用户点击复制链接，开始复制:', src);
          navigator.clipboard.writeText(src).then(() => {
            console.log('图片链接已成功复制到剪贴板:', src);
            alert('图片链接已复制到剪贴板');
          }).catch(err => {
            console.error('复制链接失败:', src, err);
          });
        });

        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) {
            const imageSize = `${img.naturalWidth}x${img.naturalHeight}`;
            info.textContent = `尺寸: ${imageSize}, `;
            info.appendChild(linkElement);
            console.log('图片加载成功，尺寸信息:', imageSize, ' 链接:', src);
          } else {
            info.appendChild(linkElement);
            console.log('图片加载成功，但未获取到尺寸信息 链接:', src);
          }
        };

        container.appendChild(img);
        container.appendChild(info);
        imagesDiv.appendChild(container);
        console.log('图片处理完成，已添加到页面:', src);
      });

      // Add event listener for downloading all images as a zip file
      downloadAllBtn.addEventListener('click', async () => {
        console.log('用户点击下载所有图片为压缩包按钮');
        const confirmation = confirm("您确定要将所有图片下载为压缩包吗？");
        if (confirmation) {
          console.log('用户确认下载，开始创建压缩包');
          const zip = new JSZip();
          const fetchPromises = images.map(async (src, index) => {
            try {
              console.log(`正在获取图片: ${src}`);
              const response = await fetch(src);
              if (!response.ok) throw new Error('网络响应不正常');
              const blob = await response.blob();
              const extension = blob.type.split('/')[1] || 'jpg';
              zip.file(`image${index + 1}.${extension}`, blob);
              console.log(`图片获取成功并添加到压缩包: ${src}`);
            } catch (error) {
              console.error('无法获取图片:', src, error);
            }
          });

          await Promise.all(fetchPromises);
          console.log('所有图片已获取，开始创建压缩包...');

          // Get the page title and URL to name the zip file
          const pageTitle = tab.title.replace(/[\/:*?"<>|]/g, "_"); // Replace invalid characters
          const pageUrl = new URL(tab.url).hostname;
          const zipFilename = `${pageTitle}_${pageUrl}.zip`;

          zip.generateAsync({ type: "blob" }).then((content) => {
            console.log('压缩包创建成功，准备下载...');
            saveAs(content, zipFilename);
            console.log('压缩包下载开始:', zipFilename);
          }).catch((error) => {
            console.error('压缩包生成失败:', error);
          });
        }
      });
    } else {
      console.log('未从页面获取到图片链接');
    }
  });
});

function getImagesFromPage() {
  console.log('开始从页面获取所有图片链接');
  const images = Array.from(document.images).map(img => img.src);
  console.log('从页面获取到的图片链接数量:', images.length);
  return images;
}

function handleImageDownload(src, isBatch = false) {
  console.log('开始下载图片:', src);
  if (!src.startsWith("data:image")) {
    if (src.includes('file-')) {
      // Handle special signed URL case
      src = decodeURIComponent(src);
      console.log('处理特殊签名 URL，解码后的链接:', src);
    }
    fetch(src, { mode: 'cors' })
      .then(response => {
        if (!response.ok) throw new Error('网络响应不正常');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = src.split('/').pop() || '下载的图片';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('图片下载成功:', src);
      })
      .catch((error) => {
        console.error('图片下载失败:', src, error);
        if (!isBatch) {
          alert('图片下载失败，请检查图片的 URL 或网络设置。');
        }
      });
  } else {
    console.warn('无法直接下载嵌入的 base64 图片:', src);
  }
}

// 打开选项卡的函数
function openTab(tabName) {
  console.log('尝试打开选项卡:', tabName);
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  const activeTab = document.querySelector(`button[data-tab="${tabName}"]`);
  if (activeTab) {
    activeTab.className += " active";
  }
  if (tabName === 'Videos') {
    retrieveVideoLinks();
  } else if (tabName === 'Images') {
    retrieveImageLinks();
  }
}

// 绑定选项卡点击事件
document.getElementById('imagesTab').addEventListener('click', function() {
  openTab('Images');
});
document.getElementById('videosTab').addEventListener('click', function() {
  openTab('Videos');
});

// 默认打开图片选项卡
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 加载完成，尝试打开图片选项卡');
  document.getElementById('imagesTab').click();
});

// 检索图片链接的函数
function retrieveImageLinks() {
  console.log('开始检索图片链接');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log('查询到的当前活动标签页:', tabs[0]);
    chrome.tabs.sendMessage(tabs[0].id, { action: "retrieveImageLinks" }, function (response) {
      if (response && response.links) {
        console.log('从页面获取到的图片链接数量:', response.links.length);
        const imageCount = response.links.length;
        document.getElementById('imageCount').textContent = imageCount;
        const imagesDiv = document.getElementById('images');
        imagesDiv.innerHTML = ''; // 清空之前的图片内容
        response.links.forEach(link => {
          const imageContainer = document.createElement('div');
          imageContainer.classList.add('image-container');
          const img = document.createElement('img');
          img.src = link;
          const imageInfo = document.createElement('div');
          imageInfo.classList.add('image-info');
          imageInfo.textContent = link;
          imageContainer.appendChild(img);
          imageContainer.appendChild(imageInfo);
          imagesDiv.appendChild(imageContainer);
        });
      } else {
        console.log('未从页面获取到图片链接');
      }
    });
  });
}

// 检索视频链接的函数
function retrieveVideoLinks() {
  console.log('开始检索视频链接');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log('查询到的当前活动标签页:', tabs[0]);
    chrome.tabs.sendMessage(tabs[0].id, { action: "retrieveVideoLinks" }, function (response) {
      if (response && response.links) {
        console.log('从页面获取到的视频链接数量:', response.links.length);
        const videoCount = response.links.length;
        document.getElementById('videoCount').textContent = videoCount;
        const videosDiv = document.getElementById('videos');
        videosDiv.innerHTML = ''; // 清空之前的视频内容
        response.links.forEach(link => {
          const videoContainer = document.createElement('div');
          videoContainer.classList.add('video-container');
          const videoInfo = document.createElement('div');
          videoInfo.classList.add('video-info');
          videoInfo.textContent = link;
          videoContainer.appendChild(videoInfo);
          videosDiv.appendChild(videoContainer);
        });
      } else {
        console.log('未从页面获取到视频链接');
      }
    });
  });
}

// 下载所有图片为压缩包的代码（需要进一步实现）
document.querySelector('#Images #downloadAllBtn').addEventListener('click', function () {
  // 实现下载所有图片为压缩包的逻辑
});

// 下载所有视频为压缩包的代码（需要进一步实现）
document.querySelector('#Videos #downloadAllBtn').addEventListener('click', function () {
  // 实现下载所有视频为压缩包的逻辑
});