using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OrchardCore.Media;
using OrchardCore.Modules;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace OrchardCore.Media.CustomAPI.Controllers
{
    [ApiController]
    [Route("api/media")]
    [Feature("OrchardCore.Media.CustomAPI")]
    [IgnoreAntiforgeryToken]
    // TODO: Re-enable authorization after configuring proper authentication
    // [Authorize]
    public class MediaApiController : ControllerBase
    {
        private readonly IMediaFileStore _mediaFileStore;

        public MediaApiController(IMediaFileStore mediaFileStore)
        {
            _mediaFileStore = mediaFileStore;
        }

        /// <summary>
        /// Upload a file to the media library
        /// POST /api/media
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload(IFormFile? file, [FromForm] string path = "")
        {
            // Debug logging
            Console.WriteLine($"Upload called - File: {file?.FileName ?? "null"}, Path: {path}");
            Console.WriteLine($"Content-Type: {Request.ContentType}");
            Console.WriteLine($"Has form: {Request.HasFormContentType}");

            if (file == null || file.Length == 0)
            {
                return BadRequest(new {
                    error = "File is required.",
                    contentType = Request.ContentType,
                    hasFormContent = Request.HasFormContentType,
                    formFiles = Request.Form.Files.Count
                });
            }

            try
            {
                // Sanitize the path
                var sanitizedPath = string.IsNullOrWhiteSpace(path) ? "" : path.Trim('/');

                // Create unique filename to avoid conflicts
                var fileName = Path.GetFileName(file.FileName);
                var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
                var uniqueFileName = $"{Path.GetFileNameWithoutExtension(fileName)}_{timestamp}{Path.GetExtension(fileName)}";

                var fullPath = string.IsNullOrEmpty(sanitizedPath)
                    ? uniqueFileName
                    : $"{sanitizedPath}/{uniqueFileName}";

                // Upload the file
                using var stream = file.OpenReadStream();
                await _mediaFileStore.CreateFileFromStreamAsync(fullPath, stream);

                var fileInfo = await _mediaFileStore.GetFileInfoAsync(fullPath);

                return Created($"/media/{fullPath}", new
                {
                    path = fullPath,
                    name = uniqueFileName,
                    size = file.Length,
                    mimeType = file.ContentType,
                    createdUtc = fileInfo?.LastModifiedUtc ?? DateTime.UtcNow,
                    url = $"/media/{fullPath}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to upload file.", details = ex.Message });
            }
        }

        /// <summary>
        /// List all media files (optionally in a specific directory)
        /// GET /api/media/list
        /// </summary>
        [HttpGet("list")]
        public async Task<IActionResult> List([FromQuery] string path = "")
        {
            try
            {
                var sanitizedPath = string.IsNullOrWhiteSpace(path) ? "" : path.Trim('/');

                var files = _mediaFileStore.GetDirectoryContentAsync(sanitizedPath);

                var result = new List<object>();

                await foreach (var entry in files)
                {
                    if (!entry.IsDirectory)
                    {
                        var fileInfo = await _mediaFileStore.GetFileInfoAsync(entry.Path);
                        result.Add(new
                        {
                            path = entry.Path,
                            name = entry.Name,
                            size = fileInfo?.Length ?? 0,
                            lastModified = fileInfo?.LastModifiedUtc ?? DateTime.UtcNow,
                            url = $"/media/{entry.Path}"
                        });
                    }
                }

                return Ok(new
                {
                    path = sanitizedPath,
                    files = result,
                    totalCount = result.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to list files.", details = ex.Message });
            }
        }

        /// <summary>
        /// Get information about a specific file
        /// GET /api/media/{*path}
        /// </summary>
        [HttpGet("{*filePath}")]
        public async Task<IActionResult> GetFileInfo(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
            {
                return BadRequest(new { error = "File path is required." });
            }

            try
            {
                var fileInfo = await _mediaFileStore.GetFileInfoAsync(filePath);

                if (fileInfo == null)
                {
                    return NotFound(new { error = "File not found.", path = filePath });
                }

                return Ok(new
                {
                    path = filePath,
                    name = fileInfo.Name,
                    size = fileInfo.Length,
                    lastModified = fileInfo.LastModifiedUtc,
                    url = $"/media/{filePath}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to get file info.", details = ex.Message });
            }
        }

        /// <summary>
        /// Delete a file from the media library
        /// DELETE /api/media/{*path}
        /// </summary>
        [HttpDelete("{*filePath}")]
        public async Task<IActionResult> Delete(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
            {
                return BadRequest(new { error = "File path is required." });
            }

            try
            {
                var fileInfo = await _mediaFileStore.GetFileInfoAsync(filePath);

                if (fileInfo == null)
                {
                    return NotFound(new { error = "File not found.", path = filePath });
                }

                await _mediaFileStore.TryDeleteFileAsync(filePath);

                return Ok(new
                {
                    message = "File deleted successfully.",
                    path = filePath
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to delete file.", details = ex.Message });
            }
        }

        /// <summary>
        /// Move/rename a file in the media library
        /// PUT /api/media/move
        /// </summary>
        [HttpPut("move")]
        public async Task<IActionResult> Move([FromBody] MoveFileRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.SourcePath))
            {
                return BadRequest(new { error = "Source path is required." });
            }

            if (string.IsNullOrWhiteSpace(request?.DestinationPath))
            {
                return BadRequest(new { error = "Destination path is required." });
            }

            try
            {
                var sourceFileInfo = await _mediaFileStore.GetFileInfoAsync(request.SourcePath);

                if (sourceFileInfo == null)
                {
                    return NotFound(new { error = "Source file not found.", path = request.SourcePath });
                }

                // Copy to new location
                using var sourceStream = await _mediaFileStore.GetFileStreamAsync(request.SourcePath);
                await _mediaFileStore.CreateFileFromStreamAsync(request.DestinationPath, sourceStream);

                // Delete original
                await _mediaFileStore.TryDeleteFileAsync(request.SourcePath);

                var newFileInfo = await _mediaFileStore.GetFileInfoAsync(request.DestinationPath);

                return Ok(new
                {
                    message = "File moved successfully.",
                    oldPath = request.SourcePath,
                    newPath = request.DestinationPath,
                    url = $"/media/{request.DestinationPath}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to move file.", details = ex.Message });
            }
        }
    }

    public class MoveFileRequest
    {
        public required string SourcePath { get; set; }
        public required string DestinationPath { get; set; }
    }
}
