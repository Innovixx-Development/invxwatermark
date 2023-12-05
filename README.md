# Innovixx Watermarking Tool

This Node.js script allows you to easily add a watermark to an image. It supports custom watermark images and provides various watermark placement options.

## Prerequisites

- Node.js
- ImageMagick (`convert` command)


## Usage

Run the script with the desired command-line options:

```bash
invxwatermark [--output <output_folder>] [--watermark <watermark_image>] <input_files...>
```

- `--output <output_folder>`: Path to the folder where the watermarked images will be saved. (Default: current folder)
- `--watermark <watermark_image>`: Path to the custom watermark image. (Default: `./assets/transparent_watermark.png`)
- `<input_files...>`: Paths to the input image files.

Example:

```bash
invxwatermark --output output_folder input1.jpg input2.jpg
```

The script will apply the watermark to each input image and save the watermarked images in the specified output folder with the following naming convention:

`<input_file_name>_watermarked.png`

## Notes

- The script uses the ImageMagick `composite` command to perform the watermarking.
- By default, the script uses the `transparent_watermark.png` image as the watermark. You can provide a custom watermark image using the `--watermark` option.
- The script applies the watermark in multiple positions to ensure visibility in different areas of the image.
- The watermarked images will be saved in PNG format.