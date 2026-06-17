using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NewsPostsController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    private readonly IWebHostEnvironment _env;

    public NewsPostsController(SanTheThaoContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category)
    {
        var query = _context.NewsPosts.Where(n => n.IsPublished);
        if (!string.IsNullOrEmpty(category))
            query = query.Where(n => n.Category == category);
        var posts = await query.OrderByDescending(n => n.CreatedAt).ToListAsync();
        return Ok(posts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var post = await _context.NewsPosts.FindAsync(id);
        return post == null ? NotFound() : Ok(post);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] NewsPostCreateDto input)
    {
        string? thumbnailUrl = null;

        if (input.ThumbnailFile != null && input.ThumbnailFile.Length > 0)
        {
            var ext = Path.GetExtension(input.ThumbnailFile.FileName).ToLower();
            
            var webRootPath = _env.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(_env.ContentRootPath, "wwwroot");
            }
            
            var folder = Path.Combine(webRootPath, "images", "news");
            Directory.CreateDirectory(folder); 
            
            var fileName = $"news_{DateTime.Now.Ticks}{ext}";
            var path = Path.Combine(folder, fileName);
            
            using var stream = System.IO.File.Create(path);
            await input.ThumbnailFile.CopyToAsync(stream);
            
            thumbnailUrl = $"/images/news/{fileName}";
        }

        var post = new NewsPost
        {
            Title = input.Title,
            Slug = input.Slug,
            Summary = input.Summary,
            Content = input.Content,
            Category = input.Category,
            AuthorId = input.AuthorId,
            IsPublished = true,
            CreatedAt = DateTime.Now,
            ThumbnailUrl = thumbnailUrl 
        };

        _context.NewsPosts.Add(post);
        await _context.SaveChangesAsync();
        
        return Ok(post);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromForm] NewsPostCreateDto input)
    {
        var post = await _context.NewsPosts.FindAsync(id);
        if (post == null) return NotFound();

        // Cập nhật text
        post.Title = input.Title;
        post.Category = input.Category;
        post.Summary = input.Summary;
        post.Content = input.Content;
        post.Slug = input.Slug;

        // Nếu có chọn ảnh mới thì cập nhật ảnh
        if (input.ThumbnailFile != null && input.ThumbnailFile.Length > 0)
        {
            var ext = Path.GetExtension(input.ThumbnailFile.FileName).ToLower();
            
            var webRootPath = _env.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(_env.ContentRootPath, "wwwroot");
            }
            
            var folder = Path.Combine(webRootPath, "images", "news");
            Directory.CreateDirectory(folder); 
            
            var fileName = $"news_{DateTime.Now.Ticks}{ext}";
            var path = Path.Combine(folder, fileName);
            
            using var stream = System.IO.File.Create(path);
            await input.ThumbnailFile.CopyToAsync(stream);
            
            post.ThumbnailUrl = $"/images/news/{fileName}";
        }

        _context.Entry(post).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(post);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var post = await _context.NewsPosts.FindAsync(id);
        if (post == null) return NotFound();
        _context.NewsPosts.Remove(post);
        await _context.SaveChangesAsync();
        return Ok();
    }
}

public class NewsPostCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public IFormFile? ThumbnailFile { get; set; } 
}