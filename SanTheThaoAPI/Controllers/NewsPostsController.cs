using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NewsPostsController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    public NewsPostsController(SanTheThaoContext context) => _context = context;

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
    public async Task<IActionResult> Create(NewsPost post)
    {
        post.CreatedAt = DateTime.Now;
        _context.NewsPosts.Add(post);
        await _context.SaveChangesAsync();
        return Ok(post);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, NewsPost post)
    {
        if (id != post.Id) return BadRequest();
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