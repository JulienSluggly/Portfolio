let gaussiansArray = []; // Array contenant toutes les gaussians du dernier fichier lu.

// XYZ - Position (Float32)
// XYZ - Scale (Float32)
// RGBA - colors (uint8)
// IJKL - quaternion/rot (uint8)
class gaussian {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.r = 0;
        this.g = 0;
        this.b = 0;

        this.scaleX = 0;
        this.scaleY = 0;
        this.scaleZ = 0;

        this.opacity = 0;

        this.q0 = 0;
        this.qx = 0;
        this.qy = 0;
        this.qz = 0;
    }
}

function calculateBarycenter(gaussians) {
    // If there are no gaussians, return the origin.
    if (!gaussians || gaussians.length === 0) {
        return [0, 0, 0];
    }

    let sumX = 0, sumY = 0, sumZ = 0;

    // Sum up all the positions
    for (const gaussian of gaussians) {
        sumX += gaussian.x;
        sumY += gaussian.y;
        sumZ += gaussian.z;
    }

    // Divide by the total number of gaussians to get the average
    const count = gaussians.length;
    return [sumX / count, sumY / count, sumZ / count];
}

function readSplatData(buffer,vertexCount) {
    gaussiansArray = [];
    const f_buffer = new Float32Array(buffer);
    const u_buffer = new Uint8Array(buffer);

    for (let i = 0; i < vertexCount; i++) {
        let tdgaussian = new gaussian();

        tdgaussian.x = f_buffer[8 * i + 0];
        tdgaussian.y = f_buffer[8 * i + 1];
        tdgaussian.z = f_buffer[8 * i + 2];

        tdgaussian.r = u_buffer[32 * i + 24 + 0];
        tdgaussian.g = u_buffer[32 * i + 24 + 1];
        tdgaussian.b = u_buffer[32 * i + 24 + 2];
        tdgaussian.opacity = u_buffer[32 * i + 24 + 3];

        tdgaussian.scaleX = f_buffer[8 * i + 3 + 0];
        tdgaussian.scaleY = f_buffer[8 * i + 3 + 1];
        tdgaussian.scaleZ = f_buffer[8 * i + 3 + 2];

        tdgaussian.q0 = u_buffer[32 * i + 28 + 0];
        tdgaussian.qx = u_buffer[32 * i + 28 + 1];
        tdgaussian.qy = u_buffer[32 * i + 28 + 2];
        tdgaussian.qz = u_buffer[32 * i + 28 + 3];

        gaussiansArray.push(tdgaussian);
    }
    modelBarycenter = calculateBarycenter(gaussiansArray);
    worker.postMessage({ 
        fileBuffer : createBuffer(gaussiansArray),
    });
}

function createBuffer(gaussians) {
    if (gaussians.length <= 0) return;
    const rowLength = 3 * 4 + 3 * 4 + 4 + 4; // 12 bytes for position, 12 bytes for scale, 4 bytes for color, 4 bytes for quaternion
    const vertexCount = gaussians.length;
    const buffer = new ArrayBuffer(rowLength * vertexCount);
    for (let j = 0; j < gaussians.length; j++) {
        let tdgaussian = gaussians[j];
        const position = new Float32Array(buffer, j * rowLength, 3);
        const scales = new Float32Array(buffer, j * rowLength + 4 * 3, 3);
        const rgba = new Uint8ClampedArray(buffer,j * rowLength + 4 * 3 + 4 * 3, 4);
        const rot = new Uint8ClampedArray(buffer,j * rowLength + 4 * 3 + 4 * 3 + 4, 4);

        position[0] = tdgaussian.x;
        position[1] = tdgaussian.y;
        position[2] = tdgaussian.z;

        scales[0] = tdgaussian.scaleX;
        scales[1] = tdgaussian.scaleY;
        scales[2] = tdgaussian.scaleZ;

        rgba[0] = tdgaussian.r;
        rgba[1] = tdgaussian.g;
        rgba[2] = tdgaussian.b;
        rgba[3] = tdgaussian.opacity;

        rot[0] = tdgaussian.q0;
        rot[1] = tdgaussian.qx;
        rot[2] = tdgaussian.qy;
        rot[3] = tdgaussian.qz;
    }
    return buffer;
}