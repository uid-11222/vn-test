'use strict'; {

const optionsUrl = `http://api.viqeo.tv/v1/data/init` +
  `?video[]=1853477d5dcac86d1260&profile=12`;

const vnClass = `vn`,
      imgReadyClass = `vn_img-ready`,
      videoReadyClass = `vn_video-ready`,
      videoAnimatedClass = `vn_animated`;
/**
 * Image disappeare duration in seconds.
 */
const disappearDuration = 1;

const videoSelector = `MediaFiles [type="video/mp4"]`;

/**
 * Run all async work.
 */
const run = async (optionsUrl) => {

  let dataUrl, previewImage, videoUrl;
  let vnOptions = localStorage.vnOptions;

  /**
   * Load urls.
   */
  if (vnOptions) {
    ({ dataUrl, previewImage, videoUrl } = JSON.parse(vnOptions));
  } else {
    const options = await fetch(optionsUrl);
    ({ formats: [{ dataUrl, options: { previewImage } }] } =
      await options.json());
    const dataXml = await new Promise((res, rej) => {
      const xhr = new XMLHttpRequest;
      xhr.open(`GET`, dataUrl, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) {
          return;
        }
        if (xhr.status !== 200) {
          rej(new Error(`Network error: ${xhr.status}`));
        }
        res(xhr.responseXML);
      };
      xhr.send();
    });
    videoUrl = dataXml.querySelector(videoSelector).textContent;
    localStorage.vnOptions = vnOptions =
      JSON.stringify({ dataUrl, previewImage, videoUrl });
  }

  /**
   * Get container.
   */
  const container = document.querySelector(`.${vnClass}`);
  let rectangle = container.getBoundingClientRect();
  const width = Math.floor(rectangle.right - rectangle.left);

  /**
   * Add image.
   */
  const img = new Image;
  img.src = previewImage;
  img.width = width;
  img.style.transition = `opacity ${disappearDuration}s`;
  container.classList.add(imgReadyClass);
  container.appendChild(img);
  rectangle = container.getBoundingClientRect();
  const height = Math.floor(rectangle.bottom - rectangle.top);

  /**
   * Add video.
   */
  const video = document.createElement(`video`);
  video.setAttribute(`preload`, `auto`);
  video.width = width;
  video.height = height;
  const canplayCallback = () => {
    container.classList.add(videoReadyClass, videoAnimatedClass);
    setTimeout(() => {
      video.removeEventListener(`canplay`, canplayCallback);
      video.play();
      container.classList.remove(videoAnimatedClass);
    }, disappearDuration * 1000);
  };
  video.addEventListener(`canplay`, canplayCallback);
  video.src = videoUrl;
  container.appendChild(video);
};

run(optionsUrl);

}
