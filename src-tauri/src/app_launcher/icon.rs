//! Extracts a shortcut's icon as a PNG data URL for the launcher grid.

use image::{DynamicImage, RgbaImage};

use crate::win32::icon::{shell_icon, ShellIconSource};

pub(super) fn extract_icon_data_url(path: &str) -> Option<String> {
    let icon = shell_icon(path, ShellIconSource::Item)?;
    let image = RgbaImage::from_raw(icon.width, icon.height, icon.rgba)?;
    let data_url = crate::file_shelf::png_data_url(&DynamicImage::ImageRgba8(image))?;
    Some(data_url)
}
