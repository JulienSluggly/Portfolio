async function LoadFootHDRelightGaussianModel() {
    const splatUrl = "https://JulienSluggly.github.io/PublicFiles/3dgs/footHDRelight.splat";
    await LoadModel(splatUrl);
    const cameraUrl = "https://JulienSluggly.github.io/PublicFiles/3dgs/footHDRelightCamera.json";
    await LoadJson(cameraUrl);
}

async function LoadModel(url) {
    try {
        const req = await fetch(url, {
            mode: "cors",
            credentials: "omit",
        });

        if (!req.ok) { // A more robust check for a successful request
            throw new Error(`${req.status} Unable to load ${req.url}`);
        }

        if (!req.body) {
            throw new Error("Response body is not available.");
        }

        const reader = req.body.getReader();
        const chunks = [];
        let receivedLength = 0;

        // Read all the chunks of the file
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            chunks.push(value);
            receivedLength += value.length;
        }

        // Create a new Uint8Array of the correct size
        const splatData = new Uint8Array(receivedLength);
        let position = 0;

        // Copy the chunks into the final array
        for (const chunk of chunks) {
            splatData.set(chunk, position);
            position += chunk.length;
        }

        const rowLength = 3 * 4 + 3 * 4 + 4 + 4;
        const vertexCount = Math.floor(splatData.byteLength / rowLength);
        readSplatData(splatData.buffer, vertexCount);

    } catch (error) {
        console.error("Failed to load model:", error);
        // You could add some UI feedback here to inform the user of an error
    }
}

async function LoadJson(url) {
    const req = await fetch(url, {
        mode: "cors", // no-cors, *cors, same-origin
        credentials: "omit", // include, *same-origin, omit
    });

    if (req.status != 200) throw new Error(req.status + " Unable to load " + req.url);

    if (/\.json$/i.test(url)) {
        const jsonData = await req.json();
        
        if (Array.isArray(jsonData) && jsonData[0] && jsonData[0].fx !== undefined) {
            cameras = jsonData;
            if (cameras.length > currentCameraIndex) { camera = cameras[currentCameraIndex]; }
            else { camera = cameras[0]; }
            viewMatrix = getViewMatrix(camera);
            let ratioH = camera.height / innerHeight;
            let fx = camera.fx / ratioH;
            let fy = camera.fy / ratioH;
            projectionMatrix = getProjectionMatrix(fx,fy,innerWidth,innerHeight);
            gl.uniformMatrix4fv(u_projection, false, projectionMatrix);
        } 
        else {
            console.error("Unknown JSON format");
        }
    }
}

async function readData(splatData, reader) {
    let bytesRead = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        splatData.set(value, bytesRead);
        bytesRead += value.length;
    }

    const rowLength = 3 * 4 + 3 * 4 + 4 + 4;
    readSplatData(splatData.buffer,Math.floor(bytesRead / rowLength));
}

const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
};
document.addEventListener("dragenter", preventDefault);
document.addEventListener("dragover", preventDefault);
document.addEventListener("dragleave", preventDefault);
document.addEventListener("drop", preventDefault);

const resize = () => {
    let ratioH = camera.height / innerHeight;
    let fx = camera.fx / ratioH;
    let fy = camera.fy / ratioH;
    gl.uniform2fv(u_focal, new Float32Array([fx, fy]));

    projectionMatrix = getProjectionMatrix(fx,fy,innerWidth,innerHeight);
    gl.uniform2fv(u_viewport, new Float32Array([innerWidth, innerHeight]));

    gl.canvas.width = Math.round(innerWidth);
    gl.canvas.height = Math.round(innerHeight);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.uniformMatrix4fv(u_projection, false, projectionMatrix);
};

window.addEventListener("resize", resize);