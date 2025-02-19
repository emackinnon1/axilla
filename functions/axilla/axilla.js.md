# Internal Code Documentation: Pixlet Image Generation Service

## Table of Contents

* [1. Introduction](#1-introduction)
* [2. Modules and Dependencies](#2-modules-and-dependencies)
* [3. Configuration](#3-configuration)
    * [3.1 Environment Variables](#31-environment-variables)
    * [3.2 Static Paths](#32-static-paths)
* [4. Constants](#4-constants)
    * [4.1 Reserved Parameters](#41-reserved-parameters)
    * [4.2 Supported Formats](#42-supported-formats)
    * [4.3 Supported Outputs](#43-supported-outputs)
    * [4.4 CSS Classes](#44-css-classes)
* [5. Functions](#5-functions)
    * [5.1 `executePixlet`](#51-executepixlet)
    * [5.2 `getOutputPath`](#52-getoutputpath)
    * [5.3 `getPixletVersion`](#53-getpixletversion)
    * [5.4 `handler`](#54-handler)
* [6. Unit Testing](#6-unit-testing)


## 1. Introduction

This document details the implementation of the Pixlet image generation service.  The service takes user parameters, optionally downloads a Pixlet applet, executes the Pixlet binary, and returns the generated image in various formats (HTML, base64 encoded image, or raw image).  Error handling is implemented throughout the process to provide informative error messages.


## 2. Modules and Dependencies

The service utilizes the following Node.js modules:

* `fs/promises`: For asynchronous file system operations.
* `path`: For path manipulation.
* `util`: For promisifying Node.js functions.
* `node-fetch`: For making HTTP requests.
* `child_process`: For executing the Pixlet binary.


## 3. Configuration

### 3.1 Environment Variables

The following environment variables are used to configure the service:

| Variable Name        | Description                                      |
|-----------------------|--------------------------------------------------|
| `PIXLET_BINARY`       | Name of the Pixlet executable.                   |
| `PIXLET_BINARY_PATH` | Path to the directory containing the Pixlet binary. |
| `LD_LIBRARY_PATH`    | Path to the LD_LIBRARY_PATH environment variable. |


### 3.2 Static Paths

The service uses several static paths:

| Path Variable        | Description                                   |
|-----------------------|-----------------------------------------------|
| `TMP_PATH`            | Temporary directory for input and output files. |
| `ASSETS_PATH`         | Directory containing the default Pixlet applet and HTML template. |
| `DEFAULT_APPLET_PATH` | Path to the default Pixlet applet.           |
| `INPUT_APPLET_PATH`  | Path to the temporary input Pixlet applet.    |
| `HTML_TEMPLATE_PATH` | Path to the HTML template file.              |


## 4. Constants

### 4.1 Reserved Parameters

These query parameters are reserved and have special meaning within the service:

| Parameter | Description                     |
|-----------|---------------------------------|
| `format`  | Output image format (WEBP or GIF). |
| `output`  | Output type (HTML, IMAGE, BASE64).|
| `applet`  | URL to a remote Pixlet applet.   |
| `version` | Request Pixlet version info.    |
| `pixelate`| Enables/Disables pixelation CSS class.  |

### 4.2 Supported Formats

| Constant     | Value   |
|--------------|---------|
| `FORMATS.WEBP` | `webp`   |
| `FORMATS.GIF`  | `gif`    |


### 4.3 Supported Outputs

| Constant      | Value    |
|---------------|----------|
| `OUTPUTS.HTML`  | `html`   |
| `OUTPUTS.IMAGE` | `image`  |
| `OUTPUTS.BASE64` | `base64` |


### 4.4 CSS Classes

| Constant       | Value          |
|----------------|-----------------|
| `CSS_CLASSES.PIXETLATE` | `pixelate`      |


## 5. Functions

### 5.1 `executePixlet`

This function executes the Pixlet binary with the given arguments.  It handles the optional `LD_LIBRARY_PATH` environment variable for specifying library locations.

```javascript
const executePixlet = async (args) => {
  const command = PIXLET_BINARY_PATH ? path.join(PIXLET_BINARY_PATH, PIXLET_BINARY) : PIXLET_BINARY;
  const opts = LD_LIBRARY_PATH ? { env: { LD_LIBRARY_PATH } } : undefined;
  return execFile(command, args, opts);
};
```

### 5.2 `getOutputPath`

This helper function constructs the path for the output image file.

```javascript
const getOutputPath = (format) => path.join(TMP_PATH, `output.${format}`);
```

### 5.3 `getPixletVersion`

This function retrieves the Pixlet version by executing the `version` command.

```javascript
const getPixletVersion = async () => (await executePixlet(['version'])).stdout;
```

### 5.4 `handler`

This is the main function that handles incoming requests.  It parses query parameters, downloads applets if necessary, executes Pixlet, processes the output, and returns the result.  The function's logic is detailed in the comments within the code itself.  It includes robust error handling at each step of the process.  The algorithm follows these steps:


1. **Parameter Parsing:** Extracts and validates parameters from the event object.
2. **Applet Handling:**  Determines the applet path (local file or URL).  If a URL is provided, it downloads the applet using `node-fetch` with timeout and size limits.
3. **Pixlet Version Check:** If requested, executes `getPixletVersion` and returns the version information.
4. **Pixlet Execution:** Constructs the Pixlet command arguments, including user-provided parameters (excluding reserved parameters starting with '-'), and executes the Pixlet binary using `executePixlet`.
5. **Output Processing:** Reads the generated image file, encodes it to Base64, and deletes the temporary files.
6. **Response Generation:** Based on the requested `output` parameter, generates an appropriate response (HTML, raw image, or Base64 encoded image).
7. **Error Handling:** Includes comprehensive error handling throughout the entire process, returning appropriate error messages and HTTP status codes.


## 6. Unit Testing

The `exports.test` object provides helper functions (`executePixlet`, `getPixletVersion`, `getOutputPath`, `INPUT_APPLET_PATH`) for use in unit testing.  This allows for independent testing of core functionalities without relying on external dependencies or environment variables.
