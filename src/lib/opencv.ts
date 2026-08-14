declare global {
  interface Window {
    cv: any;
  }
}

let cvLoadPromise: Promise<any> | null = null;

export function loadOpenCV(): Promise<any> {
  if (window.cv && window.cv.Mat) {
    return Promise.resolve(window.cv);
  }
  if (cvLoadPromise) {
    return cvLoadPromise;
  }

  cvLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://docs.opencv.org/4.8.0/opencv.js";
    script.async = true;
    script.onload = () => {
      // OpenCV.js loads a global 'cv' object, but its internal WebAssembly module might still be compiling.
      if (window.cv) {
        if (window.cv.getBuildInformation) {
          resolve(window.cv);
        } else {
          window.cv.onRuntimeInitialized = () => {
            resolve(window.cv);
          };
        }
      } else {
        reject(new Error("Failed to load OpenCV."));
      }
    };
    script.onerror = () => {
      reject(new Error("Failed to load OpenCV script from CDN."));
    };
    document.body.appendChild(script);
  });

  return cvLoadPromise;
}
