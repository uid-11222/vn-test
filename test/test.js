'use strict'; {

let doc, video;

/**
 * @param {*} value
 * @throw {!Error} - if value is not true.
 */
const assert = value => {
  if (value !== true) {
    throw new Error(value);
  }
};

const duration = 4000;

describe(`vn-test`, function() {

  this.timeout(duration + 1000);

  it(`create image`, done => {
    setTimeout(() => {
      doc = document.querySelector(`iframe`).contentDocument;
      assert(!!doc.querySelector(`img`));
      done();
    }, duration);
  });

  it(`create two canvas`, () => {
    assert(doc.querySelectorAll(`canvas`).length > 1);
  });

  it(`create video`, () => {
    video = doc.querySelector(`video`);
    assert(!!video);
  });

  it(`create source`, () => {
    assert(!!doc.querySelector(`source`));
  });

  it(`has positive width and height`, () => {
    assert(video.width > 0 && video.height > 0);
  });

});

}
