let currentCameraIndex = 0;
let projectionMatrix;

let carouselActive = true;
let modelBarycenter = [0.0, 0.0, 0.0];
const carouselRadius = 2.0; 
const carouselSpeed = 0.005; 
const cameraUp = [0, 1, 0]; 
let carouselAngle = Math.PI / 2; 

let zoomLevel = 3.0; 
const minZoom = 0.3;
const maxZoom = 4.0;
const zoomSpeed = 0.005;

let cameras = [
    {
        id: 0,
        position: [0.2, 0.4, 1.2,],
        rotation: [
            [-0.990, -0.081, 0.110],
            [-0.066, 0.988, 0.135],
            [-0.120, 0.126, -0.984],
        ],
        fy: 1164,
        fx: 1159,
        width: 1920,
        height: 1080
    }
];

let camera = cameras[0];

function getProjectionMatrix(fx, fy, width, height) {
    const znear = 0.2;
    const zfar = 200;
    return [
        [(2 * fx) / width, 0, 0, 0],
        [0, -(2 * fy) / height, 0, 0],
        [0, 0, zfar / (zfar - znear), 1],
        [0, 0, -(zfar * znear) / (zfar - znear), 0],
    ].flat();
}

function getViewMatrix(camera) {
    const R = camera.rotation.flat();
    const t = camera.position;
    const camToWorld = [
        [R[0], R[1], R[2], 0],
        [R[3], R[4], R[5], 0],
        [R[6], R[7], R[8], 0],
        [
            -t[0] * R[0] - t[1] * R[3] - t[2] * R[6],
            -t[0] * R[1] - t[1] * R[4] - t[2] * R[7],
            -t[0] * R[2] - t[1] * R[5] - t[2] * R[8],
            1
        ]
    ].flat();
    return camToWorld;
}

let viewMatrix = getViewMatrix(camera);

function updateView() {
    resize();
    const viewProj = multiply4(projectionMatrix, viewMatrix);
    worker.postMessage({ view: viewProj });
}

function handleZoom(event) {
    event.preventDefault();
    const zoomChange = event.deltaY * zoomSpeed * -1;
    zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel + zoomChange));
}

function updateCarouselCamera() {
    if (!carouselActive) return;

    carouselAngle += carouselSpeed;

    const effectiveRadius = carouselRadius * zoomLevel;

    const x = modelBarycenter[0] + effectiveRadius * Math.cos(carouselAngle);
    const z = modelBarycenter[2] + effectiveRadius * Math.sin(carouselAngle);
    const y = modelBarycenter[1];
    const cameraPosition = [x, y, z];

    viewMatrix = lookAt(cameraPosition, modelBarycenter, cameraUp);
}