'use strict'; {


const optionsUrl = `http://api.viqeo.tv/v1/data/init` +
  `?video[]=1853477d5dcac86d1260&profile=12`;

const vnClass = `vn`,
      imgClass = `vn__img`,
      imgReadyClass = `vn_img-ready`;

const videoSelector = `MediaFiles [type="video/mp4"]`;

/**
 * Run all async work.
 */
const run = async (optionsUrl) => {

  let dataUrl, previewImage, videoUrl;
  let vnOptions = localStorage.vnOptions;

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

  const container = document.querySelector(`.${vnClass}`);
  let rectangle = container.getBoundingClientRect();
  const width = Math.round(rectangle.right - rectangle.left);

  const img = new Image;
  img.src = previewImage;
  img.className = imgClass;
  img.style.width = `${width}px`;

  container.classList.add(imgReadyClass);
  container.appendChild(img);
  rectangle = container.getBoundingClientRect();
  const height = Math.round(rectangle.bottom - rectangle.top);

  console.log(width, height);

};

run(optionsUrl);

}
