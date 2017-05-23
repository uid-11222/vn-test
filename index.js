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
const disappearDuration = 3;

/**
 * Frames per second (for invert video).
 */
const fps = 60;

const videoType = `video/mp4`;
const videoSelector = `MediaFiles [type="${videoType}"]`;

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
    //videoUrl = dataXml.querySelector(videoSelector).textContent;
    videoUrl = `./test.mp4`;
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
  await new Promise((res, rej) => {
    img.addEventListener(`load`, () => res());
    img.addEventListener(`error`, () => rej());
  });
  /**
   * @todo In some keys img.clientHeight = 0.
   */
  container.offsetHeight;
  rectangle = container.getBoundingClientRect();
  const rectangleHeight = Math.floor(rectangle.bottom - rectangle.top);
  const height = Math.max(img.clientHeight, rectangleHeight) || 220;

  /**
   * Add video.
   */
  const video = document.createElement(`video`);
  video.preload = `auto`;
  video.width = width;
  video.height = height;
  const canplayCallback = () => {
    container.classList.add(videoReadyClass, videoAnimatedClass);
    /**
     * Add inverting.
     */
    changePixelColors(video, invertColors, fps);
    setTimeout(() => {
      video.removeEventListener(`canplay`, canplayCallback);
      video.play();
      container.classList.remove(videoAnimatedClass);
    }, disappearDuration * 1000);
  };
  video.addEventListener(`canplay`, canplayCallback);
  const source = document.createElement(`source`);
  source.src = videoUrl;
  source.type = videoType;
  video.appendChild(source);
  container.appendChild(video);
};

/**
 * @return {number[4]}
 */
const invertColors = (r, g, b, a) => [
  255 - r, 255 - g, 255 - b, a
];

/**
 * @param {!HTMLVideoElement} video - video element for changing colors.
 * @param {function(r, g, b, a): number[4]} colorMap - function for changing
 *   colors.
 * @param {number} [fps=60] - frame frequency.
 */
const changePixelColors = (video, colorMap, fps = 60) => {

  const rectangle = video.getBoundingClientRect();
  const width = Math.floor(rectangle.right - rectangle.left),
        height = Math.floor(rectangle.bottom - rectangle.top);

  const inputCanvas = document.createElement(`canvas`),
        outputCanvas = document.createElement(`canvas`);

  inputCanvas.width = outputCanvas.width = width;
  inputCanvas.height = outputCanvas.height = height;

  const inputContex = inputCanvas.getContext(`2d`),
        outputContex = outputCanvas.getContext(`2d`);

  video.style.display = inputCanvas.style.display = `none`;
  video.crossOrigin = ``;
  video.parentNode.insertBefore(outputCanvas, video);
  video.parentNode.insertBefore(inputCanvas, video);

  setInterval(() => {
    if (video.paused || video.ended) {
      return;
    }
    setFrame();
  }, Math.round(1000 / fps));

  /**
   * Set one changed frame from video to output canvas.
   */
  const setFrame = () => {
    inputContex.drawImage(video, 0, 0, width, height);
    const frame = inputContex.getImageData(0, 0, width, height),
          data = frame.data,
          len = data.length;

    for (let i = 0; i < len; i += 4) {
      [data[i], data[i + 1], data[i + 2], data[i + 3]] =
        colorMap(data[i], data[i + 1], data[i + 2], data[i + 3]);
    }

    outputContex.putImageData(frame, 0, 0);
  };

  /**
   * If video paused, set first frame anyway.
   */
  setFrame();
};

run(optionsUrl);

}
